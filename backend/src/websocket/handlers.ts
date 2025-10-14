import { Server, Socket } from 'socket.io';
import { AuthenticatedRequest } from '@/types';
import AuthService from '@/services/auth';
import { Logger } from '@/utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const setupWebSocketHandlers = (io: Server) => {
  const logger = new Logger('websocket-handlers');
  
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const user = AuthService.verifyToken(token);
      if (!user) {
        return next(new Error('Invalid token'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user-specific room for private messages
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
    }

    // Handle portfolio updates subscription
    socket.on('subscribe:portfolio', (portfolioId: string) => {
      if (socket.user) {
        socket.join(`portfolio:${portfolioId}`);
        logger.info(`User ${socket.user.id} subscribed to portfolio ${portfolioId}`);
      }
    });

    // Handle threat alerts subscription
    socket.on('subscribe:threats', () => {
      if (socket.user) {
        socket.join(`threats:${socket.user.id}`);
        logger.info(`User ${socket.user.id} subscribed to threat alerts`);
      }
    });

    // Handle compliance updates subscription
    socket.on('subscribe:compliance', () => {
      if (socket.user) {
        socket.join(`compliance:${socket.user.id}`);
        logger.info(`User ${socket.user.id} subscribed to compliance updates`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Methods to emit events
  const emitThreatAlert = (userId: string, threatData: any) => {
    io.to(`threats:${userId}`).emit('threat:new', threatData);
  };

  const emitPortfolioUpdate = (portfolioId: string, updateData: any) => {
    io.to(`portfolio:${portfolioId}`).emit('portfolio:update', updateData);
  };

  const emitComplianceUpdate = (userId: string, updateData: any) => {
    io.to(`compliance:${userId}`).emit('compliance:update', updateData);
  };

  return {
    emitThreatAlert,
    emitPortfolioUpdate,
    emitComplianceUpdate
  };
};