import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
type W = [string, string, string, string, number, number, number, number, string[], number];
function expand(defs: W[]) {
  const rows: any[] = [];
  for (const [name, cat, country, state, lat1, lng1, lat2, lng2, species, count] of defs) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      rows.push({
        name: count > 1 ? `${name} - ${i + 1}` : name, category: cat, country, state: state || null,
        lat: +(lat1 + (lat2 - lat1) * t + (Math.random() - 0.5) * 0.008).toFixed(5),
        lng: +(lng1 + (lng2 - lng1) * t + (Math.random() - 0.5) * 0.008).toFixed(5), species,
      });
    }
  }
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const defs: W[] = [
    // ROMANIA
    ["Danube Delta", "river", "Romania", "Tulcea", 45.15, 29.10, 44.85, 29.60, ["Common Carp", "Pike", "Zander", "Wels Catfish", "Perch"], 20],
    ["Danube River (Iron Gates)", "river", "Romania", "Mehedinți", 44.67, 22.50, 44.50, 22.00, ["Wels Catfish", "Zander", "Carp", "Asp"], 10],
    ["Bicaz Lake", "reservoir", "Romania", "Neamț", 46.88, 25.90, 46.92, 25.95, ["Rainbow Trout", "Brown Trout", "Pike", "Perch"], 6],
    ["Vidraru Lake", "reservoir", "Romania", "Argeș", 45.35, 24.62, 45.38, 24.65, ["Rainbow Trout", "Brown Trout", "Arctic Char"], 5],
    ["Olt River", "river", "Romania", "Sibiu", 45.80, 24.15, 45.60, 24.18, ["Brown Trout", "Grayling", "Chub", "Barbel"], 8],
    ["Someș River", "river", "Romania", "Cluj", 46.78, 23.60, 46.90, 23.40, ["Brown Trout", "Grayling", "Chub"], 6],
    ["Lake Snagov", "lake", "Romania", "Ilfov", 44.68, 26.15, 44.70, 26.18, ["Pike", "Perch", "Common Carp"], 4],
    ["Siret River", "river", "Romania", "Suceava", 47.65, 26.25, 47.30, 26.40, ["Brown Trout", "Grayling", "Barbel", "Chub"], 8],
    ["Black Sea (Constanța)", "coastal", "Romania", "Constanța", 44.18, 28.65, 44.10, 28.68, ["Turbot", "Bluefish", "Mullet", "Garfish"], 6],

    // BULGARIA
    ["Danube River (Vidin)", "river", "Bulgaria", "Vidin", 43.98, 22.88, 43.85, 23.20, ["Wels Catfish", "Zander", "Common Carp", "Asp"], 8],
    ["Iskar Reservoir", "reservoir", "Bulgaria", "Sofia", 42.52, 23.55, 42.55, 23.60, ["Common Carp", "Pike", "Zander", "Perch"], 6],
    ["Batak Reservoir", "reservoir", "Bulgaria", "Pazardzhik", 41.93, 24.18, 41.96, 24.22, ["Rainbow Trout", "Brown Trout", "Carp"], 5],
    ["Maritsa River", "river", "Bulgaria", "Plovdiv", 42.15, 24.75, 41.80, 25.50, ["Barbel", "Chub", "Common Carp", "Catfish"], 8],
    ["Struma River", "river", "Bulgaria", "Blagoevgrad", 41.75, 23.45, 41.40, 23.40, ["Brown Trout", "Chub", "Barbel"], 6],
    ["Black Sea (Burgas)", "coastal", "Bulgaria", "Burgas", 42.50, 27.48, 42.45, 27.50, ["Bluefish", "Sea Bass", "Turbot", "Mullet"], 5],

    // GREECE
    ["Lake Kerkini", "lake", "Greece", "Serres", 41.22, 23.10, 41.18, 23.15, ["Common Carp", "Pike", "Catfish", "Perch"], 8],
    ["Lake Plastira", "lake", "Greece", "Karditsa", 39.28, 21.72, 39.30, 21.75, ["Rainbow Trout", "Common Carp"], 4],
    ["Evros River", "river", "Greece", "Evros", 41.68, 26.32, 41.40, 26.50, ["Carp", "Catfish", "Zander", "Pike"], 8],
    ["Lake Volvi", "lake", "Greece", "Thessaloniki", 40.68, 23.48, 40.67, 23.55, ["Common Carp", "Pike", "Perch"], 5],
    ["Aliakmonas River", "river", "Greece", "Imathia", 40.50, 22.18, 40.40, 22.30, ["Brown Trout", "Chub", "Barbel"], 6],
    ["Aegean Coast (Rhodes)", "coastal", "Greece", "Dodecanese", 36.42, 28.22, 36.38, 28.25, ["Grouper", "Dentex", "Amberjack", "Sea Bream"], 6],
    ["Ionian Coast (Lefkada)", "coastal", "Greece", "Lefkada", 38.72, 20.65, 38.68, 20.68, ["Dentex", "Amberjack", "Grouper"], 5],
    ["Crete South Coast", "coastal", "Greece", "Heraklion", 35.00, 24.80, 34.98, 24.85, ["Bluefin Tuna", "Amberjack", "Grouper"], 5],

    // TURKEY
    ["Bosphorus", "coastal", "Turkey", "Istanbul", 41.12, 29.05, 41.08, 29.08, ["Bluefish", "Sea Bass", "Mackerel", "Bonito"], 6],
    ["Lake Van", "lake", "Turkey", "Van", 38.60, 43.30, 38.50, 43.50, ["Pearl Mullet", "Common Carp"], 6],
    ["Kızılırmak River", "river", "Turkey", "Samsun", 41.28, 36.33, 41.00, 35.80, ["Brown Trout", "Common Carp", "Barbel"], 8],
    ["Çoruh River", "river", "Turkey", "Artvin", 41.18, 41.82, 40.80, 41.50, ["Brown Trout", "Sturgeon", "Barbel"], 8],
    ["Atatürk Dam Lake", "reservoir", "Turkey", "Şanlıurfa", 37.45, 38.35, 37.55, 38.55, ["Common Carp", "Catfish", "Zander", "Barbel"], 10],
    ["Lake Beyşehir", "lake", "Turkey", "Konya", 37.70, 31.50, 37.60, 31.55, ["Common Carp", "Pike", "Zander"], 6],
    ["Lake Eğirdir", "lake", "Turkey", "Isparta", 38.05, 30.85, 37.95, 30.90, ["Crayfish", "Common Carp", "Zander"], 5],
    ["Antalya Coast", "coastal", "Turkey", "Antalya", 36.88, 30.70, 36.85, 30.75, ["Grouper", "Amberjack", "Dentex", "Bluefin Tuna"], 6],
    ["Dalaman River", "river", "Turkey", "Muğla", 36.78, 28.80, 36.85, 28.85, ["Common Carp", "Catfish", "Barbel"], 5],
    ["Sapanca Lake", "lake", "Turkey", "Sakarya", 40.68, 30.25, 40.70, 30.30, ["Pike", "Perch", "Common Carp", "Catfish"], 5],

    // CZECH REPUBLIC
    ["Lipno Reservoir", "reservoir", "Czech Republic", "South Bohemia", 48.63, 14.22, 48.65, 14.30, ["Common Carp", "Pike", "Zander", "Perch"], 6],
    ["Vltava River (Prague)", "river", "Czech Republic", "Prague", 50.08, 14.42, 50.00, 14.45, ["Common Carp", "Pike", "Zander", "Chub"], 6],
    ["Orlík Reservoir", "reservoir", "Czech Republic", "South Bohemia", 49.58, 14.15, 49.55, 14.20, ["Zander", "Pike", "Carp", "Catfish"], 6],
    ["Morava River", "river", "Czech Republic", "South Moravia", 48.85, 16.88, 48.60, 17.00, ["Common Carp", "Pike", "Catfish", "Asp"], 8],
    ["Sázava River", "river", "Czech Republic", "Central Bohemia", 49.88, 14.90, 49.78, 14.60, ["Brown Trout", "Grayling", "Chub", "Barbel"], 6],
    ["Třeboň Ponds", "lake", "Czech Republic", "South Bohemia", 49.00, 14.77, 49.02, 14.82, ["Common Carp", "Pike", "Tench"], 5],

    // SLOVAKIA
    ["Danube River (Bratislava)", "river", "Slovakia", "Bratislava", 48.13, 17.10, 48.10, 17.20, ["Common Carp", "Pike", "Zander", "Wels Catfish"], 6],
    ["Liptovská Mara Reservoir", "reservoir", "Slovakia", "Žilina", 49.08, 19.58, 49.10, 19.65, ["Brown Trout", "Pike", "Zander", "Whitefish"], 6],
    ["Orava Reservoir", "reservoir", "Slovakia", "Žilina", 49.35, 19.52, 49.38, 19.58, ["Brown Trout", "Pike", "Perch"], 5],
    ["Váh River", "river", "Slovakia", "Trenčín", 48.90, 18.05, 48.70, 18.20, ["Brown Trout", "Grayling", "Chub", "Barbel"], 6],

    // SERBIA
    ["Danube River (Belgrade)", "river", "Serbia", "Belgrade", 44.82, 20.45, 44.75, 20.52, ["Common Carp", "Pike", "Zander", "Wels Catfish"], 8],
    ["Đerdap Gorge", "river", "Serbia", "Bor", 44.62, 22.08, 44.55, 22.20, ["Wels Catfish", "Sterlet", "Zander", "Carp"], 8],
    ["Drina River", "river", "Serbia", "Bajina Bašta", 43.97, 19.55, 43.80, 19.48, ["Huchen", "Brown Trout", "Grayling", "Chub"], 8],
    ["Silver Lake (Srebrno Jezero)", "lake", "Serbia", "Požarevac", 44.62, 21.38, 44.63, 21.40, ["Common Carp", "Pike", "Catfish"], 4],
    ["Uvac River Canyon", "river", "Serbia", "Zlatibor", 43.40, 19.95, 43.35, 20.00, ["Grayling", "Brown Trout", "Chub"], 5],

    // CROATIA (more)
    ["Mreznica River", "river", "Croatia", "Karlovac", 45.50, 15.55, 45.40, 15.60, ["Brown Trout", "Grayling", "Chub"], 6],
    ["Gacka River", "river", "Croatia", "Lika-Senj", 44.88, 15.35, 44.82, 15.38, ["Brown Trout", "Grayling", "Rainbow Trout"], 5],
    ["Neretva River Delta", "river", "Croatia", "Dubrovnik-Neretva", 43.03, 17.45, 43.00, 17.50, ["European Eel", "Sea Bass", "Mullet", "Common Carp"], 6],
    ["Vransko Lake", "lake", "Croatia", "Zadar", 43.88, 15.55, 43.90, 15.58, ["Common Carp", "Pike", "European Eel"], 4],
  ];

  const rows = expand(defs);
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from("fishing_locations").insert(rows.slice(i, i + BATCH));
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    inserted += rows.slice(i, i + BATCH).length;
  }
  return new Response(JSON.stringify({ success: true, inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
