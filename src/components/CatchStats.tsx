import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface CatchEntry {
  fish: string;
  catch_date: string;
  length: number;
  weight: number;
  bait?: string;
  technique?: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7',
  '#ec4899', '#06b6d4', '#f97316',
];

const BAIT_COLORS = [
  '#f59e0b', '#06b6d4', '#ef4444', '#22c55e', '#a855f7',
  '#ec4899', '#3b82f6', '#f97316',
];

const MONTH_GRADIENT = [
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b',
  '#22c55e', '#14b8a6',
];

export default function CatchStats({ catches }: { catches: CatchEntry[] }) {
  const { t } = useTranslation();

  const byMonth = useMemo(() => {
    const counts = new Array(12).fill(0);
    catches.forEach(c => {
      const m = new Date(c.catch_date).getMonth();
      if (!isNaN(m)) counts[m]++;
    });
    return MONTH_LABELS.map((name, i) => ({ name, catches: counts[i] }));
  }, [catches]);

  const bySpecies = useMemo(() => {
    const map: Record<string, number> = {};
    catches.forEach(c => { map[c.fish] = (map[c.fish] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [catches]);

  const byBait = useMemo(() => {
    const map: Record<string, number> = {};
    catches.forEach(c => {
      const bait = c.bait?.trim();
      if (bait) map[bait] = (map[bait] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [catches]);

  if (catches.length < 2) return null;

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <div className="mb-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* By month */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-card">
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Catches by month
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={byMonth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="catches" radius={[3, 3, 0, 0]}>
              {byMonth.map((_, idx) => (
                <Cell key={idx} fill={MONTH_GRADIENT[idx % MONTH_GRADIENT.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* By species - pie */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-card">
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Catches by species
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={bySpecies}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {bySpecies.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: 11, lineHeight: '16px' }}
              formatter={(value: string) => <span className="text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* By bait - pie */}
      {byBait.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Catches by bait
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={byBait}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {byBait.map((_, idx) => (
                  <Cell key={idx} fill={BAIT_COLORS[idx % BAIT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11, lineHeight: '16px' }}
                formatter={(value: string) => <span className="text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
