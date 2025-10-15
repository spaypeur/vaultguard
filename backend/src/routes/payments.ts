import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import stripe from 'stripe';
import DatabaseService from '@/services/database';
import { Logger } from '@/utils/logger';
import BTCPayServerService from '@/services/btcpayServer';
import BTCPayWebhooks from '@/services/btcpayWebhooks';

const router = Router();
const logger = new Logger('payments');

// Validate environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Stripe (optional - for backward compatibility)
let stripeClient: stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripeClient = new stripe(STRIPE_SECRET_KEY);
}

// Initialize BTCPay Server (optional)
let btcpayService: BTCPayServerService | null = null;
let btcpayWebhooks: BTCPayWebhooks | null = null;

try {
  btcpayService = new BTCPayServerService();
  btcpayWebhooks = new BTCPayWebhooks();
  logger.info('BTCPay Server integration enabled');
} catch (error) {
  logger.warn('BTCPay Server integration disabled:', error instanceof Error ? error.message : 'Unknown error');
}

// 🔐 SECURE WALLET ADDRESSES - Environment Variables Only
// All client crypto payments will be sent to these addresses
const getPaymentWallets = () => ({
  BTC: process.env.PAYMENT_WALLET_BTC || '',
  ETH: process.env.PAYMENT_WALLET_ETH || '',
  USDT_ERC20: process.env.PAYMENT_WALLET_ETH || '', // Same as ETH wallet for ERC20
  USDT_TRC20: process.env.PAYMENT_WALLET_TRC20 || '', // TRC20 USDT - Configure your TRON wallet in env
  SOL: process.env.PAYMENT_WALLET_SOL || '',
  ADA: process.env.PAYMENT_WALLET_ADA || '',
  DOT: process.env.PAYMENT_WALLET_DOT || '',
});

// ✅ WALLET STATUS: ALL ACTIVE
// - BTC: ✅ Active (Client's wallet)
// - ETH: ✅ Active (Client's wallet)
// - USDT_ERC20: ✅ Active (Same as ETH wallet)
// - USDT_TRC20: ✅ Active (Configure TRON wallet in environment variables)
// - SOL: ✅ Active (Client's wallet)
// - ADA: ✅ Active (Client's wallet)
// - DOT: ✅ Active (Client's wallet)

// 🎉 ALL CRYPTO PAYMENTS NOW ENABLED!

// Pricing plans
const PRICING_PLANS = {
  foundation: {
    name: 'Foundation',
    price: 50000, // $50,000 per year
    currency: 'USD',
    description: 'Basic monitoring package',
    features: ['Real-time threat detection', 'Basic compliance reporting', 'Email/SMS alerts'],
  },
  guardian: {
    name: 'Guardian',
    price: 250000, // $250,000 per year
    currency: 'USD',
    description: 'Full service package',
    features: ['All Foundation features', 'Automated compliance', 'Priority support', 'Custom integrations'],
  },
  sovereign: {
    name: 'Sovereign',
    price: 1000000, // $1M+ per year (custom pricing)
    currency: 'USD',
    description: 'Family office package',
    features: ['All Guardian features', 'Dedicated security team', 'Legacy planning', 'Institutional features'],
  },
};

// Supported cryptocurrencies for payment (loaded dynamically for security)
const getSupportedCrypto = () => {
  const wallets = getPaymentWallets();
  return [
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', wallet: wallets.BTC },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', wallet: wallets.ETH },
    { code: 'USDT_ERC20', name: 'Tether (ERC20)', symbol: '₮', wallet: wallets.USDT_ERC20 },
    { code: 'USDT_TRC20', name: 'Tether (TRC20)', symbol: '₮', wallet: wallets.USDT_TRC20 },
    { code: 'SOL', name: 'Solana', symbol: '◎', wallet: wallets.SOL },
    { code: 'ADA', name: 'Cardano', symbol: '₳', wallet: wallets.ADA },
    { code: 'DOT', name: 'Polkadot', symbol: '●', wallet: wallets.DOT },
  ];
};

// Get pricing plans
router.get('/plans', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: PRICING_PLANS,
      message: 'Pricing plans retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get plans error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve pricing plans',
    } as ApiResponse);
  }
});

// Get supported cryptocurrencies for payment
router.get('/crypto', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: getSupportedCrypto(),
      message: 'Supported cryptocurrencies retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get crypto error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve cryptocurrencies',
    } as ApiResponse);
  }
});

// Create payment session for fiat payments
router.post('/create-session', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { planId, paymentMethod } = req.body;

    if (!PRICING_PLANS[planId as keyof typeof PRICING_PLANS]) {
      res.status(400).json({
        success: false,
        error: 'Invalid plan selected',
      } as ApiResponse);
      return;
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];

    let session;

    if (paymentMethod === 'fiat') {
      // Create Stripe payment session (if Stripe is available)
      if (stripeClient) {
        session = await stripeClient.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: plan.currency.toLowerCase(),
              product_data: {
                name: `${plan.name} Plan Subscription`,
                description: plan.description,
              },
              unit_amount: plan.price * 100, // Convert to cents
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          customer_email: req.user.email,
          metadata: {
            user_id: req.user.id,
            plan_id: planId,
            plan_name: plan.name,
          },
        });
      } else {
        throw new Error('Stripe payment method not available');
      }
    } else if (paymentMethod === 'btcpay') {
      // Create BTCPay Server invoice
      if (btcpayService) {
        const orderId = `btcpay_${Date.now()}_${req.user.id}`;
        const btcpayResult = await btcpayService.createInvoice({
          amount: plan.price,
          currency: plan.currency,
          orderId,
          userId: req.user.id,
          planId,
          planName: plan.name,
          redirectURL: `${process.env.FRONTEND_URL}/payment/success?btcpay_invoice=${orderId}`,
        });

        if (btcpayResult.success && btcpayResult.invoiceId && btcpayResult.checkoutUrl) {
          session = {
            id: btcpayResult.invoiceId,
            url: btcpayResult.checkoutUrl,
          };
        } else {
          throw new Error(btcpayResult.error || 'Failed to create BTCPay Server invoice');
        }
      } else {
        throw new Error('BTCPay Server payment method not available');
      }
    }

    // Store payment session in database
    await DatabaseService.logAuditEvent(
      req.user.id,
      'payment_session_created',
      'payment',
      null,
      null,
      {
        planId,
        paymentMethod,
        sessionId: session?.id,
        amount: plan.price,
        currency: plan.currency,
      }
    );

    res.json({
      success: true,
      data: {
        sessionId: session?.id,
        url: session?.url,
        plan,
        paymentMethod,
        wallets: paymentMethod === 'crypto' ? getPaymentWallets() : null,
        btcpayEnabled: !!btcpayService,
        stripeEnabled: !!stripeClient,
      },
      message: 'Payment session created successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Create payment session error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create payment session',
    } as ApiResponse);
  }
});

// Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig || !STRIPE_WEBHOOK_SECRET) {
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }

    // Verify webhook signature
    const body = JSON.stringify(req.body);
    const event = stripeClient.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      // Extract metadata
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;
      const planName = session.metadata?.plan_name;

      if (userId && planId) {
        // Update user's subscription status
        await DatabaseService.updateUser(userId, {
          subscription_plan: planId,
          subscription_status: 'active',
          subscription_started_at: new Date(),
        });

        // Log successful payment
        await DatabaseService.logAuditEvent(
          userId,
          'payment_completed',
          'payment',
          null,
          null,
          {
            planId,
            planName,
            amount: session.amount_total / 100,
            currency: session.currency?.toUpperCase(),
            paymentMethod: 'stripe',
            sessionId: session.id,
          }
        );
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error:', error);
    res.status(400).json({
      error: `Webhook Error: ${error.message}`,
    });
  }
});

// BTCPay Server webhook handler
router.post('/btcpay-webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!btcpayWebhooks) {
      res.status(503).json({ error: 'BTCPay Server integration not available' });
      return;
    }

    const sig = req.headers['btcpay-sig'];

    if (!sig) {
      res.status(400).json({ error: 'BTCPay webhook signature missing' });
      return;
    }

    const body = JSON.stringify(req.body);
    const result = await btcpayWebhooks.handleWebhook(sig as string, body);

    if (result.received) {
      res.json({ received: true });
    } else {
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  } catch (error: any) {
    logger.error('BTCPay webhook error:', error);
    res.status(400).json({
      error: `BTCPay Webhook Error: ${error.message}`,
    });
  }
});

import CryptoPaymentVerifier from '@/services/cryptoPaymentVerifier';

// Initialize crypto payment verifier
const cryptoVerifier = CryptoPaymentVerifier.getInstance();

// Verify crypto payment (automated verification using blockchain APIs)
router.post('/verify-crypto', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { planId, cryptocurrency, transactionId, amount } = req.body;

    if (!PRICING_PLANS[planId as keyof typeof PRICING_PLANS]) {
      res.status(400).json({
        success: false,
        error: 'Invalid plan selected',
      } as ApiResponse);
      return;
    }

    // Validate cryptocurrency is supported
    const wallets = getPaymentWallets();
    if (!wallets[cryptocurrency as keyof typeof wallets]) {
      res.status(400).json({
        success: false,
        error: `Unsupported cryptocurrency: ${cryptocurrency}`,
      } as ApiResponse);
      return;
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    const expectedAmount = parseFloat(amount);

    // Validate amount matches plan price
    if (Math.abs(expectedAmount - plan.price) > plan.price * 0.001) {
      res.status(400).json({
        success: false,
        error: `Payment amount ${expectedAmount} does not match plan price ${plan.price}`,
      } as ApiResponse);
      return;
    }

    // Generate unique payment ID
    const paymentId = `crypto_${Date.now()}_${req.user.id}`;

    // Submit payment for automated verification
    const verificationRequest = {
      userId: req.user.id,
      planId,
      cryptocurrency,
      expectedAmount,
      transactionHash: transactionId,
      walletAddress: wallets[cryptocurrency as keyof typeof wallets],
      paymentId,
    };

    await cryptoVerifier.submitPaymentVerification(verificationRequest);

    res.json({
      success: true,
      message: 'Crypto payment submitted for automated verification. You will receive an email confirmation once verified.',
      data: {
        paymentId,
        expectedWallet: verificationRequest.walletAddress,
        expectedAmount: plan.price,
        currency: 'USD',
        cryptocurrency,
        estimatedVerificationTime: '5-15 minutes',
      },
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Crypto verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to submit crypto payment verification',
    } as ApiResponse);
  }
});

// Get crypto payment status
router.get('/crypto-status/:paymentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { paymentId } = req.params;

    // Get payment status from audit logs
    const auditLogs = await DatabaseService.getAuditLogsByUserId(req.user.id, 100);

    const paymentLogs = auditLogs.filter(log =>
      log.resource_id === paymentId &&
      (log.action.includes('payment') || log.action.includes('subscription'))
    );

    if (paymentLogs.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      } as ApiResponse);
      return;
    }

    // Determine current status
    let status = 'pending';
    let message = 'Payment is being verified...';

    const verifiedLog = paymentLogs.find(log => log.action === 'crypto_payment_verified');
    const failedLog = paymentLogs.find(log => log.action === 'crypto_payment_verification_failed');

    if (verifiedLog) {
      status = 'verified';
      message = 'Payment verified successfully and subscription activated';
    } else if (failedLog) {
      status = 'failed';
      message = failedLog.new_values?.reason || 'Payment verification failed';
    }

    res.json({
      success: true,
      data: {
        paymentId,
        status,
        message,
        logs: paymentLogs.map(log => ({
          action: log.action,
          timestamp: log.created_at,
          details: log.new_values,
        })),
      },
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get crypto payment status error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get payment status',
    } as ApiResponse);
  }
});

// Start crypto payment monitoring (admin only)
router.post('/admin/start-monitoring', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      } as ApiResponse);
      return;
    }

    cryptoVerifier.startMonitoring();

    res.json({
      success: true,
      message: 'Automated crypto payment monitoring started',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Start monitoring error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to start monitoring',
    } as ApiResponse);
  }
});

// Stop crypto payment monitoring (admin only)
router.post('/admin/stop-monitoring', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      } as ApiResponse);
      return;
    }

    cryptoVerifier.stopMonitoring();

    res.json({
      success: true,
      message: 'Automated crypto payment monitoring stopped',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Stop monitoring error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to stop monitoring',
    } as ApiResponse);
  }
});

// Get blockchain API health status (admin only)
router.get('/admin/blockchain-health', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      } as ApiResponse);
      return;
    }

    const health = await cryptoVerifier.healthCheck();

    res.json({
      success: true,
      data: {
        health,
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Blockchain health check error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to check blockchain health',
    } as ApiResponse);
  }
});

// Get user's subscription status
router.get('/subscription', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const user = await DatabaseService.getUserById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: {
        plan: user.subscription_plan,
        status: user.subscription_status,
        startedAt: user.subscription_started_at,
        expiresAt: user.subscription_expires_at,
      },
      message: 'Subscription status retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get subscription error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve subscription status',
    } as ApiResponse);
  }
});

// Get payment history
router.get('/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    // Retrieve payment history from audit logs
    // In production, consider a dedicated payments table
    const auditLogs = await DatabaseService.getAuditLogsByUserId(req.user.id);

    const paymentHistory = auditLogs
      .filter(log => log.action.includes('payment') || log.action === 'subscription_updated')
      .map(log => ({
        id: log.id,
        action: log.action,
        amount: log.new_values?.amount,
        currency: log.new_values?.currency,
        plan: log.new_values?.planName || log.new_values?.planId,
        status: 'completed',
        date: log.created_at,
        method: log.new_values?.paymentMethod,
      }));

    res.json({
      success: true,
      data: paymentHistory,
      message: 'Payment history retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get payment history error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve payment history',
    } as ApiResponse);
  }
});

// Admin: Manual subscription management
router.patch('/subscription/:userId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      } as ApiResponse);
      return;
    }

    const { userId } = req.params;
    const { planId, status } = req.body;

    await DatabaseService.updateUser(userId, {
      subscription_plan: planId,
      subscription_status: status,
    });

    // Log admin action
    await DatabaseService.logAuditEvent(
      req.user.id,
      'admin_subscription_updated',
      'user',
      userId,
      null,
      { planId, status, updatedBy: req.user.id }
    );

    res.json({
      success: true,
      message: 'Subscription updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Update subscription error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update subscription',
    } as ApiResponse);
  }
});

// BTCPay Server health check (admin only)
router.get('/btcpay-health', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      } as ApiResponse);
      return;
    }

    if (!btcpayWebhooks) {
      res.status(503).json({
        success: false,
        error: 'BTCPay Server integration not available',
      } as ApiResponse);
      return;
    }

    const health = await btcpayWebhooks.getHealthStatus();

    res.json({
      success: true,
      data: health,
      message: 'BTCPay Server health status retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('BTCPay health check error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve BTCPay Server health status',
    } as ApiResponse);
  }
});

// Payment information for UI
router.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentMethods = ['crypto'];

    if (stripeClient) paymentMethods.unshift('stripe');
    if (btcpayService) paymentMethods.unshift('btcpay');

    res.json({
      success: true,
      data: {
        supportedCrypto: getSupportedCrypto(),
        pricingPlans: PRICING_PLANS,
        paymentMethods,
        btcpayEnabled: !!btcpayService,
        stripeEnabled: !!stripeClient,
        supportEmail: 'payments@vaultguard.io',
        termsUrl: 'https://vaultguard.io/terms',
        refundPolicy: 'https://vaultguard.io/refunds',
      },
      message: 'Payment information retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get payment info error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve payment information',
    } as ApiResponse);
  }
});

export default router;
