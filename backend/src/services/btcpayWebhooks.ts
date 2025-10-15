import { Logger } from '../utils/logger';
import BTCPayServerService from './btcpayServer';
import { SubscriptionManager } from './subscriptionManager';
import { DatabaseService } from './database';

export class BTCPayWebhooks {
  private logger = new Logger('BTCPayWebhooks');
  private btcpayService: BTCPayServerService;
  private subscriptionManager: SubscriptionManager;

  constructor() {
    this.btcpayService = new BTCPayServerService();
    this.subscriptionManager = new SubscriptionManager();
    this.logger.info('BTCPay Webhooks handler initialized');
  }

  /**
   * Main webhook handler for BTCPay Server events
   */
  async handleWebhook(signature: string, body: string): Promise<{ received: boolean }> {
    try {
      this.logger.info('Received BTCPay webhook');

      const result = await this.btcpayService.processWebhookEvent(signature, body);

      if (!result.processed) {
        return { received: false };
      }

      return { received: true };
    } catch (error) {
      this.logger.error('BTCPay webhook processing failed:', error);
      return { received: false };
    }
  }

  /**
   * Manual webhook event processing (for testing or manual triggering)
   */
  async processWebhookEvent(eventType: string, invoiceId: string): Promise<boolean> {
    try {
      this.logger.info(`Manually processing BTCPay webhook event: ${eventType} for invoice ${invoiceId}`);

      const invoice = await this.btcpayService.getInvoice(invoiceId);
      if (!invoice) {
        this.logger.error(`Invoice ${invoiceId} not found`);
        return false;
      }

      const posData = JSON.parse(invoice.posData || '{}');
      const userId = posData.userId;
      const planId = posData.planId;
      const planName = posData.planName;

      if (!userId || !planId) {
        this.logger.error(`Invoice ${invoiceId} missing user or plan data`);
        return false;
      }

      switch (eventType) {
        case 'InvoicePaymentSettled':
          await this.handlePaymentSettled(invoice, userId, planId, planName);
          break;

        case 'InvoiceExpired':
          await this.handleInvoiceExpired(invoice, userId);
          break;

        case 'InvoiceInvalid':
          await this.handleInvoiceInvalid(invoice, userId);
          break;

        default:
          this.logger.warn(`Unhandled manual webhook event type: ${eventType}`);
          return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Manual webhook processing failed for ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Handle payment settled event (manual processing)
   */
  private async handlePaymentSettled(
    invoice: any,
    userId: string,
    planId: string,
    planName: string
  ): Promise<void> {
    try {
      // Update user subscription status
      await DatabaseService.updateUser(userId, {
        subscription_plan: planId,
        subscription_status: 'active',
        subscription_started_at: new Date(),
      });

      // Log successful payment and subscription activation
      await DatabaseService.logAuditEvent(
        userId,
        'btcpay_payment_completed',
        'payment',
        null,
        null,
        {
          invoiceId: invoice.id,
          amount: invoice.amount,
          currency: invoice.currency,
          planId,
          planName,
          paymentMethod: 'btcpay',
          totalPaid: invoice.payments.reduce((sum: number, payment: any) => sum + payment.value, 0),
        }
      );

      await DatabaseService.logAuditEvent(
        userId,
        'subscription_activated',
        'subscription',
        null,
        null,
        {
          planId,
          planName,
          paymentMethod: 'btcpay',
          invoiceId: invoice.id,
        }
      );

      this.logger.info(`Manual BTCPay payment settled for user ${userId}, invoice ${invoice.id}`);
    } catch (error) {
      this.logger.error('Manual BTCPay payment settled handling failed:', error);
      throw error;
    }
  }

  /**
   * Handle invoice expired event (manual processing)
   */
  private async handleInvoiceExpired(invoice: any, userId: string): Promise<void> {
    try {
      // Log invoice expiration
      await DatabaseService.logAuditEvent(
        userId,
        'btcpay_invoice_expired',
        'payment',
        null,
        null,
        {
          invoiceId: invoice.id,
          amount: invoice.amount,
          currency: invoice.currency,
        }
      );

      this.logger.info(`Manual BTCPay invoice expired for user ${userId}, invoice ${invoice.id}`);
    } catch (error) {
      this.logger.error('Manual BTCPay invoice expired handling failed:', error);
      throw error;
    }
  }

  /**
   * Handle invoice invalid event (manual processing)
   */
  private async handleInvoiceInvalid(invoice: any, userId: string): Promise<void> {
    try {
      // Log invoice invalidation
      await DatabaseService.logAuditEvent(
        userId,
        'btcpay_invoice_invalid',
        'payment',
        null,
        null,
        {
          invoiceId: invoice.id,
          amount: invoice.amount,
          currency: invoice.currency,
        }
      );

      this.logger.info(`Manual BTCPay invoice invalid for user ${userId}, invoice ${invoice.id}`);
    } catch (error) {
      this.logger.error('Manual BTCPay invoice invalid handling failed:', error);
      throw error;
    }
  }

  /**
   * Get BTCPay Server health status
   */
  async getHealthStatus(): Promise<{
    connected: boolean;
    serverUrl: string;
    storeId: string;
    webhookConfigured: boolean;
    error?: string;
  }> {
    try {
      const health = await this.btcpayService.healthCheck();

      return {
        connected: health.connected,
        serverUrl: health.serverUrl,
        storeId: health.storeId,
        webhookConfigured: !!process.env.BTCPAY_WEBHOOK_SECRET,
        error: health.error,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        connected: false,
        serverUrl: '',
        storeId: '',
        webhookConfigured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get webhook delivery logs (for debugging)
   */
  async getWebhookDeliveryLogs(limit: number = 50): Promise<any[]> {
    try {
      // This would typically query a database table storing webhook deliveries
      // For now, return a placeholder
      this.logger.info(`Retrieving last ${limit} BTCPay webhook deliveries`);

      return [
        {
          timestamp: new Date(),
          eventType: 'InvoicePaymentSettled',
          invoiceId: 'example-invoice-id',
          status: 'processed',
        },
      ];
    } catch (error) {
      this.logger.error('Failed to get webhook delivery logs:', error);
      return [];
    }
  }

  /**
   * Retry failed webhook delivery (admin function)
   */
  async retryWebhookDelivery(deliveryId: string): Promise<boolean> {
    try {
      this.logger.info(`Retrying BTCPay webhook delivery: ${deliveryId}`);

      // Implementation would depend on how webhook deliveries are stored and tracked
      // For now, return success
      return true;
    } catch (error) {
      this.logger.error(`Failed to retry webhook delivery ${deliveryId}:`, error);
      return false;
    }
  }
}

export default BTCPayWebhooks;