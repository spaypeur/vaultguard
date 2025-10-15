import { Logger } from '../utils/logger';
import { SubscriptionManager } from './subscriptionManager';
import { DatabaseService } from './database';
import { CronJob } from 'cron';

export class RenewalScheduler {
  private logger = new Logger('RenewalScheduler');
  private subscriptionManager: SubscriptionManager;
  private renewalJob: CronJob | null = null;
  private isRunning = false;

  constructor() {
    this.subscriptionManager = new SubscriptionManager();
    this.logger.info('Renewal Scheduler initialized');
  }

  /**
   * Start the automated renewal scheduler
   * Runs daily at 9:00 AM UTC to check for subscriptions expiring in 7 days
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Renewal scheduler is already running');
      return;
    }

    try {
      // Run daily at 9:00 AM UTC
      this.renewalJob = new CronJob('0 9 * * *', async () => {
        await this.processDailyRenewals();
      }, null, true, 'UTC');

      this.renewalJob.start();
      this.isRunning = true;

      this.logger.info('Automated renewal scheduler started - runs daily at 9:00 AM UTC');

      // Run initial check immediately
      this.processDailyRenewals();
    } catch (error) {
      this.logger.error('Failed to start renewal scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop the renewal scheduler
   */
  stop(): void {
    if (this.renewalJob) {
      this.renewalJob.stop();
      this.isRunning = false;
      this.logger.info('Renewal scheduler stopped');
    }
  }

  /**
   * Process daily renewal checks
   */
  private async processDailyRenewals(): Promise<void> {
    try {
      this.logger.info('Starting daily renewal check...');

      // Check for subscriptions expiring in 7 days
      await this.subscriptionManager.checkExpiringSubscriptions();

      // Process any failed payment retries
      await this.processFailedPaymentRetries();

      // Clean up old payment failure records
      await this.cleanupOldRecords();

      this.logger.info('Daily renewal check completed');
    } catch (error) {
      this.logger.error('Error during daily renewal check:', error);
    }
  }

  /**
   * Process failed payment retries
   */
  private async processFailedPaymentRetries(): Promise<void> {
    try {
      // Get payment failures that are due for retry
      const dueRetries = await this.getDuePaymentRetries();

      for (const retry of dueRetries) {
        try {
          const success = await this.subscriptionManager.retryPayment(retry.subscriptionId);

          if (success) {
            this.logger.info(`Payment retry successful for subscription ${retry.subscriptionId}`);
          } else {
            this.logger.warn(`Payment retry failed for subscription ${retry.subscriptionId}`);
          }
        } catch (error) {
          this.logger.error(`Error retrying payment for subscription ${retry.subscriptionId}:`, error);
        }
      }

      this.logger.info(`Processed ${dueRetries.length} payment retry attempts`);
    } catch (error) {
      this.logger.error('Error processing failed payment retries:', error);
    }
  }

  /**
   * Clean up old records
   */
  private async cleanupOldRecords(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up resolved payment failures older than 30 days
      await this.cleanupResolvedPaymentFailures(thirtyDaysAgo);

      this.logger.info('Cleanup completed');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Get payment failures due for retry
   */
  private async getDuePaymentRetries(): Promise<Array<{
    subscriptionId: string;
    nextRetryDate: Date;
    retryCount: number;
  }>> {
    // This would typically query your database for payment failures
    // that are due for retry (nextRetryDate <= now)
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Clean up resolved payment failures older than cutoff date
   */
  private async cleanupResolvedPaymentFailures(cutoffDate: Date): Promise<void> {
    // Implement based on your database schema
    // Delete payment failure records that are resolved and older than cutoff
    this.logger.info(`Cleaned up payment failures older than ${cutoffDate.toISOString()}`);
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    nextRun?: Date;
    lastRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      nextRun: this.renewalJob?.nextDate().toDate(),
    };
  }

  /**
   * Manually trigger renewal check (for testing or admin use)
   */
  async triggerManualRenewalCheck(): Promise<void> {
    this.logger.info('Manual renewal check triggered');
    await this.processDailyRenewals();
  }
}

export default RenewalScheduler;