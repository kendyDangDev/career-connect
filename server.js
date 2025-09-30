const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { setupSocketHandlers } = require('./src/lib/socket/socket-handlers');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

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
        process.env.NODE_ENV === 'production'
          ? process.env.NEXTAUTH_URL
          : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Setup socket handlers
  setupSocketHandlers(io);

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
