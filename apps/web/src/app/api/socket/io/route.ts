import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { initSocketIO, NextApiResponseServerIO } from '@/lib/socket/socket-server';

export async function GET(req: NextRequest) {
  const res = new NextResponse() as any;

  if (res.socket?.server?.io) {
    console.log('Socket.IO server already running');
    return NextResponse.json({ success: true, message: 'Socket.IO server already running' });
  }

  console.log('Starting Socket.IO server...');

  try {
    const httpServer: NetServer = res.socket?.server;

    if (httpServer) {
      const io = initSocketIO(httpServer);
      res.socket.server.io = io;
      console.log('Socket.IO server started successfully');
    }

    return NextResponse.json({ success: true, message: 'Socket.IO server started' });
  } catch (error) {
    console.error('Failed to start Socket.IO server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start Socket.IO server' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Handle Socket.IO initialization for POST requests if needed
  return GET(req);
}
