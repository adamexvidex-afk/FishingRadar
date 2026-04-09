import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'fishingradar_offline_catalog';
const CACHE_TIMESTAMP_KEY = 'fishingradar_offline_catalog_ts';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

interface CachedFish {
  id: string;
  name_en: string;
  latin_name: string | null;
  category: string | null;
  habitat: string | null;
  techniques: string[] | null;
  baits: string[] | null;
  description: string | null;
  protection: string | null;
  min_size: string | null;
  image_url: string | null;
}

export function useOfflineCatalog() {
  const [isAvailableOffline, setIsAvailableOffline] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    checkCache();
  }, []);

  const checkCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (cached && ts) {
        const data = JSON.parse(cached) as CachedFish[];
        setIsAvailableOffline(true);
        setCacheSize(data.length);
        setLastSaved(new Date(parseInt(ts)).toLocaleDateString());
      } else {
        setIsAvailableOffline(false);
        setCacheSize(0);
      }
    } catch {
      setIsAvailableOffline(false);
    }
  };

  const downloadForOffline = useCallback(async () => {
    setSaving(true);
    try {
      // Fetch all fish in batches
      let allFish: CachedFish[] = [];
      let from = 0;
      const batchSize = 500;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('fish_species')
          .select('id, name_en, latin_name, category, habitat, techniques, baits, description, protection, min_size, image_url')
          .order('name_en')
          .range(from, from + batchSize - 1);

        if (error) throw error;
        if (data) {
          allFish = [...allFish, ...data];
          hasMore = data.length === batchSize;
          from += batchSize;
        } else {
          hasMore = false;
        }
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(allFish));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      setIsAvailableOffline(true);
      setCacheSize(allFish.length);
      setLastSaved(new Date().toLocaleDateString());
      return allFish.length;
    } catch (e) {
      console.error('Failed to cache catalog:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    setIsAvailableOffline(false);
    setCacheSize(0);
    setLastSaved(null);
  }, []);

  const getCachedData = useCallback((): CachedFish[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }, []);

  return {
    isAvailableOffline,
    cacheSize,
    saving,
    lastSaved,
    downloadForOffline,
    clearCache,
    getCachedData,
  };
}
