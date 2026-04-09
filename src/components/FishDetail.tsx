import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface DbFish {
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

interface FishDetailProps {
  fish: DbFish;
  onBack: () => void;
  translatedName?: string;
}

const DetailSection = ({ title, content, items }: { title: string; content?: string | null; items?: string[] | null }) => {
  if (!content && (!items || items.length === 0)) return null;
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      {content && <p className="text-sm text-foreground">{content}</p>}
      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const FishDetail = ({ fish, onBack, translatedName }: FishDetailProps) => {
  const displayName = translatedName || fish.name_en;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [states, setStates] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [statesExpanded, setStatesExpanded] = useState(false);
  const VISIBLE_STATES = 12;

  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const { data } = await supabase.rpc('get_states_for_fish', { fish_name: fish.name_en });
        if (data && Array.isArray(data)) {
          setStates(data);
        }
      } catch (e) {
        console.error('Failed to fetch states:', e);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [fish.name_en]);

  const handleHowToCatch = () => {
    const question = `How to catch a ${fish.name_en}?`;
    navigate('/assistant', { state: { prefill: question } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
    >
      {fish.image_url && (
        <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
          <img
            src={fish.image_url}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6 lg:p-8">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-foreground">
              {displayName}
            </h2>
            <p className="text-sm italic text-muted-foreground mt-1">{fish.latin_name}</p>
            {fish.category && (
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary capitalize">
                {fish.category}
              </span>
            )}
          </div>
          <Button
            onClick={handleHowToCatch}
            className="shrink-0 gap-2"
            size="sm"
          >
            <MessageCircle className="h-4 w-4" />
            {t('catalog.howToCatch') || 'How to Catch'}
          </Button>
        </div>
        {fish.description && (
          <p className="mt-4 text-sm text-foreground leading-relaxed">{fish.description}</p>
        )}

        {/* States */}
        {!loadingStates && states.length > 0 && (
          <div className="mt-4 rounded-xl bg-muted/50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {t('catalog.foundInStates') || 'Found in States'} ({states.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(statesExpanded ? states : states.slice(0, VISIBLE_STATES)).map((state) => (
                <span key={state} className="rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  {state}
                </span>
              ))}
            </div>
            {states.length > VISIBLE_STATES && (
              <button
                onClick={() => setStatesExpanded(!statesExpanded)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {statesExpanded ? (
                  <><ChevronUp className="h-3 w-3" /> {t('common.showLess') || 'Show less'}</>
                ) : (
                  <><ChevronDown className="h-3 w-3" /> {t('common.showAll') || `Show all ${states.length}`}</>
                )}
              </button>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailSection title={t('catalog.habitat')} content={fish.habitat} />
          <DetailSection title={t('catalog.techniques')} items={fish.techniques} />
          <DetailSection title={t('catalog.baits')} items={fish.baits} />
          <DetailSection title={t('catalog.protection')} content={fish.protection} />
          <DetailSection title={t('catalog.minSize')} content={fish.min_size} />
        </div>
      </div>
    </motion.div>
  );
};

export default FishDetail;
