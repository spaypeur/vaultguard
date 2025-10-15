import { Logger } from '../utils/logger';
import { DatabaseService } from './database';
import {
  BTCPayServerConfig,
  BTCPayInvoice,
  BTCPayInvoiceStatus,
  BTCPayWebhookPayload,
  BTCPayWebhookEvent,
  BTCPayCreateInvoiceResponse,
  BTCPayPaymentSession,
  BTCPayWebhookValidationResponse,
  BTCPayCustomer,
  BTCPayError,
} from '../types/btcpay';

export class BTCPayServerService {
  private logger = new Logger('BTCPayServerService');
  private config: BTCPayServerConfig;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.config = this.loadConfig();
    this.baseUrl = this.config.serverUrl.replace(/\/$/, '');
    this.apiKey = this.config.apiKey;

    this.logger.info('BTCPay Server Service initialized', {
      serverUrl: this.baseUrl,
      storeId: this.config.storeId,
    });
  }

  private loadConfig(): BTCPayServerConfig {
    const serverUrl = process.env.BTCPAY_SERVER_URL;
    const apiKey = process.env.BTCPAY_API_KEY;
    const webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET;
    const storeId = process.env.BTCPAY_STORE_ID;

    if (!serverUrl || !apiKey || !webhookSecret || !storeId) {
      throw new Error(
        'BTCPay Server configuration incomplete. Required: BTCPAY_SERVER_URL, BTCPAY_API_KEY, BTCPAY_WEBHOOK_SECRET, BTCPAY_STORE_ID'
      );
    }

    return {
      serverUrl,
      apiKey,
      webhookSecret,
      storeId,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Authorization': `token ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `BTCPay Server API error: ${response.status} ${response.statusText}. ${errorData.error || ''}`
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`BTCPay Server API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Create a new BTCPay Server invoice
   */
  async createInvoice(params: {
    amount: number;
    currency: string;
    orderId: string;
    userId: string;
    planId: string;
    planName: string;
    notificationURL?: string;
    redirectURL?: string;
    extendedNotifications?: boolean;
    fullNotifications?: boolean;
    posData?: string;
    metadata?: Record<string, any>;
  }): Promise<BTCPayCreateInvoiceResponse> {
    try {
      const invoiceData = {
        amount: params.amount,
        currency: params.currency,
        orderId: params.orderId,
        notificationURL: params.notificationURL || `${process.env.BACKEND_URL}/api/payments/btcpay-webhook`,
        redirectURL: params.redirectURL || `${process.env.FRONTEND_URL}/payment/success`,
        extendedNotifications: params.extendedNotifications ?? true,
        fullNotifications: params.fullNotifications ?? true,
        posData: params.posData || JSON.stringify({
          userId: params.userId,
          planId: params.planId,
          planName: params.planName,
        }),
        metadata: {
          userId: params.userId,
          planId: params.planId,
          planName: params.planName,
          ...params.metadata,
        },
      };

      this.logger.info('Creating BTCPay invoice:', {
        amount: params.amount,
        currency: params.currency,
        orderId: params.orderId,
        userId: params.userId,
      });

      const invoice = await this.makeRequest<BTCPayInvoice>(
        `/api/v1/stores/${this.config.storeId}/invoices`,
        {
          method: 'POST',
          body: JSON.stringify(invoiceData),
        }
      );

      return {
        success: true,
        invoiceId: invoice.id,
        checkoutUrl: invoice.checkoutLink,
      };
    } catch (error) {
      this.logger.error('Failed to create BTCPay invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get invoice details by ID
   */
  async getInvoice(invoiceId: string): Promise<BTCPayInvoice | null> {
    try {
      return await this.makeRequest<BTCPayInvoice>(
        `/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}`
      );
    } catch (error) {
      this.logger.error(`Failed to get invoice ${invoiceId}:`, error);
      return null;
    }
  }

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(orderId: string): Promise<BTCPayInvoice | null> {
    try {
      const invoices = await this.makeRequest<BTCPayInvoice[]>(
        `/api/v1/stores/${this.config.storeId}/invoices`
      );

      return invoices.find(invoice => invoice.metadata?.orderId === orderId) || null;
    } catch (error) {
      this.logger.error(`Failed to get invoice by order ID ${orderId}:`, error);
      return null;
    }
  }

  /**
   * Create or get BTCPay customer
   */
  async getOrCreateCustomer(email: string, name?: string): Promise<string> {
    try {
      // Try to find existing customer
      const customers = await this.makeRequest<BTCPayCustomer[]>(
        `/api/v1/stores/${this.config.storeId}/customers`
      );

      let customer = customers.find(c => c.email === email);

      if (!customer) {
        // Create new customer
        customer = await this.makeRequest<BTCPayCustomer>(
          `/api/v1/stores/${this.config.storeId}/customers`,
          {
            method: 'POST',
            body: JSON.stringify({
              email,
              name,
            }),
          }
        );
      }

      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to get/create BTCPay customer for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): BTCPayWebhookValidationResponse {
    try {
      const crypto = require('crypto');

      // BTCPay Server uses HMAC-SHA256 for webhook signatures
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');

      if (crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      )) {
        const payloadObj = JSON.parse(payload);
        return {
          isValid: true,
          event: payloadObj.type,
          invoiceId: payloadObj.invoiceId,
        };
      }

      return {
        isValid: false,
        error: 'Invalid signature',
      };
    } catch (error) {
      this.logger.error('Webhook signature validation failed:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Signature validation failed',
      };
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(
    signature: string,
    body: string
  ): Promise<{ received: boolean; processed?: boolean }> {
    try {
      // Validate webhook signature
      const validation = this.validateWebhookSignature(
        body,
        signature,
        this.config.webhookSecret
      );

      if (!validation.isValid) {
        this.logger.warn('Invalid webhook signature received');
        return { received: false };
      }

      const payload: BTCPayWebhookPayload = JSON.parse(body);

      this.logger.info(`Processing BTCPay webhook event: ${payload.type} for invoice ${payload.invoiceId}`);

      // Handle different webhook events
      switch (payload.type) {
        case BTCPayWebhookEvent.InvoiceReceivedPayment:
          await this.handleInvoicePayment(payload);
          break;

        case BTCPayWebhookEvent.InvoicePaymentSettled:
          await this.handleInvoiceSettled(payload);
          break;

        case BTCPayWebhookEvent.InvoiceExpired:
          await this.handleInvoiceExpired(payload);
          break;

        case BTCPayWebhookEvent.InvoiceInvalid:
          await this.handleInvoiceInvalid(payload);
          break;

        default:
          this.logger.info(`Unhandled webhook event type: ${payload.type}`);
      }

      return { received: true, processed: true };
    } catch (error) {
      this.logger.error('Failed to process BTCPay webhook:', error);
      return { received: false };
    }
  }

  /**
   * Handle invoice payment received
   */
  private async handleInvoicePayment(payload: BTCPayWebhookPayload): Promise<void> {
    try {
      if (!payload.invoiceId) return;

      const invoice = await this.getInvoice(payload.invoiceId);
      if (!invoice) return;

      const posData = JSON.parse(invoice.posData || '{}');
      const userId = posData.userId;
      const planId = posData.planId;
      const planName = posData.planName;

      if (!userId || !planId) {
        this.logger.warn(`Invoice ${payload.invoiceId} missing user or plan data`);
        return;
      }

      // Log payment received
      await DatabaseService.logAuditEvent(
        userId,
        'btcpay_payment_received',
        'payment',
        null,
        null,
        {
          invoiceId: payload.invoiceId,
          amount: invoice.amount,
          currency: invoice.currency,
          planId,
          planName,
          paymentMethod: payload.paymentMethod,
        }
      );

      this.logger.info(`BTCPay payment received for user ${userId}, invoice ${payload.invoiceId}`);
    } catch (error) {
      this.logger.error('Failed to handle BTCPay payment received:', error);
    }
  }

  /**
   * Handle invoice settled (payment confirmed)
   */
  private async handleInvoiceSettled(payload: BTCPayWebhookPayload): Promise<void> {
    try {
      if (!payload.invoiceId) return;

      const invoice = await this.getInvoice(payload.invoiceId);
      if (!invoice || invoice.status !== BTCPayInvoiceStatus.Complete) return;

      const posData = JSON.parse(invoice.posData || '{}');
      const userId = posData.userId;
      const planId = posData.planId;
      const planName = posData.planName;

      if (!userId || !planId) {
        this.logger.warn(`Invoice ${payload.invoiceId} missing user or plan data`);
        return;
      }

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
          invoiceId: payload.invoiceId,
          amount: invoice.amount,
          currency: invoice.currency,
          planId,
          planName,
          paymentMethod: 'btcpay',
          totalPaid: invoice.payments.reduce((sum, payment) => sum + payment.value, 0),
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
          invoiceId: payload.invoiceId,
        }
      );

      this.logger.info(`BTCPay payment settled and subscription activated for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to handle BTCPay invoice settled:', error);
    }
  }

  /**
   * Handle invoice expired
   */
  private async handleInvoiceExpired(payload: BTCPayWebhookPayload): Promise<void> {
    try {
      if (!payload.invoiceId) return;

      const invoice = await this.getInvoice(payload.invoiceId);
      if (!invoice) return;

      const posData = JSON.parse(invoice.posData || '{}');
      const userId = posData.userId;

      if (!userId) return;

      // Log invoice expiration
      await DatabaseService.logAuditEvent(
        userId,
        'btcpay_invoice_expired',
        'payment',
        null,
        null,
        {
          invoiceId: payload.invoiceId,
          amount: invoice.amount,
          currency: invoice.currency,
        }
      );

      this.logger.info(`BTCPay invoice expired for user ${userId}, invoice ${payload.invoiceId}`);
    } catch (error) {
      this.logger.error('Failed to handle BTCPay invoice expired:', error);
    }
  }

  /**
   * Handle invoice invalid
   */
  private async handleInvoiceInvalid(payload: BTCPayWebhookPayload): Promise<void> {
    try {
      if (!payload.invoiceId) return;

      const invoice = await this.getInvoice(payload.invoiceId);
      if (!invoice) return;

      const posData = JSON.parse(invoice.posData || '{}');
      const userId = posData.userId;

      if (!userId) return;

      // Log invoice invalidation
      await DatabaseService.logAuditEvent(
        userId,
        'btcpay_invoice_invalid',
        'payment',
        null,
        null,
        {
          invoiceId: payload.invoiceId,
          amount: invoice.amount,
          currency: invoice.currency,
        }
      );

      this.logger.info(`BTCPay invoice invalid for user ${userId}, invoice ${payload.invoiceId}`);
    } catch (error) {
      this.logger.error('Failed to handle BTCPay invoice invalid:', error);
    }
  }

  /**
   * Get supported payment methods
   */
  async getPaymentMethods(): Promise<string[]> {
    try {
      const store = await this.makeRequest<any>(
        `/api/v1/stores/${this.config.storeId}`
      );

      return store.paymentMethods || [];
    } catch (error) {
      this.logger.error('Failed to get BTCPay payment methods:', error);
      return [];
    }
  }

  /**
   * Get exchange rates
   */
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const rates = await this.makeRequest<any>(
        `/api/v1/stores/${this.config.storeId}/rates`
      );

      return rates || {};
    } catch (error) {
      this.logger.error('Failed to get BTCPay exchange rates:', error);
      return {};
    }
  }

  /**
   * Health check for BTCPay Server connection
   */
  async healthCheck(): Promise<{
    connected: boolean;
    serverUrl: string;
    storeId: string;
    error?: string;
  }> {
    try {
      await this.makeRequest(`/api/v1/stores/${this.config.storeId}`);
      return {
        connected: true,
        serverUrl: this.baseUrl,
        storeId: this.config.storeId,
      };
    } catch (error) {
      return {
        connected: false,
        serverUrl: this.baseUrl,
        storeId: this.config.storeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default BTCPayServerService;