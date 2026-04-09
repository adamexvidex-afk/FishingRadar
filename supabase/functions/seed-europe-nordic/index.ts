import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
type S = { name: string; lat: number; lng: number; category: string; species: string[]; state: string; country: string }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const countries = ['Sweden','Norway','Finland','Denmark']
    for (const c of countries) await sb.from('fishing_locations').delete().eq('country', c)

    const seen = new Map<string, number>()
    const u = (b: string) => { const c = (seen.get(b) || 0) + 1; seen.set(b, c); return c === 1 ? b : `${b} ${c}` }
    const rv = (river: string, wp: [number,number,string][], n: number, sp: string[], st: string, co: string): S[] => {
      const o: S[] = []
      for (let i = 0; i < wp.length; i++) {
        o.push({ name: u(`${river} - ${wp[i][2]}`), lat: wp[i][0], lng: wp[i][1], category: 'river', species: sp, state: st, country: co })
        if (i < wp.length - 1 && n > 0) for (let j = 1; j <= n; j++) {
          const t = j / (n + 1)
          o.push({ name: u(`${river} near ${wp[i][2]}`), lat: +(wp[i][0]+(wp[i+1][0]-wp[i][0])*t).toFixed(4), lng: +(wp[i][1]+(wp[i+1][1]-wp[i][1])*t).toFixed(4), category: 'river', species: sp, state: st, country: co })
        }
      }
      return o
    }
    const lk = (name: string, lat: number, lng: number, sp: string[], st: string, co: string): S => ({ name: u(name), lat, lng, category: 'lake', species: sp, state: st, country: co })
    const cs = (name: string, lat: number, lng: number, sp: string[], st: string, co: string): S => ({ name: u(name), lat, lng, category: 'coast', species: sp, state: st, country: co })

    const pike = ['Northern Pike','European Perch','Zander','Brown Trout']
    const sal = ['Atlantic Salmon','Brown Trout','Sea Trout','Arctic Char']
    const fjord = ['Cod','Pollack','Coalfish','Halibut','Mackerel','Sea Trout']
    const baltic = ['Northern Pike','European Perch','Sea Trout','Cod','Flounder']
    const lp = ['Northern Pike','European Perch','Zander','Brown Trout','Arctic Char']

    const a: S[] = []

    // ═══════ SWEDEN ═══════
    // Rivers
    a.push(...rv('Mörrum',[
      [56.37,14.74,'Mörrum'],[56.32,14.77,'Eringsboda area'],[56.28,14.80,'Svängsta']
    ],2,sal,'Blekinge','Sweden'))
    a.push(...rv('Emån',[
      [57.13,16.45,'Emsfors'],[57.20,16.55,'Mörlunda area'],[57.40,16.38,'Vetlanda area']
    ],2,sal,'Kalmar','Sweden'))
    a.push(...rv('Ätran',[
      [57.13,12.47,'Falkenberg'],[57.25,12.55,'Ullared area']
    ],2,sal,'Halland','Sweden'))
    a.push(...rv('Torne',[
      [66.40,23.65,'Tornio area'],[67.10,23.47,'Pello area'],[67.85,20.22,'Karesuando']
    ],2,sal,'Norrbotten','Sweden'))
    a.push(...rv('Kalix',[
      [66.20,23.20,'Kalix area'],[66.50,22.70,'Överkalix']
    ],2,sal,'Norrbotten','Sweden'))
    a.push(...rv('Lule',[
      [65.58,22.15,'Luleå'],[66.38,20.63,'Jokkmokk area']
    ],2,sal,'Norrbotten','Sweden'))
    a.push(...rv('Vindel',[
      [64.20,19.72,'Vindeln'],[65.08,17.28,'Sorsele']
    ],2,[...sal,'Grayling'],'Västerbotten','Sweden'))
    a.push(...rv('Ljusnan',[
      [61.30,17.00,'Söderhamn area'],[61.52,16.07,'Ljusdal']
    ],2,sal,'Gävleborg','Sweden'))
    a.push(...rv('Dalälven',[
      [60.57,17.43,'Älvkarleby'],[60.48,16.80,'Gysinge area']
    ],2,sal,'Gävleborg','Sweden'))

    // Swedish Lakes
    ;[[58.88,13.53],[58.85,13.57],[58.90,13.48],[58.78,13.40],[58.73,13.25],[58.70,13.15],[58.82,13.20],[58.95,13.45]].forEach(([la,ln])=>a.push(lk('Vänern',la,ln,pike,'Västra Götaland','Sweden')))
    ;[[58.35,14.55],[58.38,14.60],[58.32,14.50],[58.28,14.58],[58.42,14.52],[58.40,14.65]].forEach(([la,ln])=>a.push(lk('Vättern',la,ln,[...pike,'Arctic Char'],'Jönköping','Sweden')))
    ;[[59.43,17.12],[59.45,17.15],[59.40,17.08],[59.48,17.20],[59.35,17.05]].forEach(([la,ln])=>a.push(lk('Mälaren',la,ln,pike,'Stockholm','Sweden')))
    ;[[59.92,15.55],[59.88,15.52],[59.95,15.58]].forEach(([la,ln])=>a.push(lk('Hjälmaren',la,ln,pike,'Örebro','Sweden')))
    ;[[64.00,17.90],[63.95,17.85]].forEach(([la,ln])=>a.push(lk('Storsjön',la,ln,lp,'Jämtland','Sweden')))
    ;[[60.95,14.87],[60.92,14.85]].forEach(([la,ln])=>a.push(lk('Siljan',la,ln,pike,'Dalarna','Sweden')))
    ;[[56.23,14.82],[56.20,14.85]].forEach(([la,ln])=>a.push(lk('Ivösjön',la,ln,pike,'Skåne','Sweden')))
    ;[[57.20,15.98],[57.18,16.00]].forEach(([la,ln])=>a.push(lk('Asnen',la,ln,pike,'Kronoberg','Sweden')))

    // Swedish Coast
    const sec: [string,number,number,string][] = [
      ['Göteborg',57.70,11.97,'Västra Götaland'],['Lysekil',58.28,11.43,'Västra Götaland'],['Strömstad',58.93,11.17,'Västra Götaland'],['Varberg',57.10,12.25,'Halland'],['Helsingborg',56.04,12.70,'Skåne'],['Simrishamn',55.56,14.35,'Skåne'],['Karlskrona',56.16,15.59,'Blekinge'],['Kalmar',56.66,16.37,'Kalmar'],['Västervik',57.76,16.63,'Kalmar'],['Nyköping',58.75,17.00,'Södermanland'],['Stockholm Archipelago',59.32,18.07,'Stockholm'],['Norrtälje',59.77,18.70,'Stockholm'],['Gävle Coast',60.67,17.15,'Gävleborg'],['Sundsvall',62.39,17.31,'Västernorrland'],['Umeå Coast',63.83,20.27,'Västerbotten'],['Luleå Coast',65.58,22.15,'Norrbotten'],['Gotland Visby',57.64,18.28,'Gotland'],['Öland North',56.88,16.95,'Kalmar']
    ]
    sec.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,baltic,st,'Sweden')))

    // ═══════ NORWAY ═══════
    // Salmon Rivers
    a.push(...rv('Alta',[
      [69.97,23.27,'Alta'],[69.90,23.35,'Raipas area']
    ],2,sal,'Troms og Finnmark','Norway'))
    a.push(...rv('Tana',[
      [70.07,27.02,'Tana Bru'],[70.20,27.30,'Upper Tana']
    ],2,sal,'Troms og Finnmark','Norway'))
    a.push(...rv('Namsen',[
      [64.47,11.50,'Namsos area'],[64.55,12.50,'Grong area']
    ],2,sal,'Trøndelag','Norway'))
    a.push(...rv('Gaula',[
      [63.30,10.40,'Trondheim area'],[63.00,10.25,'Støren area']
    ],2,sal,'Trøndelag','Norway'))
    a.push(...rv('Orkla',[
      [63.35,10.12,'Fannrem area'],[63.18,9.85,'Ulsberg area']
    ],2,sal,'Trøndelag','Norway'))
    a.push(...rv('Lærdal',[
      [61.10,7.48,'Lærdal'],[61.07,7.55,'Lower Lærdal']
    ],2,sal,'Vestland','Norway'))
    a.push(...rv('Mandalselva',[
      [58.03,7.47,'Mandal'],[58.13,7.50,'Bjelland area']
    ],2,sal,'Agder','Norway'))
    a.push(...rv('Otra',[
      [58.15,7.98,'Kristiansand area'],[58.30,7.78,'Evje area']
    ],2,sal,'Agder','Norway'))
    a.push(...rv('Numedalslågen',[
      [59.05,10.05,'Larvik area'],[59.40,9.55,'Kongsberg area']
    ],2,sal,'Vestfold og Telemark','Norway'))
    a.push(...rv('Glomma',[
      [59.27,11.11,'Sarpsborg'],[60.20,11.10,'Elverum area'],[61.12,11.37,'Alvdal area']
    ],2,[...sal,'Grayling'],'Innlandet','Norway'))

    // Norwegian Fjords/Coast (sea fishing)
    const noc: [string,number,number,string][] = [
      ['Lofoten - Svolvær',68.23,14.57,'Nordland'],['Lofoten - Henningsvær',68.15,14.20,'Nordland'],['Lofoten - Reine',67.93,13.08,'Nordland'],['Bodø',67.28,14.40,'Nordland'],['Tromsø',69.65,18.96,'Troms og Finnmark'],['Hammerfest',70.66,23.68,'Troms og Finnmark'],['Nordkapp',71.17,25.78,'Troms og Finnmark'],['Trondheim Fjord',63.43,10.40,'Trøndelag'],['Ålesund',62.47,6.15,'Møre og Romsdal'],['Molde',62.74,7.16,'Møre og Romsdal'],['Kristiansund',63.11,7.73,'Møre og Romsdal'],['Bergen',60.39,5.32,'Vestland'],['Sognefjorden',61.20,6.80,'Vestland'],['Hardangerfjorden',60.42,6.42,'Vestland'],['Stavanger',58.97,5.73,'Rogaland'],['Haugesund',59.41,5.27,'Rogaland'],['Flekkefjord',58.30,6.67,'Agder'],['Kristiansand',58.15,8.00,'Agder'],['Arendal',58.46,8.77,'Agder'],['Risør',58.72,9.23,'Agder'],['Kragerø',58.87,9.42,'Vestfold og Telemark'],['Langesund',59.00,9.75,'Vestfold og Telemark'],['Tønsberg',59.27,10.42,'Vestfold og Telemark'],['Fredrikstad',59.22,10.93,'Viken'],['Hvaler',59.03,10.98,'Viken']
    ]
    noc.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,fjord,st,'Norway')))

    // Norwegian Lakes
    ;[[60.73,10.73],[60.70,10.78],[60.68,10.70]].forEach(([la,ln])=>a.push(lk('Mjøsa',la,ln,pike,'Innlandet','Norway')))
    ;[[60.03,9.55],[60.00,9.58]].forEach(([la,ln])=>a.push(lk('Norsjø',la,ln,pike,'Vestfold og Telemark','Norway')))
    ;[[61.08,8.90],[61.10,8.87]].forEach(([la,ln])=>a.push(lk('Bygdin',la,ln,['Brown Trout','Arctic Char'],'Innlandet','Norway')))
    a.push(lk('Randsfjorden',60.35,10.37,pike,'Innlandet','Norway'))
    a.push(lk('Tyrifjorden',59.98,10.18,pike,'Viken','Norway'))
    a.push(lk('Femunden',62.12,11.85,['Brown Trout','Arctic Char','Grayling'],'Innlandet','Norway'))

    // ═══════ FINLAND ═══════
    // Lakes
    ;[[61.53,28.10],[61.50,28.13],[61.48,28.07],[61.55,28.15],[61.45,28.05]].forEach(([la,ln])=>a.push(lk('Saimaa',la,ln,lp,'South Karelia','Finland')))
    ;[[61.57,25.52],[61.55,25.55],[61.53,25.48]].forEach(([la,ln])=>a.push(lk('Päijänne',la,ln,lp,'Central Finland','Finland')))
    ;[[62.22,27.70],[62.20,27.73]].forEach(([la,ln])=>a.push(lk('Kallavesi',la,ln,lp,'North Savo','Finland')))
    ;[[61.48,23.78],[61.45,23.82]].forEach(([la,ln])=>a.push(lk('Näsijärvi',la,ln,lp,'Pirkanmaa','Finland')))
    ;[[63.05,27.48],[63.02,27.50]].forEach(([la,ln])=>a.push(lk('Pielinen',la,ln,lp,'North Karelia','Finland')))
    ;[[63.98,28.30],[63.95,28.33]].forEach(([la,ln])=>a.push(lk('Oulujärvi',la,ln,lp,'Kainuu','Finland')))
    ;[[69.07,27.02],[69.05,27.05]].forEach(([la,ln])=>a.push(lk('Inarijärvi',la,ln,['Brown Trout','Arctic Char','Grayling','Northern Pike'],'Lapland','Finland')))
    ;[[61.17,23.72],[61.15,23.75]].forEach(([la,ln])=>a.push(lk('Pyhäjärvi',la,ln,lp,'Pirkanmaa','Finland')))
    a.push(lk('Haukivesi',62.07,28.07,lp,'South Savo','Finland'))
    a.push(lk('Keitele',63.23,25.67,lp,'Central Finland','Finland'))
    a.push(lk('Puula',61.62,26.52,lp,'South Savo','Finland'))

    // Finnish Rivers
    a.push(...rv('Teno (Tana)',[
      [69.90,26.00,'Utsjoki'],[70.07,27.02,'Nuorgam']
    ],2,sal,'Lapland','Finland'))
    a.push(...rv('Tornionjoki',[
      [65.85,24.15,'Tornio'],[66.40,23.65,'Pello area']
    ],2,sal,'Lapland','Finland'))
    a.push(...rv('Simojoki',[
      [65.63,25.07,'Simo'],[65.75,25.50,'Simojoki upper']
    ],2,sal,'Lapland','Finland'))
    a.push(...rv('Kymijoki',[
      [60.47,26.93,'Kotka'],[60.73,26.80,'Anjalankoski']
    ],2,[...pike,...sal],'Kymenlaakso','Finland'))

    // Finnish Coast
    const fic: [string,number,number,string][] = [
      ['Helsinki',60.17,24.95,'Uusimaa'],['Turku Archipelago',60.45,22.27,'Southwest Finland'],['Hanko',59.82,22.97,'Uusimaa'],['Rauma',61.13,21.50,'Satakunta'],['Pori',61.48,21.80,'Satakunta'],['Vaasa',63.10,21.60,'Ostrobothnia'],['Kokkola',63.84,23.13,'Central Ostrobothnia'],['Oulu Coast',65.02,25.47,'North Ostrobothnia'],['Åland Islands',60.10,19.93,'Åland'],['Åland Islands',60.12,20.00,'Åland']
    ]
    fic.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,baltic,st,'Finland')))

    // ═══════ DENMARK ═══════
    // Rivers
    a.push(...rv('Gudenå',[
      [56.18,9.52,'Silkeborg'],[56.28,9.57,'Bjerringbro area'],[56.46,10.05,'Randers']
    ],2,pike,'Midtjylland','Denmark'))
    a.push(...rv('Skjern Å',[
      [55.93,8.42,'Skjern'],[55.97,8.75,'Borris area']
    ],2,[...pike,'Atlantic Salmon'],'Midtjylland','Denmark'))
    a.push(...rv('Storå',[
      [56.25,8.13,'Holstebro area'],[56.32,8.50,'Herning area']
    ],2,pike,'Midtjylland','Denmark'))
    a.push(...rv('Karup Å',[
      [56.32,9.12,'Karup'],[56.48,9.18,'Viborg area']
    ],2,[...pike,'Atlantic Salmon'],'Midtjylland','Denmark'))

    // Danish Lakes
    a.push(lk('Arresø',55.97,12.10,pike,'Hovedstaden','Denmark'))
    a.push(lk('Esrum Sø',55.97,12.37,pike,'Hovedstaden','Denmark'))
    a.push(lk('Mossø',55.92,9.73,pike,'Midtjylland','Denmark'))
    a.push(lk('Julsø',56.10,9.65,pike,'Midtjylland','Denmark'))
    a.push(lk('Skanderborg Sø',56.02,9.92,pike,'Midtjylland','Denmark'))

    // Danish Coast
    const dkc: [string,number,number,string][] = [
      ['Skagen',57.72,10.58,'Nordjylland'],['Frederikshavn',57.43,10.53,'Nordjylland'],['Hanstholm',57.12,8.62,'Nordjylland'],['Thyborøn',56.70,8.22,'Midtjylland'],['Hvide Sande',56.00,8.13,'Midtjylland'],['Esbjerg',55.47,8.45,'Syddanmark'],['Rømø',55.10,8.52,'Syddanmark'],['Fanø',55.42,8.40,'Syddanmark'],['Als',54.92,9.88,'Syddanmark'],['Langeland',54.75,10.70,'Syddanmark'],['Bornholm - Nexø',55.07,15.13,'Hovedstaden'],['Bornholm - Rønne',55.10,14.70,'Hovedstaden'],['Helsingør',56.04,12.62,'Hovedstaden'],['Copenhagen',55.68,12.60,'Hovedstaden'],['Møn',55.00,12.37,'Sjælland'],['Odsherred',55.80,11.62,'Sjælland'],['Samsø',55.85,10.60,'Midtjylland'],['Kerteminde',55.45,10.65,'Syddanmark'],['Nyborg',55.32,10.78,'Syddanmark']
    ]
    dkc.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,['Cod','Sea Trout','Flounder','Garfish','Mackerel'],st,'Denmark')))

    let ins = 0
    for (let i = 0; i < a.length; i += 200) {
      const { error } = await sb.from('fishing_locations').insert(a.slice(i, i + 200))
      if (!error) ins += Math.min(200, a.length - i); else console.error(error.message)
    }
    return new Response(JSON.stringify({ countries, inserted: ins, total: a.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
