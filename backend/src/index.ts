import express, { Request, Response } from 'express';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { Logger } from './utils/logger';

// Middleware and Config
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import { corsConfig } from './config/cors';
import { rateLimitConfig } from './config/rateLimit';
import csrf from './config/csrf';
import sanitizer from './config/sanitizer';
import { initializeDatabase } from './config/database';
import { ExchangeIntegrationService } from './services/exchangeIntegration';
import { ForensicAnalysisService } from './services/forensicAnalysis';
import { LawEnforcementCoordinationService } from './services/lawEnforcementCoordination';
import { RecoveryOperationsService } from './services/recoveryOperations';
import { NotificationService } from './services/notification'; // Import NotificationService
import { BillingService } from './services/billingService'; // Import BillingService
import { Jurisdiction } from './types'; // Import Jurisdiction enum

// Routes
import authRoutes from '@/routes/auth';
import portfolioRoutes from '@/routes/portfolio';
import threatRoutes from '@/routes/threats';
import complianceRoutes from '@/routes/compliance';
import websocketRoutes from '@/routes/websocket';
import recoveryRoutes from '@/routes/recovery';
import userRoutes from '@/routes/user';
import mapRoutes from '@/routes/map';
import adminRoutes from '@/routes/admin';
// import notificationRoutes from '@/routes/notifications';
// import expertRecoveryRoutes from '@/routes/expertRecovery';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = new Logger('main-server');

// Initialize Express app
const app = express();

const exchangeIntegrationService = new ExchangeIntegrationService();
const forensicAnalysisService = new ForensicAnalysisService();
const lawEnforcementCoordinationService = new LawEnforcementCoordinationService();
const recoveryOperationsService = new RecoveryOperationsService();

// Initialize services that depend on Redis with error handling
let notificationService: NotificationService | null = null;
let billingService: BillingService | null = null;

try {
  notificationService = NotificationService.getInstance(); // Initialize NotificationService
  billingService = new BillingService(); // Initialize BillingService
} catch (error) {
  logger.warn('Failed to initialize Redis-dependent services:', error);
  logger.warn('Continuing without Redis services...');
}

// Initialize HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsConfig,
  transports: ['websocket', 'polling']
});

// Setup WebSocket handlers
import { setupWebSocketHandlers } from './websocket/handlers';
const wsHandlers = setupWebSocketHandlers(io);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsConfig));

// Basic middleware
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Custom security middleware
app.use(sanitizer);

// Rate limiting
const limiter = rateLimit(rateLimitConfig);
const authLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
});

const generalLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 general requests per 15 minutes
});

// Apply rate limiting
app.use('/api/auth', authLimiter); // Strict rate limiting for auth endpoints
app.use('/api/', generalLimiter); // General rate limiting for other endpoints

// CSRF protection enabled for production security
app.get('/api/csrf-token', (req: Request, res: Response) => {
  const token = csrf.generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

// Enable CSRF protection for state-changing routes
const csrfProtection = csrf.doubleCsrfProtection;
app.use('/api/auth', csrfProtection);
app.use('/api/admin', csrfProtection);
app.use('/api/portfolio', csrfProtection);
app.use('/api/user', csrfProtection);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'VaultGuard Enterprise API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Enterprise-grade crypto security and portfolio management platform',
    documentation: '/api/docs',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      portfolio: '/api/portfolio',
      threats: '/api/threats',
      compliance: '/api/compliance',
      websocket: '/api/websocket',
      recovery: '/api/recovery'
    }
  });
});

// Placeholder for an incident detection system alert
// In a real scenario, this would be triggered by an actual incident.
app.post('/incident-alert', authMiddleware, async (req, res) => {
  const { exchangeId, accountId, transactionDetails } = req.body;
  try {
    await exchangeIntegrationService.freezeFundsOnExchange(req.user!.id, exchangeId, { accountId, transactionDetails });
    res.status(200).json({ message: 'Funds freeze initiated successfully.' });
  } catch (error: any) {
    logger.error('Failed to process incident alert:', error);
    res.status(500).json({ message: 'Failed to initiate fund freeze', error: error.message });
  }
});

app.post('/forensic-analysis', authMiddleware, async (req, res) => {
  const { stolenTxId } = req.body;
  try {
    const suspectAddresses = await forensicAnalysisService.analyzeThiefPatterns(req.user!.id, stolenTxId);
    res.status(200).json({ message: 'Forensic analysis initiated successfully.', suspectAddresses });
  } catch (error: any) {
    logger.error('Failed to perform forensic analysis:', error);
    res.status(500).json({ message: 'Failed to perform forensic analysis', error: error.message });
  }
});

app.post('/notify-law-enforcement', authMiddleware, async (req, res) => {
  const { country, incidentDetails } = req.body;
  try {
    // No longer need to validate against Jurisdiction enum here, as the service handles mock contacts
    await lawEnforcementCoordinationService.notifyLawEnforcement(req.user!.id, country, incidentDetails);
    res.status(200).json({ message: 'Law enforcement notification initiated successfully.' });
  } catch (error: any) {
    logger.error('Failed to notify law enforcement:', error);
    res.status(500).json({ message: 'Failed to notify law enforcement', error: error.message });
  }
});

app.post('/create-recovery-case', authMiddleware, async (req, res) => {
  const { incidentDetails } = req.body;
  try {
    const recoveryCase = await recoveryOperationsService.createRecoveryCase(incidentDetails);
    res.status(200).json({ message: 'Recovery case created successfully.', recoveryCase });
  } catch (error: any) {
    logger.error('Failed to create recovery case:', error);
    res.status(500).json({ message: 'Failed to create recovery case', error: error.message });
  }
});

app.post('/update-recovery-case-status', authMiddleware, async (req, res) => {
  const { caseId, status, notes } = req.body;
  try {
    const updatedCase = await recoveryOperationsService.updateRecoveryCaseStatus(caseId, status, notes);
    res.status(200).json({ message: 'Recovery case status updated successfully.', updatedCase });
  } catch (error: any) {
    logger.error('Failed to update recovery case status:', error);
    res.status(500).json({ message: 'Failed to update recovery case status', error: error.message });
  }
});

app.post('/trigger-legal-action', authMiddleware, async (req, res) => {
  const { caseId, action, legalTeamId } = req.body;
  try {
    const updatedCase = await recoveryOperationsService.triggerLegalAction(caseId, action, legalTeamId);
    res.status(200).json({ message: 'Legal action triggered successfully.', updatedCase });
  } catch (error: any) {
    logger.error('Failed to trigger legal action:', error);
    res.status(500).json({ message: 'Failed to trigger legal action', error: error.message });
  }
});

app.post('/process-recovery-funds', authMiddleware, async (req: any, res: Response): Promise<void> => {
  const { userId, caseId, totalRecovered } = req.body;
  try {
    if (!billingService) {
      res.status(503).json({ message: 'Billing service unavailable' });
      return;
    }
    const transaction = await billingService.processRecoveryFunds(userId, caseId, totalRecovered);
    res.status(200).json({ message: 'Recovery funds processed successfully.', transaction });
  } catch (error: any) {
    logger.error('Failed to process recovery funds:', error);
    res.status(500).json({ message: 'Failed to process recovery funds', error: error.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', authMiddleware, portfolioRoutes);
app.use('/api/threats', authMiddleware, threatRoutes);
app.use('/api/compliance', authMiddleware, complianceRoutes);
app.use('/api/websocket', websocketRoutes);
app.use('/api/recovery', authMiddleware, recoveryRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/map', authMiddleware, mapRoutes);
app.use('/api/admin', adminRoutes); // Admin routes (middleware applied within routes)
// app.use('/api/notifications', authMiddleware, notificationRoutes);
// app.use('/api/expert-recovery', authMiddleware, expertRecoveryRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

const PORT = process.env.PORT || 3001;

// Initialize database and cache before starting the server
initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`🚀 VaultGuard Backend Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔒 Security: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DEVELOPMENT'}`);
      logger.info('🔄 Supabase-Redis integration initialized');
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database and cache:', error);
    process.exit(1);
  });

export { app, server, io, wsHandlers };
