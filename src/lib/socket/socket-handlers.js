const jwt = require('jsonwebtoken');
const { saveMessageToDatabase, transformMessage } = require('./socket-utils');

const setupSocketHandlers = (io) => {
  // Rate limiting Map để track messages per user
  const rateLimitMap = new Map();

  // Middleware xác thực
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new Error('No token provided');
      }

      // Verify JWT token - try both possible formats
      let decoded = null;
      let userId = null;

      try {
        // First try with NEXTAUTH_SECRET for socket tokens
        decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        userId = decoded.userId || decoded.id;
      } catch (error) {
        console.log('NEXTAUTH_SECRET verification failed, trying JWT_SECRET');
        try {
          // Try with JWT_SECRET for mobile app tokens
          const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
          decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id || decoded.userId;
        } catch (jwtError) {
          throw new Error('Invalid token - failed both verification methods');
        }
      }

      if (!userId) {
        throw new Error('Invalid token structure - no user ID found');
      }

      socket.userId = userId;
      socket.user = {
        id: userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        userType: decoded.userType,
      };

      console.log('Socket authenticated for user:', userId);

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Send online users list
    const onlineUsers = Array.from(io.sockets.sockets.values())
      .filter((s) => s.userId)
      .map((s) => ({
        userId: s.userId,
        socketId: s.id,
        userInfo: {
          name: s.user?.firstName
            ? `${s.user.firstName} ${s.user.lastName || ''}`.trim()
            : s.user?.email,
          avatar: null,
        },
      }));

    socket.emit('users:online', onlineUsers);
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      socketId: socket.id,
      userInfo: {
        name: socket.user?.firstName
          ? `${socket.user.firstName} ${socket.user.lastName || ''}`.trim()
          : socket.user?.email,
        avatar: null,
      },
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      if (typeof conversationId !== 'string') return;
      socket.join(`conversation:${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      if (typeof conversationId !== 'string') return;
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle message sending
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, content, type = 'TEXT' } = data;

        if (!conversationId || !content) {
          const error = { error: 'Missing required fields' };
          socket.emit('error', error);
          if (callback) callback(error);
          return;
        }

        // Rate limiting
        const now = Date.now();
        const userRateLimit = rateLimitMap.get(socket.userId) || {
          count: 0,
          resetTime: now + 60000,
        };

        if (now > userRateLimit.resetTime) {
          userRateLimit.count = 0;
          userRateLimit.resetTime = now + 60000;
        }

        if (userRateLimit.count >= 50) {
          const error = { error: 'Rate limit exceeded. Please slow down.' };
          socket.emit('error', error);
          if (callback) callback(error);
          return;
        }

        userRateLimit.count++;
        rateLimitMap.set(socket.userId, userRateLimit);

        // Save message to database
        try {
          // Create internal JWT token for API authentication
          const { createInternalToken } = require('./socket-utils');
          const internalToken = createInternalToken(socket.userId, socket.user);

          console.log('Attempting to save message with internal token');
          console.log('Message data:', { content, type });

          const savedMessage = await saveMessageToDatabase(
            conversationId,
            { content, type },
            internalToken
          );

          if (!savedMessage) {
            throw new Error('saveMessageToDatabase returned null/undefined');
          }

          // Transform to frontend format
          const message = transformMessage(savedMessage);

          // Emit to conversation room
          io.to(`conversation:${conversationId}`).emit('message:new', message);

          // Also emit to sender to ensure they see their own message
          socket.emit('message:new', message);

          // Send acknowledgment with the real message
          console.log('Sending success callback with message:', message.id);
          if (callback) callback({ success: true, message });
        } catch (dbError) {
          console.error('Failed to save message to database:', dbError);
          console.error('Error details:', {
            message: dbError.message,
            stack: dbError.stack,
            conversationId,
            userId: socket.userId,
            userData: socket.user,
          });

          // Fallback: create temporary message for real-time experience
          const tempMessage = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            conversationId,
            senderId: socket.userId,
            content: content || '', // Ensure content is never undefined
            type: type || 'TEXT',
            createdAt: new Date().toISOString(),
            sender: {
              id: socket.userId,
              name: socket.user?.firstName
                ? `${socket.user.firstName} ${socket.user.lastName || ''}`.trim()
                : socket.user?.email || 'Unknown User',
              avatar: null,
            },
            attachments: [],
          };

          // Emit temporary message
          io.to(`conversation:${conversationId}`).emit('message:new', tempMessage);
          socket.emit('message:new', tempMessage);

          // Send acknowledgment but with warning
          if (callback)
            callback({
              success: true,
              warning: 'Message sent but may not be permanently saved. Error: ' + dbError.message,
              message: tempMessage,
            });
        }
      } catch (error) {
        console.error('Critical error in message handling:', error);
        const errorResponse = {
          error: 'Failed to send message',
          details: error.message,
        };
        socket.emit('error', errorResponse);

        // Always call callback to prevent timeout
        if (callback) {
          callback(errorResponse);
        } else {
          console.warn('No callback provided for message send');
        }
      }
    });

    // Handle typing indicators
    socket.on('user:typing', (data) => {
      const { conversationId } = data;
      if (!conversationId) return;

      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId: socket.userId,
        conversationId,
        userInfo: {
          name: socket.user?.firstName
            ? `${socket.user.firstName} ${socket.user.lastName || ''}`.trim()
            : socket.user?.email,
        },
      });
    });

    socket.on('user:stop-typing', (data) => {
      const { conversationId } = data;
      if (!conversationId) return;

      socket.to(`conversation:${conversationId}`).emit('user:stop-typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Notify others that user went offline
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
      });

      // Clean up rate limiting
      rateLimitMap.delete(socket.userId);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = { setupSocketHandlers };
