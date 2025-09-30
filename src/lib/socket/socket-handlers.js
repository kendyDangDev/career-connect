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

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET, {
        issuer: 'career-connect-chat',
      });

      if (!decoded.userId) {
        throw new Error('Invalid token');
      }

      socket.userId = decoded.userId;
      socket.user = {
        id: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        userType: decoded.userType,
      };

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
          const savedMessage = await saveMessageToDatabase(
            conversationId,
            { content, type },
            socket.handshake.auth.token
          );

          // Transform to frontend format
          const message = transformMessage(savedMessage);

          // Emit to conversation room
          io.to(`conversation:${conversationId}`).emit('message:new', message);

          // Also emit to sender to ensure they see their own message
          socket.emit('message:new', message);

          // Send acknowledgment with the real message
          if (callback) callback({ success: true, message });
        } catch (dbError) {
          console.error('Failed to save message to database:', dbError);

          // Fallback: create temporary message for real-time experience
          const tempMessage = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            conversationId,
            senderId: socket.userId,
            content,
            type,
            createdAt: new Date().toISOString(),
            sender: {
              id: socket.userId,
              name: socket.user?.firstName
                ? `${socket.user.firstName} ${socket.user.lastName || ''}`.trim()
                : socket.user?.email,
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
              warning: 'Message sent but may not be permanently saved',
              message: tempMessage,
            });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorResponse = { error: 'Failed to send message' };
        socket.emit('error', errorResponse);
        if (callback) callback(errorResponse);
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
