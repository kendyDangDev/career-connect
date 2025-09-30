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


    const response = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: messageData.content,
        type: messageData.type,
        replyToId: messageData.replyToId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    throw error;
  }
};

/**
 * Transform database message to frontend format
 */
const transformMessage = (dbMessage) => {
  return {
    id: dbMessage.id,
    conversationId: dbMessage.conversationId,
    senderId: dbMessage.senderId,
    content: dbMessage.content,
    type: dbMessage.type,
    createdAt: dbMessage.createdAt,
    sender: {
      id: dbMessage.sender.id,
      name: dbMessage.sender.firstName
        ? `${dbMessage.sender.firstName} ${dbMessage.sender.lastName || ''}`.trim()
        : dbMessage.sender.email,
      avatar: dbMessage.sender.avatarUrl,
    },
    attachments: dbMessage.attachments || [],
  };
};

module.exports = {
  createInternalToken,
  saveMessageToDatabase,
  transformMessage,
};
