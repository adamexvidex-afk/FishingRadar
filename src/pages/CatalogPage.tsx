import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Trash2, Check, Loader2, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import FishCard from '@/components/FishCard';
import FishDetailOverlay from '@/components/FishDetailOverlay';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineCatalog } from '@/hooks/useOfflineCatalog';
import { useFishTranslations } from '@/hooks/useFishTranslations';
import { toast } from 'sonner';

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

type FishCategory = 'all' | 'freshwater' | 'anadromous' | 'saltwater';

const CATEGORY_LABELS: Record<FishCategory, string> = {
  all: 'All',
  freshwater: 'Freshwater',
  anadromous: 'Anadromous',
  saltwater: 'Saltwater',
};

const PAGE_SIZE = 30;

const CatalogPage = () => {
  const { t } = useTranslation();
  const { isPremium } = useAuth();
  const { isAvailableOffline, cacheSize, saving, lastSaved, downloadForOffline, clearCache } = useOfflineCatalog();
  const { translateFishName } = useFishTranslations();
  const [fishData, setFishData] = useState<DbFish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FishCategory>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const fetchFish = async () => {
      const { data, error } = await supabase
        .from('fish_species')
        .select('*')
        .order('name_en');
      if (!error && data) setFishData(data);
      setLoading(false);
    };
    fetchFish();
  }, []);

  const filtered = useMemo(() => {
    return fishData.filter((f) => {
      const q = search.toLowerCase();
      const matchesSearch =
        f.name_en.toLowerCase().includes(q) ||
        (f.latin_name || '').toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter, fishData]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, categoryFilter]);

  const visibleFish = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const selectedFish = fishData.find((f) => f.id === selected);

  const categories = useMemo(() => {
    const cats = new Set(fishData.map(f => f.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as FishCategory[];
  }, [fishData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-foreground lg:text-3xl">
          {t('catalog.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {fishData.length} species in catalog
        </p>

        {/* Offline download - premium only */}
        {isPremium && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {isAvailableOffline ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>{cacheSize} species saved offline</span>
                  {lastSaved && <span className="text-muted-foreground">· {lastSaved}</span>}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearCache}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={saving}
                  onClick={async () => {
                    const count = await downloadForOffline();
                    toast.success(`Updated ${count} species for offline use`);
                  }}
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                  Update
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                disabled={saving}
                onClick={async () => {
                  try {
                    const count = await downloadForOffline();
                    toast.success(`Saved ${count} species for offline use`);
                  } catch {
                    toast.error('Failed to download catalog');
                  }
                }}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <WifiOff className="h-3 w-3" />}
                Save for offline
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('catalog.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      <>
          <p className="mb-4 text-xs font-medium text-muted-foreground">
            {filtered.length} results
          </p>
          <div className="grid gap-x-6 gap-y-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleFish.map((fish, i) => (
              <FishCard
                key={fish.id}
                fish={fish}
                index={i}
                onClick={() => setSelected(fish.id)}
                translatedName={translateFishName(fish.id, fish.name_en)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-8"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>

      <FishDetailOverlay
        fish={selectedFish || null}
        onClose={() => setSelected(null)}
        translatedName={selectedFish ? translateFishName(selectedFish.id, selectedFish.name_en) : undefined}
      />
    </div>
  );
};

export default CatalogPage;
