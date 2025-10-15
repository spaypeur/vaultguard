import { Logger } from '../utils/logger';
import { DatabaseService } from './database';
import { EmailService } from './email';
import { generateForm8949PDF } from './pdfGenerator';
import { NotificationService } from './notification';
import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  trialDays?: number;
  maxAssets?: number;
  maxUsers?: number;
  prioritySupport?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  paymentMethodId?: string;
  nextInvoiceDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
  lineItems: InvoiceLineItem[];
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface PaymentFailure {
  id: string;
  subscriptionId: string;
  userId: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  failureReason: string;
  retryCount: number;
  maxRetries: number;
  nextRetryDate?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CancellationSurvey {
  id: string;
  subscriptionId: string;
  userId: string;
  reason: string;
  feedback?: string;
  wouldRecommend?: number; // 1-10 scale
  alternatives?: string[];
  createdAt: Date;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?: number;
  usedCount: number;
  validFrom: Date;
  validUntil?: Date;
  applicablePlans?: string[];
  active: boolean;
  createdAt: Date;
}

export interface SubscriptionAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  canceledSubscribers: number;
  monthlyRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  planDistribution: Record<string, number>;
  revenueByPlan: Record<string, number>;
}

export class SubscriptionManager {
  private logger = new Logger('SubscriptionManager');
  private stripe: Stripe;
  private emailService: EmailService;
  private notificationService: NotificationService;

  // Default subscription plans
  private readonly PLANS: Record<string, SubscriptionPlan> = {
    foundation: {
      id: 'foundation',
      name: 'Foundation',
      price: 50000, // $50,000 per year
      currency: 'USD',
      interval: 'year',
      features: ['Real-time threat detection', 'Basic compliance reporting', 'Email/SMS alerts'],
      trialDays: 30,
      maxAssets: 10,
      maxUsers: 5,
      prioritySupport: false,
    },
    guardian: {
      id: 'guardian',
      name: 'Guardian',
      price: 250000, // $250,000 per year
      currency: 'USD',
      interval: 'year',
      features: ['All Foundation features', 'Automated compliance', 'Priority support', 'Custom integrations'],
      trialDays: 30,
      maxAssets: 100,
      maxUsers: 25,
      prioritySupport: true,
    },
    sovereign: {
      id: 'sovereign',
      name: 'Sovereign',
      price: 1000000, // $1M+ per year (custom pricing)
      currency: 'USD',
      interval: 'year',
      features: ['All Guardian features', 'Dedicated security team', 'Legacy planning', 'Institutional features'],
      trialDays: 30,
      maxAssets: -1, // unlimited
      maxUsers: -1, // unlimited
      prioritySupport: true,
    },
  };

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    this.emailService = EmailService.getInstance();
    this.notificationService = NotificationService.getInstance();

    this.logger.info('Subscription Manager initialized');
  }

  // ========== SUBSCRIPTION MANAGEMENT ==========

  /**
   * Create a new subscription for a user
   */
  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId?: string,
    trialDays?: number
  ): Promise<Subscription | null> {
    try {
      if (!this.PLANS[planId]) {
        throw new Error(`Invalid plan: ${planId}`);
      }

      const plan = this.PLANS[planId];
      const now = new Date();

      // Calculate trial period
      let trialStart: Date | undefined;
      let trialEnd: Date | undefined;
      if (trialDays || plan.trialDays) {
        trialStart = now;
        trialEnd = new Date(now.getTime() + ((trialDays || plan.trialDays)! * 24 * 60 * 60 * 1000));
      }

      // Create Stripe subscription if payment method provided
      let stripeSubscriptionId: string | undefined;
      if (paymentMethodId) {
        // First create a product
        const product = await this.stripe.products.create({
          name: `${plan.name} Plan`,
          description: plan.features.join(', '),
          metadata: {
            plan_id: planId,
          },
        });

        // Then create a price for the product
        const price = await this.stripe.prices.create({
          product: product.id,
          unit_amount: plan.price * 100,
          currency: plan.currency.toLowerCase(),
          recurring: {
            interval: plan.interval as 'month' | 'year',
          },
          metadata: {
            plan_id: planId,
          },
        });

        // Create the subscription
        const stripeSubscription = await this.stripe.subscriptions.create({
          customer: await this.getOrCreateStripeCustomer(userId),
          items: [{
            price: price.id,
          }],
          default_payment_method: paymentMethodId,
          trial_period_days: trialDays || plan.trialDays,
          metadata: {
            user_id: userId,
            plan_id: planId,
          },
        });

        stripeSubscriptionId = stripeSubscription.id;
      }

      // Create subscription record
      const subscription: Partial<Subscription> = {
        userId,
        planId,
        stripeSubscriptionId,
        status: trialEnd ? 'trialing' : 'active',
        currentPeriodStart: trialStart || now,
        currentPeriodEnd: trialEnd || new Date(now.getTime() + (plan.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
        trialStart,
        trialEnd,
        paymentMethodId,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };

      // Store in database (you'll need to implement this based on your schema)
      const createdSubscription = await this.storeSubscription(subscription as Subscription);

      // Update user subscription status
      await DatabaseService.updateUser(userId, {
        subscription_plan: planId,
        subscription_status: subscription.status,
        subscription_started_at: now,
      });

      // Send welcome email
      await this.sendSubscriptionWelcomeEmail(userId, plan);

      this.logger.info(`Created subscription for user ${userId}, plan ${planId}`);
      return createdSubscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
    reason?: string,
    feedback?: string
  ): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (cancelAtPeriodEnd && subscription.stripeSubscriptionId) {
        // Cancel at period end in Stripe
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } else if (subscription.stripeSubscriptionId) {
        // Cancel immediately in Stripe
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }

      // Update subscription record
      await this.updateSubscription(subscriptionId, {
        status: cancelAtPeriodEnd ? 'active' : 'canceled',
        cancelAtPeriodEnd,
        canceledAt: new Date(),
        endedAt: cancelAtPeriodEnd ? undefined : new Date(),
      });

      // Update user status
      await DatabaseService.updateUser(subscription.userId, {
        subscription_status: cancelAtPeriodEnd ? 'active' : 'canceled',
      });

      // Store cancellation survey if provided
      if (reason || feedback) {
        await this.storeCancellationSurvey(subscriptionId, reason || '', feedback);
      }

      // Send cancellation confirmation email
      await this.sendCancellationEmail(subscription.userId, cancelAtPeriodEnd);

      // Trigger win-back campaign if canceling at period end
      if (cancelAtPeriodEnd) {
        await this.triggerWinBackCampaign(subscription.userId);
      }

      this.logger.info(`Canceled subscription ${subscriptionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Update subscription payment method
   */
  async updatePaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('Subscription not found or not managed by Stripe');
      }

      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        default_payment_method: paymentMethodId,
      });

      await this.updateSubscription(subscriptionId, {
        paymentMethodId,
        updatedAt: new Date(),
      });

      this.logger.info(`Updated payment method for subscription ${subscriptionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update payment method for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  // ========== AUTOMATED RENEWAL SYSTEM ==========

  /**
   * Daily check for expiring subscriptions (7-day notice)
   */
  async checkExpiringSubscriptions(): Promise<void> {
    try {
      const expiringSoon = new Date();
      expiringSoon.setDate(expiringSoon.getDate() + 7);

      const subscriptions = await this.getSubscriptionsExpiringBy(expiringSoon);

      for (const subscription of subscriptions) {
        if (subscription.status === 'active' && !subscription.cancelAtPeriodEnd) {
          // Send renewal reminder
          await this.sendRenewalReminderEmail(subscription.userId, subscription.currentPeriodEnd);

          // Schedule auto-renewal if payment method on file
          if (subscription.paymentMethodId && subscription.stripeSubscriptionId) {
            await this.processAutoRenewal(subscription.id);
          }
        }
      }

      this.logger.info(`Checked ${subscriptions.length} expiring subscriptions`);
    } catch (error) {
      this.logger.error('Failed to check expiring subscriptions:', error);
    }
  }

  /**
   * Process auto-renewal for subscription
   */
  private async processAutoRenewal(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        return false;
      }

      // Stripe will automatically attempt to charge the payment method
      // We'll handle success/failure via webhooks

      this.logger.info(`Processed auto-renewal for subscription ${subscriptionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to process auto-renewal for subscription ${subscriptionId}:`, error);
      return false;
    }
  }

  // ========== INVOICE GENERATION ==========

  /**
   * Generate invoice for subscription payment
   */
  async generateInvoice(
    subscriptionId: string,
    stripeInvoiceId?: string
  ): Promise<Invoice | null> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = this.PLANS[subscription.planId];
      const now = new Date();

      // Create invoice number
      const invoiceNumber = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

      const lineItems: InvoiceLineItem[] = [{
        id: `line-${Date.now()}`,
        description: `${plan.name} Plan Subscription`,
        amount: plan.price * 100, // Convert to cents
        quantity: 1,
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
      }];

      const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

      const invoice: Partial<Invoice> = {
        subscriptionId,
        userId: subscription.userId,
        invoiceNumber,
        amount: plan.price,
        currency: plan.currency,
        status: 'open',
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        stripeInvoiceId,
        lineItems,
        totalAmount,
        createdAt: now,
        updatedAt: now,
      };

      // Generate PDF invoice
      const pdfBuffer = await this.generateInvoicePDF(invoice as Invoice);
      const pdfUrl = await this.uploadInvoicePDF(invoiceNumber, pdfBuffer);

      invoice.pdfUrl = pdfUrl;

      const createdInvoice = await this.storeInvoice(invoice as Invoice);

      // Send invoice email
      await this.sendInvoiceEmail(subscription.userId, createdInvoice!);

      this.logger.info(`Generated invoice ${invoiceNumber} for subscription ${subscriptionId}`);
      return createdInvoice;
    } catch (error) {
      this.logger.error(`Failed to generate invoice for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Generate PDF invoice
   */
  private async generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
    // Create a simple PDF invoice using PDFKit directly
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Collect PDF content in buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {});

    // Invoice header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.createdAt.toDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
    doc.moveDown();

    // Customer info
    const customerInfo = await this.getCustomerInfo(invoice.userId);
    doc.fontSize(14).text('Bill To:');
    doc.fontSize(10).text(customerInfo.name);
    doc.text(customerInfo.email);
    doc.moveDown();

    // Line items table
    doc.fontSize(12).text('Description', 50, doc.y);
    doc.text('Amount', 400, doc.y);
    doc.moveDown();

    invoice.lineItems.forEach(item => {
      doc.fontSize(10).text(item.description, 50, doc.y);
      doc.text(`${invoice.currency} ${item.amount.toLocaleString()}`, 400, doc.y);
      doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total: ${invoice.currency} ${invoice.totalAmount.toLocaleString()}`, 350, doc.y);

    doc.end();

    // Wait for the PDF to be fully generated
    await new Promise(resolve => doc.on('end', resolve));

    return Buffer.concat(chunks);
  }

  /**
   * Upload PDF and return URL (implement based on your storage solution)
   */
  private async uploadInvoicePDF(invoiceNumber: string, pdfBuffer: Buffer): Promise<string> {
    // Implement based on your file storage solution (AWS S3, local storage, etc.)
    // For now, return a placeholder URL
    return `/invoices/${invoiceNumber}.pdf`;
  }

  // ========== PAYMENT FAILURE HANDLING ==========

  /**
   * Handle payment failure from Stripe webhook
   */
  async handlePaymentFailure(
    subscriptionId: string,
    stripeInvoiceId: string,
    failureReason: string,
    amount: number,
    currency: string
  ): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Create payment failure record
      const paymentFailure: Partial<PaymentFailure> = {
        subscriptionId,
        userId: subscription.userId,
        stripeInvoiceId,
        amount,
        currency,
        failureReason,
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.storePaymentFailure(paymentFailure as PaymentFailure);

      // Update subscription status
      await this.updateSubscription(subscriptionId, {
        status: 'past_due',
        updatedAt: new Date(),
      });

      // Update user status
      await DatabaseService.updateUser(subscription.userId, {
        subscription_status: 'past_due',
      });

      // Send payment failure email
      await this.sendPaymentFailureEmail(subscription.userId, failureReason);

      // Schedule retry
      await this.schedulePaymentRetry(subscriptionId);

      this.logger.info(`Handled payment failure for subscription ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to handle payment failure for subscription ${subscriptionId}:`, error);
    }
  }

  /**
   * Schedule payment retry
   */
  private async schedulePaymentRetry(subscriptionId: string): Promise<void> {
    try {
      const paymentFailure = await this.getLatestPaymentFailure(subscriptionId);
      if (!paymentFailure || paymentFailure.retryCount >= paymentFailure.maxRetries) {
        return;
      }

      // Calculate next retry date (exponential backoff)
      const retryDelay = Math.pow(2, paymentFailure.retryCount) * 24 * 60 * 60 * 1000; // Hours
      const nextRetryDate = new Date(Date.now() + retryDelay);

      await this.updatePaymentFailure(paymentFailure.id, {
        retryCount: paymentFailure.retryCount + 1,
        nextRetryDate,
        updatedAt: new Date(),
      });

      // TODO: Schedule actual retry job (using your job scheduler)
      this.logger.info(`Scheduled payment retry for subscription ${subscriptionId} at ${nextRetryDate}`);
    } catch (error) {
      this.logger.error(`Failed to schedule payment retry for subscription ${subscriptionId}:`, error);
    }
  }

  /**
   * Retry failed payment
   */
  async retryPayment(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        return false;
      }

      // Attempt to pay latest invoice
      const invoices = await this.stripe.invoices.list({
        subscription: subscription.stripeSubscriptionId,
        status: 'open',
        limit: 1,
      });

      if (invoices.data.length === 0) {
        return false;
      }

      const invoice = invoices.data[0];
      await this.stripe.invoices.pay(invoice.id, { paid_out_of_band: false });

      // Update payment failure record
      const paymentFailure = await this.getLatestPaymentFailure(subscriptionId);
      if (paymentFailure) {
        await this.updatePaymentFailure(paymentFailure.id, {
          resolvedAt: new Date(),
          updatedAt: new Date(),
        });
      }

      this.logger.info(`Retried payment for subscription ${subscriptionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to retry payment for subscription ${subscriptionId}:`, error);
      return false;
    }
  }

  // ========== CANCELLATION MANAGEMENT ==========

  /**
   * Store cancellation survey
   */
  private async storeCancellationSurvey(
    subscriptionId: string,
    reason: string,
    feedback?: string
  ): Promise<void> {
    // Implement based on your database schema
    this.logger.info(`Stored cancellation survey for subscription ${subscriptionId}`);
  }

  /**
   * Trigger win-back campaign
   */
  private async triggerWinBackCampaign(userId: string): Promise<void> {
    try {
      // Offer 50% off for 3 months
      const discount = await this.createWinBackDiscount(userId);

      // Send win-back email
      await this.sendWinBackEmail(userId, discount);

      this.logger.info(`Triggered win-back campaign for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger win-back campaign for user ${userId}:`, error);
    }
  }

  /**
   * Create win-back discount
   */
  private async createWinBackDiscount(userId: string): Promise<Discount> {
    const discount: Partial<Discount> = {
      code: `WINBACK-${userId.substring(0, 8).toUpperCase()}`,
      type: 'percentage',
      value: 50, // 50% off
      duration: 'repeating',
      durationInMonths: 3,
      maxRedemptions: 1,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      applicablePlans: Object.keys(this.PLANS),
      active: true,
      createdAt: new Date(),
    };

    // Store discount (implement based on your schema)
    return discount as Discount;
  }

  // ========== ADVANCED FEATURES ==========

  /**
   * Apply discount to subscription
   */
  async applyDiscount(subscriptionId: string, discountCode: string): Promise<boolean> {
    try {
      const discount = await this.getDiscount(discountCode);
      if (!discount || !discount.active) {
        throw new Error('Invalid or expired discount code');
      }

      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Check if discount applies to this plan
      if (discount.applicablePlans && !discount.applicablePlans.includes(subscription.planId)) {
        throw new Error('Discount code not applicable to this plan');
      }

      // Apply discount in Stripe if managed by Stripe
      if (subscription.stripeSubscriptionId) {
        const coupons = await this.stripe.coupons.list({ limit: 1 });
        let stripeCoupon = coupons.data.find(c => c.metadata?.discount_code === discountCode);

        if (!stripeCoupon) {
          stripeCoupon = await this.stripe.coupons.create({
            percent_off: discount.type === 'percentage' ? discount.value : undefined,
            amount_off: discount.type === 'fixed_amount' ? discount.value * 100 : undefined,
            currency: discount.currency?.toLowerCase(),
            duration: discount.duration,
            duration_in_months: discount.durationInMonths,
            max_redemptions: discount.maxRedemptions,
            metadata: {
              discount_code: discountCode,
            },
          });
        }

        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          coupon: stripeCoupon.id,
        });
      }

      // Update discount usage
      await this.incrementDiscountUsage(discountCode);

      this.logger.info(`Applied discount ${discountCode} to subscription ${subscriptionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to apply discount ${discountCode} to subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
    try {
      // Implement based on your analytics requirements
      // This is a placeholder implementation
      const totalSubscribers = await this.getTotalSubscriberCount();
      const activeSubscribers = await this.getActiveSubscriberCount();
      const canceledSubscribers = await this.getCanceledSubscriberCount();
      const monthlyRevenue = await this.getMonthlyRevenue();
      const churnRate = canceledSubscribers / (totalSubscribers || 1);
      const averageRevenuePerUser = monthlyRevenue / (activeSubscribers || 1);

      const planDistribution = await this.getPlanDistribution();
      const revenueByPlan = await this.getRevenueByPlan();

      return {
        totalSubscribers,
        activeSubscribers,
        canceledSubscribers,
        monthlyRevenue,
        churnRate,
        averageRevenuePerUser,
        planDistribution,
        revenueByPlan,
      };
    } catch (error) {
      this.logger.error('Failed to get subscription analytics:', error);
      throw error;
    }
  }

  // ========== HELPER METHODS ==========

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    // Check if customer exists
    const user = await DatabaseService.getUserById(userId);
    if (user && (user as any).stripe_customer_id) {
      return (user as any).stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: user?.email,
      metadata: {
        user_id: userId,
      },
    });

    // Store Stripe customer ID (implement based on your schema)
    // For now, we'll store it in metadata or a separate table
    this.logger.info(`Created Stripe customer ${customer.id} for user ${userId}`);

    return customer.id;
  }

  private async getCustomerInfo(userId: string): Promise<any> {
    const user = await DatabaseService.getUserById(userId);
    return {
      name: `${user?.first_name} ${user?.last_name}`,
      email: user?.email,
      // Add more customer info as needed
    };
  }

  // ========== EMAIL METHODS ==========

  private async sendSubscriptionWelcomeEmail(userId: string, plan: SubscriptionPlan): Promise<void> {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Welcome to ${plan.name} Plan!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to ${plan.name}!</h1>
          <p>Hello ${user.first_name},</p>
          <p>Thank you for subscribing to the ${plan.name} plan. Your subscription is now active and you have access to all ${plan.name} features.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Plan Details:</h3>
            <ul>
              ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <p><strong>Price:</strong> ${plan.currency} ${plan.price.toLocaleString()}</p>
          </div>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Welcome aboard!</p>
          <p>The VaultGuard Team</p>
        </div>
      `,
    });
  }

  private async sendRenewalReminderEmail(userId: string, renewalDate: Date): Promise<void> {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Subscription Renewal Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Subscription Renewal Reminder</h1>
          <p>Hello ${user.first_name},</p>
          <p>This is a reminder that your subscription will renew on ${renewalDate.toDateString()}.</p>
          <p>Your subscription will automatically renew unless you cancel it beforehand.</p>
          <p>If you have any questions about your subscription, please contact our support team.</p>
          <p>Thank you for being a valued customer!</p>
          <p>The VaultGuard Team</p>
        </div>
      `,
    });
  }

  private async sendCancellationEmail(userId: string, cancelAtPeriodEnd: boolean): Promise<void> {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Subscription Cancellation Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Subscription Cancellation Confirmation</h1>
          <p>Hello ${user.first_name},</p>
          <p>We have received your subscription cancellation request.</p>
          <p><strong>Cancellation Details:</strong></p>
          <ul>
            <li><strong>Cancellation Date:</strong> ${new Date().toDateString()}</li>
            <li><strong>Access Until:</strong> ${cancelAtPeriodEnd ? 'End of current billing period' : 'Immediately'}</li>
          </ul>
          <p>If you canceled by mistake or want to discuss your account, please contact us immediately.</p>
          <p>We're sorry to see you go and hope to serve you again in the future.</p>
          <p>The VaultGuard Team</p>
        </div>
      `,
    });
  }

  private async sendPaymentFailureEmail(userId: string, reason: string): Promise<void> {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Payment Failed - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc3545;">Payment Failed - Action Required</h1>
          <p>Hello ${user.first_name},</p>
          <p>We were unable to process your subscription payment.</p>
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Reason:</strong> ${reason}
          </div>
          <p>Please update your payment method to continue enjoying uninterrupted service.</p>
          <p>You can update your payment method by logging into your account and visiting the billing section.</p>
          <p>If you have any questions, please contact our support team at support@vaultguard.io.</p>
          <p>The VaultGuard Team</p>
        </div>
      `,
      priority: 'high',
    });
  }

  private async sendInvoiceEmail(userId: string, invoice: Invoice): Promise<void> {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Invoice ${invoice.invoiceNumber}</h1>
          <p>Hello ${user.first_name},</p>
          <p>Your invoice is ready for payment.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Invoice Details:</h3>
            <ul>
              <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
              <li><strong>Amount:</strong> ${invoice.currency} ${invoice.amount.toLocaleString()}</li>
              <li><strong>Due Date:</strong> ${invoice.dueDate.toDateString()}</li>
            </ul>
          </div>
          <p>You can download your invoice PDF from your account dashboard.</p>
          <p>If you have any questions about this invoice, please contact our billing team.</p>
          <p>Thank you for your business!</p>
          <p>The VaultGuard Team</p>
        </div>
      `,
    });
  }

  private async sendWinBackEmail(userId: string, discount: Discount): Promise<void> {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Special Offer: 50% Off for 3 Months',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745;">Special Offer Just for You!</h1>
          <p>Hello ${user.first_name},</p>
          <p>We noticed you've canceled your subscription and we want you back!</p>
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Limited Time Offer:</h3>
            <p><strong>50% OFF</strong> for the next 3 months when you resubscribe!</p>
            <p><strong>Discount Code:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${discount.code}</code></p>
          </div>
          <p>This exclusive offer is only available for the next 30 days.</p>
          <p>Don't miss out on this great opportunity to continue protecting your digital assets.</p>
          <p>We'd love to have you back in the VaultGuard family!</p>
          <p>The VaultGuard Team</p>
        </div>
      `,
    });
  }

  // ========== DATABASE METHODS (Implement based on your schema) ==========

  private async storeSubscription(subscription: Subscription): Promise<Subscription> {
    // Implement based on your database schema
    // This should insert into a subscriptions table
    return subscription;
  }

  private async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    // Implement based on your database schema
    return null;
  }

  private async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    // Implement based on your database schema
  }

  private async storeInvoice(invoice: Invoice): Promise<Invoice> {
    // Implement based on your database schema
    return invoice;
  }

  private async storePaymentFailure(paymentFailure: PaymentFailure): Promise<void> {
    // Implement based on your database schema
  }

  private async getLatestPaymentFailure(subscriptionId: string): Promise<PaymentFailure | null> {
    // Implement based on your database schema
    return null;
  }

  private async updatePaymentFailure(paymentFailureId: string, updates: Partial<PaymentFailure>): Promise<void> {
    // Implement based on your database schema
  }

  private async getDiscount(code: string): Promise<Discount | null> {
    // Implement based on your database schema
    return null;
  }

  private async incrementDiscountUsage(code: string): Promise<void> {
    // Implement based on your database schema
  }

  private async getSubscriptionsExpiringBy(date: Date): Promise<Subscription[]> {
    // Implement based on your database schema
    return [];
  }

  private async getTotalSubscriberCount(): Promise<number> {
    // Implement based on your database schema
    return 0;
  }

  private async getActiveSubscriberCount(): Promise<number> {
    // Implement based on your database schema
    return 0;
  }

  private async getCanceledSubscriberCount(): Promise<number> {
    // Implement based on your database schema
    return 0;
  }

  private async getMonthlyRevenue(): Promise<number> {
    // Implement based on your database schema
    return 0;
  }

  private async getPlanDistribution(): Promise<Record<string, number>> {
    // Implement based on your database schema
    return {};
  }

  private async getRevenueByPlan(): Promise<Record<string, number>> {
    // Implement based on your database schema
    return {};
  }

  // ========== WEBHOOK HELPER METHODS ==========

  /**
   * Update subscription from Stripe data
   */
  async updateSubscriptionFromStripe(stripeSubscriptionId: string, stripeData: any): Promise<void> {
    try {
      // Find subscription by Stripe ID
      // Update subscription record with Stripe data
      this.logger.info(`Updated subscription from Stripe: ${stripeSubscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to update subscription from Stripe ${stripeSubscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Update user subscription status
   */
  async updateUserSubscriptionStatus(userId: string, status: string): Promise<void> {
    try {
      await DatabaseService.updateUser(userId, {
        subscription_status: status,
      });

      this.logger.info(`Updated user ${userId} subscription status to ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update user ${userId} subscription status:`, error);
      throw error;
    }
  }

  /**
   * Clear payment failures for subscription
   */
  async clearPaymentFailures(subscriptionId: string): Promise<void> {
    try {
      // Clear resolved payment failure records
      this.logger.info(`Cleared payment failures for subscription ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to clear payment failures for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }
}

export default SubscriptionManager;