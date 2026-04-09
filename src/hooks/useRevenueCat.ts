import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { useAuth } from '@/hooks/useAuth';

const ENTITLEMENT_ID = 'FishingRadar Pro';
const IOS_API_KEY = 'appl_bGZECOEASZbBHqTSRubTOEyiehF';
const ANDROID_API_KEY = 'goog_eQVPGCnmhKpzumsPKkQGprypeNL';

export function useRevenueCat() {
  const { user } = useAuth();

  const [offerings, setOfferings] = useState<any | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const isPremium =
    !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive;

  const subscriptionEnd =
    customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.expirationDate ?? null;

  useEffect(() => {
    if (!isNative || initialized) return;

    const init = async () => {
      try {
        const platform = Capacitor.getPlatform();
        const apiKey = platform === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;

        await Purchases.configure({ apiKey });
        setInitialized(true);
        console.log('[RevenueCat] configure success');
      } catch (err) {
        console.error('[RevenueCat] Init error:', err);
      }
    };

    init();
  }, [isNative, initialized]);

  useEffect(() => {
    if (!isNative || !initialized) return;

    const syncRevenueCatUser = async () => {
      try {
        if (user?.id) {
          console.log('[RevenueCat] logIn with app user:', user.id);
          await Purchases.logIn({ appUserID: user.id });
        }
      } catch (err) {
        console.error('[RevenueCat] logIn error:', err);
      }
    };

    syncRevenueCatUser();
  }, [isNative, initialized, user?.id]);

  const refreshCustomerInfo = useCallback(async () => {
    if (!isNative || !initialized) return null;

    try {
      const result = await Purchases.getCustomerInfo();
      const info = result?.customerInfo ?? result;
      setCustomerInfo(info);
      return info;
    } catch (err) {
      console.error('[RevenueCat] Customer info error:', err);
      return null;
    }
  }, [isNative, initialized]);

  const fetchOfferings = useCallback(async () => {
    if (!isNative || !initialized) return null;

    setLoading(true);
    try {
      const result = await Purchases.getOfferings();
      const off = result?.offerings ?? result;

      setOfferings(off?.current ?? null);
      return off?.current ?? null;
    } catch (err) {
      console.error('[RevenueCat] Offerings error:', err);
      setOfferings(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isNative, initialized]);

  useEffect(() => {
    if (!initialized) return;

    fetchOfferings();
    refreshCustomerInfo();
  }, [initialized, fetchOfferings, refreshCustomerInfo, user?.id]);

  const purchasePackage = useCallback(async (pkg: any) => {
    if (!isNative || !initialized || !pkg) return false;

    setPurchasing(true);
    try {
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      const info = result?.customerInfo ?? result;
      setCustomerInfo(info);

      return !!info?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive;
    } catch (err) {
      console.error('[RevenueCat] Purchase error:', err);
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [isNative, initialized]);

  const restorePurchases = useCallback(async () => {
    if (!isNative || !initialized) return false;

    setPurchasing(true);
    try {
      const result = await Purchases.restorePurchases();
      const info = result?.customerInfo ?? result;
      setCustomerInfo(info);

      return !!info?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive;
    } catch (err) {
      console.error('[RevenueCat] Restore error:', err);
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [isNative, initialized]);

  const logoutRevenueCat = useCallback(async () => {
    if (!isNative || !initialized) return;

    try {
      await Purchases.logOut();
      setCustomerInfo(null);
      setOfferings(null);
      console.log('[RevenueCat] logged out');
    } catch (err) {
      console.error('[RevenueCat] logOut error:', err);
    }
  }, [isNative, initialized]);

  const monthlyPackage =
    offerings?.monthly ??
    offerings?.availablePackages?.find(
      (p: any) =>
        p?.identifier === '$rc_monthly' ||
        p?.identifier === 'monthly' ||
        p?.packageType === 'MONTHLY'
    ) ??
    null;

  const annualPackage =
    offerings?.annual ??
    offerings?.availablePackages?.find(
      (p: any) =>
        p?.identifier === '$rc_annual' ||
        p?.identifier === '$rc_yearly' ||
        p?.identifier === 'annual' ||
        p?.identifier === 'yearly' ||
        p?.packageType === 'ANNUAL'
    ) ??
    null;

  return {
    isNative,
    offerings,
    isPremium,
    subscriptionEnd,
    loading,
    purchasing,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
    fetchOfferings,
    logoutRevenueCat,
    monthlyPackage,
    annualPackage,
  };
}