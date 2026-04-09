import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

// In-memory cache per language
const translationCache = new Map<string, Map<string, string>>();
const loadingPromises = new Map<string, Promise<void>>();

export function useFishTranslations() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [ready, setReady] = useState(lang === 'en' || translationCache.has(lang));

  useEffect(() => {
    if (lang === 'en') {
      setReady(true);
      return;
    }

    if (translationCache.has(lang)) {
      setReady(true);
      return;
    }

    // Check if already loading
    if (loadingPromises.has(lang)) {
      loadingPromises.get(lang)!.then(() => setReady(true));
      return;
    }

    const loadPromise = (async () => {
      try {
        // Load cached translations from DB
        const { data } = await supabase
          .from('fish_name_translations')
          .select('fish_id, translated_name')
          .eq('language_code', lang);

        const map = new Map<string, string>();
        if (data && data.length > 0) {
          data.forEach((row: any) => map.set(row.fish_id, row.translated_name));
          translationCache.set(lang, map);
        }

        // If no translations exist, trigger generation in background
        if (!data || data.length === 0) {
          supabase.functions.invoke('translate-fish-names', {
            body: { language_code: lang },
          }).then(async () => {
            // Reload after generation
            const { data: newData } = await supabase
              .from('fish_name_translations')
              .select('fish_id, translated_name')
              .eq('language_code', lang);
            if (newData) {
              const newMap = new Map<string, string>();
              newData.forEach((row: any) => newMap.set(row.fish_id, row.translated_name));
              translationCache.set(lang, newMap);
            }
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to load fish translations:', e);
      }
    })();

    loadingPromises.set(lang, loadPromise);
    loadPromise.then(() => {
      setReady(true);
      loadingPromises.delete(lang);
    });
  }, [lang]);

  const translateFishName = (fishId: string, nameEn: string): string => {
    if (lang === 'en') return nameEn;
    const map = translationCache.get(lang);
    return map?.get(fishId) || nameEn;
  };

  return { translateFishName, ready };
}
