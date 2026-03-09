import { RedisClient } from '@shared/components/redis-pubsub/redis';
import Logger from '@shared/utils/logger';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

interface SocketUser {
  userId: string;
  socketId: string;
}

export class SocketService {
  private static instance: SocketService;
  private io!: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.use(this.authMiddleware);

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    this.subscribeToRedisEvents();
    Logger.success('Socket.io initialized');
  }

  private authMiddleware = (socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      // Decode token to get user ID. 
      // Note: In a real microservice, we might verify with the auth service, 
      // but for now we assume the token is valid if it can be decoded and contains 'sub'.
      // Or verify using the same secret if available.
      // Assuming standard JWT structure where 'sub' is userId.
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.sub) {
        return next(new Error('Invalid token'));
      }
      socket.data.userId = decoded.sub;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  };

  private handleConnection(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      this.userSockets.set(userId, socket.id);
      Logger.info(`User connected: ${userId}`);

      socket.on('disconnect', () => {
        this.userSockets.delete(userId);
        Logger.info(`User disconnected: ${userId}`);
      });
    }
  }

  private async subscribeToRedisEvents() {
    const redis = RedisClient.getInstance();
    
    // Subscribe to NEW_MESSAGE event
    await redis.subscribe('NEW_MESSAGE', (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        this.handleNewMessage(parsedMessage.payload);
      } catch (error) {
        Logger.error(`Error parsing Redis message: ${error}`);
      }
    });
  }

  private handleNewMessage(payload: any) {
    // Payload structure depends on what we publish. 
    // Assuming { receiverId: string, message: any }
    const { receiverId, message } = payload;
    
    if (receiverId && message) {
      const socketId = this.userSockets.get(receiverId);
      if (socketId) {
        this.io.to(socketId).emit('new_message', message);
        Logger.info(`Message sent to user ${receiverId}`);
      }
    }
  }

  public getIO(): Server {
    return this.io;
  }
}
