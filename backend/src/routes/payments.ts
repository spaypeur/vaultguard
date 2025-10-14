import { generateForm8949PDF } from '@/services/pdfGenerator';
import { calculateGainsLosses, getAllUserTransactions } from '@/services/taxCalculator';
import { Logger } from '@/utils/logger';

// $99/report pricing
const TAX_REPORT_PRICE = 99;
const TAX_REPORT_PRODUCT = {
  name: 'Automated Crypto Tax Report (Form 8949)',
  price: TAX_REPORT_PRICE,
  currency: 'USD',
  description: 'Automated crypto tax report with exchange integration and IRS Form 8949 PDF',
};

// === TAX REPORT PAYMENT (IRS Form 8949) ===
// Create payment session for tax report
router.post('/tax-report/create-session', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const { paymentMethod } = req.body;
    let session;
    if (paymentMethod === 'fiat') {
      session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: TAX_REPORT_PRODUCT.currency.toLowerCase(),
            product_data: {
              name: TAX_REPORT_PRODUCT.name,
              description: TAX_REPORT_PRODUCT.description,
            },
            unit_amount: TAX_REPORT_PRODUCT.price * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/tax-report/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/tax-report/cancel`,
        customer_email: req.user.email,
        metadata: {
          user_id: req.user.id,
          product: 'tax_report',
        },
      });
    }
    await DatabaseService.logAuditEvent(
      req.user.id,
      'tax_report_payment_session_created',
      'payment',
      null,
      null,
      {
        paymentMethod,
        sessionId: session?.id,
        amount: TAX_REPORT_PRODUCT.price,
        currency: TAX_REPORT_PRODUCT.currency,
      }
    );
    res.json({
      success: true,
      data: {
        sessionId: session?.id,
        url: session?.url,
        product: TAX_REPORT_PRODUCT,
        wallets: paymentMethod === 'crypto' ? PAYMENT_WALLETS : null,
      },
      message: 'Tax report payment session created',
    });
    return;
  } catch (error: any) {
    logger.error('Create tax report payment session error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to create tax report payment session' });
    return;
  }
});

// Stripe webhook for tax report
router.post('/tax-report/webhook', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig || !STRIPE_WEBHOOK_SECRET) {
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }
    const body = JSON.stringify(req.body);
    const event = stripeClient.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.user_id;
      if (userId && session.metadata?.product === 'tax_report') {
        await DatabaseService.logAuditEvent(
          userId,
          'tax_report_payment_completed',
          'payment',
          null,
          null,
          {
            amount: session.amount_total / 100,
            currency: session.currency?.toUpperCase(),
            paymentMethod: 'stripe',
            sessionId: session.id,
            product: 'tax_report',
          }
        );
        // Mark user as eligible to generate/download tax report
        await DatabaseService.updateUser(userId, { tax_report_paid: true, tax_report_paid_at: new Date() });
      }
    }
    res.json({ received: true });
    return;
  } catch (error: any) {
    logger.error('Tax report webhook error:', error);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
    return;
  }
});

// Generate and download IRS Form 8949 PDF (requires payment)
router.post('/tax-report/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    // Check payment status
    const user = await DatabaseService.getUserById(req.user.id);
    if (!user?.tax_report_paid) {
      res.status(402).json({ success: false, error: 'Payment required for tax report' });
      return;
    }
    // Fetch transactions and calculate gains/losses
    const txs = await getAllUserTransactions(user);
    const gainsLosses = calculateGainsLosses(txs);
    // Generate PDF
    const pdfPath = await generateForm8949PDF(gainsLosses, req.user.id);
    // Optionally, reset tax_report_paid so user must pay again for next report
    await DatabaseService.updateUser(req.user.id, { tax_report_paid: false });
    // Send PDF file
    res.download(pdfPath, `IRS_Form_8949_${new Date().getFullYear()}.pdf`);
    return;
  } catch (error: any) {
    logger.error('Generate tax report error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate tax report' });
    return;
  }
});
import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import stripe from 'stripe';
import DatabaseService from '@/services/database';

const router = Router();
const logger = new Logger('payments');

// Validate environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

// Initialize Stripe
const stripeClient = new stripe(STRIPE_SECRET_KEY);

// 🔐 SECURE WALLET ADDRESSES - Owner Verified
// All client crypto payments will be sent to these addresses
const PAYMENT_WALLETS = {
  BTC: 'bc1qshs529g7r3uhfvr4uf68yj9l243nnkz8082ve7', // Bitcoin (bech32 format)
  ETH: '0x6f3d73eadffad9ad3f8cb04d133282de95d6c3cd', // Ethereum (ERC20 compatible)
  USDT_ERC20: '0x6f3d73eadffad9ad3f8cb04d133282de95d6c3cd', // USDT ERC20 (same as ETH)
  USDT_TRC20: 'TA7LQSsqimN18hiwoeTZnymcDS4kUeNCT8', // TRC20 USDT - Your TRON wallet
  SOL: 'BHdJyRkTkxVRCqKWi8oKbcD2ijKFwXYeH1ZfogLcXxLb', // Solana (base58 format)
  ADA: 'addr1q9de789ay5ygnhqfd5g9pnadnasm2wpwrqe6sh0jh64y50wdrcr7nywn3t7sy0fh66uf2wftz4lwc303su8t03wzh2yqhqwn5u', // Cardano
  DOT: '0x93812EE085718eC2ae1cF33921020e9CE9E3f2dC', // Polkadot (hex format)
};

// ✅ WALLET STATUS: ALL ACTIVE
// - BTC: ✅ Active (Client's wallet)
// - ETH: ✅ Active (Client's wallet)
// - USDT_ERC20: ✅ Active (Same as ETH wallet)
// - USDT_TRC20: ✅ ACTIVE (Client's TRON wallet - TA7LQSsqimN18hiwoeTZnymcDS4kUeNCT8)
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

// Supported cryptocurrencies for payment
const SUPPORTED_CRYPTO = [
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', wallet: PAYMENT_WALLETS.BTC },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', wallet: PAYMENT_WALLETS.ETH },
  { code: 'USDT_ERC20', name: 'Tether (ERC20)', symbol: '₮', wallet: PAYMENT_WALLETS.USDT_ERC20 },
  { code: 'USDT_TRC20', name: 'Tether (TRC20)', symbol: '₮', wallet: PAYMENT_WALLETS.USDT_TRC20 },
  { code: 'SOL', name: 'Solana', symbol: '◎', wallet: PAYMENT_WALLETS.SOL },
  { code: 'ADA', name: 'Cardano', symbol: '₳', wallet: PAYMENT_WALLETS.ADA },
  { code: 'DOT', name: 'Polkadot', symbol: '●', wallet: PAYMENT_WALLETS.DOT },
];

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
      data: SUPPORTED_CRYPTO,
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
      // Create Stripe payment session
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
        wallets: paymentMethod === 'crypto' ? PAYMENT_WALLETS : null,
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

// Verify crypto payment (manual verification for non-automated payments)
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

    // Note: In production, integrate with blockchain explorers for automatic verification
    // For now, this creates a manual verification request

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];

    // Log crypto payment verification request
    await DatabaseService.logAuditEvent(
      req.user.id,
      'crypto_payment_verification_requested',
      'payment',
      null,
      null,
      {
        planId,
        planName: plan.name,
        cryptocurrency,
        transactionId,
        amount: parseFloat(amount),
        walletAddress: PAYMENT_WALLETS[cryptocurrency as keyof typeof PAYMENT_WALLETS],
        status: 'pending_verification',
      }
    );

    res.json({
      success: true,
      message: 'Crypto payment verification request submitted. Please allow 24-48 hours for manual verification.',
      data: {
        requestId: `req_${Date.now()}_${req.user.id}`,
        expectedWallet: PAYMENT_WALLETS[cryptocurrency as keyof typeof PAYMENT_WALLETS],
        expectedAmount: plan.price,
        currency: 'USD',
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

// Payment information for UI
router.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        supportedCrypto: SUPPORTED_CRYPTO,
        pricingPlans: PRICING_PLANS,
        paymentMethods: ['stripe', 'crypto'],
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
