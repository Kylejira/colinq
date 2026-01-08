import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { subscriptionsApi } from '../services/api';

export const useSubscription = () => {
  const { isSignedIn, getToken } = useAuthContext();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubscription = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      const [statusData, usageData] = await Promise.all([
        subscriptionsApi.getStatus(getToken),
        subscriptionsApi.getUsage(getToken),
      ]);
      setSubscription(statusData);
      setUsage(usageData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const startCheckout = async (tier) => {
    try {
      const { checkoutUrl } = await subscriptionsApi.createCheckout(tier, getToken);
      window.location.href = checkoutUrl;
    } catch (err) {
      throw err;
    }
  };

  const openPortal = async () => {
    try {
      const { portalUrl } = await subscriptionsApi.getPortalUrl(getToken);
      window.location.href = portalUrl;
    } catch (err) {
      throw err;
    }
  };

  const refresh = () => {
    setLoading(true);
    loadSubscription();
  };

  const canUseFeature = (feature) => {
    if (!subscription?.features) return false;
    return subscription.features[feature] === true || subscription.features[feature] === -1;
  };

  const isWithinLimit = (limitType) => {
    if (!usage) return true;
    const data = usage[limitType];
    if (!data) return true;
    if (data.unlimited) return true;
    return data.used < data.limit;
  };

  return {
    subscription,
    usage,
    loading,
    error,
    startCheckout,
    openPortal,
    refresh,
    canUseFeature,
    isWithinLimit,
    isPro: subscription?.tier === 'pro' || subscription?.tier === 'premium',
    isPremium: subscription?.tier === 'premium',
    isFree: subscription?.tier === 'free' || !subscription?.tier,
  };
};

export default useSubscription;



