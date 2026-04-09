import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
type S = { name: string; lat: number; lng: number; category: string; species: string[]; state: string; country: string }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const countries = ['Austria','Croatia','Hungary','Czech Republic','Poland','Netherlands','Belgium','Portugal','Greece','Ireland']
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
    const rs = (name: string, lat: number, lng: number, sp: string[], st: string, co: string): S => ({ name: u(name), lat, lng, category: 'reservoir', species: sp, state: st, country: co })

    const fw = ['Common Carp','Northern Pike','Zander','European Perch','Wels Catfish','Barbel']
    const tr = ['Brown Trout','Rainbow Trout','Grayling','Arctic Char']
    const lp = ['Northern Pike','European Perch','Zander','Common Carp','Tench']
    const med = ['Sea Bass','Sea Bream','Dentex','Mullet','Grouper']
    const atl = ['Sea Bass','Mackerel','Pollack','Cod','Sole']

    const a: S[] = []

    // ═══════ AUSTRIA ═══════
    a.push(...rv('Donau',[
      [48.30,14.29,'Linz'],[48.25,14.85,'Grein'],[48.22,15.32,'Melk'],[48.21,15.63,'Krems'],[48.30,16.00,'Tulln'],[48.21,16.37,'Wien'],[48.14,16.87,'Hainburg']
    ],3,[...fw,'Huchen'],'Oberösterreich','Austria'))
    a.push(...rv('Inn',[
      [47.27,10.18,'Landeck'],[47.26,10.76,'Innsbruck'],[47.27,11.10,'Hall in Tirol'],[47.31,11.69,'Jenbach'],[47.50,12.10,'Kufstein'],[48.23,13.02,'Schärding']
    ],3,[...tr,'Huchen'],'Tirol','Austria'))
    a.push(...rv('Salzach',[
      [47.27,13.02,'Bischofshofen'],[47.33,13.05,'St. Johann'],[47.50,13.02,'Hallein'],[47.80,13.05,'Salzburg'],[48.17,12.83,'Burghausen area']
    ],3,tr,'Salzburg','Austria'))
    a.push(...rv('Mur',[
      [47.07,13.65,'Judenburg'],[47.07,14.44,'Leoben'],[47.07,15.44,'Graz'],[46.72,15.99,'Bad Radkersburg']
    ],3,fw,'Steiermark','Austria'))
    a.push(...rv('Drau',[
      [46.73,12.77,'Lienz'],[46.75,13.22,'Spittal'],[46.62,13.85,'Villach'],[46.63,14.31,'Klagenfurt area'],[46.58,14.95,'Lavamünd']
    ],3,[...fw,...tr],'Kärnten','Austria'))
    a.push(...rv('Enns',[
      [47.39,13.82,'Schladming area'],[47.53,14.35,'Admont'],[47.88,14.45,'Steyr'],[48.21,14.48,'Enns confluence']
    ],3,tr,'Oberösterreich','Austria'))
    a.push(...rv('Traun',[
      [47.72,13.62,'Bad Ischl'],[47.85,13.67,'Gmunden'],[47.95,13.83,'Lambach'],[48.18,14.03,'Wels'],[48.24,14.25,'Linz area']
    ],3,[...tr,'Huchen'],'Oberösterreich','Austria'))

    // Austrian Lakes
    ;[[47.53,13.43],[47.51,13.45],[47.55,13.41]].forEach(([la,ln])=>a.push(lk('Wolfgangsee',la,ln,tr,'Salzburg','Austria')))
    ;[[47.52,13.75],[47.50,13.73]].forEach(([la,ln])=>a.push(lk('Hallstätter See',la,ln,tr,'Oberösterreich','Austria')))
    ;[[47.82,13.80],[47.80,13.82],[47.78,13.78]].forEach(([la,ln])=>a.push(lk('Attersee',la,ln,lp,'Oberösterreich','Austria')))
    ;[[47.87,13.47],[47.85,13.49]].forEach(([la,ln])=>a.push(lk('Mondsee',la,ln,lp,'Oberösterreich','Austria')))
    ;[[47.82,13.69],[47.80,13.71]].forEach(([la,ln])=>a.push(lk('Traunsee',la,ln,lp,'Oberösterreich','Austria')))
    ;[[46.63,13.58],[46.60,13.60],[46.57,13.55]].forEach(([la,ln])=>a.push(lk('Millstätter See',la,ln,lp,'Kärnten','Austria')))
    ;[[46.58,13.92],[46.56,13.95]].forEach(([la,ln])=>a.push(lk('Ossiacher See',la,ln,lp,'Kärnten','Austria')))
    ;[[46.62,14.15],[46.60,14.12]].forEach(([la,ln])=>a.push(lk('Wörthersee',la,ln,lp,'Kärnten','Austria')))
    ;[[46.75,13.38],[46.73,13.40]].forEach(([la,ln])=>a.push(lk('Weißensee',la,ln,tr,'Kärnten','Austria')))
    ;[[47.45,11.44],[47.43,11.46]].forEach(([la,ln])=>a.push(lk('Achensee',la,ln,tr,'Tirol','Austria')))
    ;[[47.87,16.77],[47.85,16.80],[47.83,16.75]].forEach(([la,ln])=>a.push(lk('Neusiedler See',la,ln,lp,'Burgenland','Austria')))

    // ═══════ CROATIA ═══════
    a.push(...rv('Sava',[
      [45.88,15.77,'Zagreb area'],[45.55,16.37,'Sisak'],[45.13,17.12,'Slavonski Brod'],[45.14,17.68,'Županja'],[45.20,18.00,'Gunja area']
    ],3,fw,'Zagrebačka','Croatia'))
    a.push(...rv('Drava',[
      [46.35,16.38,'Varaždin'],[46.05,16.83,'Koprivnica area'],[45.73,17.68,'Virovitica area'],[45.55,18.40,'Osijek area'],[45.55,18.69,'Osijek']
    ],3,fw,'Osječko-baranjska','Croatia'))
    a.push(...rv('Kupa',[
      [45.48,14.78,'Ozalj'],[45.36,15.11,'Karlovac'],[45.41,15.62,'Petrinja area']
    ],3,fw,'Karlovačka','Croatia'))
    a.push(...rv('Mrežnica',[
      [45.42,15.57,'Duga Resa'],[45.36,15.41,'Generalski Stol']
    ],2,[...tr,...fw],'Karlovačka','Croatia'))
    a.push(...rv('Gacka',[
      [44.88,15.32,'Otočac'],[44.83,15.26,'Sinac']
    ],2,tr,'Ličko-senjska','Croatia'))
    a.push(...rv('Una',[
      [44.82,15.92,'Bihać area'],[45.02,16.03,'Bosanska Krupa area'],[45.21,16.23,'Hrvatska Kostajnica']
    ],2,[...tr,...fw],'Sisačko-moslavačka','Croatia'))
    a.push(...rv('Cetina',[
      [43.70,16.27,'Sinj area'],[43.54,16.50,'Trilj'],[43.44,16.70,'Omiš']
    ],2,tr,'Splitsko-dalmatinska','Croatia'))
    a.push(...rv('Krka',[
      [43.87,16.00,'Knin'],[43.80,15.97,'Drniš area'],[43.74,15.90,'Skradin']
    ],2,[...tr,...fw],'Šibensko-kninska','Croatia'))
    a.push(...rv('Neretva',[
      [43.05,17.47,'Metković'],[43.01,17.42,'Opuzen area'],[43.03,17.52,'Delta']
    ],2,fw,'Dubrovačko-neretvanska','Croatia'))

    // Croatian Coast
    const crc: [string,number,number,string][] = [
      ['Pula',44.87,13.85,'Istarska'],['Rovinj',45.08,13.63,'Istarska'],['Poreč',45.23,13.59,'Istarska'],['Umag',45.44,13.52,'Istarska'],['Rijeka',45.33,14.44,'Primorsko-goranska'],['Crikvenica',45.18,14.69,'Primorsko-goranska'],['Krk Island',45.03,14.57,'Primorsko-goranska'],['Rab Island',44.77,14.76,'Primorsko-goranska'],['Zadar',44.12,15.23,'Zadarska'],['Šibenik',43.74,15.89,'Šibensko-kninska'],['Split',43.51,16.44,'Splitsko-dalmatinska'],['Makarska',43.30,17.02,'Splitsko-dalmatinska'],['Hvar Island',43.17,16.44,'Splitsko-dalmatinska'],['Korčula',42.96,17.14,'Dubrovačko-neretvanska'],['Dubrovnik',42.65,18.09,'Dubrovačko-neretvanska'],['Vis Island',43.06,16.18,'Splitsko-dalmatinska'],['Brač Island',43.32,16.64,'Splitsko-dalmatinska'],['Murter',43.82,15.60,'Šibensko-kninska']
    ]
    crc.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,med,st,'Croatia')))

    // ═══════ HUNGARY ═══════
    a.push(...rv('Duna',[
      [47.76,18.07,'Komárom'],[47.73,18.63,'Esztergom'],[47.50,19.05,'Budapest'],[46.90,18.93,'Dunaföldvár'],[46.35,18.72,'Paks'],[46.08,18.68,'Baja'],[45.97,18.90,'Mohács']
    ],3,fw,'Pest','Hungary'))
    a.push(...rv('Tisza',[
      [48.10,20.77,'Tokaj'],[47.90,21.02,'Tiszalúc'],[47.18,20.18,'Szolnok'],[46.67,20.13,'Csongrád'],[46.25,20.15,'Szeged']
    ],3,fw,'Szolnok','Hungary'))
    a.push(...rv('Dráva',[
      [46.08,17.27,'Barcs'],[45.83,18.02,'Drávaszabolcs']
    ],2,fw,'Somogy','Hungary'))
    // Balaton
    ;[[46.85,17.73],[46.83,17.78],[46.82,17.85],[46.87,17.68],[46.90,17.62],[46.92,17.55],[46.93,17.48],[46.88,17.82],[46.80,17.90],[46.78,17.93],[46.75,17.95]].forEach(([la,ln])=>a.push(lk('Balaton',la,ln,lp,'Veszprém','Hungary')))
    ;[[47.63,20.98],[47.60,20.95],[47.58,20.92]].forEach(([la,ln])=>a.push(lk('Tisza-tó',la,ln,lp,'Heves','Hungary')))
    a.push(lk('Velencei-tó',47.23,18.60,lp,'Fejér','Hungary'))
    a.push(lk('Fertő-tó',47.68,16.80,lp,'Győr-Moson-Sopron','Hungary'))

    // ═══════ CZECH REPUBLIC ═══════
    a.push(...rv('Vltava',[
      [48.82,14.32,'Český Krumlov'],[49.02,14.42,'České Budějovice'],[49.38,14.14,'Tábor area'],[49.62,14.27,'Orlík area'],[49.82,14.40,'Kamýk area'],[50.08,14.41,'Praha']
    ],3,fw,'Středočeský','Czech Republic'))
    a.push(...rv('Labe',[
      [50.20,15.83,'Hradec Králové'],[50.20,15.30,'Pardubice area'],[50.05,14.68,'Kolín'],[50.08,14.41,'Praha confluence'],[50.41,14.10,'Mělník'],[50.66,14.03,'Ústí nad Labem'],[50.78,14.21,'Děčín']
    ],3,fw,'Ústecký','Czech Republic'))
    a.push(...rv('Morava',[
      [49.60,17.25,'Olomouc'],[49.22,17.67,'Otrokovice'],[48.85,16.88,'Hodonín'],[48.73,16.90,'Lanžhot']
    ],3,fw,'Olomoucký','Czech Republic'))
    a.push(...rv('Ohře',[
      [50.23,12.37,'Karlovy Vary'],[50.43,13.65,'Louny'],[50.53,14.15,'Litoměřice']
    ],2,fw,'Karlovarský','Czech Republic'))
    a.push(...rv('Berounka',[
      [49.75,13.38,'Plzeň'],[49.83,13.90,'Beroun'],[49.97,14.27,'Praha confluence']
    ],2,fw,'Plzeňský','Czech Republic'))
    ;[[48.90,14.75],[48.88,14.77],[48.87,14.73]].forEach(([la,ln])=>a.push(lk('Lipno',la,ln,lp,'Jihočeský','Czech Republic')))
    ;[[49.60,14.12],[49.58,14.15]].forEach(([la,ln])=>a.push(lk('Orlík',la,ln,lp,'Středočeský','Czech Republic')))
    a.push(rs('Slapy',49.82,14.40,lp,'Středočeský','Czech Republic'))
    a.push(rs('Nové Mlýny',48.87,16.63,lp,'Jihomoravský','Czech Republic'))
    a.push(rs('Vranov',48.90,15.82,lp,'Jihomoravský','Czech Republic'))

    // ═══════ POLAND ═══════
    a.push(...rv('Vistula',[
      [50.05,19.95,'Kraków'],[50.25,20.42,'Tarnobrzeg area'],[50.67,21.75,'Sandomierz'],[51.42,21.97,'Puławy'],[52.23,21.00,'Warszawa'],[52.75,19.80,'Płock'],[53.00,18.62,'Toruń'],[53.13,18.00,'Bydgoszcz area'],[54.20,18.68,'Gdańsk area'],[54.35,18.95,'Vistula mouth']
    ],3,fw,'Mazowieckie','Poland'))
    a.push(...rv('Oder',[
      [50.30,17.93,'Opole area'],[51.10,17.03,'Wrocław'],[51.65,16.08,'Głogów'],[52.73,15.23,'Kostrzyn'],[53.42,14.55,'Szczecin']
    ],3,fw,'Dolnośląskie','Poland'))
    a.push(...rv('Warta',[
      [51.40,18.82,'Sieradz area'],[52.40,16.93,'Poznań'],[52.73,15.23,'Kostrzyn confluence']
    ],3,fw,'Wielkopolskie','Poland'))
    a.push(...rv('Bug',[
      [50.67,23.60,'Hrubieszów'],[51.68,23.10,'Terespol area'],[52.53,21.73,'Serock area']
    ],3,fw,'Lubelskie','Poland'))
    a.push(...rv('San',[
      [49.57,22.07,'Lesko'],[49.68,22.12,'Sanok'],[50.07,22.30,'Jarosław area'],[50.37,22.00,'Sandomierz confluence']
    ],3,[...fw,...tr],'Podkarpackie','Poland'))
    a.push(...rv('Dunajec',[
      [49.42,20.42,'Nowy Targ area'],[49.55,20.37,'Szczawnica area'],[49.68,20.57,'Nowy Sącz'],[50.00,20.72,'Tarnów area']
    ],3,tr,'Małopolskie','Poland'))
    a.push(...rv('Narew',[
      [53.00,22.35,'Łomża'],[52.75,21.37,'Pułtusk'],[52.48,20.92,'Nowy Dwór area']
    ],2,fw,'Podlaskie','Poland'))

    // Polish Lakes (Masuria)
    ;[[53.73,21.63],[53.70,21.60],[53.68,21.65]].forEach(([la,ln])=>a.push(lk('Śniardwy',la,ln,lp,'Warmińsko-mazurskie','Poland')))
    ;[[53.95,21.55],[53.93,21.57]].forEach(([la,ln])=>a.push(lk('Mamry',la,ln,lp,'Warmińsko-mazurskie','Poland')))
    ;[[53.58,19.93],[53.55,19.95]].forEach(([la,ln])=>a.push(lk('Jeziorak',la,ln,lp,'Warmińsko-mazurskie','Poland')))
    ;[[53.82,21.42],[53.80,21.44]].forEach(([la,ln])=>a.push(lk('Niegocin',la,ln,lp,'Warmińsko-mazurskie','Poland')))
    a.push(lk('Tałty',53.85,21.55,lp,'Warmińsko-mazurskie','Poland'))
    // Polish coast
    const plc: [string,number,number][] = [
      ['Świnoujście',53.91,14.25],['Międzyzdroje',53.93,14.45],['Kołobrzeg',54.18,15.58],['Darłowo',54.42,16.38],['Ustka',54.58,16.87],['Łeba',54.75,17.55],['Władysławowo',54.79,18.40],['Hel',54.61,18.80],['Sopot',54.45,18.56],['Gdynia',54.52,18.55],['Gdańsk Coast',54.35,18.65]
    ]
    plc.forEach(([n,la,ln])=>a.push(cs(n,la,ln,['Cod','Flounder','Sea Trout','Herring','European Perch'],'Pomorskie','Poland')))

    // ═══════ NETHERLANDS ═══════
    a.push(...rv('Rhine Delta',[
      [51.97,5.92,'Arnhem'],[51.85,5.63,'Tiel'],[51.90,4.50,'Rotterdam area'],[51.98,4.12,'Hook of Holland']
    ],3,fw,'South Holland','Netherlands'))
    a.push(...rv('Maas',[
      [51.44,6.07,'Venlo'],[51.70,5.32,'s-Hertogenbosch area'],[51.80,4.68,'Dordrecht']
    ],3,fw,'North Brabant','Netherlands'))
    a.push(...rv('IJssel',[
      [52.00,6.10,'Zutphen'],[52.22,6.00,'Deventer'],[52.52,5.92,'Kampen']
    ],3,fw,'Overijssel','Netherlands'))
    ;[[52.53,5.32],[52.55,5.35],[52.57,5.30],[52.60,5.28],[52.50,5.37]].forEach(([la,ln])=>a.push(lk('IJsselmeer',la,ln,lp,'Flevoland','Netherlands')))
    ;[[52.73,5.42],[52.70,5.45]].forEach(([la,ln])=>a.push(lk('Markermeer',la,ln,lp,'North Holland','Netherlands')))
    const nlc: [string,number,number][] = [['Scheveningen',52.10,4.27],['Katwijk',52.20,4.40],['IJmuiden',52.47,4.60],['Den Helder',52.95,4.75],['Harlingen',53.17,5.42],['Ameland',53.45,5.77],['Terschelling',53.40,5.35]]
    nlc.forEach(([n,la,ln])=>a.push(cs(n,la,ln,['Cod','Plaice','Sea Bass','Sole','Mackerel'],'North Holland','Netherlands')))

    // ═══════ BELGIUM ═══════
    a.push(...rv('Meuse',[
      [50.11,5.87,'Namur'],[50.38,5.58,'Huy'],[50.63,5.57,'Liège'],[50.73,5.70,'Visé']
    ],2,fw,'Wallonia','Belgium'))
    a.push(...rv('Scheldt',[
      [50.48,3.52,'Tournai area'],[50.95,3.78,'Ghent area'],[51.22,4.40,'Antwerp']
    ],2,fw,'Flanders','Belgium'))
    const bec: [string,number,number][] = [['Ostend',51.23,2.92],['Blankenberge',51.31,3.13],['Knokke',51.35,3.28],['De Panne',51.10,2.59],['Nieuwpoort',51.15,2.73]]
    bec.forEach(([n,la,ln])=>a.push(cs(n,la,ln,atl,'West Flanders','Belgium')))

    // ═══════ PORTUGAL ═══════
    a.push(...rv('Douro',[
      [41.14,-8.62,'Porto'],[41.12,-8.10,'Peso da Régua'],[41.14,-7.07,'Barca d\'Alva']
    ],3,fw,'Norte','Portugal'))
    a.push(...rv('Tejo',[
      [39.47,-8.42,'Santarém'],[39.12,-8.78,'Vila Franca area'],[38.70,-9.12,'Lisboa']
    ],3,fw,'Lisboa','Portugal'))
    a.push(...rv('Guadiana',[
      [38.02,-7.87,'Mértola'],[37.22,-7.42,'Vila Real de Santo António']
    ],2,fw,'Algarve','Portugal'))
    a.push(...rv('Mondego',[
      [40.21,-8.43,'Coimbra'],[40.14,-8.87,'Figueira da Foz']
    ],2,fw,'Centro','Portugal'))
    const ptc: [string,number,number,string][] = [
      ['Viana do Castelo',41.69,-8.83,'Norte'],['Porto Coast',41.15,-8.68,'Norte'],['Aveiro',40.64,-8.65,'Centro'],['Nazaré',39.60,-9.07,'Centro'],['Peniche',39.36,-9.38,'Centro'],['Ericeira',38.96,-9.42,'Lisboa'],['Cascais',38.70,-9.42,'Lisboa'],['Sesimbra',38.44,-9.10,'Setúbal'],['Sines',37.95,-8.88,'Alentejo'],['Sagres',37.01,-8.94,'Algarve'],['Lagos',37.10,-8.67,'Algarve'],['Portimão',37.13,-8.54,'Algarve'],['Albufeira',37.09,-8.25,'Algarve'],['Faro',37.02,-7.93,'Algarve'],['Tavira',37.13,-7.65,'Algarve'],['Funchal (Madeira)',32.65,-16.91,'Madeira'],['Ponta Delgada (Azores)',37.74,-25.67,'Azores']
    ]
    ptc.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,['Sea Bass','Sea Bream','Mackerel','Conger Eel','Pollack','Bluefin Tuna'],st,'Portugal')))
    a.push(rs('Alqueva',38.20,-7.50,lp,'Alentejo','Portugal'))
    a.push(rs('Alqueva',38.18,-7.52,lp,'Alentejo','Portugal'))
    a.push(rs('Alqueva',38.22,-7.48,lp,'Alentejo','Portugal'))
    a.push(rs('Castelo de Bode',39.55,-8.32,lp,'Centro','Portugal'))
    a.push(rs('Castelo de Bode',39.53,-8.30,lp,'Centro','Portugal'))
    a.push(rs('Santa Clara',37.52,-8.48,lp,'Alentejo','Portugal'))

    // ═══════ GREECE ═══════
    a.push(...rv('Evros',[
      [41.67,26.57,'Didymoteicho'],[41.13,26.55,'Soufli area'],[40.85,26.03,'Alexandroupoli area']
    ],2,fw,'Eastern Macedonia','Greece'))
    a.push(...rv('Axios',[
      [41.13,22.50,'Kilkis area'],[40.65,22.70,'Thessaloniki area'],[40.52,22.72,'Delta']
    ],2,fw,'Central Macedonia','Greece'))
    a.push(...rv('Aliakmonas',[
      [40.60,21.63,'Kozani area'],[40.55,22.17,'Veria area'],[40.50,22.55,'Delta']
    ],2,fw,'Central Macedonia','Greece'))
    a.push(...rv('Acheloos',[
      [38.98,21.42,'Agrinio area'],[38.70,21.10,'Messolonghi area']
    ],2,fw,'Western Greece','Greece'))
    ;[[40.68,21.28],[40.65,21.30],[40.62,21.25]].forEach(([la,ln])=>a.push(lk('Lake Kastoria',la,ln,lp,'Western Macedonia','Greece')))
    ;[[39.63,20.85],[39.60,20.82]].forEach(([la,ln])=>a.push(lk('Lake Pamvotis',la,ln,lp,'Epirus','Greece')))
    a.push(lk('Lake Trichonida',38.57,21.55,lp,'Western Greece','Greece'))
    a.push(lk('Lake Volvi',40.68,23.48,lp,'Central Macedonia','Greece'))
    const grc: [string,number,number,string][] = [
      ['Thessaloniki',40.62,22.95,'Central Macedonia'],['Kavala',40.94,24.41,'Eastern Macedonia'],['Alexandroupoli',40.85,25.87,'Eastern Macedonia'],['Volos',39.36,22.94,'Thessaly'],['Corfu',39.62,19.92,'Ionian Islands'],['Lefkada',38.83,20.71,'Ionian Islands'],['Patras',38.25,21.73,'Western Greece'],['Nafpaktos',38.39,21.83,'Western Greece'],['Piraeus',37.95,23.65,'Attica'],['Aegina',37.75,23.43,'Attica'],['Hydra',37.35,23.47,'Attica'],['Nafplio',37.57,22.80,'Peloponnese'],['Kalamata',37.04,22.11,'Peloponnese'],['Chania (Crete)',35.52,24.02,'Crete'],['Heraklion (Crete)',35.34,25.13,'Crete'],['Agios Nikolaos (Crete)',35.19,25.72,'Crete'],['Rhodes',36.45,28.22,'South Aegean'],['Kos',36.89,27.09,'South Aegean'],['Mykonos',37.45,25.33,'South Aegean'],['Santorini',36.42,25.43,'South Aegean'],['Paros',37.08,25.15,'South Aegean'],['Lesbos',39.10,26.33,'North Aegean'],['Samos',37.75,26.97,'North Aegean'],['Zakynthos',37.79,20.90,'Ionian Islands'],['Kefalonia',38.18,20.49,'Ionian Islands']
    ]
    grc.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,med,st,'Greece')))

    // ═══════ IRELAND ═══════
    a.push(...rv('Shannon',[
      [52.67,-8.63,'Limerick'],[52.84,-7.83,'Killaloe'],[53.22,-7.90,'Athlone'],[53.53,-8.07,'Carrick-on-Shannon']
    ],2,fw,'Munster','Ireland'))
    ;[[53.90,-8.32],[53.88,-8.35],[53.85,-8.30],[53.83,-8.28]].forEach(([la,ln])=>a.push(lk('Lough Corrib',la,ln,[...lp,'Brown Trout','Atlantic Salmon'],'Connacht','Ireland')))
    ;[[53.73,-7.33],[53.70,-7.35],[53.68,-7.30]].forEach(([la,ln])=>a.push(lk('Lough Ree',la,ln,lp,'Leinster','Ireland')))
    ;[[52.92,-8.25],[52.90,-8.28]].forEach(([la,ln])=>a.push(lk('Lough Derg',la,ln,lp,'Munster','Ireland')))
    a.push(lk('Lough Mask',53.62,-9.42,lp,'Connacht','Ireland'))
    a.push(lk('Lough Conn',53.93,-9.30,[...lp,'Atlantic Salmon'],'Connacht','Ireland'))
    const iec: [string,number,number,string][] = [
      ['Dublin Bay',53.33,-6.12,'Leinster'],['Wexford',52.34,-6.46,'Leinster'],['Waterford Coast',52.15,-7.10,'Munster'],['Cork Coast',51.85,-8.47,'Munster'],['Dingle',52.14,-10.27,'Munster'],['Galway Bay',53.27,-9.05,'Connacht'],['Clifden',53.49,-10.02,'Connacht'],['Westport',53.80,-9.52,'Connacht'],['Sligo Coast',54.27,-8.47,'Connacht'],['Donegal Bay',54.63,-8.10,'Ulster'],['Malin Head',55.38,-7.38,'Ulster']
    ]
    iec.forEach(([n,la,ln,st])=>a.push(cs(n,la,ln,['Sea Bass','Mackerel','Pollack','Cod','Conger Eel','Blue Shark'],'Connacht','Ireland')))

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
