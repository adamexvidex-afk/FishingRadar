import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Search, Fish, Tag, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { baitData, type Bait } from '@/data/baitData';

// Collect unique techniques for filter
const allTechniquesSi = [...new Set(baitData.flatMap(b => b.techniquesSi))].sort();
const allTechniquesEn = [...new Set(baitData.flatMap(b => b.techniquesEn))].sort();

// Collect unique target fish
const allFishEn = [...new Set(baitData.flatMap(b => b.fishEn || []))].sort();
const allFishSi = [...new Set(baitData.flatMap(b => b.fishSi || []))].sort();

const BaitsPage = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'artificial' | 'natural'>('all');
  const [techniqueFilter, setTechniqueFilter] = useState<string>('all');
  const [fishFilter, setFishFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const lang = i18n.language;

  const techniques = lang === 'si' ? allTechniquesSi : allTechniquesEn;
  const fishList = lang === 'si' ? allFishSi : allFishEn;

  const filtered = useMemo(() => baitData.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || b.nameSi.toLowerCase().includes(q) || b.nameEn.toLowerCase().includes(q) ||
      (b.fishSi || []).some(f => f.toLowerCase().includes(q)) ||
      (b.fishEn || []).some(f => f.toLowerCase().includes(q));
    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    const matchesTechnique = techniqueFilter === 'all' ||
      (lang === 'si' ? b.techniquesSi : b.techniquesEn).includes(techniqueFilter);
    const matchesFish = fishFilter === 'all' ||
      (lang === 'si' ? b.fishSi : b.fishEn || []).includes(fishFilter);
    return matchesSearch && matchesType && matchesTechnique && matchesFish;
  }), [search, typeFilter, techniqueFilter, fishFilter, lang]);

  const activeFilters = [typeFilter !== 'all', techniqueFilter !== 'all', fishFilter !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter('all');
    setTechniqueFilter('all');
    setFishFilter('all');
    setSearch('');
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <h1 className="mb-2 font-display text-2xl font-bold text-foreground lg:text-3xl">
        {t('baitsPage.title')}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {lang === 'si'
          ? 'Poišči pravo vabo za ciljno ribo in tehniko.'
          : 'Find the right bait for your target fish and technique.'}
      </p>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={lang === 'si' ? 'Išči vabo ali ribo...' : 'Search bait or fish...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'artificial', 'natural'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === f ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-accent'
              }`}
            >
              {f === 'all' ? (lang === 'si' ? 'Vse' : 'All') : t(`baitsPage.${f}`)}
            </button>
          ))}

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          <Select value={techniqueFilter} onValueChange={setTechniqueFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[160px] rounded-full border-border bg-card text-xs">
              <SlidersHorizontal className="mr-1.5 h-3 w-3" />
              <SelectValue placeholder={lang === 'si' ? 'Tehnika' : 'Technique'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'si' ? 'Vse tehnike' : 'All techniques'}</SelectItem>
              {techniques.map((tech) => (
                <SelectItem key={tech} value={tech}>{tech}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fishFilter} onValueChange={setFishFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[140px] rounded-full border-border bg-card text-xs">
              <Fish className="mr-1.5 h-3 w-3" />
              <SelectValue placeholder={lang === 'si' ? 'Ciljna riba' : 'Target fish'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'si' ? 'Vse ribe' : 'All fish'}</SelectItem>
              {fishList.map((fish) => (
                <SelectItem key={fish} value={fish}>{fish}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X className="h-3 w-3" />
              {lang === 'si' ? 'Počisti' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        {filtered.length} {lang === 'si' ? 'vab' : 'baits'}
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((bait, i) => {
          const isExpanded = expanded === bait.id;
          const techs = lang === 'si' ? bait.techniquesSi : bait.techniquesEn;
          const fish = lang === 'si' ? bait.fishSi : bait.fishEn;
          const usage = lang === 'si' ? bait.usageSi : bait.usageEn;
          const conditions = lang === 'si' ? bait.conditionsSi : bait.conditionsEn;

          return (
            <motion.div
              key={bait.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              onClick={() => setExpanded(isExpanded ? null : bait.id)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-3.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="font-display text-sm font-bold text-foreground leading-tight">
                  {lang === 'si' ? bait.nameSi : bait.nameEn}
                </h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  bait.type === 'artificial' ? 'bg-primary/10 text-primary' : 'bg-nature/10 text-nature'
                }`}>
                  {t(`baitsPage.${bait.type}`)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                {usage}
              </p>

              <div className="flex flex-wrap gap-1">
                {techs.slice(0, 2).map((tech) => (
                  <span key={tech} className="inline-flex items-center gap-0.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    <Tag className="h-2.5 w-2.5" />
                    {tech}
                  </span>
                ))}
                {techs.length > 2 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    +{techs.length - 2}
                  </span>
                )}
                {fish && fish.length > 0 && fish.slice(0, 2).map((f) => (
                  <span key={f} className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Fish className="h-2.5 w-2.5" />
                    {f}
                  </span>
                ))}
                {fish && fish.length > 2 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    +{fish.length - 2}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {lang === 'si' ? 'Pogoji' : 'Conditions'}
                        </span>
                        <p className="text-xs text-foreground mt-0.5">{conditions}</p>
                      </div>
                      {fish && fish.length > 2 && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {lang === 'si' ? 'Vse ciljne ribe' : 'All target fish'}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {fish.map((f) => (
                              <span key={f} className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                <Fish className="h-2.5 w-2.5" />{f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {techs.length > 2 && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {lang === 'si' ? 'Vse tehnike' : 'All techniques'}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {techs.map((tech) => (
                              <span key={tech} className="inline-flex items-center gap-0.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                                <Tag className="h-2.5 w-2.5" />{tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BaitsPage;
