const jwt = require('jsonwebtoken');

/**
 * Create a temporary JWT token for internal API calls
 */
const createInternalToken = (userId, userInfo) => {
  return jwt.sign(
    {
      userId,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      userType: userInfo.userType,
    },
    process.env.NEXTAUTH_SECRET,
    {
      expiresIn: '1h',
      issuer: 'career-connect-chat',
    }
  );
};

/**
 * Save message to database via API call
 */
const saveMessageToDatabase = async (conversationId, messageData, authToken) => {
  try {
    // Use built-in fetch (Node.js 18+) or dynamic import for node-fetch
    let fetch;
    if (global.fetch) {
      fetch = global.fetch;
    } else {
      try {
        const { default: fetchImpl } = await import('node-fetch');
        fetch = fetchImpl;
      } catch (e) {
        console.error('Neither global fetch nor node-fetch available');
        throw new Error('No fetch implementation available');
      }
    }

    // Use the same host and port as the current server
    const hostname = process.env.HOSTNAME || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `http://${hostname}:${port}`;

    console.log('Making API call to save message:', {
      url: `${baseUrl}/api/chat/conversations/${conversationId}/messages`,
      token: authToken?.substring(0, 50) + '...',
      messageData,
    });

    const response = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: messageData.content,
        messageType: messageData.type, // API expects 'messageType'
        replyToId: messageData.replyToId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    // API response structure: { success: true, data: { message: {...} }, message: "success text" }
    // We need the actual message object from data.message, not the success text from message
    if (result.data && result.data.message) {
      return result.data.message;
    }

    throw new Error('API did not return a valid message object');
  } catch (error) {
    console.error('Error in saveMessageToDatabase:', error);
    throw error;
  }
};

/**
 * Transform database message to frontend format
 */
const transformMessage = (dbMessage) => {
  if (!dbMessage) {
    throw new Error('No message data to transform');
  }

  // Handle different possible response structures
  const sender = dbMessage.sender || {};

  return {
    id: dbMessage.id,
    conversationId: dbMessage.conversationId,
    senderId: dbMessage.senderId,
    content: dbMessage.content || '', // Ensure content is never undefined
    type: dbMessage.type || dbMessage.messageType || 'TEXT',
    createdAt: dbMessage.createdAt,
    sender: {
      id: sender.id || dbMessage.senderId,
      name: sender.firstName
        ? `${sender.firstName} ${sender.lastName || ''}`.trim()
        : sender.email || 'Unknown User',
      avatar: sender.avatarUrl || null,
    },
    attachments: dbMessage.attachments || [],
  };
};

module.exports = {
  createInternalToken,
  saveMessageToDatabase,
  transformMessage,
};
