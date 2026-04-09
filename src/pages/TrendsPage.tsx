import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Calendar, Fish, Target, Crown, Lock, BarChart3, ArrowUp, ArrowDown, Sparkles, Loader2, RefreshCw, Share2 } from 'lucide-react';
import ShareTrendsCard from '@/components/ShareTrendsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';

interface CatchEntry {
  id: string;
  fish: string;
  length: number;
  weight: number;
  water: string;
  bait: string;
  technique: string;
  catch_date: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
};

const TrendsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isPremium, subscriptionLoading, loading: authLoading } = useAuth();
  const [catches, setCatches] = useState<CatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  const fetchCatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('catches')
      .select('id, fish, length, weight, water, bait, technique, catch_date')
      .eq('user_id', user.id)
      .order('catch_date', { ascending: true });
    if (data) setCatches(data.map(r => ({ ...r, length: Number(r.length), weight: Number(r.weight), water: r.water || '', bait: r.bait || '', technique: r.technique || '' })));
    setLoading(false);
  }, [user]);

  // Re-fetch every time user navigates to this page
  useEffect(() => {
    fetchCatches();
  }, [fetchCatches, location.key]);

  // Also re-fetch on window focus for tab switches
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchCatches();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchCatches]);

  // Premium gate
  if (!subscriptionLoading && !isPremium) {
     return (
       <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
         <div className="rounded-2xl bg-primary/10 p-4 mb-4">
           <Lock className="h-8 w-8 text-primary" />
         </div>
         <h2 className="font-heading text-2xl font-bold mb-2">{t('trends.premiumTitle')}</h2>
         <p className="max-w-sm text-muted-foreground mb-6">
           {t('trends.premiumDesc')}
         </p>
         <Button onClick={() => navigate('/premium')} className="gap-2">
           <Crown className="h-4 w-4" />
           {t('trends.unlockPremium')}
         </Button>
       </div>
    );
  }

  if (authLoading || loading || subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return <TrendsContent catches={catches} />;
};

function TrendsContent({ catches }: { catches: CatchEntry[] }) {
  const { t } = useTranslation();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (catches.length < 2) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('catch-analysis', {
        body: { catches: catches.slice(0, 100) },
      });
      if (error) throw error;
      setAiAnalysis(data?.analysis || null);
    } catch (e) {
      console.error('AI analysis failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [catches]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);
  // Monthly trend
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { name: string; catches: number; avgLength: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthCatches = catches.filter(c => {
        const cd = new Date(c.catch_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      });
      months.push({
        name: MONTH_LABELS[d.getMonth()],
        catches: monthCatches.length,
        avgLength: monthCatches.length ? Math.round(monthCatches.reduce((s, c) => s + c.length, 0) / monthCatches.length / 2.54) : 0,
      });
    }
    return months;
  }, [catches]);

  // Species breakdown
  const speciesData = useMemo(() => {
    const map: Record<string, number> = {};
    catches.forEach(c => { map[c.fish] = (map[c.fish] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [catches]);

  // Best catches (personal records)
  const records = useMemo(() => {
    if (!catches.length) return { longestFish: null, heaviestFish: null, mostCaughtSpecies: '-', bestMonth: '-', totalSpecies: 0 };
    const longest = catches.reduce((best, c) => c.length > best.length ? c : best, catches[0]);
    const heaviest = catches.reduce((best, c) => c.weight > best.weight ? c : best, catches[0]);
    const speciesCount: Record<string, number> = {};
    catches.forEach(c => { speciesCount[c.fish] = (speciesCount[c.fish] || 0) + 1; });
    const mostCaught = Object.entries(speciesCount).sort((a, b) => b[1] - a[1])[0];
    const monthCount: Record<number, number> = {};
    catches.forEach(c => { const m = new Date(c.catch_date).getMonth(); monthCount[m] = (monthCount[m] || 0) + 1; });
    const bestMonth = Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0];

    return {
      longestFish: longest.length > 0 ? longest : null,
      heaviestFish: heaviest.weight > 0 ? heaviest : null,
      mostCaughtSpecies: mostCaught ? `${mostCaught[0]} (${mostCaught[1]}×)` : '-',
      bestMonth: bestMonth ? MONTH_LABELS[Number(bestMonth[0])] : '-',
      totalSpecies: Object.keys(speciesCount).length,
    };
  }, [catches]);

  // Bait effectiveness
  const baitData = useMemo(() => {
    const map: Record<string, { count: number; totalLength: number }> = {};
    catches.forEach(c => {
      if (!c.bait) return;
      if (!map[c.bait]) map[c.bait] = { count: 0, totalLength: 0 };
      map[c.bait].count++;
      map[c.bait].totalLength += c.length;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([name, { count, totalLength }]) => ({ name, count, avgLength: Math.round(totalLength / count / 2.54) }));
  }, [catches]);

  // This month vs last month
  const comparison = useMemo(() => {
    const now = new Date();
    const thisMonth = catches.filter(c => {
      const d = new Date(c.catch_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = catches.filter(c => {
      const d = new Date(c.catch_date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });
    const diff = thisMonth.length - lastMonth.length;
    return { thisMonth: thisMonth.length, lastMonth: lastMonth.length, diff };
  }, [catches]);

  if (catches.length === 0) {
    return (
       <div className="container mx-auto px-4 py-8 text-center">
         <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
         <h2 className="font-heading text-xl font-bold mb-2">{t('trends.noData')}</h2>
         <p className="text-muted-foreground">{t('trends.noDataDesc')}</p>
       </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 pb-24">
      <div className="flex items-center justify-between mb-6">
         <h1 className="font-display text-2xl font-bold lg:text-3xl flex items-center gap-2">
           <TrendingUp className="h-6 w-6 text-primary" />
           {t('trends.title')}
         </h1>
         <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowShare(true)}>
           <Share2 className="h-4 w-4" />
           {t('common.share')}
         </Button>
      </div>

      {/* Record cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
         <RecordCard icon={<Trophy className="h-5 w-5 text-amber-500" />} label={t('trends.longestCatch')} value={records.longestFish ? `${(records.longestFish.length / 2.54).toFixed(1)} in` : '-'} sub={records.longestFish?.fish} />
         <RecordCard icon={<Trophy className="h-5 w-5 text-amber-500" />} label={t('trends.heaviestCatch')} value={records.heaviestFish ? `${(records.heaviestFish.weight * 2.205).toFixed(1)} lb` : '-'} sub={records.heaviestFish?.fish} />
         <RecordCard icon={<Fish className="h-5 w-5 text-primary" />} label={t('trends.mostCaught')} value={records.mostCaughtSpecies} />
         <RecordCard
           icon={<Calendar className="h-5 w-5 text-primary" />}
           label={t('trends.thisMonth')}
           value={`${comparison.thisMonth} ${t('trends.catches')}`}
           sub={comparison.diff > 0 ? `+${comparison.diff} ${t('trends.vsLastMonth')}` : comparison.diff < 0 ? `${comparison.diff} ${t('trends.vsLastMonth')}` : t('trends.sameAsLastMonth')}
           trend={comparison.diff}
         />
      </div>

      {/* AI Coach Analysis */}
      {catches.length >= 2 && (
        <motion.div
          className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{t('trends.aiCoach')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={fetchAnalysis}
              disabled={aiLoading}
            >
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
          {aiLoading && !aiAnalysis ? (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Loader2 className="h-4 w-4 animate-spin" />
               {t('trends.analyzing')}
             </div>
          ) : aiAnalysis ? (
            <p className="text-sm text-foreground leading-relaxed">{aiAnalysis}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('trends.analysisFailed')}</p>
          )}
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Monthly trend */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('trends.monthlyCatches')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="catchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="catches" stroke="hsl(var(--primary))" fill="url(#catchGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Species pie */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('trends.speciesBreakdown')} ({records.totalSpecies} {t('trends.species')})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={speciesData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                  {speciesData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => <span className="text-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Avg length by month */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('trends.avgLengthByMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="avgLength" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bait effectiveness */}
        {baitData.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('trends.baitEffectiveness')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={baitData} layout="vertical" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <ShareTrendsCard
        stats={{
          totalCatches: catches.length,
          totalSpecies: records.totalSpecies,
          longestCatch: records.longestFish ? `${(records.longestFish.length / 2.54).toFixed(1)} in — ${records.longestFish.fish}` : '-',
          heaviestCatch: records.heaviestFish ? `${(records.heaviestFish.weight * 2.205).toFixed(1)} lb — ${records.heaviestFish.fish}` : '-',
          mostCaughtSpecies: records.mostCaughtSpecies,
          bestMonth: records.bestMonth,
          topBait: baitData.length > 0 ? baitData[0].name : '-',
        }}
        open={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
}

function RecordCard({ icon, label, value, sub, trend }: { icon: React.ReactNode; label: string; value: string; sub?: string; trend?: number }) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-3 shadow-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="font-bold text-foreground truncate">{value}</p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
          {trend != null && trend > 0 && <ArrowUp className="h-3 w-3 text-green-500" />}
          {trend != null && trend < 0 && <ArrowDown className="h-3 w-3 text-red-500" />}
          {sub}
        </p>
      )}
    </motion.div>
  );
}

export default TrendsPage;
