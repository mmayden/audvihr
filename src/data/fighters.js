/**
 * fighters.js — GENERATED FILE. Do not edit manually.
 * Run `npm run fetch-data` to refresh from UFCStats.com.
 * To add a new fighter: update scripts/fighter-seed.json and re-run fetch-data.
 *
 * Fighter object schema:
 * {
 *   id: Number,
 *   name: String,
 *   nickname: String,
 *   weight: String,           // 'Lightweight' | 'Welterweight' | 'Middleweight' | 'Bantamweight' | 'Heavyweight'
 *   org: String,              // 'UFC'
 *   rank: String,             // 'CHAMPION' or '#N'
 *   age: Number,              // computed from DOB at scrape time
 *   height: String,           // "5'10\""
 *   reach: String,            // '70"'
 *   stance: String,           // 'Orthodox' | 'Southpaw' | 'Switch'
 *   camp: String,             // from seed
 *   country: String,          // from seed
 *   archetype: String,        // from seed — one of ARCH_COLORS keys
 *   mods: String[],           // from seed — up to 3 modifier tags
 *   record: String,           // derived: '${wins}-${losses}'
 *   wins: Number,
 *   losses: Number,
 *   draws: Number,
 *   streak: Number,           // derived from history
 *   streakType: String,       // 'W' | 'L' (derived)
 *   finishes: { ko: Number, sub: Number, dec: Number },   // derived from full history
 *   losses_by: { ko: Number, sub: Number, dec: Number },  // derived from full history
 *   finish_rate: Number,      // % of wins by finish (derived)
 *   chin: String,             // from seed — 'Iron' | 'Solid' | 'Questionable' | 'Stopped Before'
 *   cardio: String,           // from seed — 'Elite' | 'Good' | 'Average' | 'Concern'
 *   weight_cut: String,       // from seed — 'Minimal' | 'Moderate' | 'Heavy Cutter' | 'Drain Risk'
 *   striking: {
 *     slpm: Number,           // UFCStats live
 *     str_acc: Number,        // UFCStats live
 *     sapm: Number,           // UFCStats live
 *     str_def: Number,        // UFCStats live
 *     head_pct: Number,       // from seed
 *     body_pct: Number,       // from seed
 *     leg_pct: Number,        // from seed
 *     kd_landed: Number,      // from seed
 *     kd_suffered: Number,    // from seed
 *     clinch_str_pct: Number,   // from seed
 *     distance_str_pct: Number, // from seed
 *     ground_str_pct: Number,   // from seed
 *   },
 *   grappling: {
 *     td_per15: Number,       // UFCStats live
 *     td_acc: Number,         // UFCStats live
 *     td_def: Number,         // UFCStats live
 *     sub_per15: Number,      // UFCStats live
 *     top_time_pct: Number,   // from seed
 *     bottom_time_pct: Number, // from seed
 *     ctrl_time_per15: Number, // from seed
 *     pass_rate: Number,      // from seed
 *     reversal_rate: Number,  // from seed
 *   },
 *   history: [{ result: 'W'|'L', opponent: String, method: String, round: Number, event: String, year: Number, opp_quality?: 'elite'|'contender'|'gatekeeper'|'unknown' }],
 *   market: { ml_open: '', ml_current: '', odds_ko: '', odds_sub: '', odds_dec: '', public_pct: '', notes: '' },
 *   trader_notes: String,     // from seed
 * }
 */
// Last updated: 2026-03-15T17:00:08.149Z

export const FIGHTERS = [
  { id:1, name:"Islam Makhachev", nickname:"The Dagestani", weight:"Welterweight", org:'UFC', rank:"CHAMPION",
    age:34, height:"5'10\"", reach:"70\"", stance:"Southpaw", camp:"AKA / Abdulmanap Makhachev", country:"Russia",
    archetype:"COMPLETE FIGHTER", mods:["SOUTHPAW","VOLUME STRIKER"],
    record:"28-1", wins:28, losses:1, draws:0, streak:17, streakType:'W',
    finishes:{ko:3,sub:8,dec:6}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:39,
    chin:"Solid", cardio:"Elite", weight_cut:"Moderate",
    striking:{ slpm:2.45, str_acc:58, sapm:1.45, str_def:61, head_pct:52, body_pct:28, leg_pct:20, kd_landed:4, kd_suffered:0, clinch_str_pct:35, distance_str_pct:55, ground_str_pct:10 },
    grappling:{ td_per15:3.1, td_acc:56, td_def:91, sub_per15:1, top_time_pct:62, bottom_time_pct:8, ctrl_time_per15:4.2, pass_rate:68, reversal_rate:12 },
    history:[
      {result:'W',opponent:"Jack Della Maddalena",method:'DEC',round:5,event:"UFC 322: Della Maddalena vs. Makhachev",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"Renato Moicano",method:'SUB',round:1,event:"UFC 311: Makhachev vs. Moicano",year:2025,opp_quality:'contender'},
      {result:'W',opponent:"Dustin Poirier",method:'SUB',round:5,event:"UFC 302: Makhachev vs. Poirier",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Alexander Volkanovski",method:'TKO',round:1,event:"UFC 294: Makhachev vs. Volkanovski 2",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Alexander Volkanovski",method:'DEC',round:5,event:"UFC 284: Makhachev vs. Volkanovski",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Charles Oliveira",method:'SUB',round:2,event:"UFC 280: Oliveira vs. Makhachev",year:2022,opp_quality:'elite'}
    ],
    trader_notes:"Elite grappler, historically dominant TD defense (92%). Dangerous off back against walls. Southpaw creates layered complexity vs orthodox fighters. Single career loss at 22 years old." },
  { id:2, name:"Dustin Poirier", nickname:"The Diamond", weight:"Lightweight", org:'UFC', rank:"#3",
    age:37, height:"5'9\"", reach:"72\"", stance:"Southpaw", camp:"American Top Team", country:"USA",
    archetype:"BRAWLER", mods:["KO POWER","SOUTHPAW","DURABILITY RISK"],
    record:"30-10", wins:30, losses:10, draws:0, streak:23, streakType:'W',
    finishes:{ko:12,sub:4,dec:7}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:53,
    chin:"Questionable", cardio:"Good", weight_cut:"Minimal",
    striking:{ slpm:5.24, str_acc:50, sapm:4.57, str_def:52, head_pct:58, body_pct:26, leg_pct:16, kd_landed:12, kd_suffered:5, clinch_str_pct:28, distance_str_pct:62, ground_str_pct:10 },
    grappling:{ td_per15:1.15, td_acc:35, td_def:64, sub_per15:1.2, top_time_pct:22, bottom_time_pct:18, ctrl_time_per15:1.4, pass_rate:42, reversal_rate:28 },
    history:[
      {result:'W',opponent:"Benoit Saint Denis",method:'TKO',round:2,event:"UFC 299: O'Malley vs. Vera 2",year:2024,opp_quality:'contender'},
      {result:'W',opponent:"Michael Chandler",method:'SUB',round:3,event:"UFC 281: Adesanya vs. Pereira",year:2022,opp_quality:'elite'},
      {result:'W',opponent:"Conor McGregor",method:'TKO',round:1,event:"UFC 264: Poirier vs. McGregor 3",year:2021,opp_quality:'elite'},
      {result:'W',opponent:"Conor McGregor",method:'TKO',round:2,event:"UFC 257: Poirier vs. McGregor",year:2021,opp_quality:'elite'},
      {result:'W',opponent:"Dan Hooker",method:'DEC',round:5,event:"UFC Fight Night: Poirier vs. Hooker",year:2020,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Max Holloway",method:'DEC',round:5,event:"UFC 236: Holloway vs. Poirier 2",year:2019,opp_quality:'elite'}
    ],
    trader_notes:"High output, dangerous left hook. Struggles against elite grapplers (3 sub losses). Absorbs 5.53/min — high volume both ways. Heart and volume compensate for durability questions." },
  { id:3, name:"Dricus Du Plessis", nickname:"Stillknocks", weight:"Middleweight", org:'UFC', rank:"CHAMPION",
    age:32, height:"6'1\"", reach:"76\"", stance:"Switch", camp:"EFC", country:"South Africa",
    archetype:"BRAWLER", mods:["KO POWER","GUARD DANGER"],
    record:"23-3", wins:23, losses:3, draws:0, streak:9, streakType:'W',
    finishes:{ko:4,sub:2,dec:3}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:26,
    chin:"Iron", cardio:"Good", weight_cut:"Moderate",
    striking:{ slpm:5.18, str_acc:48, sapm:4.33, str_def:52, head_pct:55, body_pct:25, leg_pct:20, kd_landed:8, kd_suffered:3, clinch_str_pct:32, distance_str_pct:58, ground_str_pct:10 },
    grappling:{ td_per15:2.22, td_acc:51, td_def:34, sub_per15:0.7, top_time_pct:30, bottom_time_pct:25, ctrl_time_per15:2.1, pass_rate:44, reversal_rate:38 },
    history:[
      {result:'W',opponent:"Sean Strickland",method:'DEC',round:5,event:"UFC 312: Du Plessis vs. Strickland 2",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"Israel Adesanya",method:'SUB',round:4,event:"UFC 305: Du Plessis vs. Adesanya",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Sean Strickland",method:'DEC',round:5,event:"UFC 297: Strickland vs. Du Plessis",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Robert Whittaker",method:'TKO',round:2,event:"UFC 290: Volkanovski vs. Rodriguez",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Derek Brunson",method:'TKO',round:2,event:"UFC 285: Jones vs. Gane",year:2023,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Darren Till",method:'SUB',round:3,event:"UFC 282: Blachowicz vs. Ankalaev",year:2022,opp_quality:'contender'}
    ],
    trader_notes:"Underrated grappling, dangerous from guard. Iron chin enables unconventional exchanges. Never backed down from contact. Fights better when hurt — pressure fighter who weaponizes damage." },
  { id:4, name:"Sean O'Malley", nickname:"Suga", weight:"Bantamweight", org:'UFC', rank:"#2",
    age:31, height:"5'11\"", reach:"72\"", stance:"Switch", camp:"MMA Lab", country:"USA",
    archetype:"COUNTER STRIKER", mods:["KO POWER","VOLUME STRIKER","FRONT-RUNNER"],
    record:"19-3", wins:19, losses:3, draws:0, streak:12, streakType:'W',
    finishes:{ko:7,sub:0,dec:5}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:37,
    chin:"Questionable", cardio:"Good", weight_cut:"Minimal",
    striking:{ slpm:6.05, str_acc:60, sapm:3.4, str_def:60, head_pct:62, body_pct:22, leg_pct:16, kd_landed:10, kd_suffered:4, clinch_str_pct:18, distance_str_pct:74, ground_str_pct:8 },
    grappling:{ td_per15:0.24, td_acc:42, td_def:60, sub_per15:0.2, top_time_pct:12, bottom_time_pct:14, ctrl_time_per15:0.6, pass_rate:30, reversal_rate:20 },
    history:[
      {result:'W',opponent:"Song Yadong",method:'DEC',round:3,event:"UFC 324: Gaethje vs. Pimblett",year:2026,opp_quality:'contender'},
      {result:'W',opponent:"Marlon Vera",method:'DEC',round:5,event:"UFC 299: O'Malley vs. Vera 2",year:2024,opp_quality:'contender'},
      {result:'W',opponent:"Aljamain Sterling",method:'TKO',round:2,event:"UFC 292: Sterling vs. O'Malley",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Petr Yan",method:'DEC',round:3,event:"UFC 280: Oliveira vs. Makhachev",year:2022,opp_quality:'elite'},
      {result:'W',opponent:"Raulian Paiva",method:'TKO',round:1,event:"UFC 269: Oliveira vs. Poirier",year:2021,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Kris Moutinho",method:'TKO',round:3,event:"UFC 264: Poirier vs. McGregor 3",year:2021,opp_quality:'gatekeeper'}
    ],
    trader_notes:"Flashy counter-striker, exceptional lateral movement. Limited wrestling (0.51 TD/15). Vulnerable to grapplers and pressure fighters. Front-runner — performs best early when fresh." },
  { id:5, name:"Merab Dvalishvili", nickname:"The Machine", weight:"Bantamweight", org:'UFC', rank:"CHAMPION",
    age:35, height:"5'6\"", reach:"68\"", stance:"Orthodox", camp:"Serra-Longo Fight Team", country:"Georgia",
    archetype:"WRESTLER", mods:["VOLUME STRIKER","LATE BLOOMER"],
    record:"21-5", wins:21, losses:5, draws:0, streak:14, streakType:'W',
    finishes:{ko:1,sub:1,dec:12}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:10,
    chin:"Solid", cardio:"Elite", weight_cut:"Minimal",
    striking:{ slpm:4.42, str_acc:41, sapm:2.8, str_def:54, head_pct:48, body_pct:30, leg_pct:22, kd_landed:2, kd_suffered:4, clinch_str_pct:42, distance_str_pct:44, ground_str_pct:14 },
    grappling:{ td_per15:5.97, td_acc:35, td_def:76, sub_per15:0.3, top_time_pct:55, bottom_time_pct:10, ctrl_time_per15:5.8, pass_rate:52, reversal_rate:18 },
    history:[
      {result:'W',opponent:"Cory Sandhagen",method:'DEC',round:5,event:"UFC 320: Ankalaev vs. Pereira 2",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"Sean O'Malley",method:'SUB',round:3,event:"UFC 316: Dvalishvili vs. O'Malley 2",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"Umar Nurmagomedov",method:'DEC',round:5,event:"UFC 311: Makhachev vs. Moicano",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"Sean O'Malley",method:'DEC',round:5,event:"UFC 306: Riyadh Season Noche UFC",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Henry Cejudo",method:'DEC',round:3,event:"UFC 298: Volkanovski vs. Topuria",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Petr Yan",method:'DEC',round:5,event:"UFC Fight Night: Yan vs. Dvalishvili",year:2023,opp_quality:'elite'}
    ],
    trader_notes:"Highest TD volume in division at 7.33/15. Cardio freak — gets stronger every round. Late bloomer dynamic is real and tradeable. Early round striking is weakness before pace takes over." },
  { id:6, name:"Paddy Pimblett", nickname:"The Baddy", weight:"Lightweight", org:'UFC', rank:"#9",
    age:31, height:"5'10\"", reach:"73\"", stance:"Orthodox", camp:"Next Generation MMA", country:"England",
    archetype:"BJJ / SUB HUNTER", mods:["GUARD DANGER","STEP-UP CONCERN","WEIGHT CUT FLAG"],
    record:"23-4", wins:23, losses:4, draws:0, streak:7, streakType:'W',
    finishes:{ko:2,sub:3,dec:2}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:22,
    chin:"Questionable", cardio:"Average", weight_cut:"Heavy Cutter",
    striking:{ slpm:5.49, str_acc:52, sapm:3.89, str_def:42, head_pct:55, body_pct:28, leg_pct:17, kd_landed:5, kd_suffered:3, clinch_str_pct:30, distance_str_pct:55, ground_str_pct:15 },
    grappling:{ td_per15:0.69, td_acc:21, td_def:44, sub_per15:1.2, top_time_pct:28, bottom_time_pct:32, ctrl_time_per15:2.8, pass_rate:38, reversal_rate:44 },
    history:[
      {result:'W',opponent:"Michael Chandler",method:'TKO',round:3,event:"UFC 314: Volkanovski vs. Lopes",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"King Green",method:'SUB',round:1,event:"UFC 304: Edwards vs. Muhammad 2",year:2024,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Tony Ferguson",method:'DEC',round:3,event:"UFC 296: Edwards vs. Covington",year:2023,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Jared Gordon",method:'DEC',round:3,event:"UFC 282: Blachowicz vs. Ankalaev",year:2022,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Jordan Leavitt",method:'SUB',round:2,event:"UFC Fight Night: Blaydes vs. Aspinall",year:2022,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Kazula Vargas",method:'SUB',round:1,event:"UFC Fight Night: Volkov vs. Aspinall",year:2022,opp_quality:'unknown'}
    ],
    trader_notes:"Excellent BJJ, dangerous sub game from guard. Striking has real holes vs elite level. Heavy cutter flag. Big name public inflation — consistently overpriced due to fanbase size." },
  { id:7, name:"Charles Oliveira", nickname:"Do Bronxs", weight:"Lightweight", org:'UFC', rank:"#2",
    age:36, height:"5'10\"", reach:"74\"", stance:"Orthodox", camp:"Chute Boxe", country:"Brazil",
    archetype:"BJJ / SUB HUNTER", mods:["GUARD DANGER","KO POWER","DURABILITY RISK"],
    record:"37-11", wins:37, losses:11, draws:0, streak:25, streakType:'W',
    finishes:{ko:4,sub:17,dec:4}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:57,
    chin:"Questionable", cardio:"Good", weight_cut:"Moderate",
    striking:{ slpm:3.23, str_acc:55, sapm:3.05, str_def:48, head_pct:58, body_pct:25, leg_pct:17, kd_landed:8, kd_suffered:6, clinch_str_pct:28, distance_str_pct:58, ground_str_pct:14 },
    grappling:{ td_per15:2.29, td_acc:39, td_def:54, sub_per15:2.6, top_time_pct:44, bottom_time_pct:28, ctrl_time_per15:3.8, pass_rate:56, reversal_rate:40 },
    history:[
      {result:'W',opponent:"Max Holloway",method:'DEC',round:5,event:"UFC 326: Holloway vs. Oliveira 2",year:2026,opp_quality:'elite'},
      {result:'W',opponent:"Mateusz Gamrot",method:'SUB',round:2,event:"UFC Fight Night: Oliveira vs. Gamrot",year:2025,opp_quality:'contender'},
      {result:'W',opponent:"Michael Chandler",method:'DEC',round:5,event:"UFC 309: Jones vs. Miocic",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Beneil Dariush",method:'TKO',round:1,event:"UFC 289: Nunes vs. Aldana",year:2023,opp_quality:'contender'},
      {result:'W',opponent:"Justin Gaethje",method:'SUB',round:1,event:"UFC 274: Oliveira vs. Gaethje",year:2022,opp_quality:'elite'},
      {result:'W',opponent:"Dustin Poirier",method:'SUB',round:3,event:"UFC 269: Oliveira vs. Poirier",year:2021,opp_quality:'elite'}
    ],
    trader_notes:"Most submissions in UFC history. Dangerous everywhere — sub threats from bottom, KO power standing. Chin issues exposed at elite LW level (4 KO losses). High-variance fighter; fights emotionally which amplifies both ceiling and floor." },
  { id:8, name:"Justin Gaethje", nickname:"The Highlight", weight:"Lightweight", org:'UFC', rank:"#5",
    age:37, height:"5'11\"", reach:"70\"", stance:"Orthodox", camp:"Elevation Fight Team", country:"USA",
    archetype:"PRESSURE FIGHTER", mods:["KO POWER","VOLUME STRIKER"],
    record:"27-5", wins:27, losses:5, draws:0, streak:10, streakType:'W',
    finishes:{ko:6,sub:0,dec:4}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:22,
    chin:"Solid", cardio:"Elite", weight_cut:"Minimal",
    striking:{ slpm:6.48, str_acc:58, sapm:7.05, str_def:51, head_pct:57, body_pct:30, leg_pct:13, kd_landed:14, kd_suffered:5, clinch_str_pct:24, distance_str_pct:65, ground_str_pct:11 },
    grappling:{ td_per15:0.33, td_acc:40, td_def:74, sub_per15:0, top_time_pct:18, bottom_time_pct:12, ctrl_time_per15:1.4, pass_rate:30, reversal_rate:22 },
    history:[
      {result:'W',opponent:"Paddy Pimblett",method:'DEC',round:5,event:"UFC 324: Gaethje vs. Pimblett",year:2026,opp_quality:'contender'},
      {result:'W',opponent:"Rafael Fiziev",method:'DEC',round:3,event:"UFC 313: Pereira vs. Ankalaev",year:2025,opp_quality:'contender'},
      {result:'W',opponent:"Dustin Poirier",method:'TKO',round:2,event:"UFC 291: Poirier vs. Gaethje 2",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Rafael Fiziev",method:'DEC',round:3,event:"UFC 286: Edwards vs. Usman 3",year:2023,opp_quality:'contender'},
      {result:'W',opponent:"Michael Chandler",method:'DEC',round:3,event:"UFC 268: Usman vs. Covington 2",year:2021,opp_quality:'elite'},
      {result:'W',opponent:"Tony Ferguson",method:'TKO',round:5,event:"UFC 249: Ferguson vs. Gaethje",year:2020,opp_quality:'gatekeeper'}
    ],
    trader_notes:"Elite pressure and leg kick volume. Iron chin — rarely stops fighting when hurt. Gets better in deep water which creates late-round betting angles. Elite competition exposure (Khabib, Makhachev, Oliveira) keeps market price honest." },
  { id:9, name:"Arman Tsarukyan", nickname:"Ahalkalakets", weight:"Lightweight", org:'UFC', rank:"#1",
    age:29, height:"5'7\"", reach:"72\"", stance:"Orthodox", camp:"Sagadat Akhmetov / Team Khabib", country:"Armenia",
    archetype:"COMPLETE FIGHTER", mods:["VOLUME STRIKER","LATE BLOOMER"],
    record:"23-3", wins:23, losses:3, draws:0, streak:10, streakType:'W',
    finishes:{ko:4,sub:1,dec:5}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:22,
    chin:"Solid", cardio:"Elite", weight_cut:"Minimal",
    striking:{ slpm:3.85, str_acc:50, sapm:1.8, str_def:54, head_pct:52, body_pct:28, leg_pct:20, kd_landed:6, kd_suffered:2, clinch_str_pct:30, distance_str_pct:60, ground_str_pct:10 },
    grappling:{ td_per15:3.26, td_acc:37, td_def:75, sub_per15:0.1, top_time_pct:48, bottom_time_pct:14, ctrl_time_per15:4.4, pass_rate:58, reversal_rate:20 },
    history:[
      {result:'W',opponent:"Dan Hooker",method:'SUB',round:2,event:"UFC Fight Night: Tsarukyan vs. Hooker",year:2025,opp_quality:'contender'},
      {result:'W',opponent:"Charles Oliveira",method:'DEC',round:3,event:"UFC 300: Pereira vs. Hill",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Beneil Dariush",method:'TKO',round:1,event:"UFC Fight Night: Dariush vs. Tsarukyan",year:2023,opp_quality:'contender'},
      {result:'W',opponent:"Joaquim Silva",method:'TKO',round:3,event:"UFC Fight Night: Vettori vs. Cannonier",year:2023,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Damir Ismagulov",method:'DEC',round:3,event:"UFC Fight Night: Cannonier vs. Strickland",year:2022,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Joel Alvarez",method:'TKO',round:2,event:"UFC Fight Night: Makhachev vs. Green",year:2022,opp_quality:'gatekeeper'}
    ],
    trader_notes:"Legitimate title contender with elite TD volume and cardio. Contested Makhachev early in his career — rematch is the market event to watch. Late bloomer tag applies: pace and output have steadily risen. Underpriced relative to skillset in non-title fights." },
  { id:10, name:"Belal Muhammad", nickname:"Remember the Name", weight:"Welterweight", org:'UFC', rank:"CHAMPION",
    age:37, height:"5'11\"", reach:"72\"", stance:"Orthodox", camp:"Overtime Athletix", country:"USA",
    archetype:"WRESTLER", mods:["VOLUME STRIKER"],
    record:"24-5", wins:24, losses:5, draws:0, streak:15, streakType:'W',
    finishes:{ko:2,sub:1,dec:12}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:13,
    chin:"Solid", cardio:"Elite", weight_cut:"Moderate",
    striking:{ slpm:4.43, str_acc:43, sapm:3.82, str_def:55, head_pct:50, body_pct:30, leg_pct:20, kd_landed:3, kd_suffered:2, clinch_str_pct:38, distance_str_pct:50, ground_str_pct:12 },
    grappling:{ td_per15:2.14, td_acc:36, td_def:90, sub_per15:0.1, top_time_pct:52, bottom_time_pct:10, ctrl_time_per15:5.2, pass_rate:60, reversal_rate:14 },
    history:[
      {result:'W',opponent:"Leon Edwards",method:'DEC',round:5,event:"UFC 304: Edwards vs. Muhammad 2",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Gilbert Burns",method:'DEC',round:5,event:"UFC 288: Sterling vs. Cejudo",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Sean Brady",method:'TKO',round:2,event:"UFC 280: Oliveira vs. Makhachev",year:2022,opp_quality:'contender'},
      {result:'W',opponent:"Vicente Luque",method:'DEC',round:5,event:"UFC Fight Night: Luque vs. Muhammad",year:2022,opp_quality:'contender'},
      {result:'W',opponent:"Stephen Thompson",method:'DEC',round:3,event:"UFC Fight Night: Lewis vs. Daukaus",year:2021,opp_quality:'elite'},
      {result:'W',opponent:"Demian Maia",method:'DEC',round:3,event:"UFC 263: Adesanya vs. Vettori 2",year:2021,opp_quality:'gatekeeper'}
    ],
    trader_notes:"Pressure grappler who controls pace and position. Decision machine — only 48% finish rate but controls every minute of fight time. Elite TD defense means he can dictate where the fight goes. Historically underrated; now correctly priced as champion." },
  { id:11, name:"Leon Edwards", nickname:"Rocky", weight:"Welterweight", org:'UFC', rank:"#1",
    age:34, height:"6'2\"", reach:"74\"", stance:"Southpaw", camp:"BCMMA", country:"England",
    archetype:"COMPLETE FIGHTER", mods:["SOUTHPAW","VOLUME STRIKER"],
    record:"22-6", wins:22, losses:6, draws:0, streak:14, streakType:'W',
    finishes:{ko:3,sub:1,dec:10}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:18,
    chin:"Solid", cardio:"Good", weight_cut:"Minimal",
    striking:{ slpm:2.6, str_acc:54, sapm:2.44, str_def:52, head_pct:52, body_pct:28, leg_pct:20, kd_landed:7, kd_suffered:3, clinch_str_pct:22, distance_str_pct:66, ground_str_pct:12 },
    grappling:{ td_per15:1.25, td_acc:37, td_def:63, sub_per15:0.4, top_time_pct:32, bottom_time_pct:16, ctrl_time_per15:2.8, pass_rate:42, reversal_rate:24 },
    history:[
      {result:'W',opponent:"Colby Covington",method:'DEC',round:5,event:"UFC 296: Edwards vs. Covington",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Kamaru Usman",method:'DEC',round:5,event:"UFC 286: Edwards vs. Usman 3",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Kamaru Usman",method:'TKO',round:5,event:"UFC 278: Usman vs. Edwards",year:2022,opp_quality:'elite'},
      {result:'W',opponent:"Nate Diaz",method:'DEC',round:5,event:"UFC 263: Adesanya vs. Vettori 2",year:2021,opp_quality:'contender'},
      {result:'W',opponent:"Rafael Dos Anjos",method:'DEC',round:5,event:"UFC Fight Night: Dos Anjos vs. Edwards",year:2019,opp_quality:'elite'},
      {result:'W',opponent:"Gunnar Nelson",method:'DEC',round:3,event:"UFC Fight Night: Till vs. Masvidal",year:2019,opp_quality:'gatekeeper'}
    ],
    trader_notes:"KO of the year pedigree vs Usman — southpaw check hook is legitimate. Well-rounded but not elite in any single area; wins through composure and output. Rematch with Muhammad is the defining market. Historically underdog-priced before title wins." },
  { id:12, name:"Jack Della Maddalena", nickname:"JDM", weight:"Welterweight", org:'UFC', rank:"#3",
    age:29, height:"5'11\"", reach:"73\"", stance:"Switch", camp:"SBG Australia", country:"Australia",
    archetype:"KICKBOXER", mods:["KO POWER","FRONT-RUNNER"],
    record:"18-3", wins:18, losses:3, draws:0, streak:9, streakType:'W',
    finishes:{ko:4,sub:1,dec:4}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:28,
    chin:"Questionable", cardio:"Good", weight_cut:"Minimal",
    striking:{ slpm:5.57, str_acc:51, sapm:3.84, str_def:63, head_pct:55, body_pct:28, leg_pct:17, kd_landed:11, kd_suffered:4, clinch_str_pct:18, distance_str_pct:72, ground_str_pct:10 },
    grappling:{ td_per15:0.13, td_acc:10, td_def:64, sub_per15:0.1, top_time_pct:14, bottom_time_pct:18, ctrl_time_per15:0.8, pass_rate:28, reversal_rate:24 },
    history:[
      {result:'W',opponent:"Belal Muhammad",method:'DEC',round:5,event:"UFC 315: Muhammad vs. Della Maddalena",year:2025,opp_quality:'elite'},
      {result:'W',opponent:"Gilbert Burns",method:'TKO',round:3,event:"UFC 299: O'Malley vs. Vera 2",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Kevin Holland",method:'DEC',round:3,event:"UFC Fight Night: Grasso vs. Shevchenko 2",year:2023,opp_quality:'contender'},
      {result:'W',opponent:"Bassil Hafez",method:'DEC',round:3,event:"UFC Fight Night: Holm vs. Bueno Silva",year:2023,opp_quality:'unknown'},
      {result:'W',opponent:"Randy Brown",method:'SUB',round:1,event:"UFC 284: Makhachev vs. Volkanovski",year:2023,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Danny Roberts",method:'TKO',round:1,event:"UFC Fight Night: Nzechukwu vs. Cutelaba",year:2022,opp_quality:'unknown'}
    ],
    trader_notes:"Fastest KO rate in WW division. Reaches full output early — front-runner flag means rounds 1-2 are peak danger. Both career losses came by KO, suggesting chin questions at elite level not yet fully answered. Watch line when elite wrestlers are matched against him." },
  { id:13, name:"Jon Jones", nickname:"Bones", weight:"Heavyweight", org:'UFC', rank:"CHAMPION",
    age:38, height:"6'4\"", reach:"84\"", stance:"Orthodox", camp:"Jackson-Wink MMA", country:"USA",
    archetype:"COMPLETE FIGHTER", mods:["VOLUME STRIKER","KO POWER"],
    record:"28-1", wins:28, losses:1, draws:0, streak:22, streakType:'W',
    finishes:{ko:6,sub:6,dec:10}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:43,
    chin:"Iron", cardio:"Good", weight_cut:"Moderate",
    striking:{ slpm:4.38, str_acc:58, sapm:2.24, str_def:64, head_pct:44, body_pct:32, leg_pct:24, kd_landed:10, kd_suffered:2, clinch_str_pct:36, distance_str_pct:54, ground_str_pct:10 },
    grappling:{ td_per15:1.89, td_acc:45, td_def:95, sub_per15:0.5, top_time_pct:42, bottom_time_pct:10, ctrl_time_per15:3.6, pass_rate:62, reversal_rate:16 },
    history:[
      {result:'W',opponent:"Stipe Miocic",method:'TKO',round:3,event:"UFC 309: Jones vs. Miocic",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Ciryl Gane",method:'SUB',round:1,event:"UFC 285: Jones vs. Gane",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Dominick Reyes",method:'DEC',round:5,event:"UFC 247: Jones vs. Reyes",year:2020,opp_quality:'contender'},
      {result:'W',opponent:"Thiago Santos",method:'DEC',round:5,event:"UFC 239: Jones vs. Santos",year:2019,opp_quality:'contender'},
      {result:'W',opponent:"Anthony Smith",method:'DEC',round:5,event:"UFC 235: Jones vs. Smith",year:2019,opp_quality:'contender'},
      {result:'W',opponent:"Alexander Gustafsson",method:'TKO',round:3,event:"UFC 232: Jones vs. Gustafsson 2",year:2018,opp_quality:'elite'}
    ],
    trader_notes:"Generationally complete skillset — elite in every dimension simultaneously. Reach (84\") and intelligence create near-unsolvable puzzles. Only technical loss (Hamill, 2009) was a DQ; effectively unbeaten. Father time is the only real market risk. Heavily favorited in all markets; line movement on Jones fights is rare and significant when it occurs." },
  { id:14, name:"Tom Aspinall", nickname:"The Kestrel", weight:"Heavyweight", org:'UFC', rank:"#1",
    age:32, height:"6'5\"", reach:"78\"", stance:"Orthodox", camp:"Team Kaobon", country:"England",
    archetype:"COMPLETE FIGHTER", mods:["KO POWER"],
    record:"15-3", wins:15, losses:3, draws:0, streak:8, streakType:'W',
    finishes:{ko:6,sub:2,dec:0}, losses_by:{ko:0,sub:0,dec:0}, finish_rate:53,
    chin:"Solid", cardio:"Elite", weight_cut:"Minimal",
    striking:{ slpm:7.63, str_acc:67, sapm:3.62, str_def:56, head_pct:52, body_pct:30, leg_pct:18, kd_landed:9, kd_suffered:3, clinch_str_pct:26, distance_str_pct:62, ground_str_pct:12 },
    grappling:{ td_per15:2.62, td_acc:80, td_def:100, sub_per15:1.3, top_time_pct:28, bottom_time_pct:16, ctrl_time_per15:2.2, pass_rate:44, reversal_rate:28 },
    history:[
      {result:'W',opponent:"Curtis Blaydes",method:'TKO',round:1,event:"UFC 304: Edwards vs. Muhammad 2",year:2024,opp_quality:'elite'},
      {result:'W',opponent:"Sergei Pavlovich",method:'TKO',round:1,event:"UFC 295: Prochazka vs. Pereira",year:2023,opp_quality:'elite'},
      {result:'W',opponent:"Marcin Tybura",method:'TKO',round:1,event:"UFC Fight Night: Aspinall vs. Tybura",year:2023,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Alexander Volkov",method:'SUB',round:1,event:"UFC Fight Night: Volkov vs. Aspinall",year:2022,opp_quality:'contender'},
      {result:'W',opponent:"Serghei Spivac",method:'TKO',round:1,event:"UFC Fight Night: Brunson vs. Till",year:2021,opp_quality:'gatekeeper'},
      {result:'W',opponent:"Andrei Arlovski",method:'SUB',round:2,event:"UFC Fight Night: Blaydes vs. Lewis",year:2021,opp_quality:'gatekeeper'}
    ],
    trader_notes:"Highest finishing rate among elite HW contenders. Extremely fast for the weight class — elite cardio is a major edge over aging division. Knee injury history warrants monitoring (suffered during Blaydes fight at UFC 304). Jones unification fight is the market event; currently priced as underdog but skillset gap is smaller than public believes." },
];
