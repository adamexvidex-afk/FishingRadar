import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// USGS Water Services API
const USGS_BASE = 'https://waterservices.usgs.gov/nwis/iv/';
// Weather.gov API
const NWS_BASE = 'https://api.weather.gov';

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

async function fetchUSGSData(siteId: string) {
  try {
    // Parameter codes: 00010=water temp, 00060=discharge, 00065=gage height
    const url = `${USGS_BASE}?format=json&sites=${siteId}&parameterCd=00010,00060,00065&siteStatus=active`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`USGS HTTP ${response.status}`);
    const data = await response.json();

    let waterTemp: number | null = null;
    let flow: number | null = null;
    let waterLevel: number | null = null;
    let stationName = siteId;

    const timeSeries = data?.value?.timeSeries || [];
    for (const ts of timeSeries) {
      stationName = ts.sourceInfo?.siteName || stationName;
      const paramCode = ts.variable?.variableCode?.[0]?.value;
      const latestValue = ts.values?.[0]?.value?.[0]?.value;
      if (!latestValue || latestValue === '-999999') continue;

      const val = parseFloat(latestValue);
      if (isNaN(val)) continue;

      if (paramCode === '00010') {
        // USGS reports in Celsius
        waterTemp = Math.round(val * 10) / 10;
      } else if (paramCode === '00060') {
        // Discharge in cubic feet per second → convert to m³/s
        flow = Math.round(val * 0.0283168 * 100) / 100;
      } else if (paramCode === '00065') {
        // Gage height in feet → convert to meters
        waterLevel = Math.round(val * 0.3048 * 100) / 100;
      }
    }

    return { waterTemp, flow, waterLevel, station: stationName };
  } catch (error) {
    console.error('USGS fetch error:', error);
    return null;
  }
}

async function fetchNWSData(lat: number, lng: number) {
  try {
    // Step 1: Get the observation stations for the point
    const pointRes = await fetch(`${NWS_BASE}/points/${lat},${lng}`, {
      headers: { 'User-Agent': 'FishingRadar/1.0 (contact@fishingradar.app)', 'Accept': 'application/geo+json' },
    });
    if (!pointRes.ok) throw new Error(`NWS points HTTP ${pointRes.status}`);
    const pointData = await pointRes.json();

    const stationsUrl = pointData.properties?.observationStations;
    if (!stationsUrl) throw new Error('No observation stations URL');

    // Step 2: Get nearest station
    const stationsRes = await fetch(stationsUrl, {
      headers: { 'User-Agent': 'FishingRadar/1.0 (contact@fishingradar.app)', 'Accept': 'application/geo+json' },
    });
    if (!stationsRes.ok) throw new Error(`NWS stations HTTP ${stationsRes.status}`);
    const stationsData = await stationsRes.json();

    const stationId = stationsData.features?.[0]?.properties?.stationIdentifier;
    if (!stationId) throw new Error('No station found');

    // Step 3: Get latest observations
    const obsRes = await fetch(`${NWS_BASE}/stations/${stationId}/observations/latest`, {
      headers: { 'User-Agent': 'FishingRadar/1.0 (contact@fishingradar.app)', 'Accept': 'application/geo+json' },
    });
    if (!obsRes.ok) throw new Error(`NWS observations HTTP ${obsRes.status}`);
    const obsData = await obsRes.json();

    const props = obsData.properties || {};
    const airTemp = props.temperature?.value != null ? Math.round(props.temperature.value * 10) / 10 : null;
    const pressure = props.seaLevelPressure?.value != null ? Math.round(props.seaLevelPressure.value / 100) : null; // Pa to hPa
    const humidity = props.relativeHumidity?.value != null ? Math.round(props.relativeHumidity.value) : null;

    return { airTemp, pressure, humidity, weatherStation: stationId };
  } catch (error) {
    console.error('NWS fetch error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: { usgs_site_id?: string; lat?: number; lng?: number } | null = null;

    if (req.method !== 'GET') {
      try { body = await req.json(); } catch { body = null; }
    }

    const url = new URL(req.url);
    const usgsSiteId = body?.usgs_site_id || url.searchParams.get('usgs_site_id') || '01646500'; // Potomac River near DC
    const lat = body?.lat || parseFloat(url.searchParams.get('lat') || '38.9') || 38.9;
    const lng = body?.lng || parseFloat(url.searchParams.get('lng') || '-77.0') || -77.0;

    const [hydro, weather] = await Promise.all([
      fetchUSGSData(usgsSiteId),
      fetchNWSData(lat, lng),
    ]);

    const moon = getMoonPhase(new Date());

    const hydroHasData = !!(hydro && (hydro.waterTemp !== null || hydro.flow !== null || hydro.waterLevel !== null));
    const weatherHasData = !!(weather && (weather.airTemp !== null || weather.pressure !== null || weather.humidity !== null));

    const result = {
      waterTemp: hydro?.waterTemp ?? null,
      flow: hydro?.flow ?? null,
      waterLevel: hydro?.waterLevel ?? null,
      airTemp: weather?.airTemp ?? null,
      pressure: weather?.pressure ?? null,
      humidity: weather?.humidity ?? null,
      moonPhase: moon.phase,
      moonPhaseEn: moon.phase,
      moonIllumination: moon.illumination,
      lastUpdate: new Date().toISOString(),
      hydroStation: hydro?.station ?? usgsSiteId,
      weatherStation: weather?.weatherStation ?? `${lat},${lng}`,
      hydroAvailable: hydroHasData,
      weatherAvailable: weatherHasData,
    };

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
