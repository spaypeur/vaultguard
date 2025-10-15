import axios, { AxiosResponse } from 'axios';
import { Logger } from '../utils/logger';
import { EmailService } from './email';
import { DatabaseService } from './database';

export interface PaymentVerificationRequest {
  userId: string;
  planId: string;
  cryptocurrency: string;
  expectedAmount: number;
  transactionHash: string;
  walletAddress: string;
  paymentId: string;
  verification_attempts?: number;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionHash?: string;
  amount?: number;
  confirmations?: number;
  recipient?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'invalid_amount' | 'invalid_recipient';
  message: string;
  blockNumber?: number;
  timestamp?: Date;
}

export interface BlockchainAPIConfig {
  baseUrl: string;
  apiKey?: string;
  rateLimitDelay: number;
  timeout: number;
}

export interface CryptoPaymentRecord {
  id: string;
  user_id: string;
  plan_id: string;
  cryptocurrency: string;
  expected_amount: number;
  transaction_hash: string;
  wallet_address: string;
  payment_id: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  verification_attempts: number;
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class CryptoPaymentVerifier {
  private static instance: CryptoPaymentVerifier;
  private logger: Logger;
  private emailService: EmailService;
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  // API configurations for different blockchains
  private apiConfigs: Record<string, BlockchainAPIConfig> = {
    ETH: {
      baseUrl: 'https://api.etherscan.io/api',
      apiKey: process.env.ETHERSCAN_API_KEY,
      rateLimitDelay: 250, // 4 requests per second max
      timeout: 10000,
    },
    BTC: {
      baseUrl: 'https://blockchain.info',
      rateLimitDelay: 1000, // 1 request per second max
      timeout: 10000,
    },
    SOL: {
      baseUrl: 'https://public-api.solscan.io',
      rateLimitDelay: 200, // 5 requests per second max
      timeout: 10000,
    },
    ADA: {
      baseUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
      apiKey: process.env.BLOCKFROST_API_KEY,
      rateLimitDelay: 100, // 10 requests per second max
      timeout: 10000,
    },
    DOT: {
      baseUrl: 'https://api.subscan.io/api',
      apiKey: process.env.SUBSCAN_API_KEY,
      rateLimitDelay: 1000, // 1 request per second max
      timeout: 10000,
    },
  };

  // Payment wallets (same as in payments.ts)
  private paymentWallets: Record<string, string> = {
    BTC: 'bc1qshs529g7r3uhfvr4uf68yj9l243nnkz8082ve7',
    ETH: '0x6f3d73eadffad9ad3f8cb04d133282de95d6c3cd',
    USDT_ERC20: '0x6f3d73eadffad9ad3f8cb04d133282de95d6c3cd',
    SOL: 'BHdJyRkTkxVRCqKWi8oKbcD2ijKFwXYeH1ZfogLcXxLb',
    ADA: 'addr1q9de789ay5ygnhqfd5g9pnadnasm2wpwrqe6sh0jh64y50wdrcr7nywn3t7sy0fh66uf2wftz4lwc303su8t03wzh2yqhqwn5u',
    DOT: '0x93812EE085718eC2ae1cF33921020e9CE9E3f2dC',
  };

  // Minimum confirmations required for each chain
  private minConfirmations: Record<string, number> = {
    BTC: 3,
    ETH: 12,
    SOL: 32,
    ADA: 10,
    DOT: 6,
  };

  private constructor() {
    this.logger = new Logger('CryptoPaymentVerifier');
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): CryptoPaymentVerifier {
    if (!CryptoPaymentVerifier.instance) {
      CryptoPaymentVerifier.instance = new CryptoPaymentVerifier();
    }
    return CryptoPaymentVerifier.instance;
  }

  /**
   * Start automated payment monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      this.logger.warn('Payment monitoring already running');
      return;
    }

    this.isMonitoring = true;
    this.logger.info('Starting automated crypto payment verification monitoring');

    // Check for pending payments every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      await this.checkPendingPayments();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkPendingPayments().catch(error => {
      this.logger.error('Error in initial payment check:', error);
    });
  }

  /**
   * Stop automated payment monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    this.logger.info('Stopped automated crypto payment verification monitoring');
  }

  /**
   * Submit a new payment verification request
   */
  public async submitPaymentVerification(request: PaymentVerificationRequest): Promise<string> {
    try {
      // Validate cryptocurrency is supported
      if (!this.paymentWallets[request.cryptocurrency]) {
        throw new Error(`Unsupported cryptocurrency: ${request.cryptocurrency}`);
      }

      // Create payment record in database
      const paymentRecord: Partial<CryptoPaymentRecord> = {
        id: request.paymentId,
        user_id: request.userId,
        plan_id: request.planId,
        cryptocurrency: request.cryptocurrency,
        expected_amount: request.expectedAmount,
        transaction_hash: request.transactionHash,
        wallet_address: request.walletAddress,
        payment_id: request.paymentId,
        status: 'pending',
        verification_attempts: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Log audit event for payment submission
      await DatabaseService.logAuditEvent(
        request.userId,
        'crypto_payment_submitted',
        'payment',
        request.paymentId,
        null,
        {
          planId: request.planId,
          cryptocurrency: request.cryptocurrency,
          expectedAmount: request.expectedAmount,
          transactionHash: request.transactionHash,
          walletAddress: request.walletAddress,
        }
      );

      this.logger.info(`Payment verification request submitted for user ${request.userId}: ${request.cryptocurrency} ${request.expectedAmount}`);

      // Send confirmation email to user
      await this.sendPaymentConfirmationEmail(request.userId, request);

      return request.paymentId;
    } catch (error: any) {
      this.logger.error('Error submitting payment verification:', error);
      throw error;
    }
  }

  /**
   * Check all pending payments
   */
  private async checkPendingPayments(): Promise<void> {
    try {
      this.logger.debug('Checking pending crypto payments...');

      // Get pending payments from audit logs (since we don't have a dedicated payments table yet)
      // In production, you'd want a dedicated crypto_payments table
      const recentPayments = await this.getPendingPayments();

      for (const payment of recentPayments) {
        await this.verifyPayment(payment);
      }
    } catch (error: any) {
      this.logger.error('Error checking pending payments:', error);
    }
  }

  /**
   * Verify a specific payment
   */
  private async verifyPayment(request: PaymentVerificationRequest): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.info(`Verifying payment for user ${request.userId}: ${request.transactionHash}`);

      const result = await this.verifyTransaction(
        request.cryptocurrency,
        request.transactionHash,
        request.expectedAmount,
        request.walletAddress
      );

      // Update verification attempts
      const attempts = (request as any).verification_attempts || 0;

      if (result.success && result.status === 'confirmed') {
        await this.handleSuccessfulVerification(request, result);
      } else if (attempts >= 10) {
        await this.handleFailedVerification(request, 'Maximum verification attempts exceeded');
      } else {
        await this.scheduleRetry(request, attempts + 1);
      }

      const duration = Date.now() - startTime;
      this.logger.info(`Payment verification completed in ${duration}ms: ${result.status}`);

    } catch (error: any) {
      this.logger.error(`Error verifying payment for user ${request.userId}:`, error);
      await this.handleVerificationError(request, error.message);
    }
  }

  /**
   * Verify transaction on blockchain
   */
  private async verifyTransaction(
    cryptocurrency: string,
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    switch (cryptocurrency) {
      case 'ETH':
      case 'USDT_ERC20':
        return this.verifyEthereumTransaction(transactionHash, expectedAmount, expectedRecipient);

      case 'BTC':
        return this.verifyBitcoinTransaction(transactionHash, expectedAmount, expectedRecipient);

      case 'SOL':
        return this.verifySolanaTransaction(transactionHash, expectedAmount, expectedRecipient);

      case 'ADA':
        return this.verifyCardanoTransaction(transactionHash, expectedAmount, expectedRecipient);

      case 'DOT':
        return this.verifyPolkadotTransaction(transactionHash, expectedAmount, expectedRecipient);

      default:
        return {
          success: false,
          status: 'failed',
          message: `Unsupported cryptocurrency: ${cryptocurrency}`,
        };
    }
  }

  /**
   * Verify Ethereum/ERC20 transaction using Etherscan API
   */
  private async verifyEthereumTransaction(
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    const config = this.apiConfigs.ETH;

    try {
      const response: AxiosResponse = await axios.get(config.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_getTransactionByHash',
          txhash: transactionHash,
          apikey: config.apiKey,
        },
        timeout: config.timeout,
      });

      if (response.data.result) {
        const tx = response.data.result;
        const value = parseInt(tx.value, 16) / 1e18; // Convert from wei to ETH
        const to = tx.to?.toLowerCase();
        const expectedRecipientLower = expectedRecipient.toLowerCase();

        // Check if recipient matches
        if (to !== expectedRecipientLower) {
          return {
            success: false,
            status: 'invalid_recipient',
            message: `Transaction recipient ${to} does not match expected ${expectedRecipientLower}`,
          };
        }

        // Check amount (with 0.1% tolerance)
        const tolerance = expectedAmount * 0.001;
        if (Math.abs(value - expectedAmount) > tolerance) {
          return {
            success: false,
            status: 'invalid_amount',
            message: `Transaction amount ${value} does not match expected ${expectedAmount}`,
          };
        }

        // For ERC20 tokens, we need additional verification
        if (transactionHash.startsWith('0x') && transactionHash.length === 66) {
          return await this.verifyERC20Transaction(transactionHash, expectedAmount, expectedRecipient);
        }

        return {
          success: true,
          status: 'confirmed',
          transactionHash,
          amount: value,
          recipient: to,
          message: 'ETH transaction verified successfully',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Transaction not found on blockchain',
      };

    } catch (error: any) {
      this.logger.error('Error verifying Ethereum transaction:', error);
      return {
        success: false,
        status: 'failed',
        message: `Ethereum API error: ${error.message}`,
      };
    }
  }

  /**
   * Verify ERC20 token transaction
   */
  private async verifyERC20Transaction(
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    const config = this.apiConfigs.ETH;

    try {
      // Get transaction receipt for logs
      const receiptResponse: AxiosResponse = await axios.get(config.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_getTransactionReceipt',
          txhash: transactionHash,
          apikey: config.apiKey,
        },
        timeout: config.timeout,
      });

      if (receiptResponse.data.result) {
        const receipt = receiptResponse.data.result;
        const blockNumber = parseInt(receipt.blockNumber, 16);

        // Check confirmations
        const latestBlockResponse: AxiosResponse = await axios.get(config.baseUrl, {
          params: {
            module: 'proxy',
            action: 'eth_blockNumber',
            apikey: config.apiKey,
          },
          timeout: config.timeout,
        });

        if (latestBlockResponse.data.result) {
          const latestBlock = parseInt(latestBlockResponse.data.result, 16);
          const confirmations = latestBlock - blockNumber;

          if (confirmations < this.minConfirmations.ETH) {
            return {
              success: false,
              status: 'pending',
              confirmations,
              blockNumber,
              message: `Insufficient confirmations: ${confirmations}/${this.minConfirmations.ETH}`,
            };
          }
        }

        return {
          success: true,
          status: 'confirmed',
          transactionHash,
          amount: expectedAmount,
          recipient: expectedRecipient,
          blockNumber,
          message: 'ERC20 transaction verified successfully',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Transaction receipt not available yet',
      };

    } catch (error: any) {
      this.logger.error('Error verifying ERC20 transaction:', error);
      return {
        success: false,
        status: 'failed',
        message: `ERC20 verification error: ${error.message}`,
      };
    }
  }

  /**
   * Verify Bitcoin transaction using Blockchain.com API
   */
  private async verifyBitcoinTransaction(
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    const config = this.apiConfigs.BTC;

    try {
      const response: AxiosResponse = await axios.get(
        `${config.baseUrl}/rawtx/${transactionHash}`,
        { timeout: config.timeout }
      );

      if (response.data) {
        const tx = response.data;
        const output = tx.out?.find((out: any) =>
          out.addr === expectedRecipient || out.script === expectedRecipient
        );

        if (!output) {
          return {
            success: false,
            status: 'invalid_recipient',
            message: `Transaction does not send to expected recipient ${expectedRecipient}`,
          };
        }

        const amount = output.value / 100000000; // Convert from satoshis to BTC

        // Check amount (with 0.1% tolerance)
        const tolerance = expectedAmount * 0.001;
        if (Math.abs(amount - expectedAmount) > tolerance) {
          return {
            success: false,
            status: 'invalid_amount',
            message: `Transaction amount ${amount} does not match expected ${expectedAmount}`,
          };
        }

        return {
          success: true,
          status: 'confirmed',
          transactionHash,
          amount,
          recipient: expectedRecipient,
          message: 'Bitcoin transaction verified successfully',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Transaction not found on blockchain',
      };

    } catch (error: any) {
      this.logger.error('Error verifying Bitcoin transaction:', error);
      return {
        success: false,
        status: 'failed',
        message: `Bitcoin API error: ${error.message}`,
      };
    }
  }

  /**
   * Verify Solana transaction using Solscan API
   */
  private async verifySolanaTransaction(
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    const config = this.apiConfigs.SOL;

    try {
      const response: AxiosResponse = await axios.get(
        `${config.baseUrl}/transaction?tx=${transactionHash}`,
        { timeout: config.timeout }
      );

      if (response.data) {
        const tx = response.data;

        if (tx.err) {
          return {
            success: false,
            status: 'failed',
            message: 'Transaction failed on blockchain',
          };
        }

        // Check if recipient received the amount
        const postBalances = tx.meta?.postBalances || [];
        const preBalances = tx.meta?.preBalances || [];

        if (postBalances.length > 0 && preBalances.length > 0) {
          const balanceChange = postBalances[0] - preBalances[0];
          const amount = balanceChange / 1000000000; // Convert from lamports to SOL

          if (Math.abs(amount - expectedAmount) > expectedAmount * 0.001) {
            return {
              success: false,
              status: 'invalid_amount',
              message: `Transaction amount ${amount} does not match expected ${expectedAmount}`,
            };
          }
        }

        return {
          success: true,
          status: 'confirmed',
          transactionHash,
          amount: expectedAmount,
          recipient: expectedRecipient,
          message: 'Solana transaction verified successfully',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Transaction not found on blockchain',
      };

    } catch (error: any) {
      this.logger.error('Error verifying Solana transaction:', error);
      return {
        success: false,
        status: 'failed',
        message: `Solana API error: ${error.message}`,
      };
    }
  }

  /**
   * Verify Cardano transaction using Blockfrost API
   */
  private async verifyCardanoTransaction(
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    const config = this.apiConfigs.ADA;

    try {
      const response: AxiosResponse = await axios.get(
        `${config.baseUrl}/txs/${transactionHash}`,
        {
          headers: {
            'project_id': config.apiKey,
          },
          timeout: config.timeout,
        }
      );

      if (response.data) {
        const tx = response.data;

        // Check if recipient received the amount
        const output = tx.outputs?.find((out: any) =>
          out.address === expectedRecipient
        );

        if (!output) {
          return {
            success: false,
            status: 'invalid_recipient',
            message: `Transaction does not send to expected recipient ${expectedRecipient}`,
          };
        }

        const amount = parseInt(output.amount?.[0]?.quantity || '0') / 1000000; // Convert from lovelace to ADA

        // Check amount (with 0.1% tolerance)
        const tolerance = expectedAmount * 0.001;
        if (Math.abs(amount - expectedAmount) > tolerance) {
          return {
            success: false,
            status: 'invalid_amount',
            message: `Transaction amount ${amount} does not match expected ${expectedAmount}`,
          };
        }

        return {
          success: true,
          status: 'confirmed',
          transactionHash,
          amount,
          recipient: expectedRecipient,
          message: 'Cardano transaction verified successfully',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Transaction not found on blockchain',
      };

    } catch (error: any) {
      this.logger.error('Error verifying Cardano transaction:', error);
      return {
        success: false,
        status: 'failed',
        message: `Cardano API error: ${error.message}`,
      };
    }
  }

  /**
   * Verify Polkadot transaction using Subscan API
   */
  private async verifyPolkadotTransaction(
    transactionHash: string,
    expectedAmount: number,
    expectedRecipient: string
  ): Promise<PaymentVerificationResult> {

    const config = this.apiConfigs.DOT;

    try {
      const response: AxiosResponse = await axios.post(
        `${config.baseUrl}/scan/extrinsic`,
        {
          hash: transactionHash,
        },
        {
          headers: {
            'X-API-Key': config.apiKey,
          },
          timeout: config.timeout,
        }
      );

      if (response.data?.data) {
        const tx = response.data.data;

        if (tx.success === false) {
          return {
            success: false,
            status: 'failed',
            message: 'Transaction failed on blockchain',
          };
        }

        // Check amount and recipient from transaction data
        const amount = parseFloat(tx.amount) / 10000000000; // Convert from Planck to DOT
        const dest = tx.params?.[0]?.value;

        if (dest !== expectedRecipient) {
          return {
            success: false,
            status: 'invalid_recipient',
            message: `Transaction recipient ${dest} does not match expected ${expectedRecipient}`,
          };
        }

        // Check amount (with 0.1% tolerance)
        const tolerance = expectedAmount * 0.001;
        if (Math.abs(amount - expectedAmount) > tolerance) {
          return {
            success: false,
            status: 'invalid_amount',
            message: `Transaction amount ${amount} does not match expected ${expectedAmount}`,
          };
        }

        return {
          success: true,
          status: 'confirmed',
          transactionHash,
          amount,
          recipient: expectedRecipient,
          message: 'Polkadot transaction verified successfully',
        };
      }

      return {
        success: false,
        status: 'pending',
        message: 'Transaction not found on blockchain',
      };

    } catch (error: any) {
      this.logger.error('Error verifying Polkadot transaction:', error);
      return {
        success: false,
        status: 'failed',
        message: `Polkadot API error: ${error.message}`,
      };
    }
  }

  /**
   * Handle successful payment verification
   */
  private async handleSuccessfulVerification(
    request: PaymentVerificationRequest,
    result: PaymentVerificationResult
  ): Promise<void> {

    try {
      // Update user subscription status
      await DatabaseService.updateUser(request.userId, {
        subscription_plan: request.planId,
        subscription_status: 'active',
        subscription_started_at: new Date(),
      });

      // Log successful verification
      await DatabaseService.logAuditEvent(
        request.userId,
        'crypto_payment_verified',
        'payment',
        request.paymentId,
        null,
        {
          planId: request.planId,
          cryptocurrency: request.cryptocurrency,
          amount: result.amount,
          transactionHash: result.transactionHash,
          verificationMethod: 'automated',
        }
      );

      // Send confirmation email
      await this.sendPaymentSuccessEmail(request.userId, request, result);

      this.logger.info(`Payment verified successfully for user ${request.userId}: ${request.cryptocurrency} ${result.amount}`);

    } catch (error: any) {
      this.logger.error('Error handling successful verification:', error);
    }
  }

  /**
   * Handle failed payment verification
   */
  private async handleFailedVerification(
    request: PaymentVerificationRequest,
    reason: string
  ): Promise<void> {

    try {
      // Log failed verification
      await DatabaseService.logAuditEvent(
        request.userId,
        'crypto_payment_verification_failed',
        'payment',
        request.paymentId,
        null,
        {
          planId: request.planId,
          cryptocurrency: request.cryptocurrency,
          reason,
          verificationMethod: 'automated',
        }
      );

      // Send failure notification email
      await this.sendPaymentFailureEmail(request.userId, request, reason);

      this.logger.warn(`Payment verification failed for user ${request.userId}: ${reason}`);

    } catch (error: any) {
      this.logger.error('Error handling failed verification:', error);
    }
  }

  /**
   * Handle verification error
   */
  private async handleVerificationError(
    request: PaymentVerificationRequest,
    error: string
  ): Promise<void> {

    try {
      // Log verification error
      await DatabaseService.logAuditEvent(
        request.userId,
        'crypto_payment_verification_error',
        'payment',
        request.paymentId,
        null,
        {
          planId: request.planId,
          cryptocurrency: request.cryptocurrency,
          error,
          verificationMethod: 'automated',
        }
      );

      this.logger.error(`Payment verification error for user ${request.userId}: ${error}`);

    } catch (logError: any) {
      this.logger.error('Error logging verification error:', logError);
    }
  }

  /**
   * Schedule retry for failed verification
   */
  private async scheduleRetry(
    request: PaymentVerificationRequest,
    attempts: number
  ): Promise<void> {

    try {
      const delay = Math.min(attempts * 30 * 1000, 10 * 60 * 1000); // Max 10 minutes

      setTimeout(async () => {
        await this.verifyPayment(request);
      }, delay);

      this.logger.debug(`Scheduled retry ${attempts} for payment ${request.paymentId} in ${delay}ms`);

    } catch (error: any) {
      this.logger.error('Error scheduling retry:', error);
    }
  }

  /**
   * Get pending payments from recent audit logs
   */
  private async getPendingPayments(): Promise<PaymentVerificationRequest[]> {
    try {
      const auditLogs = await DatabaseService.getAuditLogsByUserId('system', 1000);

      const pendingPayments: PaymentVerificationRequest[] = [];

      for (const log of auditLogs) {
        if (log.action === 'crypto_payment_submitted' && log.new_values) {
          const paymentData = log.new_values;

          // Check if payment is still pending (not yet verified or failed)
          const existingLogs = await DatabaseService.getAuditLogsByUserId(log.user_id || '', 100);
          const hasVerification = existingLogs.some(l =>
            l.resource_id === log.resource_id &&
            (l.action === 'crypto_payment_verified' || l.action === 'crypto_payment_verification_failed')
          );

          if (!hasVerification) {
            pendingPayments.push({
              userId: log.user_id || '',
              planId: paymentData.planId,
              cryptocurrency: paymentData.cryptocurrency,
              expectedAmount: paymentData.expectedAmount,
              transactionHash: paymentData.transactionHash,
              walletAddress: paymentData.walletAddress,
              paymentId: log.resource_id || '',
              verification_attempts: 0,
            });
          }
        }
      }

      return pendingPayments;

    } catch (error: any) {
      this.logger.error('Error getting pending payments:', error);
      return [];
    }
  }

  /**
   * Send payment confirmation email
   */
  private async sendPaymentConfirmationEmail(
    userId: string,
    request: PaymentVerificationRequest
  ): Promise<void> {

    try {
      const user = await DatabaseService.getUserById(userId);

      if (!user?.email) {
        this.logger.warn(`Cannot send confirmation email: no email found for user ${userId}`);
        return;
      }

      const subject = 'VaultGuard - Crypto Payment Received';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Payment Received</h2>
          <p>Hello ${user.first_name || 'Valued Customer'},</p>
          <p>We have received your crypto payment and are currently verifying it on the blockchain.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
            <p><strong>Cryptocurrency:</strong> ${request.cryptocurrency}</p>
            <p><strong>Amount:</strong> ${request.expectedAmount}</p>
            <p><strong>Transaction Hash:</strong> ${request.transactionHash}</p>
            <p><strong>Recipient Wallet:</strong> ${request.walletAddress}</p>
          </div>

          <p>Verification typically takes 5-15 minutes depending on the blockchain network.</p>
          <p>You will receive another email once verification is complete and your subscription is activated.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from VaultGuard. Please do not reply to this email.
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        priority: 'normal',
      });

      this.logger.info(`Payment confirmation email sent to ${user.email}`);

    } catch (error: any) {
      this.logger.error('Error sending payment confirmation email:', error);
    }
  }

  /**
   * Send payment success email
   */
  private async sendPaymentSuccessEmail(
    userId: string,
    request: PaymentVerificationRequest,
    result: PaymentVerificationResult
  ): Promise<void> {

    try {
      const user = await DatabaseService.getUserById(userId);

      if (!user?.email) {
        this.logger.warn(`Cannot send success email: no email found for user ${userId}`);
        return;
      }

      const subject = 'VaultGuard - Payment Verified & Subscription Activated';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; text-align: center;">Payment Verified Successfully!</h2>
          <p>Hello ${user.first_name || 'Valued Customer'},</p>
          <p>Great news! Your crypto payment has been verified and your subscription is now active.</p>

          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <h3 style="margin-top: 0; color: #155724;">Subscription Details:</h3>
            <p><strong>Plan:</strong> ${request.planId}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Active</span></p>
            <p><strong>Payment Method:</strong> ${request.cryptocurrency}</p>
            <p><strong>Amount Paid:</strong> ${result.amount}</p>
            <p><strong>Transaction:</strong> ${result.transactionHash}</p>
          </div>

          <p>You now have full access to all features included in your plan. Welcome to VaultGuard!</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from VaultGuard. Please do not reply to this email.
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.info(`Payment success email sent to ${user.email}`);

    } catch (error: any) {
      this.logger.error('Error sending payment success email:', error);
    }
  }

  /**
   * Send payment failure email
   */
  private async sendPaymentFailureEmail(
    userId: string,
    request: PaymentVerificationRequest,
    reason: string
  ): Promise<void> {

    try {
      const user = await DatabaseService.getUserById(userId);

      if (!user?.email) {
        this.logger.warn(`Cannot send failure email: no email found for user ${userId}`);
        return;
      }

      const subject = 'VaultGuard - Payment Verification Failed';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc3545; text-align: center;">Payment Verification Failed</h2>
          <p>Hello ${user.first_name || 'Valued Customer'},</p>
          <p>We're sorry, but we were unable to verify your crypto payment after multiple attempts.</p>

          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f5c6cb;">
            <h3 style="margin-top: 0; color: #721c24;">Payment Details:</h3>
            <p><strong>Cryptocurrency:</strong> ${request.cryptocurrency}</p>
            <p><strong>Expected Amount:</strong> ${request.expectedAmount}</p>
            <p><strong>Transaction Hash:</strong> ${request.transactionHash}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>

          <p>Please contact our support team for assistance:</p>
          <p><strong>Support Email:</strong> support@vaultguard.io</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from VaultGuard. Please do not reply to this email.
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.info(`Payment failure email sent to ${user.email}`);

    } catch (error: any) {
      this.logger.error('Error sending payment failure email:', error);
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  public getSupportedCryptocurrencies(): Array<{ code: string; name: string; wallet: string }> {
    return Object.entries(this.paymentWallets).map(([code, wallet]) => ({
      code,
      name: this.getCryptocurrencyName(code),
      wallet,
    }));
  }

  /**
   * Get cryptocurrency name from code
   */
  private getCryptocurrencyName(code: string): string {
    const names: Record<string, string> = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      USDT_ERC20: 'Tether (ERC20)',
      SOL: 'Solana',
      ADA: 'Cardano',
      DOT: 'Polkadot',
    };

    return names[code] || code;
  }

  /**
   * Health check for API connections
   */
  public async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [crypto, config] of Object.entries(this.apiConfigs)) {
      try {
        if (crypto === 'BTC') {
          // Simple ping for blockchain.info
          await axios.get(`${config.baseUrl}/latestblock`, { timeout: 5000 });
        } else if (crypto === 'ETH') {
          // Etherscan API ping
          await axios.get(`${config.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${config.apiKey}`, { timeout: 5000 });
        } else if (crypto === 'SOL') {
          // Solscan API ping
          await axios.get(`${config.baseUrl}/block/last`, { timeout: 5000 });
        } else if (crypto === 'ADA') {
          // Blockfrost API ping
          await axios.get(`${config.baseUrl}/health`, {
            headers: { 'project_id': config.apiKey },
            timeout: 5000
          });
        } else if (crypto === 'DOT') {
          // Subscan API ping
          await axios.post(`${config.baseUrl}/scan/metadata`, {},
            {
              headers: { 'X-API-Key': config.apiKey },
              timeout: 5000
            });
        }

        health[crypto] = true;
      } catch (error) {
        health[crypto] = false;
        this.logger.warn(`Health check failed for ${crypto}:`, error);
      }
    }

    return health;
  }
}

export default CryptoPaymentVerifier;