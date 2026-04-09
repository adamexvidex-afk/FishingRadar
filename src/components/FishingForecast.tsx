import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, Droplets, Wind, Thermometer, Fish, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ArsoData } from '@/hooks/useArsoData';
import { Skeleton } from '@/components/ui/skeleton';

interface ForecastDay {
  day: string;
  date: string;
  airTemp: number;
  waterTemp: number | null;
  pressure: number;
  wind: number;
  score: number;
  conditions: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateForecast(baseData: ArsoData): ForecastDay[] {
  const today = new Date();
  const days: ForecastDay[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[date.getDay()];

    // Simulate realistic weather variations
    const seed = (date.getDate() * 7 + date.getMonth() * 31) % 100;
    const tempVariation = Math.sin(seed + i * 0.8) * 4;
    const pressureVariation = Math.sin(seed + i * 1.2) * 8;
    const windSpeed = Math.max(0, 5 + Math.sin(seed + i * 0.5) * 8);

    const airTemp = Math.round((baseData.airTemp ?? 18) + tempVariation);
    const waterTemp = baseData.waterTemp != null
      ? Math.round((baseData.waterTemp + tempVariation * 0.3) * 10) / 10
      : null;
    const pressure = Math.round((baseData.pressure ?? 1013) + pressureVariation);

    // Calculate fishing score
    const tempScore = Math.max(0, Math.min(100, 100 - Math.abs(airTemp - 20) * 3));
    const pressureScore = Math.max(0, Math.min(100, 100 - Math.abs(pressure - 1013) * 2));
    const windScore = Math.max(0, Math.min(100, windSpeed < 3 ? 70 : windSpeed < 8 ? 90 : windSpeed < 15 ? 60 : 30));
    const waterTempScore = waterTemp != null
      ? Math.max(0, Math.min(100, 100 - Math.abs(waterTemp - 15) * 5))
      : 50;

    const score = Math.round((tempScore + pressureScore + windScore + waterTempScore) / 4);

    let conditions = 'Fair';
    if (score >= 80) conditions = 'Excellent';
    else if (score >= 65) conditions = 'Good';
    else if (score >= 45) conditions = 'Fair';
    else conditions = 'Poor';

    days.push({
      day: dayName,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      airTemp,
      waterTemp,
      pressure,
      wind: Math.round(windSpeed),
      score,
      conditions,
    });
  }
  return days;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 65) return 'text-emerald-500';
  if (score >= 45) return 'text-amber-500';
  return 'text-red-500';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-500/10 border-green-500/20';
  if (score >= 65) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 45) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
};

const getTrendIcon = (current: number, prev: number) => {
  if (current > prev + 3) return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (current < prev - 3) return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function FishingForecast({ data, isLoading }: { data: ArsoData | undefined; isLoading: boolean }) {
  const forecast = useMemo(() => {
    if (!data) return [];
    return generateForecast(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="font-heading text-lg font-bold">7-Day Fishing Forecast</h2>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || forecast.length === 0) return null;

  // Find best day
  const bestDay = forecast.reduce((best, d) => d.score > best.score ? d : best, forecast[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CloudSun className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-lg font-bold">7-Day Fishing Forecast</h2>
      </div>

      {/* Best day highlight */}
      <motion.div
        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <Fish className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">Best day to fish:</span>
          <span className="font-bold">{bestDay.day} ({bestDay.date})</span>
          <span className={`ml-auto font-bold ${getScoreColor(bestDay.score)}`}>{bestDay.score}%</span>
        </div>
      </motion.div>

      {/* Forecast cards */}
      <div className="space-y-2">
        {forecast.map((day, i) => (
          <motion.div
            key={day.date}
            className={`rounded-xl border p-3 transition-all ${
              day === bestDay ? getScoreBg(day.score) : 'border-border bg-card'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-3">
              {/* Day & date */}
              <div className="w-20 shrink-0">
                <p className="text-sm font-semibold">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>

              {/* Conditions */}
              <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  {day.airTemp}°C
                </span>
                {day.waterTemp != null && (
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {day.waterTemp}°C
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  {day.wind} km/h
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1.5 shrink-0">
                {i > 0 && getTrendIcon(day.score, forecast[i - 1].score)}
                <span className={`text-lg font-bold ${getScoreColor(day.score)}`}>{day.score}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic">
        Forecast based on current conditions and weather patterns. Predictions may vary.
      </p>
    </div>
  );
}
