import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: Server | undefined;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    res.status(400).end();
    return;
  }

  // @ts-ignore: Next.js type issue
  if (!res.socket.server.io) {
    // @ts-ignore: Next.js type issue
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    // @ts-ignore: Next.js type issue
    res.socket.server.io = io;

    io.on('connection', (socket: any) => {
      // You can add listeners here
      socket.on('disconnect', () => {});
    });
  }
  res.end();
} 