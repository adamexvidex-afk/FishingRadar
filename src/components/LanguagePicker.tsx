import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe, Loader2 } from 'lucide-react';
import { languages, loadLanguage, type LanguageCode } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LanguagePickerProps {
  onSelect?: (code: LanguageCode) => void;
  compact?: boolean;
}

const LanguagePicker = ({ onSelect, compact }: LanguagePickerProps) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const currentLang = i18n.language;

  const handleSelect = async (code: string) => {
    if (code === currentLang) {
      onSelect?.(code as LanguageCode);
      return;
    }
    setLoading(code);

    const ok = await loadLanguage(code);
    if (ok) {
      localStorage.setItem('fr_language', code);
      if (user) {
        await supabase
          .from('profiles')
          .update({ preferred_language: code } as any)
          .eq('id', user.id);
      }
      onSelect?.(code as LanguageCode);
    } else {
      toast({ title: 'Error', description: 'Could not load translation. Try again.', variant: 'destructive' });
    }
    setLoading(null);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            disabled={loading !== null}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
              currentLang === lang.code
                ? 'border-primary bg-primary/10 font-semibold text-primary'
                : 'border-border bg-card hover:bg-muted/50 text-foreground'
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="truncate flex-1">{lang.label}</span>
            {loading === lang.code && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />}
            {currentLang === lang.code && !loading && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          disabled={loading !== null}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
            currentLang === lang.code
              ? 'bg-primary/10 font-semibold text-primary'
              : 'hover:bg-muted/50 text-foreground'
          }`}
        >
          <span className="text-xl">{lang.flag}</span>
          <span className="flex-1 text-sm">{lang.name}</span>
          {loading === lang.code && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {currentLang === lang.code && !loading && <Check className="h-4 w-4 text-primary" />}
        </button>
      ))}
    </div>
  );
};

export default LanguagePicker;
