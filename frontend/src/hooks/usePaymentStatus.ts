import { useState, useEffect, useCallback } from 'react';
import { paymentAPI } from '../services/api';

interface PaymentStatus {
  status: 'checking' | 'confirmed' | 'pending' | 'failed';
  paymentDetails: any;
  error: string | null;
  isPolling: boolean;
}

interface UsePaymentStatusOptions {
  paymentId?: string;
  autoPoll?: boolean;
  pollInterval?: number;
  maxRetries?: number;
}

export const usePaymentStatus = (options: UsePaymentStatusOptions = {}) => {
  const {
    paymentId,
    autoPoll = true,
    pollInterval = 5000,
    maxRetries = 10
  } = options;

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'checking',
    paymentDetails: null,
    error: null,
    isPolling: false,
  });

  const [retryCount, setRetryCount] = useState(0);

  const checkPaymentStatus = useCallback(async () => {
    try {
      setPaymentStatus(prev => ({ ...prev, error: null }));

      // Check subscription status first
      const subscriptionResponse = await paymentAPI.getSubscription();

      if (subscriptionResponse.success) {
        const subscription = subscriptionResponse.data;

        if (subscription.status === 'active') {
          setPaymentStatus({
            status: 'confirmed',
            paymentDetails: {
              plan: subscription.plan,
              startedAt: subscription.startedAt,
              expiresAt: subscription.expiresAt,
            },
            error: null,
            isPolling: false,
          });
          return;
        }
      }

      // If subscription not active, check payment history
      const historyResponse = await paymentAPI.getPaymentHistory();

      if (historyResponse.success) {
        const recentPayments = historyResponse.data.filter((payment: any) => {
          const paymentDate = new Date(payment.date);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          return paymentDate > fiveMinutesAgo;
        });

        if (recentPayments.length > 0) {
          setPaymentStatus({
            status: 'pending',
            paymentDetails: recentPayments[0],
            error: null,
            isPolling: true,
          });
        } else {
          setPaymentStatus({
            status: 'failed',
            paymentDetails: null,
            error: 'No recent payments found',
            isPolling: false,
          });
        }
      } else {
        setPaymentStatus({
          status: 'failed',
          paymentDetails: null,
          error: 'Failed to check payment status',
          isPolling: false,
        });
      }
    } catch (error: any) {
      console.error('Failed to check payment status:', error);
      setPaymentStatus({
        status: 'failed',
        paymentDetails: null,
        error: error.message || 'Unknown error occurred',
        isPolling: false,
      });
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!autoPoll || paymentStatus.status === 'confirmed' || paymentStatus.status === 'failed') {
      return;
    }

    setPaymentStatus(prev => ({ ...prev, isPolling: true }));
    setRetryCount(0);

    const interval = setInterval(() => {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        checkPaymentStatus();
      } else {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'failed',
          error: 'Payment verification timeout',
          isPolling: false
        }));
        clearInterval(interval);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [autoPoll, paymentStatus.status, retryCount, maxRetries, pollInterval, checkPaymentStatus]);

  const stopPolling = useCallback(() => {
    setPaymentStatus(prev => ({ ...prev, isPolling: false }));
    setRetryCount(0);
  }, []);

  const reset = useCallback(() => {
    setPaymentStatus({
      status: 'checking',
      paymentDetails: null,
      error: null,
      isPolling: false,
    });
    setRetryCount(0);
  }, []);

  // Auto-start polling when component mounts or when paymentId changes
  useEffect(() => {
    if (autoPoll) {
      const cleanup = startPolling();
      return cleanup;
    }
  }, [autoPoll, startPolling]);

  // Check status immediately when paymentId is provided
  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus();
    }
  }, [paymentId, checkPaymentStatus]);

  return {
    ...paymentStatus,
    retryCount,
    maxRetries,
    checkPaymentStatus,
    startPolling,
    stopPolling,
    reset,
  };
};