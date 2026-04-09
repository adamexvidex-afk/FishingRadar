import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
type S = { name: string; lat: number; lng: number; category: string; species: string[]; state: string; country: string }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const C = 'Italy'
    await sb.from('fishing_locations').delete().eq('country', C)
    const seen = new Map<string, number>()
    const u = (b: string) => { const c = (seen.get(b) || 0) + 1; seen.set(b, c); return c === 1 ? b : `${b} ${c}` }
    const rv = (river: string, wp: [number,number,string][], n: number, sp: string[], st: string): S[] => {
      const o: S[] = []
      for (let i = 0; i < wp.length; i++) {
        o.push({ name: u(`${river} - ${wp[i][2]}`), lat: wp[i][0], lng: wp[i][1], category: 'river', species: sp, state: st, country: C })
        if (i < wp.length - 1 && n > 0) for (let j = 1; j <= n; j++) {
          const t = j / (n + 1)
          o.push({ name: u(`${river} near ${wp[i][2]}`), lat: +(wp[i][0]+(wp[i+1][0]-wp[i][0])*t).toFixed(4), lng: +(wp[i][1]+(wp[i+1][1]-wp[i][1])*t).toFixed(4), category: 'river', species: sp, state: st, country: C })
        }
      }
      return o
    }
    const lk = (name: string, lat: number, lng: number, sp: string[], st: string): S => ({ name: u(name), lat, lng, category: 'lake', species: sp, state: st, country: C })
    const co = (name: string, lat: number, lng: number, sp: string[], st: string): S => ({ name: u(name), lat, lng, category: 'coast', species: sp, state: st, country: C })
    const rs = (name: string, lat: number, lng: number, sp: string[], st: string): S => ({ name: u(name), lat, lng, category: 'reservoir', species: sp, state: st, country: C })

    const fw = ['Common Carp','Northern Pike','Zander','European Perch','Wels Catfish','Barbel','Chub']
    const tr = ['Brown Trout','Rainbow Trout','Marble Trout','Grayling']
    const med = ['Sea Bass','Sea Bream','Dentex','Grouper','Bluefin Tuna','Swordfish','Amberjack']
    const lp = ['Northern Pike','European Perch','Zander','Common Carp','Tench','Largemouth Bass']

    const a: S[] = []

    // Po
    a.push(...rv('Po',[
      [44.73,7.14,'Saluzzo area'],[44.88,7.35,'Carignano'],[45.07,7.69,'Torino'],[45.08,8.06,'Chivasso'],[45.19,8.42,'Casale Monferrato'],[45.11,8.85,'Valenza'],[45.19,9.16,'Pavia'],[45.13,9.50,'Piacenza area'],[45.05,9.69,'Piacenza'],[45.14,10.02,'Cremona'],[45.10,10.42,'Viadana'],[45.16,10.79,'Mantova area'],[45.08,11.20,'Ostiglia'],[44.95,11.62,'Ferrara area'],[44.96,12.00,'Ro Ferrarese'],[44.96,12.33,'Po Delta']
    ],3,fw,'Lombardia'))

    // Adige
    a.push(...rv('Adige',[
      [46.50,11.35,'Bolzano'],[46.33,11.20,'Salorno'],[46.07,11.12,'Trento'],[45.88,11.00,'Rovereto'],[45.60,10.90,'Rivoli Veronese'],[45.44,10.99,'Verona'],[45.18,11.17,'Legnago'],[45.07,11.80,'Cavarzere'],[45.10,12.20,'Chioggia area']
    ],3,[...fw,...tr],'Trentino-Alto Adige'))

    // Tiber (Tevere)
    a.push(...rv('Tevere',[
      [43.46,12.24,'Sansepolcro area'],[43.28,12.17,'Città di Castello'],[42.97,12.39,'Perugia area'],[42.74,12.41,'Todi area'],[42.72,12.11,'Orvieto'],[42.26,12.35,'Viterbo area'],[41.90,12.48,'Roma'],[41.73,12.28,'Fiumicino area']
    ],3,fw,'Lazio'))

    // Arno
    a.push(...rv('Arno',[
      [43.63,11.87,'Arezzo area'],[43.77,11.25,'Firenze'],[43.72,11.00,'Empoli'],[43.72,10.40,'Pisa']
    ],3,fw,'Toscana'))

    // Tanaro
    a.push(...rv('Tanaro',[
      [44.32,7.75,'Ceva'],[44.55,8.03,'Alba'],[44.70,8.20,'Asti'],[44.91,8.61,'Alessandria']
    ],3,fw,'Piemonte'))

    // Ticino
    a.push(...rv('Ticino',[
      [45.72,8.63,'Sesto Calende'],[45.52,8.85,'Vigevano area'],[45.19,9.16,'Pavia confluence']
    ],3,fw,'Lombardia'))

    // Oglio
    a.push(...rv('Oglio',[
      [45.84,10.17,'Lovere area'],[45.55,10.05,'Palazzolo'],[45.32,10.20,'Ostiano'],[45.10,10.42,'Po confluence']
    ],3,fw,'Lombardia'))

    // Mincio
    a.push(...rv('Mincio',[
      [45.45,10.72,'Peschiera'],[45.16,10.79,'Mantova'],[45.05,10.82,'Governolo']
    ],3,fw,'Lombardia'))

    // Brenta
    a.push(...rv('Brenta',[
      [46.00,11.45,'Borgo Valsugana'],[45.73,11.66,'Bassano del Grappa'],[45.50,11.87,'Cittadella'],[45.41,11.88,'Padova area'],[45.25,12.00,'Chioggia area']
    ],3,[...fw,...tr],'Veneto'))

    // Piave
    a.push(...rv('Piave',[
      [46.34,12.27,'Belluno area'],[45.95,12.17,'Vittorio Veneto'],[45.70,12.25,'Treviso area'],[45.55,12.53,'Jesolo area']
    ],3,fw,'Veneto'))

    // Tagliamento
    a.push(...rv('Tagliamento',[
      [46.37,12.95,'Tolmezzo area'],[46.18,12.88,'Gemona'],[46.00,13.00,'Osoppo'],[45.80,13.10,'Latisana']
    ],3,tr,'Friuli Venezia Giulia'))

    // Isonzo (Soča Italian section)
    a.push(...rv('Isonzo',[
      [45.96,13.62,'Gorizia'],[45.85,13.55,'Gradisca'],[45.73,13.53,'Monfalcone area']
    ],3,tr,'Friuli Venezia Giulia'))

    // Sarca
    a.push(...rv('Sarca',[
      [46.15,10.88,'Tione'],[45.95,10.85,'Arco'],[45.87,10.84,'Torbole']
    ],3,tr,'Trentino-Alto Adige'))

    // Reno
    a.push(...rv('Reno',[
      [44.11,11.00,'Porretta Terme'],[44.42,11.32,'Bologna area'],[44.60,11.60,'Argenta area'],[44.65,12.10,'Ravenna area']
    ],3,fw,'Emilia-Romagna'))

    // Volturno
    a.push(...rv('Volturno',[
      [41.47,14.22,'Isernia area'],[41.24,14.12,'Alife'],[41.10,14.08,'Capua'],[41.05,13.95,'Caserta area']
    ],3,fw,'Campania'))

    // Lakes
    // Garda
    ;[[45.72,10.70],[45.68,10.65],[45.63,10.63],[45.58,10.60],[45.55,10.62],[45.50,10.65],[45.47,10.70],[45.45,10.72],[45.53,10.73],[45.58,10.75],[45.63,10.73],[45.68,10.72],[45.75,10.73]].forEach(([la,ln])=>a.push(lk('Lago di Garda',la,ln,lp,'Veneto')))

    // Como
    ;[[46.02,9.26],[45.98,9.25],[45.95,9.27],[45.90,9.28],[45.85,9.10],[46.00,9.30],[46.10,9.30],[46.05,9.25],[45.82,9.07]].forEach(([la,ln])=>a.push(lk('Lago di Como',la,ln,lp,'Lombardia')))

    // Maggiore
    ;[[45.95,8.58],[45.90,8.55],[45.85,8.56],[45.80,8.58],[46.00,8.60],[46.05,8.62],[46.10,8.65],[45.97,8.57]].forEach(([la,ln])=>a.push(lk('Lago Maggiore',la,ln,lp,'Piemonte')))

    // Iseo
    ;[[45.72,10.07],[45.70,10.05],[45.68,10.08],[45.75,10.10],[45.73,10.12]].forEach(([la,ln])=>a.push(lk('Lago d\'Iseo',la,ln,lp,'Lombardia')))

    // Trasimeno
    ;[[43.11,12.10],[43.09,12.13],[43.13,12.15],[43.10,12.08],[43.08,12.11]].forEach(([la,ln])=>a.push(lk('Lago Trasimeno',la,ln,lp,'Umbria')))

    // Bolsena
    ;[[42.63,11.93],[42.60,11.95],[42.65,11.97],[42.58,11.92]].forEach(([la,ln])=>a.push(lk('Lago di Bolsena',la,ln,lp,'Lazio')))

    // Bracciano
    ;[[42.12,12.23],[42.10,12.21],[42.14,12.25]].forEach(([la,ln])=>a.push(lk('Lago di Bracciano',la,ln,lp,'Lazio')))

    // Orta
    ;[[45.82,8.40],[45.80,8.39],[45.78,8.41]].forEach(([la,ln])=>a.push(lk('Lago d\'Orta',la,ln,lp,'Piemonte')))

    // Lugano (Italian side)
    ;[[45.97,8.97],[45.95,8.95]].forEach(([la,ln])=>a.push(lk('Lago di Lugano',la,ln,lp,'Lombardia')))

    // Varano & Lesina (Puglia)
    a.push(lk('Lago di Varano',41.87,15.75,fw,'Puglia'))
    a.push(lk('Lago di Lesina',41.88,15.45,fw,'Puglia'))

    // Coast - Adriatic
    const adr: [string,number,number,string][] = [
      ['Trieste',45.65,13.77,'Friuli Venezia Giulia'],['Grado',45.68,13.40,'Friuli Venezia Giulia'],['Lignano',45.69,13.14,'Friuli Venezia Giulia'],['Venezia Lido',45.38,12.36,'Veneto'],['Chioggia Coast',45.22,12.30,'Veneto'],['Comacchio',44.70,12.18,'Emilia-Romagna'],['Ravenna Coast',44.42,12.20,'Emilia-Romagna'],['Rimini',44.06,12.57,'Emilia-Romagna'],['Pesaro',43.91,12.91,'Marche'],['Ancona',43.62,13.51,'Marche'],['San Benedetto del Tronto',42.95,13.89,'Marche'],['Pescara',42.46,14.22,'Abruzzo'],['Vasto',42.12,14.71,'Abruzzo'],['Termoli',42.00,14.99,'Molise'],['Vieste',41.88,16.18,'Puglia'],['Bari',41.12,16.87,'Puglia'],['Brindisi',40.64,17.95,'Puglia'],['Otranto',40.15,18.49,'Puglia'],['Gallipoli',40.06,17.99,'Puglia'],['Taranto',40.47,17.24,'Puglia']
    ]
    adr.forEach(([n,la,ln,st])=>a.push(co(n,la,ln,med,st)))

    // Coast - Tyrrhenian
    const tyr: [string,number,number,string][] = [
      ['Sanremo',43.82,7.78,'Liguria'],['Genova',44.41,8.93,'Liguria'],['La Spezia',44.10,9.82,'Liguria'],['Viareggio',43.87,10.25,'Toscana'],['Livorno',43.55,10.31,'Toscana'],['Piombino',42.93,10.53,'Toscana'],['Orbetello',42.44,11.21,'Toscana'],['Civitavecchia',42.09,11.80,'Lazio'],['Gaeta',41.21,13.57,'Lazio'],['Napoli',40.84,14.25,'Campania'],['Amalfi',40.63,14.60,'Campania'],['Salerno',40.68,14.77,'Campania'],['Tropea',38.68,15.90,'Calabria'],['Reggio Calabria',38.11,15.65,'Calabria']
    ]
    tyr.forEach(([n,la,ln,st])=>a.push(co(n,la,ln,med,st)))

    // Sicily
    const sic: [string,number,number,string][] = [
      ['Palermo',38.12,13.36,'Sicilia'],['Catania',37.50,15.09,'Sicilia'],['Siracusa',37.07,15.29,'Sicilia'],['Messina',38.19,15.56,'Sicilia'],['Trapani',38.02,12.51,'Sicilia'],['Agrigento Coast',37.29,13.59,'Sicilia'],['Ragusa Coast',36.93,14.73,'Sicilia'],['Cefalù',38.04,14.02,'Sicilia'],['Taormina',37.85,15.29,'Sicilia'],['Lampedusa',35.50,12.60,'Sicilia']
    ]
    sic.forEach(([n,la,ln,st])=>a.push(co(n,la,ln,med,st)))

    // Sardinia
    const sar: [string,number,number,string][] = [
      ['Cagliari',39.22,9.12,'Sardegna'],['Olbia',40.92,9.50,'Sardegna'],['Alghero',40.56,8.32,'Sardegna'],['Porto Torres',40.84,8.40,'Sardegna'],['Oristano Coast',39.90,8.59,'Sardegna'],['Carloforte',39.14,8.31,'Sardegna'],['La Maddalena',41.21,9.41,'Sardegna'],['Stintino',40.94,8.22,'Sardegna'],['Villasimius',39.14,9.52,'Sardegna'],['Costa Rei',39.19,9.58,'Sardegna']
    ]
    sar.forEach(([n,la,ln,st])=>a.push(co(n,la,ln,med,st)))

    // Reservoirs
    a.push(rs('Lago di Campotosto',42.55,13.37,lt,'Abruzzo'))
    a.push(rs('Lago di Scanno',41.90,13.87,lt,'Abruzzo'))
    a.push(rs('Lago del Salto',42.19,13.10,lp,'Lazio'))
    a.push(rs('Lago di Cecita',39.40,16.53,lt,'Calabria'))
    a.push(rs('Lago Omodeo',40.10,8.93,lp,'Sardegna'))
    a.push(rs('Lago di Bomba',42.07,14.37,lp,'Abruzzo'))
    a.push(rs('Lago di Santa Giustina',46.38,11.05,lt,'Trentino-Alto Adige'))
    a.push(rs('Lago di Resia',46.80,10.53,lt,'Trentino-Alto Adige'))
    a.push(rs('Lago di Molveno',46.12,10.97,lt,'Trentino-Alto Adige'))
    a.push(rs('Lago di Ledro',45.88,10.75,lt,'Trentino-Alto Adige'))

    let ins = 0
    for (let i = 0; i < a.length; i += 200) {
      const { error } = await sb.from('fishing_locations').insert(a.slice(i, i + 200))
      if (!error) ins += Math.min(200, a.length - i); else console.error(error.message)
    }
    return new Response(JSON.stringify({ country: C, inserted: ins, total: a.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
