interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const limit = this.limits.get(identifier);

    if (!limit || now > limit.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (limit.count >= this.maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [identifier, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(identifier);
      }
    }
  }
}

class ConnectionManager {
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

  addConnection(userId: string, socketId: string) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, userId);
  }

  removeConnection(socketId: string) {
    const userId = this.socketUsers.get(socketId);
    if (userId) {
      const userSockets = this.userConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);
        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
        }
      }
      this.socketUsers.delete(socketId);
    }
  }

  getUserConnections(userId: string): string[] {
    return Array.from(this.userConnections.get(userId) || []);
  }

  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId) && this.userConnections.get(userId)!.size > 0;
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userConnections.keys());
  }

  checkRateLimit(identifier: string): boolean {
    return this.rateLimiter.isAllowed(identifier);
  }

  cleanup() {
    this.rateLimiter.cleanup();
  }
}

export const connectionManager = new ConnectionManager();

// Cleanup every 5 minutes
setInterval(
  () => {
    connectionManager.cleanup();
  },
  5 * 60 * 1000
);
