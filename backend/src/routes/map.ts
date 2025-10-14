import { Router } from 'express';
import { getLiveThreats, getLiveTransactions } from '../controllers/mapController';
import rateLimit from 'express-rate-limit';

const router = Router();

// Apply rate limiting - 60 requests per minute
const mapRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests from this IP for map data'
});

router.get('/threats/live', mapRateLimit, getLiveThreats);
router.get('/transactions/live', mapRateLimit, getLiveTransactions);

export default router;