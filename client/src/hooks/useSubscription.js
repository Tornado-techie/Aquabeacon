import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSubscriptionAccess = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setSubscription({ hasAccess: false, requiresAuth: true });
        return;
      }

      const response = await fetch('/api/payments/subscription/access', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
        
        // Show expiry warning if needed
        if (data.data.isExpiringSoon && data.data.subscription.daysRemaining <= 7) {
          toast.warning(
            `Your subscription expires in ${data.data.subscription.daysRemaining} days. Renew now to keep access!`,
            {
              duration: 6000,
              id: 'subscription-warning'
            }
          );
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to check subscription status');
      console.error('Subscription check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    checkSubscriptionAccess();
  };

  useEffect(() => {
    checkSubscriptionAccess();
  }, []);

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    hasAccess: subscription?.hasAccess || false,
    isExpiringSoon: subscription?.isExpiringSoon || false,
    daysRemaining: subscription?.subscription?.daysRemaining || 0,
    currentPlan: subscription?.subscription?.plan || 'free'
  };
};

export default useSubscription;