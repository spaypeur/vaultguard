import { Logger } from '../utils/logger';
import { SubscriptionManager } from './subscriptionManager';
import Stripe from 'stripe';

export class SubscriptionWebhooks {
  private logger = new Logger('SubscriptionWebhooks');
  private subscriptionManager: SubscriptionManager;
  private stripe: Stripe;

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    this.subscriptionManager = new SubscriptionManager();
    this.logger.info('Subscription Webhooks handler initialized');
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, body: string): Promise<{ received: boolean }> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
      }

      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

      this.logger.info(`Received webhook event: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.created':
          await this.handleInvoiceCreated(event.data.object as Stripe.Invoice);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          this.logger.info(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription created event
   */
  private async handleSubscriptionCreated(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = stripeSubscription.metadata?.user_id;
      const planId = stripeSubscription.metadata?.plan_id;

      if (!userId || !planId) {
        this.logger.warn('Subscription created without user_id or plan_id in metadata');
        return;
      }

      this.logger.info(`Subscription created for user ${userId}, plan ${planId}`);

      // Update subscription status in database
      await this.subscriptionManager.updateSubscriptionFromStripe(stripeSubscription.id, stripeSubscription);

      // Send welcome email if this is a new subscription (not a trial)
      if (stripeSubscription.status === 'active') {
        // Welcome email is already sent in createSubscription, but we could send a different message here
        this.logger.info(`Active subscription confirmed for user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Error handling subscription created:', error);
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = stripeSubscription.metadata?.user_id;

      if (!userId) {
        this.logger.warn('Subscription updated without user_id in metadata');
        return;
      }

      this.logger.info(`Subscription updated for user ${userId}: ${stripeSubscription.status}`);

      // Update subscription in database
      await this.subscriptionManager.updateSubscriptionFromStripe(stripeSubscription.id, stripeSubscription);

      // Handle specific status changes
      if (stripeSubscription.status === 'past_due') {
        this.logger.warn(`Subscription ${stripeSubscription.id} is past due for user ${userId}`);
      } else if (stripeSubscription.status === 'canceled') {
        this.logger.info(`Subscription ${stripeSubscription.id} was canceled for user ${userId}`);
      } else if (stripeSubscription.status === 'active') {
        this.logger.info(`Subscription ${stripeSubscription.id} is now active for user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Error handling subscription updated:', error);
    }
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = stripeSubscription.metadata?.user_id;

      if (!userId) {
        this.logger.warn('Subscription deleted without user_id in metadata');
        return;
      }

      this.logger.info(`Subscription deleted for user ${userId}`);

      // Update subscription status in database
      await this.subscriptionManager.updateSubscriptionFromStripe(stripeSubscription.id, stripeSubscription);

      // Update user subscription status
      await this.subscriptionManager.updateUserSubscriptionStatus(userId, 'canceled');
    } catch (error) {
      this.logger.error('Error handling subscription deleted:', error);
    }
  }

  /**
   * Handle successful invoice payment
   */
  private async handleInvoicePaymentSucceeded(stripeInvoice: Stripe.Invoice): Promise<void> {
    try {
      if (!stripeInvoice.subscription) {
        return; // Not a subscription invoice
      }

      const subscriptionId = stripeInvoice.subscription as string;
      const userId = stripeInvoice.metadata?.user_id;

      this.logger.info(`Invoice payment succeeded for subscription ${subscriptionId}`);

      // Generate invoice PDF and send email
      await this.subscriptionManager.generateInvoice(subscriptionId, stripeInvoice.id);

      // Update subscription status
      await this.subscriptionManager.updateSubscriptionFromStripe(subscriptionId, {
        status: 'active',
        current_period_end: new Date(stripeInvoice.period_end! * 1000),
      } as any);

      // Clear any payment failure records
      await this.subscriptionManager.clearPaymentFailures(subscriptionId);
    } catch (error) {
      this.logger.error('Error handling invoice payment succeeded:', error);
    }
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice): Promise<void> {
    try {
      if (!stripeInvoice.subscription) {
        return; // Not a subscription invoice
      }

      const subscriptionId = stripeInvoice.subscription as string;
      const userId = stripeInvoice.metadata?.user_id;

      this.logger.warn(`Invoice payment failed for subscription ${subscriptionId}`);

      // Handle payment failure
      await this.subscriptionManager.handlePaymentFailure(
        subscriptionId,
        stripeInvoice.id,
        `Payment failed: Invoice payment attempt failed`,
        stripeInvoice.amount_due! / 100,
        stripeInvoice.currency!
      );

      // Update subscription status
      await this.subscriptionManager.updateSubscriptionFromStripe(subscriptionId, {
        status: 'past_due',
      } as any);
    } catch (error) {
      this.logger.error('Error handling invoice payment failed:', error);
    }
  }

  /**
   * Handle invoice created event
   */
  private async handleInvoiceCreated(stripeInvoice: Stripe.Invoice): Promise<void> {
    try {
      if (!stripeInvoice.subscription) {
        return; // Not a subscription invoice
      }

      const subscriptionId = stripeInvoice.subscription as string;

      this.logger.info(`Invoice created for subscription ${subscriptionId}`);

      // Invoice will be processed when payment succeeds or fails
      // We could send a preview email here if desired
    } catch (error) {
      this.logger.error('Error handling invoice created:', error);
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      this.logger.info(`Payment intent succeeded: ${paymentIntent.id}`);

      // Payment succeeded - invoice payment succeeded event should also fire
      // This is mainly for one-time payments or additional logging
    } catch (error) {
      this.logger.error('Error handling payment intent succeeded:', error);
    }
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      this.logger.warn(`Payment intent failed: ${paymentIntent.id}`);

      // Payment failed - invoice payment failed event should also fire
      // This is mainly for one-time payments or additional logging
    } catch (error) {
      this.logger.error('Error handling payment intent failed:', error);
    }
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16',
      });

      stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default SubscriptionWebhooks;