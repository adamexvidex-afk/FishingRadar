import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


export interface MarineData {
  seaTemp: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  waveDirectionLabel: string;
  wavePeriod: number | null;
  windWaveHeight: number | null;
  windWaveDirection: number | null;
  windWaveDirectionLabel: string;
  windWavePeriod: number | null;
  swellHeight: number | null;
  swellDirection: number | null;
  swellDirectionLabel: string;
  swellPeriod: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
  currentDirectionLabel: string;
  waveHourly: Array<{
    time: string;
    waveHeight: number | null;
    windWaveHeight: number | null;
    swellHeight: number | null;
  }>;
}

export interface ArsoData {
  waterTemp: number | null;
  flow: number | null;
  waterLevel: number | null;
  airTemp: number | null;
  pressure: number | null;
  humidity: number | null;
  windSpeed?: number | null;
  moonPhase: string;
  moonPhaseEn: string;
  moonIllumination: number;
  lastUpdate: string;
  hydroStation: string;
  weatherStation: string;
  hydroAvailable: boolean;
  weatherAvailable: boolean;
  marine?: MarineData;
}

// Checks if coordinates are in the US (continental + Alaska + Hawaii)
function isUSLocation(lat: number, lng: number): boolean {
  // Continental US
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) return true;
  // Alaska
  if (lat >= 51 && lat <= 72 && lng >= -180 && lng <= -129) return true;
  // Hawaii
  if (lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154) return true;
  return false;
}

export function useArsoData(
  usgsSiteIdOrNull?: string,
  lat = 38.9,
  lng = -77.0,
  waterType?: string | null,
  enabled = true,
) {
  const isUS = !!(usgsSiteIdOrNull && isUSLocation(lat, lng));

  return useQuery<ArsoData>({
    queryKey: ['conditions-data', usgsSiteIdOrNull, lat, lng, waterType, enabled],
    enabled,
    queryFn: async () => {
      if (isUS) {
        // Use US-specific USGS/NWS data
        const { data, error } = await supabase.functions.invoke<ArsoData>('fetch-us-conditions', {
          body: { usgs_site_id: usgsSiteIdOrNull, lat, lng },
        });
        if (error || !data) throw new Error(`US conditions fetch failed: ${error?.message || 'Unknown error'}`);
        return data;
      }

      // Use global data with water-body type hint for better source selection
      const { data, error } = await supabase.functions.invoke<ArsoData>('fetch-global-conditions', {
        body: { lat, lng, water_type: waterType ?? null },
      });
      if (error || !data) throw new Error(`Global conditions fetch failed: ${error?.message || 'Unknown error'}`);
      return data;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
