/**
 * odds.js — GENERATED FILE. Do not edit manually.
 * Run `npm run fetch-odds` to refresh from BestFightOdds.com.
 *
 * Odds object schema (keyed by fightKey — same as normalizeOdds.js):
 * {
 *   [fightKey: string]: {
 *     fighter1:  string,           // display name as listed on BFO
 *     fighter2:  string,
 *     fightKey:  string,           // sorted last-names joined by '_'
 *     event:     string,           // event name (e.g. 'UFC Seattle')
 *     books: [{
 *       source:  string,           // sportsbook name (e.g. 'FanDuel')
 *       f1_ml:   string,           // American moneyline for fighter 1
 *       f2_ml:   string,           // American moneyline for fighter 2
 *     }],
 *     best: {                      // tightest spread across all books (or null)
 *       source:  string,
 *       f1_ml:   string,
 *       f2_ml:   string,
 *     } | null,
 *     ts: string,                  // ISO timestamp of scrape
 *   }
 * }
 */
// Last updated: 2026-03-25T05:41:54.673Z

export const ODDS = {
  'bahamondes_musayev': {
    fighter1:"Ignacio Bahamondes", fighter2:"Tofiq Musayev",
    fightKey:'bahamondes_musayev', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-295',f2_ml:'+220'},{source:"Caesars",f1_ml:'-300',f2_ml:'+240'},{source:"BetRivers",f1_ml:'-305',f2_ml:'+240'},{source:"BetWay",f1_ml:'-333',f2_ml:'+250'},{source:"Unibet",f1_ml:'-305',f2_ml:'+240'}],
    best:{source:"FanDuel",f1_ml:'-295',f2_ml:'+220'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'hooper_jr': {
    fighter1:"Chase Hooper", fighter2:"Lance Gibson Jr",
    fightKey:'hooper_jr', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-280',f2_ml:'+210'},{source:"Caesars",f1_ml:'-270',f2_ml:'+220'},{source:"BetRivers",f1_ml:'-275',f2_ml:'+210'},{source:"BetWay",f1_ml:'-250',f2_ml:'+200'},{source:"Unibet",f1_ml:'-275',f2_ml:'+210'}],
    best:{source:"BetWay",f1_ml:'-250',f2_ml:'+200'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'fortune_tybura': {
    fighter1:"Marcin Tybura", fighter2:"Tyrell Fortune",
    fightKey:'fortune_tybura', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-104',f2_ml:'-122'},{source:"Caesars",f1_ml:'+110',f2_ml:'-130'},{source:"BetRivers",f1_ml:'+107',f2_ml:'-132'},{source:"BetWay",f1_ml:'+100',f2_ml:'-125'},{source:"Unibet",f1_ml:'+107',f2_ml:'-132'}],
    best:{source:"BetWay",f1_ml:'+100',f2_ml:'-125'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'fernandes_oneill': {
    fighter1:"Casey Oneill", fighter2:"Gabriella Fernandes",
    fightKey:'fernandes_oneill', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-113',f2_ml:'-113'},{source:"Caesars",f1_ml:'-110',f2_ml:'-110'},{source:"BetRivers",f1_ml:'+102',f2_ml:'-127'},{source:"BetWay",f1_ml:'+100',f2_ml:'-125'},{source:"Unibet",f1_ml:'+102',f2_ml:'-127'}],
    best:{source:"Caesars",f1_ml:'-110',f2_ml:'-110'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'lopes_stirling': {
    fighter1:"Bruno Lopes", fighter2:"Navajo Stirling",
    fightKey:'lopes_stirling', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'+310',f2_ml:'-440'},{source:"Caesars",f1_ml:'+460',f2_ml:'-650'},{source:"BetRivers",f1_ml:'+390',f2_ml:'-530'},{source:"BetWay",f1_ml:'+400',f2_ml:'-549'},{source:"Unibet",f1_ml:'+390',f2_ml:'-530'}],
    best:{source:"FanDuel",f1_ml:'+310',f2_ml:'-440'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'simon_yanez': {
    fighter1:"Adrian Yanez", fighter2:"Ricky Simon",
    fightKey:'simon_yanez', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'+124',f2_ml:'-158'},{source:"Caesars",f1_ml:'+115',f2_ml:'-135'},{source:"BetRivers",f1_ml:'+116',f2_ml:'-143'},{source:"BetWay",f1_ml:'+120',f2_ml:'-150'},{source:"Unibet",f1_ml:'+116',f2_ml:'-143'}],
    best:{source:"Caesars",f1_ml:'+115',f2_ml:'-135'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'brasil_thainara': {
    fighter1:"Alexia Thainara", fighter2:"Bruna Brasil",
    fightKey:'brasil_thainara', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-480',f2_ml:'+330'},{source:"Caesars",f1_ml:'-700',f2_ml:'+500'},{source:"BetRivers",f1_ml:'-625',f2_ml:'+450'},{source:"BetWay",f1_ml:'-649',f2_ml:'+450'},{source:"Unibet",f1_ml:'-625',f2_ml:'+450'}],
    best:{source:"FanDuel",f1_ml:'-480',f2_ml:'+330'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'adesanya_pyfer': {
    fighter1:"Israel Adesanya", fighter2:"Joe Pyfer",
    fightKey:'adesanya_pyfer', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-130',f2_ml:'+102'},{source:"Caesars",f1_ml:'-135',f2_ml:'+115'},{source:"BetRivers",f1_ml:'-139',f2_ml:'+112'},{source:"BetWay",f1_ml:'-138',f2_ml:'+110'},{source:"Unibet",f1_ml:'-139',f2_ml:'+112'}],
    best:{source:"FanDuel",f1_ml:'-130',f2_ml:'+102'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'barber_grasso': {
    fighter1:"Alexa Grasso", fighter2:"Maycee Barber",
    fightKey:'barber_grasso', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'+124',f2_ml:'-158'},{source:"Caesars",f1_ml:'+150',f2_ml:'-180'},{source:"BetRivers",f1_ml:'+138',f2_ml:'-175'},{source:"BetWay",f1_ml:'+130',f2_ml:'-175'},{source:"Unibet",f1_ml:'+138',f2_ml:'-175'}],
    best:{source:"FanDuel",f1_ml:'+124',f2_ml:'-158'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'douglas_erosa': {
    fighter1:"Julian Erosa", fighter2:"Lerryan Douglas",
    fightKey:'douglas_erosa', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'+235',f2_ml:'-320'},{source:"Caesars",f1_ml:'+240',f2_ml:'-300'},{source:"BetRivers",f1_ml:'+250',f2_ml:'-335'},{source:"BetWay",f1_ml:'+210',f2_ml:'-275'},{source:"Unibet",f1_ml:'+250',f2_ml:'-335'}],
    best:{source:"BetWay",f1_ml:'+210',f2_ml:'-275'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'abdul-malik_belgaroui': {
    fighter1:"Mansur Abdul-Malik", fighter2:"Yousri Belgaroui",
    fightKey:'abdul-malik_belgaroui', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'-158',f2_ml:'+124'},{source:"Caesars",f1_ml:'-125',f2_ml:'+105'},{source:"BetRivers",f1_ml:'-127',f2_ml:'+102'},{source:"BetWay",f1_ml:'-120',f2_ml:'-105'},{source:"Unibet",f1_ml:'-127',f2_ml:'+102'}],
    best:{source:"BetWay",f1_ml:'-120',f2_ml:'-105'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'chiesa_price': {
    fighter1:"Michael Chiesa", fighter2:"Niko Price",
    fightKey:'chiesa_price', event:"UFC Seattle",
    books:[{source:"Caesars",f1_ml:'-600',f2_ml:'+430'},{source:"BetRivers",f1_ml:'-670',f2_ml:'+475'},{source:"BetWay",f1_ml:'-549',f2_ml:'+400'},{source:"Unibet",f1_ml:'-670',f2_ml:'+475'}],
    best:{source:"BetWay",f1_ml:'-549',f2_ml:'+400'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'mckinney_nelson': {
    fighter1:"Kyle Nelson", fighter2:"Terrance McKinney",
    fightKey:'mckinney_nelson', event:"UFC Seattle",
    books:[{source:"FanDuel",f1_ml:'+118',f2_ml:'-150'},{source:"Caesars",f1_ml:'+143',f2_ml:'-170'},{source:"BetRivers",f1_ml:'+143',f2_ml:'-180'},{source:"BetWay",f1_ml:'+140',f2_ml:'-175'},{source:"Unibet",f1_ml:'+143',f2_ml:'-180'}],
    best:{source:"FanDuel",f1_ml:'+118',f2_ml:'-150'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'duncan_moicano': {
    fighter1:"Chris Duncan", fighter2:"Renato Moicano",
    fightKey:'duncan_moicano', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-188',f2_ml:'+140'}],
    best:{source:"BetWay",f1_ml:'-188',f2_ml:'+140'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'jandiroba_ricci': {
    fighter1:"Tabatha Ricci", fighter2:"Virna Jandiroba",
    fightKey:'jandiroba_ricci', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-105',f2_ml:'-125'}],
    best:{source:"BetWay",f1_ml:'-105',f2_ml:'-125'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'ribeiro_yakhyaev': {
    fighter1:"Abdul Rakhman Yakhyaev", fighter2:"Brendson Ribeiro",
    fightKey:'ribeiro_yakhyaev', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-1000',f2_ml:'+500'}],
    best:{source:"BetWay",f1_ml:'-1000',f2_ml:'+500'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'estevam_ewing': {
    fighter1:"Ethyn Ewing", fighter2:"Rafael Estevam",
    fightKey:'estevam_ewing', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-110',f2_ml:'-110'}],
    best:{source:"BetWay",f1_ml:'-110',f2_ml:'-110'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'mcmillen_zecchini': {
    fighter1:"Manolo Zecchini", fighter2:"Tommy McMillen",
    fightKey:'mcmillen_zecchini', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'+400',f2_ml:'-649'}],
    best:{source:"BetWay",f1_ml:'+400',f2_ml:'-649'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'henrique_radtke': {
    fighter1:"Charles Radtke", fighter2:"Jose Henrique",
    fightKey:'henrique_radtke', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-250',f2_ml:'+175'}],
    best:{source:"BetWay",f1_ml:'-250',f2_ml:'+175'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'delano_ruchala': {
    fighter1:"Jose Delano", fighter2:"Robert Ruchala",
    fightKey:'delano_ruchala', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-400',f2_ml:'+275'}],
    best:{source:"BetWay",f1_ml:'-400',f2_ml:'+275'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'costa_nicoll': {
    fighter1:"Alessandro Costa", fighter2:"Stewart Nicoll",
    fightKey:'costa_nicoll', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-350',f2_ml:'+240'}],
    best:{source:"BetWay",f1_ml:'-350',f2_ml:'+240'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'flowers_vannata': {
    fighter1:"Darrius Flowers", fighter2:"Lando Vannata",
    fightKey:'flowers_vannata', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'+175',f2_ml:'-250'}],
    best:{source:"BetWay",f1_ml:'+175',f2_ml:'-250'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'cowan_pereira': {
    fighter1:"Alice Pereira", fighter2:"Hailey Cowan",
    fightKey:'cowan_pereira', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-110',f2_ml:'-110'}],
    best:{source:"BetWay",f1_ml:'-110',f2_ml:'-110'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'pat_petersen': {
    fighter1:"Guilherme Pat", fighter2:"Thomas Petersen",
    fightKey:'pat_petersen', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-125',f2_ml:'-105'}],
    best:{source:"BetWay",f1_ml:'-125',f2_ml:'-105'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'bekoev_gore': {
    fighter1:"Azamt Bekoev", fighter2:"Tresean Gore",
    fightKey:'bekoev_gore', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-450',f2_ml:'+300'}],
    best:{source:"BetWay",f1_ml:'-450',f2_ml:'+300'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'barbosa_gatto': {
    fighter1:"Dione Barbosa", fighter2:"Melissa Gatto",
    fightKey:'barbosa_gatto', event:"UFC Vegas 115",
    books:[{source:"BetWay",f1_ml:'-150',f2_ml:'+110'}],
    best:{source:"BetWay",f1_ml:'-150',f2_ml:'+110'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'prochazka_ulberg': {
    fighter1:"Carlos Ulberg", fighter2:"Jiri Prochazka",
    fightKey:'prochazka_ulberg', event:"UFC 327",
    books:[{source:"FanDuel",f1_ml:'+114',f2_ml:'-146'},{source:"Caesars",f1_ml:'+105',f2_ml:'-135'},{source:"BetRivers",f1_ml:'+107',f2_ml:'-132'},{source:"BetWay",f1_ml:'-105',f2_ml:'-120'},{source:"Unibet",f1_ml:'+107',f2_ml:'-132'}],
    best:{source:"BetWay",f1_ml:'-105',f2_ml:'-120'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'maddalena_prates': {
    fighter1:"Carlos Prates", fighter2:"Jack Della Maddalena",
    fightKey:'maddalena_prates', event:"UFC Perth",
    books:[{source:"FanDuel",f1_ml:'-102',f2_ml:'-125'},{source:"Caesars",f1_ml:'-110',f2_ml:'-120'},{source:"BetWay",f1_ml:'+100',f2_ml:'-125'}],
    best:{source:"BetWay",f1_ml:'+100',f2_ml:'-125'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'green_stephens': {
    fighter1:"Jeremy Stephens", fighter2:"King Green",
    fightKey:'green_stephens', event:"UFC 328",
    books:[{source:"BetWay",f1_ml:'+175',f2_ml:'-250'}],
    best:{source:"BetWay",f1_ml:'+175',f2_ml:'-250'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'cortes-acosta_volkov': {
    fighter1:"Alexander Volkov", fighter2:"Waldo Cortes-Acosta",
    fightKey:'cortes-acosta_volkov', event:"UFC 328",
    books:[{source:"FanDuel",f1_ml:'-158',f2_ml:'+124'},{source:"BetWay",f1_ml:'-138',f2_ml:'+105'}],
    best:{source:"BetWay",f1_ml:'-138',f2_ml:'+105'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'brady_buckley': {
    fighter1:"Joaquin Buckley", fighter2:"Sean Brady",
    fightKey:'brady_buckley', event:"UFC 328",
    books:[{source:"FanDuel",f1_ml:'+164',f2_ml:'-215'},{source:"BetWay",f1_ml:'+150',f2_ml:'-200'}],
    best:{source:"BetWay",f1_ml:'+150',f2_ml:'-200'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'blachowicz_guskov': {
    fighter1:"Bogdan Guskov", fighter2:"Jan Blachowicz",
    fightKey:'blachowicz_guskov', event:"UFC 328",
    books:[{source:"FanDuel",f1_ml:'-174',f2_ml:'+136'},{source:"BetWay",f1_ml:'-163',f2_ml:'+120'}],
    best:{source:"BetWay",f1_ml:'-163',f2_ml:'+120'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'chimaev_strickland': {
    fighter1:"Khamzat Chimaev", fighter2:"Sean Strickland",
    fightKey:'chimaev_strickland', event:"UFC 328",
    books:[{source:"FanDuel",f1_ml:'-440',f2_ml:'+310'},{source:"Caesars",f1_ml:'-500',f2_ml:'+325'},{source:"BetRivers",f1_ml:'-560',f2_ml:'+410'},{source:"BetWay",f1_ml:'-450',f2_ml:'+333'},{source:"Unibet",f1_ml:'-560',f2_ml:'+410'}],
    best:{source:"FanDuel",f1_ml:'-440',f2_ml:'+310'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'gane_pereira': {
    fighter1:"Alex Pereira", fighter2:"Ciryl Gane",
    fightKey:'gane_pereira', event:"UFC Freedom Fights 250",
    books:[{source:"FanDuel",f1_ml:'-120',f2_ml:'-106'},{source:"Caesars",f1_ml:'-120',f2_ml:'+100'},{source:"BetRivers",f1_ml:'-112',f2_ml:'-112'},{source:"BetWay",f1_ml:'-120',f2_ml:'-105'},{source:"Unibet",f1_ml:'-112',f2_ml:'-112'}],
    best:{source:"Caesars",f1_ml:'-120',f2_ml:'+100'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'omalley_zahabi': {
    fighter1:"Aiemann Zahabi", fighter2:"Sean Omalley",
    fightKey:'omalley_zahabi', event:"UFC Freedom Fights 250",
    books:[{source:"FanDuel",f1_ml:'+280',f2_ml:'-390'},{source:"Caesars",f1_ml:'+300',f2_ml:'-400'},{source:"BetRivers",f1_ml:'+295',f2_ml:'-385'},{source:"BetWay",f1_ml:'+260',f2_ml:'-350'},{source:"Unibet",f1_ml:'+295',f2_ml:'-385'}],
    best:{source:"BetWay",f1_ml:'+260',f2_ml:'-350'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'chandler_ruffy': {
    fighter1:"Mauricio Ruffy", fighter2:"Michael Chandler",
    fightKey:'chandler_ruffy', event:"UFC Freedom Fights 250",
    books:[{source:"FanDuel",f1_ml:'-480',f2_ml:'+330'},{source:"Caesars",f1_ml:'-600',f2_ml:'+380'},{source:"BetRivers",f1_ml:'-480',f2_ml:'+350'},{source:"BetWay",f1_ml:'-649',f2_ml:'+450'},{source:"Unibet",f1_ml:'-480',f2_ml:'+350'}],
    best:{source:"FanDuel",f1_ml:'-480',f2_ml:'+330'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'daukaus_nickal': {
    fighter1:"Bo Nickal", fighter2:"Kyle Daukaus",
    fightKey:'daukaus_nickal', event:"UFC Freedom Fights 250",
    books:[{source:"FanDuel",f1_ml:'-330',f2_ml:'+240'},{source:"Caesars",f1_ml:'-350',f2_ml:'+250'},{source:"BetRivers",f1_ml:'-335',f2_ml:'+250'},{source:"BetWay",f1_ml:'-333',f2_ml:'+250'},{source:"Unibet",f1_ml:'-335',f2_ml:'+250'}],
    best:{source:"FanDuel",f1_ml:'-330',f2_ml:'+240'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'garcia_lopes': {
    fighter1:"Diego Lopes", fighter2:"Steve Garcia",
    fightKey:'garcia_lopes', event:"UFC Freedom Fights 250",
    books:[{source:"FanDuel",f1_ml:'-200',f2_ml:'+154'},{source:"Caesars",f1_ml:'-200',f2_ml:'+150'},{source:"BetRivers",f1_ml:'-186',f2_ml:'+150'},{source:"BetWay",f1_ml:'-175',f2_ml:'+140'},{source:"Unibet",f1_ml:'-186',f2_ml:'+150'}],
    best:{source:"BetWay",f1_ml:'-175',f2_ml:'+140'},
    ts:'2026-03-25T05:41:54.673Z',
  },
  'gaethje_topuria': {
    fighter1:"Ilia Topuria", fighter2:"Justin Gaethje",
    fightKey:'gaethje_topuria', event:"UFC Freedom Fights 250",
    books:[{source:"FanDuel",f1_ml:'-520',f2_ml:'+350'},{source:"Caesars",f1_ml:'-600',f2_ml:'+380'},{source:"BetWay",f1_ml:'-549',f2_ml:'+400'},{source:"Unibet",f1_ml:'-770',f2_ml:'+525'}],
    best:{source:"FanDuel",f1_ml:'-520',f2_ml:'+350'},
    ts:'2026-03-25T05:41:54.673Z',
  },
};
