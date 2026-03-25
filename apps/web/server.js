const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { setupSocketHandlers } = require('./src/lib/socket/socket-handlers');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const recommendationCronEnabled = process.env.RECOMMENDATION_CRON_ENABLED !== 'false';
const recommendationCronSchedule = process.env.RECOMMENDATION_CRON_SCHEDULE || '0 2 * * *';
const recommendationCronSecret = process.env.RECOMMENDATION_CRON_SECRET;

let cron = null;
try {
  cron = require('node-cron');
} catch (error) {
  console.warn(
    '[recommendation-cron] node-cron is unavailable. Install dependencies to enable scheduled similarity refresh.'
  );
}

async function localFetch(url, options) {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(url, options);
  }

  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch(url, options);
}

async function triggerSimilarityRefresh() {
  if (!recommendationCronSecret) {
    console.warn(
      '[recommendation-cron] RECOMMENDATION_CRON_SECRET is missing. Skipping scheduled similarity refresh.'
    );
    return;
  }

  const cronUrl = `http://127.0.0.1:${port}/api/cron/calculate-job-similarity`;

  try {
    const response = await localFetch(cronUrl, {
      method: 'POST',
      headers: {
        'x-cron-secret': recommendationCronSecret,
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(
        `[recommendation-cron] Similarity refresh failed with status ${response.status}: ${responseText}`
      );
      return;
    }

    console.log('[recommendation-cron] Similarity refresh completed successfully.');
  } catch (error) {
    console.error('[recommendation-cron] Failed to trigger similarity refresh:', error);
  }
}

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin:
        // process.env.NODE_ENV === 'production'
        //   ? process.env.NEXTAUTH_URL
        //   : ['http://localhost:3000'],
        '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Setup socket handlers
  setupSocketHandlers(io);

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);

    if (!cron || !recommendationCronEnabled) {
      if (!recommendationCronEnabled) {
        console.log('[recommendation-cron] Disabled by RECOMMENDATION_CRON_ENABLED=false.');
      }
      return;
    }

    if (!cron.validate(recommendationCronSchedule)) {
      console.warn(
        `[recommendation-cron] Invalid cron expression "${recommendationCronSchedule}". Similarity refresh was not scheduled.`
      );
      return;
    }

    cron.schedule(recommendationCronSchedule, () => {
      void triggerSimilarityRefresh();
    });

    console.log(
      `[recommendation-cron] Scheduled similarity refresh with expression "${recommendationCronSchedule}".`
    );
  });
});
