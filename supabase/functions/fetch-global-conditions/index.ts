import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_MARINE = 'https://marine-api.open-meteo.com/v1/marine';

function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let c = 0, e = 0, jd = 0, b = 0;
  if (month < 3) { c = year - 1; e = month + 12; }
  else { c = year; e = month; }
  jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
  b = Math.floor((c / 100));
  jd = jd + 2 - b + Math.floor(b / 4);

  const daysSinceNew = (jd - 2451550.1) % 29.530588853;
  const normalizedPhase = daysSinceNew / 29.530588853;
  const illumination = Math.round((1 - Math.cos(normalizedPhase * 2 * Math.PI)) / 2 * 100);

  let phase: string;
  if (normalizedPhase < 0.0625) phase = 'New Moon';
  else if (normalizedPhase < 0.1875) phase = 'Waxing Crescent';
  else if (normalizedPhase < 0.3125) phase = 'First Quarter';
  else if (normalizedPhase < 0.4375) phase = 'Waxing Gibbous';
  else if (normalizedPhase < 0.5625) phase = 'Full Moon';
  else if (normalizedPhase < 0.6875) phase = 'Waning Gibbous';
  else if (normalizedPhase < 0.8125) phase = 'Last Quarter';
  else if (normalizedPhase < 0.9375) phase = 'Waning Crescent';
  else phase = 'New Moon';

  return { phase, illumination };
}

async function fetchOpenMeteo(lat: number, lng: number) {
  try {
    const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,soil_temperature_0cm&hourly=temperature_2m&timezone=auto&cell_selection=sea`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
    const data = await response.json();

    const current = data.current || {};
    const airTemp = current.temperature_2m != null ? Math.round(current.temperature_2m * 10) / 10 : null;
    const pressure = current.surface_pressure != null ? Math.round(current.surface_pressure) : null;
    const humidity = current.relative_humidity_2m != null ? Math.round(current.relative_humidity_2m) : null;
    const windSpeed = current.wind_speed_10m != null ? Math.round(current.wind_speed_10m * 10) / 10 : null;
    const soilWaterTemp = current.soil_temperature_0cm != null ? Math.round(current.soil_temperature_0cm * 10) / 10 : null;

    return { airTemp, pressure, humidity, windSpeed, soilWaterTemp };
  } catch (error) {
    console.error('Open-Meteo fetch error:', error);
    return null;
  }
}

// Fetch SST from Open-Meteo Marine API (works for coastal/ocean locations)
async function fetchMarineSST(lat: number, lng: number): Promise<number | null> {
  try {
    const url = `${OPEN_METEO_MARINE}?latitude=${lat}&longitude=${lng}&current=sea_surface_temperature`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const sst = data?.current?.sea_surface_temperature;
    if (sst != null && !isNaN(sst)) {
      return Math.round(sst * 10) / 10;
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch full marine data (waves, currents, SST) for sea mode
async function fetchMarineData(lat: number, lng: number) {
  try {
    const url = `${OPEN_METEO_MARINE}?latitude=${lat}&longitude=${lng}&current=sea_surface_temperature,wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,ocean_current_velocity,ocean_current_direction&hourly=wave_height,wind_wave_height,swell_wave_height&timezone=auto&forecast_days=2`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const c = data?.current || {};

    // Build hourly wave forecast (next 24h)
    const hourlyTimes: string[] = data?.hourly?.time || [];
    const hourlyWaveHeight: (number | null)[] = data?.hourly?.wave_height || [];
    const hourlyWindWaveHeight: (number | null)[] = data?.hourly?.wind_wave_height || [];
    const hourlySwellHeight: (number | null)[] = data?.hourly?.swell_wave_height || [];

    const now = new Date();
    const nowStr = now.toISOString().slice(0, 13); // "2026-03-20T12"
    const startIdx = hourlyTimes.findIndex(t => t >= nowStr);
    const forecastSlice = startIdx >= 0 ? hourlyTimes.slice(startIdx, startIdx + 24).map((t, i) => ({
      time: t,
      waveHeight: hourlyWaveHeight[startIdx + i] ?? null,
      windWaveHeight: hourlyWindWaveHeight[startIdx + i] ?? null,
      swellHeight: hourlySwellHeight[startIdx + i] ?? null,
    })) : [];

    return {
      seaTemp: c.sea_surface_temperature != null ? Math.round(c.sea_surface_temperature * 10) / 10 : null,
      waveHeight: c.wave_height != null ? Math.round(c.wave_height * 10) / 10 : null,
      waveDirection: c.wave_direction ?? null,
      wavePeriod: c.wave_period != null ? Math.round(c.wave_period * 10) / 10 : null,
      windWaveHeight: c.wind_wave_height != null ? Math.round(c.wind_wave_height * 10) / 10 : null,
      windWaveDirection: c.wind_wave_direction ?? null,
      windWavePeriod: c.wind_wave_period != null ? Math.round(c.wind_wave_period * 10) / 10 : null,
      swellHeight: c.swell_wave_height != null ? Math.round(c.swell_wave_height * 10) / 10 : null,
      swellDirection: c.swell_wave_direction ?? null,
      swellPeriod: c.swell_wave_period != null ? Math.round(c.swell_wave_period * 10) / 10 : null,
      currentSpeed: c.ocean_current_velocity != null ? Math.round(c.ocean_current_velocity * 100) / 100 : null,
      currentDirection: c.ocean_current_direction ?? null,
      waveHourly: forecastSlice,
    };
  } catch (e) {
    console.error('Marine data fetch error:', e);
    return null;
  }
}

function directionLabel(deg: number | null): string {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// Fallback estimation when no real data available
function estimateWaterTemp(airTemp: number | null, lat: number): number | null {
  if (airTemp == null) return null;

  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  const fractionalMonth = month + day / 30;

  const laggedMonth = fractionalMonth - 1.5;
  const seasonalOffset = Math.sin((laggedMonth - 1) * Math.PI / 6);

  const latAbs = Math.abs(lat);
  const baseline = latAbs > 55 ? 2 : latAbs > 45 ? 3 : latAbs > 30 ? 4 : 6;

  const isSpring = month >= 2 && month <= 5;
  const springPenalty = isSpring ? -2.5 * (1 - (fractionalMonth - 2) / 4) : 0;

  const isAutumn = month >= 9 && month <= 11;
  const autumnBonus = isAutumn ? 1.5 * (1 - (fractionalMonth - 9) / 3) : 0;

  const waterTemp = airTemp * 0.55 + baseline + seasonalOffset * 1.5 + springPenalty + autumnBonus;
  return Math.round(Math.max(0, Math.min(35, waterTemp)) * 10) / 10;
}

type WaterTypeHint = 'cold-river' | 'warm-river' | 'lake' | 'reservoir' | 'coastal' | 'sea';

function resolveInlandWaterTemp(airTemp: number | null, soilWaterTemp: number | null, lat: number) {
  const estimatedTemp = estimateWaterTemp(airTemp, lat);

  if (soilWaterTemp == null) {
    return { waterTemp: estimatedTemp, source: 'estimated', estimatedTemp };
  }

  if (estimatedTemp == null) {
    return { waterTemp: soilWaterTemp, source: 'soil-proxy', estimatedTemp: null };
  }

  const deviation = Math.abs(soilWaterTemp - estimatedTemp);

  if (deviation <= 2.5) {
    return { waterTemp: soilWaterTemp, source: 'soil-proxy', estimatedTemp };
  }

  const blended = deviation <= 5
    ? estimatedTemp * 0.7 + soilWaterTemp * 0.3
    : estimatedTemp * 0.8 + soilWaterTemp * 0.2;

  return {
    waterTemp: Math.round(blended * 10) / 10,
    source: 'inland-corrected',
    estimatedTemp,
  };
}

// Simple in-memory cache (edge function instances are reused)
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: { lat?: number; lng?: number; water_type?: WaterTypeHint | null } | null = null;
    if (req.method !== 'GET') {
      try { body = await req.json(); } catch { body = null; }
    }

    const url = new URL(req.url);
    const lat = body?.lat || parseFloat(url.searchParams.get('lat') || '48.2') || 48.2;
    const lng = body?.lng || parseFloat(url.searchParams.get('lng') || '16.4') || 16.4;
    const waterTypeHint = (body?.water_type || url.searchParams.get('water_type')) as WaterTypeHint | null;

    // Check cache
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)},${waterTypeHint || ''}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isSea = waterTypeHint === 'sea' || waterTypeHint === 'coastal';

    // For sea mode, fetch full marine data; otherwise skip marine for inland
    const needMarine = !waterTypeHint || waterTypeHint === 'coastal';

    const [weather, marineData, marineSST] = await Promise.all([
      fetchOpenMeteo(lat, lng),
      isSea ? fetchMarineData(lat, lng) : Promise.resolve(null),
      (!isSea && needMarine) ? fetchMarineSST(lat, lng) : Promise.resolve(null),
    ]);

    const moon = getMoonPhase(new Date());
    const inland = resolveInlandWaterTemp(weather?.airTemp ?? null, weather?.soilWaterTemp ?? null, lat);

    let waterTemp: number | null = inland.waterTemp;
    let waterTempSource = inland.source;

    if (isSea && marineData?.seaTemp != null) {
      waterTemp = marineData.seaTemp;
      waterTempSource = 'marine-sst';
    } else {
      const marineLooksPlausible = inland.estimatedTemp == null || (marineSST != null && Math.abs(marineSST - inland.estimatedTemp) <= 6);
      const canUseMarine = marineSST != null && (waterTypeHint === 'coastal' || (!waterTypeHint && marineLooksPlausible));
      if (canUseMarine) {
        waterTemp = marineSST;
        waterTempSource = 'marine-sst';
      }
    }

    console.log(`Water temp for ${lat.toFixed(2)},${lng.toFixed(2)}: ${waterTemp}°C (source: ${waterTempSource})`);

    const weatherHasData = !!(weather && (weather.airTemp !== null || weather.pressure !== null));

    const result: Record<string, any> = {
      waterTemp,
      flow: null,
      waterLevel: null,
      airTemp: weather?.airTemp ?? null,
      pressure: weather?.pressure ?? null,
      humidity: weather?.humidity ?? null,
      windSpeed: weather?.windSpeed ?? null,
      moonPhase: moon.phase,
      moonPhaseEn: moon.phase,
      moonIllumination: moon.illumination,
      lastUpdate: new Date().toISOString(),
      hydroStation: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      weatherStation: 'Open-Meteo',
      hydroAvailable: waterTemp !== null,
      weatherAvailable: weatherHasData,
    };

    // Attach marine/wave data when in sea mode
    if (isSea && marineData) {
      result.marine = {
        seaTemp: marineData.seaTemp,
        waveHeight: marineData.waveHeight,
        waveDirection: marineData.waveDirection,
        waveDirectionLabel: directionLabel(marineData.waveDirection),
        wavePeriod: marineData.wavePeriod,
        windWaveHeight: marineData.windWaveHeight,
        windWaveDirection: marineData.windWaveDirection,
        windWaveDirectionLabel: directionLabel(marineData.windWaveDirection),
        windWavePeriod: marineData.windWavePeriod,
        swellHeight: marineData.swellHeight,
        swellDirection: marineData.swellDirection,
        swellDirectionLabel: directionLabel(marineData.swellDirection),
        swellPeriod: marineData.swellPeriod,
        currentSpeed: marineData.currentSpeed,
        currentDirection: marineData.currentDirection,
        currentDirectionLabel: directionLabel(marineData.currentDirection),
        waveHourly: marineData.waveHourly,
      };
    }

    // Store in cache
    cache.set(cacheKey, { data: result, ts: Date.now() });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
