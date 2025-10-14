import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, ApiResponse, AssetType, Blockchain, RiskLevel, User, Portfolio } from '@/types';
import PortfolioService from '@/services/portfolio';
import { Logger } from '@/utils/logger';

const router = Router();
const logger = new Logger('portfolio-routes');

// Validation schemas
// Define type for portfolio creation
interface CreatePortfolioInput {
  name: string;
  description?: string;
  currency?: string;
  riskLevel?: string;
}

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  currency: z.string().length(3).default('USD'),
  riskLevel: z.nativeEnum(RiskLevel).default(RiskLevel.MODERATE),
}).transform((data): CreatePortfolioInput => ({
  name: data.name,
  description: data.description,
  currency: data.currency,
  riskLevel: data.riskLevel,
}));

const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  currency: z.string().length(3).optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
  isActive: z.boolean().optional(),
});

interface AddAssetInput {
  symbol: string;
  name: string;
  type: AssetType;
  amount: number;
  value: number;
  currency?: string;
  blockchain?: Blockchain;
  address?: string;
  exchange?: string;
  metadata?: Record<string, any>;
}

const addAssetSchema = z.object({
  symbol: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  type: z.nativeEnum(AssetType),
  amount: z.number().positive(),
  value: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  blockchain: z.nativeEnum(Blockchain).optional(),
  address: z.string().optional(),
  exchange: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).default({}),
}).transform((data): AddAssetInput => ({
  symbol: data.symbol,
  name: data.name,
  type: data.type,
  amount: data.amount,
  value: data.value,
  currency: data.currency,
  blockchain: data.blockchain,
  address: data.address,
  exchange: data.exchange,
  metadata: data.metadata,
}));

// Get user's portfolios
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const portfolios = await PortfolioService.getUserPortfolios(req.user.id);

    res.json({
      success: true,
      data: portfolios.map(portfolio => ({
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: portfolio.totalValue,
        currency: portfolio.currency,
        riskLevel: portfolio.riskLevel,
        isActive: portfolio.isActive,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      })),
      message: 'Portfolios retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get portfolios error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve portfolios',
    } as ApiResponse);
  }
});

// Get portfolio by ID
router.get('/:portfolioId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { portfolioId } = req.params;
    const portfolio = await PortfolioService.getPortfolioById(portfolioId);

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      } as ApiResponse);
      return;
    }

    // Check if user owns this portfolio
    if (portfolio.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: portfolio.totalValue,
        currency: portfolio.currency,
        riskLevel: portfolio.riskLevel,
        isActive: portfolio.isActive,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      },
      message: 'Portfolio retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get portfolio error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve portfolio',
    } as ApiResponse);
  }
});

// Create new portfolio
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const result = createPortfolioSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: result.error.errors.map(e => e.message),
      } as ApiResponse);
      return;
    }

    const portfolio = await PortfolioService.createPortfolio(req.user.id, result.data);

    if (!portfolio) {
      res.status(400).json({
        success: false,
        error: 'Failed to create portfolio',
      } as ApiResponse);
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: portfolio.totalValue,
        currency: portfolio.currency,
        riskLevel: portfolio.riskLevel,
        isActive: portfolio.isActive,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      },
      message: 'Portfolio created successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Create portfolio error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create portfolio',
    } as ApiResponse);
  }
});

// Update portfolio
router.put('/:portfolioId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { portfolioId } = req.params;
    const result = updatePortfolioSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: result.error.errors.map(e => e.message),
      } as ApiResponse);
      return;
    }

    const portfolio = await PortfolioService.updatePortfolio(portfolioId, result.data);

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: portfolio.totalValue,
        currency: portfolio.currency,
        riskLevel: portfolio.riskLevel,
        isActive: portfolio.isActive,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      },
      message: 'Portfolio updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Update portfolio error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update portfolio',
    } as ApiResponse);
  }
});

// Delete portfolio
router.delete('/:portfolioId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { portfolioId } = req.params;
    const success = await PortfolioService.deletePortfolio(portfolioId, req.user.id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Portfolio not found or could not be deleted',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Portfolio deleted successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Delete portfolio error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to delete portfolio',
    } as ApiResponse);
  }
});

// Get portfolio assets
router.get('/:portfolioId/assets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { portfolioId } = req.params;
    const assets = await PortfolioService.getPortfolioAssets(portfolioId, req.user.id);

    res.json({
      success: true,
      data: assets.map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        amount: asset.amount,
        value: asset.value,
        currency: asset.currency,
        blockchain: asset.blockchain,
        address: asset.address,
        exchange: asset.exchange,
        lastUpdated: asset.lastUpdated,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      })),
      message: 'Portfolio assets retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get portfolio assets error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve portfolio assets',
    } as ApiResponse);
  }
});

// Add asset to portfolio
router.post('/:portfolioId/assets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { portfolioId } = req.params;
    const result = addAssetSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: result.error.errors.map(e => e.message),
      } as ApiResponse);
      return;
    }

    const asset = await PortfolioService.addAsset(portfolioId, req.user.id, result.data);

    if (!asset) {
      res.status(400).json({
        success: false,
        error: 'Failed to add asset to portfolio',
      } as ApiResponse);
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        amount: asset.amount,
        value: asset.value,
        currency: asset.currency,
        blockchain: asset.blockchain,
        address: asset.address,
        exchange: asset.exchange,
        lastUpdated: asset.lastUpdated,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
      message: 'Asset added to portfolio successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Add asset error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to add asset',
    } as ApiResponse);
  }
});

// Get portfolio summary
router.get('/:portfolioId/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { portfolioId } = req.params;
    const summary = await PortfolioService.getPortfolioSummary(portfolioId, req.user.id);

    if (!summary) {
      res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: summary,
      message: 'Portfolio summary retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get portfolio summary error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve portfolio summary',
    } as ApiResponse);
  }
});

// Get user's total wealth
router.get('/user/wealth', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const wealth = await PortfolioService.getUserTotalWealth(req.user.id);

    res.json({
      success: true,
      data: wealth,
      message: 'User wealth retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get user wealth error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve user wealth',
    } as ApiResponse);
  }
});

export default router;
