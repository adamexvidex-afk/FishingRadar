import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Fish,
  BookOpen,
  MapPin,
  Activity,
  ArrowRight,
  Crosshair,
  Bot,
  Search,
  LocateFixed,
  Loader2,
  TrendingUp,
  Sparkles,
  Users,
} from 'lucide-react';
import logoImg from '@/assets/fishingradar-logo.png';
import { Geolocation } from '@capacitor/geolocation';

const OceanBackground = lazy(() => import('@/components/OceanBackground'));
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useArsoData } from '@/hooks/useArsoData';

const LOCATIONS = [
  { key: 'potomac river', lat: 38.9, lng: -77.0, label: 'Potomac River' },
  { key: 'delaware river', lat: 40.22, lng: -74.77, label: 'Delaware River' },
  { key: 'connecticut river', lat: 41.8, lng: -72.6, label: 'Connecticut River' },
  { key: 'hudson river', lat: 42.75, lng: -73.69, label: 'Hudson River' },
  { key: 'susquehanna river', lat: 39.65, lng: -76.17, label: 'Susquehanna River' },
  { key: 'kennebec river', lat: 44.63, lng: -69.73, label: 'Kennebec River' },
  { key: 'lake champlain', lat: 44.55, lng: -73.21, label: 'Lake Champlain' },
  { key: 'chattahoochee river', lat: 33.82, lng: -84.43, label: 'Chattahoochee River' },
  { key: 'st johns river', lat: 28.54, lng: -81.37, label: 'St. Johns River' },
  { key: 'lake okeechobee', lat: 26.96, lng: -80.83, label: 'Lake Okeechobee' },
  { key: 'neuse river', lat: 35.27, lng: -77.58, label: 'Neuse River' },
  { key: 'james river', lat: 37.56, lng: -77.54, label: 'James River' },
  { key: 'mississippi river', lat: 38.63, lng: -90.18, label: 'Mississippi River' },
  { key: 'missouri river', lat: 39.1, lng: -94.59, label: 'Missouri River' },
  { key: 'ohio river', lat: 40.44, lng: -80.02, label: 'Ohio River' },
  { key: 'mille lacs lake', lat: 46.13, lng: -94.36, label: 'Mille Lacs Lake' },
  { key: 'lake erie', lat: 41.68, lng: -83.47, label: 'Lake Erie' },
  { key: 'lake texoma', lat: 33.98, lng: -96.37, label: 'Lake Texoma' },
  { key: 'yellowstone river', lat: 45.63, lng: -110.56, label: 'Yellowstone River' },
  { key: 'snake river', lat: 43.73, lng: -111.04, label: 'Snake River' },
  { key: 'columbia river', lat: 45.63, lng: -121.94, label: 'Columbia River' },
  { key: 'sacramento river', lat: 40.59, lng: -122.37, label: 'Sacramento River' },
  { key: 'lake tahoe', lat: 39.17, lng: -120.14, label: 'Lake Tahoe' },
  { key: 'kenai river', lat: 60.49, lng: -149.98, label: 'Kenai River' },
  { key: 'south platte river', lat: 39.65, lng: -105.17, label: 'South Platte River' },
  { key: 'arkansas river', lat: 36.12, lng: -95.99, label: 'Arkansas River' },
  { key: 'flathead lake', lat: 47.85, lng: -114.08, label: 'Flathead Lake' },
];

function findNearest(lat: number, lng: number) {
  let best = LOCATIONS[0];
  let bestDist = Infinity;
  for (const loc of LOCATIONS) {
    const d = (loc.lat - lat) ** 2 + (loc.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = loc;
    }
  }
  return best;
}

const features = [
  { key: 'conditions', icon: Activity, path: '/conditions', gradient: 'from-primary/15 to-water/10', iconColor: 'text-primary' },
  { key: 'catalog', icon: Fish, path: '/catalog', gradient: 'from-nature/15 to-nature/8', iconColor: 'text-nature' },
  { key: 'catchLog', icon: BookOpen, path: '/catch-log', gradient: 'from-warm/15 to-warm/8', iconColor: 'text-warm' },
  { key: 'trends', icon: TrendingUp, path: '/trends', gradient: 'from-nature/12 to-primary/8', iconColor: 'text-nature' },
  { key: 'hotspots', icon: MapPin, path: '/hotspots', gradient: 'from-destructive/12 to-warm/8', iconColor: 'text-destructive' },
  { key: 'community', icon: Users, path: '/community', gradient: 'from-water/12 to-nature/8', iconColor: 'text-water' },
  { key: 'baits', icon: Crosshair, path: '/baits', gradient: 'from-water/15 to-primary/8', iconColor: 'text-water' },
];

const FALLBACK_TIPS = [
  { title: 'Water Temp Dropping?', body: 'Try deeper pools for trout today. Slower presentations work best in cold water.' },
  { title: 'Morning Bite Window', body: 'First 2 hours after sunrise are prime. Target shallow weed edges with topwater lures.' },
  { title: 'Cloudy Day Advantage', body: 'Overcast skies push fish to shallow water. Use bright-colored lures for better visibility.' },
];

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const [dailyTip, setDailyTip] = useState<{ title: string; body: string } | null>(null);
  const { data: arsoData } = useArsoData();

  useEffect(() => {
    const fetchTip = async () => {
      const cached = sessionStorage.getItem('daily-tip');
      const cachedDate = sessionStorage.getItem('daily-tip-date');
      const today = new Date().toISOString().slice(0, 10);

      if (cached && cachedDate === today) {
        try {
          setDailyTip(JSON.parse(cached));
          return;
        } catch {}
      }

      try {
        const conditions = arsoData
          ? {
              waterTemp: arsoData.waterTemp,
              airTemp: arsoData.airTemp,
              pressure: arsoData.pressure,
              moonPhase: arsoData.moonPhase,
            }
          : undefined;

        const { data, error } = await supabase.functions.invoke('daily-tip', {
          body: { conditions },
        });

        if (!error && data?.title) {
          setDailyTip(data);
          sessionStorage.setItem('daily-tip', JSON.stringify(data));
          sessionStorage.setItem('daily-tip-date', today);
        } else {
          const fallback = FALLBACK_TIPS[new Date().getDate() % FALLBACK_TIPS.length];
          setDailyTip(fallback);
        }
      } catch {
        const fallback = FALLBACK_TIPS[new Date().getDate() % FALLBACK_TIPS.length];
        setDailyTip(fallback);
      }
    };

    fetchTip();
  }, [arsoData]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      navigate(`/conditions?q=${encodeURIComponent(location.trim())}`);
    }
  };

  const handleUseMyLocation = async () => {
    try {
      setLocating(true);

      const permission = await Geolocation.requestPermissions();

      if (
        permission.location !== 'granted' &&
        permission.coarseLocation !== 'granted'
      ) {
        setLocating(false);
        toast.error(t('home.locationDenied'));
        return;
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const nearest = findNearest(pos.coords.latitude, pos.coords.longitude);
      setLocation(nearest.key);
      setLocating(false);
      navigate(`/conditions?q=${encodeURIComponent(nearest.key)}`);
    } catch (error) {
      console.error('Location error:', error);
      setLocating(false);
      toast.error(t('home.locationDenied'));
    }
  };

  return (
    <div className="relative isolate px-4 py-6 space-y-6 max-w-2xl mx-auto min-h-[80vh]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Suspense fallback={null}>
          <OceanBackground />
        </Suspense>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="FishingRadar" className="h-8 w-8 rounded-lg" />
          <span className="text-sm font-semibold text-primary tracking-wide">FishingRadar</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-[1.15]">
          {t('home.hero')}
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          {t('home.searchSub')}
        </p>

        <form onSubmit={handleLocationSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="pl-11 pr-4 h-12 rounded-xl border-border bg-card text-sm shadow-sm focus:shadow-md transition-shadow"
          />
        </form>

        <Button
          type="button"
          variant="outline"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="w-full h-11 rounded-xl gap-2 text-sm font-medium"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          {locating ? t('home.locating') : t('home.useMyLocation')}
        </Button>
      </motion.div>

      {dailyTip && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        >
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warm/15">
                <span className="text-lg">🎣</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  {t('home.castmateTip')}
                </p>
                <h3 className="text-sm font-bold text-foreground">{dailyTip.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{dailyTip.body}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Link to="/assistant">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-foreground/5 blur-xl" />
            <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-primary-foreground/5 blur-lg" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold">{t('nav.assistant')}</h3>
                <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{t('home.assistantDesc')}</p>
              </div>
              <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className="space-y-2"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-3">
          {t('home.features')}
        </h2>
        <div className="space-y-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
              >
                <Link to={feature.path}>
                  <div className="flex items-center gap-4 rounded-xl bg-card p-4 border border-border/40 transition-all duration-200 active:scale-[0.98] hover:shadow-md hover:border-primary/15 group">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                      <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t(`home.${feature.key}Title`)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {t(`home.${feature.key}Desc`)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;