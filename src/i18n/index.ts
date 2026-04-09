import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import { supabase } from '@/integrations/supabase/client';

export const languages = [
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', name: '中文', flag: '🇨🇳' },
  { code: 'pt', label: 'PT', name: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'no', label: 'NO', name: 'Norsk', flag: '🇳🇴' },
  { code: 'sv', label: 'SV', name: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', label: 'FI', name: 'Suomi', flag: '🇫🇮' },
  { code: 'da', label: 'DA', name: 'Dansk', flag: '🇩🇰' },
  { code: 'nl', label: 'NL', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', label: 'IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'sl', label: 'SL', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'hr', label: 'HR', name: 'Hrvatski / Srpski / Bosanski', flag: '🇭🇷' },
  { code: 'pl', label: 'PL', name: 'Polski', flag: '🇵🇱' },
  { code: 'ro', label: 'RO', name: 'Română', flag: '🇷🇴' },
  { code: 'cs', label: 'CS', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', label: 'SK', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'el', label: 'EL', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'bg', label: 'BG', name: 'Български', flag: '🇧🇬' },
  { code: 'mk', label: 'MK', name: 'Македонски', flag: '🇲🇰' },
  { code: 'sq', label: 'SQ', name: 'Shqip', flag: '🇦🇱' },
  { code: 'uk', label: 'UK', name: 'Українська', flag: '🇺🇦' },
  { code: 'by', label: 'BY', name: 'Беларуская', flag: '🇧🇾' },
  { code: 'lv', label: 'LV', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', label: 'LT', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'et', label: 'ET', name: 'Eesti', flag: '🇪🇪' },
  { code: 'ar', label: 'AR', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'HI', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'UR', name: 'اردو', flag: '🇵🇰' },
  { code: 'ja', label: 'JA', name: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'VI', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', label: 'TH', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'ko', label: 'KO', name: '한국어', flag: '🇰🇷' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

// Cache loaded translations in memory
const loadedLanguages = new Set<string>(['en']);

export async function loadLanguage(code: string): Promise<boolean> {
  if (code === 'en' || loadedLanguages.has(code)) {
    await i18n.changeLanguage(code);
    return true;
  }

  try {
    // Try to load from cache table first
    const { data: cached } = await supabase
      .from('ui_translations')
      .select('translations')
      .eq('language_code', code)
      .maybeSingle();

    if (cached?.translations) {
      i18n.addResourceBundle(code, 'translation', cached.translations, true, true);
      loadedLanguages.add(code);
      await i18n.changeLanguage(code);
      return true;
    }

    // Generate via edge function
    const { data, error } = await supabase.functions.invoke('translate-ui', {
      body: { language_code: code },
    });

    if (error || !data) {
      console.error('Translation load failed:', error);
      return false;
    }

    i18n.addResourceBundle(code, 'translation', data, true, true);
    loadedLanguages.add(code);
    await i18n.changeLanguage(code);
    return true;
  } catch (e) {
    console.error('Failed to load language:', code, e);
    return false;
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// On init, load saved language if not English
const savedLang = localStorage.getItem('fr_language');
if (savedLang && savedLang !== 'en') {
  loadLanguage(savedLang);
}

export default i18n;
