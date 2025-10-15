/**
 * BTCPay Server Integration Types
 * Based on BTCPay Server API v1.7.0
 */

export interface BTCPayServerConfig {
  serverUrl: string;
  apiKey: string;
  webhookSecret: string;
  storeId: string;
}

export interface BTCPayInvoice {
  id: string;
  storeId: string;
  amount: number;
  currency: string;
  type: 'Standard' | 'PaymentRequest';
  checkoutLink: string;
  createdTime: number;
  expirationTime: number;
  monitoringExpiration: number;
  status: BTCPayInvoiceStatus;
  additionalData?: string;
  posData?: string;
  metadata?: Record<string, any>;
  checkout: BTCPayCheckout;
  receipts: BTCPayReceipt[];
  payments: BTCPayPayment[];
}

export enum BTCPayInvoiceStatus {
  New = 'New',
  Processing = 'Processing',
  Expired = 'Expired',
  Invalid = 'Invalid',
  Paid = 'Paid',
  Complete = 'Complete',
}

export interface BTCPayCheckout {
  id: string;
  model: string;
  speedPolicy: 'HighSpeed' | 'MediumSpeed' | 'LowSpeed' | 'LowMediumSpeed';
  paymentMethods: string[];
  expiration: number;
  monitoringMinutes: number;
  paymentTolerance: number;
  redirectURL?: string;
  redirectAutomatically: boolean;
  requiresRefundEmail: boolean;
  defaultLanguage: string;
}

export interface BTCPayPayment {
  id: string;
  receivedDate: number;
  value: number;
  fee: number;
  status: BTCPayPaymentStatus;
  destination: string;
  paymentMethod: string;
  paymentProof?: string;
  networkFee?: number;
  txId?: string;
}

export enum BTCPayPaymentStatus {
  Processing = 'Processing',
  Completed = 'Completed',
  Expired = 'Expired',
  Invalid = 'Invalid',
}

export interface BTCPayReceipt {
  id: string;
  amount: number;
  currency: string;
  timestamp: number;
  destination: string;
}

export interface BTCPayStore {
  id: string;
  name: string;
  website?: string;
  defaultCurrency: string;
  defaultLang: string;
  timezone: string;
  archived: boolean;
  created: number;
}

export interface BTCPayWebhook {
  id: string;
  type: BTCPayWebhookType;
  url: string;
  enabled: boolean;
  automaticRedelivery: boolean;
  secret?: string;
  authorizedEvents: BTCPayWebhookEvent[];
  created: number;
}

export enum BTCPayWebhookType {
  Generic = 'Generic',
  Specific = 'Specific',
}

export enum BTCPayWebhookEvent {
  InvoiceReceivedPayment = 'InvoiceReceivedPayment',
  InvoicePaymentSettled = 'InvoicePaymentSettled',
  InvoiceProcessing = 'InvoiceProcessing',
  InvoiceExpired = 'InvoiceExpired',
  InvoiceSettled = 'InvoiceSettled',
  InvoiceInvalid = 'InvoiceInvalid',
}

export interface BTCPayWebhookDelivery {
  id: string;
  webhookId: string;
  type: BTCPayWebhookEvent;
  deliveryId: string;
  timestamp: number;
  status: BTCPayWebhookDeliveryStatus;
  errorMessage?: string;
  payload?: Record<string, any>;
}

export enum BTCPayWebhookDeliveryStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
}

export interface BTCPayRate {
  currencyPair: string;
  rate: number;
  timestamp: number;
}

export interface BTCPayPaymentMethod {
  paymentMethod: string;
  currency: string;
  enabled: boolean;
  data?: Record<string, any>;
}

// Subscription-specific BTCPay types
export interface BTCPaySubscriptionInvoice extends BTCPayInvoice {
  subscriptionId: string;
  userId: string;
  planId: string;
  metadata: {
    subscriptionId: string;
    userId: string;
    planId: string;
    planName: string;
    interval: string;
    [key: string]: any;
  };
}

export interface BTCPayPaymentRequest {
  id: string;
  storeId: string;
  currency: string;
  amount: number;
  title?: string;
  description?: string;
  email?: string;
  notifications: boolean;
  extendedNotifications: boolean;
  posData?: string;
  callbackUrl?: string;
  redirectUrl?: string;
  customCssUrl?: string;
  embeddedCss?: string;
  expiry: number;
  status: BTCPayPaymentRequestStatus;
  createdTime: number;
  payments?: BTCPayPayment[];
  allowedPaymentMethods: string[];
}

export enum BTCPayPaymentRequestStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Expired = 'Expired',
}

// Webhook payload types
export interface BTCPayWebhookPayload {
  deliveryId: string;
  webhookId: string;
  originalDeliveryId?: string;
  type: BTCPayWebhookEvent;
  timestamp: number;
  afterExpiration: boolean;
  storeId: string;
  invoiceId: string;
  paymentMethod?: string;
  payment?: BTCPayPayment;
  manual?: boolean;
}

// Integration-specific types
export interface BTCPayPaymentSession {
  sessionId: string;
  invoiceId: string;
  checkoutUrl: string;
  expiresAt: Date;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'expired' | 'invalid';
}

export interface BTCPaySubscription {
  id: string;
  userId: string;
  planId: string;
  btcpayCustomerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  nextInvoiceDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BTCPayCustomer {
  id: string;
  email: string;
  name?: string;
  created: number;
}

// Error types
export interface BTCPayError {
  error: string;
  details?: string;
  status?: number;
}

// Configuration types
export interface BTCPayEnvironmentConfig {
  BTCPAY_SERVER_URL: string;
  BTCPAY_API_KEY: string;
  BTCPAY_WEBHOOK_SECRET: string;
  BTCPAY_STORE_ID: string;
  BTCPAY_WEBHOOK_URL?: string;
}

// Integration response types
export interface BTCPayCreateInvoiceResponse {
  success: boolean;
  invoiceId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface BTCPayWebhookValidationResponse {
  isValid: boolean;
  event?: BTCPayWebhookEvent;
  invoiceId?: string;
  error?: string;
}