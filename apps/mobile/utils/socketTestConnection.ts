// Socket.IO Connection Test Utility
// Use this to test and debug Socket.IO connection issues

import { io, Socket } from "socket.io-client";

interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: any;
}

export const testSocketConnection = async (
  baseUrl: string = `${process.env.EXPO_PUBLIC_API_URL}`,
  authToken?: string
): Promise<ConnectionTestResult> => {
  return new Promise((resolve) => {
    console.log(`[Socket Test] Testing connection to ${baseUrl}`);

    const testSocket = io(baseUrl, {
      path: "/api/socket/io",
      auth: {
        token: authToken || "test-token",
      },
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: false, // Disable for testing
      forceNew: true,
    });

    const timeout = setTimeout(() => {
      testSocket.disconnect();
      resolve({
        success: false,
        error: "Connection timeout after 10 seconds",
      });
    }, 10000);

    testSocket.on("connect", () => {
      clearTimeout(timeout);
      console.log("[Socket Test] ✅ Connection successful!");
      testSocket.disconnect();
      resolve({
        success: true,
        details: {
          id: testSocket.id,
          connected: testSocket.connected,
          transport: testSocket.io.engine.transport.name,
        },
      });
    });

    testSocket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.error("[Socket Test] ❌ Connection failed:", error);
      testSocket.disconnect();
      resolve({
        success: false,
        error: error.message || "Connection failed",
        details: error,
      });
    });

    testSocket.on("disconnect", (reason) => {
      console.log("[Socket Test] Disconnected:", reason);
    });
  });
};

// Test function for different scenarios
export const runConnectionTests = async () => {
  const baseUrl =
    process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.106:3000";

  console.log("🧪 Running Socket.IO Connection Tests...\n");

  // Test 1: Basic connection (without auth)
  console.log("Test 1: Basic connection (no auth)");
  const test1 = await testSocketConnection(baseUrl);
  console.log("Result:", test1);
  console.log("---\n");

  // Test 2: Different transport methods
  console.log("Test 2: Testing WebSocket only");
  const testWebSocketOnly = await testConnectionWithTransport(baseUrl, [
    "websocket",
  ]);
  console.log("Result:", testWebSocketOnly);
  console.log("---\n");

  console.log("Test 3: Testing Polling only");
  const testPollingOnly = await testConnectionWithTransport(baseUrl, [
    "polling",
  ]);
  console.log("Result:", testPollingOnly);
  console.log("---\n");

  console.log("🏁 Tests completed!");
};

const testConnectionWithTransport = (
  baseUrl: string,
  transports: string[]
): Promise<ConnectionTestResult> => {
  return new Promise((resolve) => {
    const testSocket = io(baseUrl, {
      path: "/api/socket/io",
      transports: transports as any,
      timeout: 10000,
      reconnection: false,
      forceNew: true,
    });

    const timeout = setTimeout(() => {
      testSocket.disconnect();
      resolve({
        success: false,
        error: `Connection timeout with transports: ${transports.join(", ")}`,
      });
    }, 10000);

    testSocket.on("connect", () => {
      clearTimeout(timeout);
      testSocket.disconnect();
      resolve({
        success: true,
        details: {
          transport: testSocket.io.engine.transport.name,
          id: testSocket.id,
        },
      });
    });

    testSocket.on("connect_error", (error) => {
      clearTimeout(timeout);
      testSocket.disconnect();
      resolve({
        success: false,
        error: error.message || "Connection failed",
        details: { transports, error },
      });
    });
  });
};
