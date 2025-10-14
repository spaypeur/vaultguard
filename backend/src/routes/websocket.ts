import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WebSocket endpoint - connect via Socket.IO client',
    endpoint: '/socket.io',
  });
});

// Export router as the default middleware
export default router as Router;
