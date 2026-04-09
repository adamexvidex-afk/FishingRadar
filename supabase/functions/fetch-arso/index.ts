import { serve } from "https://deno.land/std@0.224.0/http/server.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ARSO_HYDRO_URL = 'https://www.arso.gov.si/xml/vode/hidro_podatki_zadnji.xml';
const ARSO_WEATHER_URL = 'https://meteo.arso.gov.si/uploads/probase/www/observ/surface/text/sl/observationAms_si_latest.xml';

// Basic input sanitization to prevent abuse (function is callable publicly)
function sanitizeStation(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const station = raw.trim();
  if (!station) return fallback;
  if (station.length > 80) return fallback;

  // Allow letters (incl. diacritics), numbers, spaces and common punctuation.
  // Reject unusual characters to avoid pathological inputs.
  const allowed = /^[\p{L}\p{M}0-9\s.'(),\-–—/]+$/u;
  if (!allowed.test(station)) return fallback;

  return station;
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeForSearch(input: string): string {
  // Decode entities, lower-case and strip diacritics so "Bodešče" matches "Bode&#353;&#269;e" etc.
  return decodeXmlEntities(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function extractBetweenTags(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractAllStationBlocks(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

function parseHydroBlock(block: string) {
  const waterTemp = parseFloat(extractBetweenTags(block, 'temp_vode') || '') || null;
  const flow = parseFloat(extractBetweenTags(block, 'pretok') || '') || null;
  const waterLevel = parseFloat(extractBetweenTags(block, 'vodostaj') || '') || null;
  const stationFromXml =
    extractBetweenTags(block, 'ime_kratko') ||
    extractBetweenTags(block, 'merilno_mesto') ||
    'Unknown';
  const river = extractBetweenTags(block, 'reka') || null;

  return {
    waterTemp,
    flow,
    waterLevel,
    station: decodeXmlEntities(stationFromXml).trim(),
    river: river ? decodeXmlEntities(river).trim() : null,
  };
}

function hasHydroValues(h: { waterTemp: number | null; flow: number | null; waterLevel: number | null }) {
  return h.waterTemp !== null || h.flow !== null || h.waterLevel !== null;
}

async function fetchHydroData(station: string) {
  try {
    const response = await fetch(ARSO_HYDRO_URL);
    if (!response.ok) throw new Error(`ARSO hydro HTTP ${response.status}`);
    const xml = await response.text();

    const blocks = extractAllStationBlocks(xml, 'postaja');
    const stationKey = normalizeForSearch(station);

    let targetBlock: string | null = null;

    for (const block of blocks) {
      if (normalizeForSearch(block).includes(stationKey)) {
        targetBlock = block;
        break;
      }
    }

    if (!targetBlock) {
      const parts = xml.split(/<postaja\b/i);
      for (const part of parts) {
        if (normalizeForSearch(part).includes(stationKey)) {
          targetBlock = '<postaja' + part;
          break;
        }
      }
    }

    if (!targetBlock) return null;

    // Primary parse
    const primary = parseHydroBlock(targetBlock);
    if (hasHydroValues(primary)) return primary;

    // Fallback: same river (ARSO often returns empty tags for some stations)
    if (primary.river) {
      const riverKey = normalizeForSearch(primary.river);
      for (const block of blocks) {
        const parsed = parseHydroBlock(block);
        if (!parsed.river) continue;
        if (normalizeForSearch(parsed.river) !== riverKey) continue;
        if (hasHydroValues(parsed)) return parsed;
      }
    }

    // No data available
    return primary;
  } catch (error) {
    console.error('Hydro fetch error:', error);
    return null;
  }
}

async function fetchWeatherData(station: string) {
  try {
    const response = await fetch(ARSO_WEATHER_URL);
    if (!response.ok) throw new Error(`ARSO weather HTTP ${response.status}`);
    const xml = await response.text();

    // Split by <metData> blocks
    const blocks = extractAllStationBlocks(xml, 'metData');
    let targetBlock: string | null = null;

    for (const block of blocks) {
      const title = extractBetweenTags(block, 'domain_title') || 
                    extractBetweenTags(block, 'domain_shortTitle') ||
                    extractBetweenTags(block, 'domain_longtitle') || '';
      if (title.toLowerCase().includes(station.toLowerCase())) {
        targetBlock = block;
        break;
      }
    }

    // Fallback: try Ljubljana
    if (!targetBlock) {
      for (const block of blocks) {
        const title = extractBetweenTags(block, 'domain_title') || 
                      extractBetweenTags(block, 'domain_longtitle') || '';
        if (title.toLowerCase().includes('ljubljana')) {
          targetBlock = block;
          break;
        }
      }
    }

    if (!targetBlock && blocks.length > 0) {
      targetBlock = blocks[0];
    }

    if (!targetBlock) return null;

    // Tags in automated stations XML: <t> for temp, <rh> for humidity, <msl> for pressure
    const airTemp = parseFloat(extractBetweenTags(targetBlock, 't') || '') || null;
    const pressure = parseFloat(extractBetweenTags(targetBlock, 'msl') || extractBetweenTags(targetBlock, 'msll') || '') || null;
    const humidity = parseFloat(extractBetweenTags(targetBlock, 'rh') || '') || null;

    return { airTemp, pressure, humidity };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

function getMoonPhase(date: Date): { phase: string; phaseSi: string; illumination: number } {
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

  let phase: string, phaseSi: string;
  if (normalizedPhase < 0.0625) { phase = 'New Moon'; phaseSi = 'Mlaj'; }
  else if (normalizedPhase < 0.1875) { phase = 'Waxing Crescent'; phaseSi = 'Naraščajoč srp'; }
  else if (normalizedPhase < 0.3125) { phase = 'First Quarter'; phaseSi = 'Prvi krajec'; }
  else if (normalizedPhase < 0.4375) { phase = 'Waxing Gibbous'; phaseSi = 'Naraščajoč polmesec'; }
  else if (normalizedPhase < 0.5625) { phase = 'Full Moon'; phaseSi = 'Polna luna'; }
  else if (normalizedPhase < 0.6875) { phase = 'Waning Gibbous'; phaseSi = 'Padajoč polmesec'; }
  else if (normalizedPhase < 0.8125) { phase = 'Last Quarter'; phaseSi = 'Zadnji krajec'; }
  else if (normalizedPhase < 0.9375) { phase = 'Waning Crescent'; phaseSi = 'Padajoč srp'; }
  else { phase = 'New Moon'; phaseSi = 'Mlaj'; }

  return { phase, phaseSi, illumination };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let body: { hydro_station?: string; weather_station?: string } | null = null;

    if (req.method !== 'GET') {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }

    const rawHydro = body?.hydro_station || url.searchParams.get('hydro_station') || 'Radovljica I';
    const rawWeather = body?.weather_station || url.searchParams.get('weather_station') || 'Ljubljana';

    // Sanitize station names (fallback to defaults if invalid)
    const hydroStation = sanitizeStation(rawHydro, 'Radovljica I');
    const weatherStation = sanitizeStation(rawWeather, 'Ljubljana');

    const [hydro, weather] = await Promise.all([
      fetchHydroData(hydroStation),
      fetchWeatherData(weatherStation),
    ]);

    const moon = getMoonPhase(new Date());

    const hydroHasData = !!(
      hydro &&
      (hydro.waterTemp !== null || hydro.flow !== null || hydro.waterLevel !== null)
    );

    const weatherHasData = !!(
      weather &&
      (weather.airTemp !== null || weather.pressure !== null || weather.humidity !== null)
    );

    const result = {
      waterTemp: hydro?.waterTemp ?? null,
      flow: hydro?.flow ?? null,
      waterLevel: hydro?.waterLevel ?? null,
      airTemp: weather?.airTemp ?? null,
      pressure: weather?.pressure ?? null,
      humidity: weather?.humidity ?? null,
      moonPhase: moon.phaseSi,
      moonPhaseEn: moon.phase,
      moonIllumination: moon.illumination,
      lastUpdate: new Date().toISOString(),
      hydroStation: hydro?.station ?? hydroStation,
      weatherStation: weatherStation,
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
