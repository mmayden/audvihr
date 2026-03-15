/**
 * markets.js — active UFC prediction market opportunities.
 *
 * Schema: {
 *   id:          String    — unique identifier
 *   event:       String    — event name e.g. 'UFC 315'
 *   eventDate:   String    — ISO date of the event
 *   fighter1:    String    — name matching FIGHTERS roster (or standalone)
 *   fighter2:    String
 *   weight:      String    — weight class
 *   isTitle:     Boolean
 *   closing:     String    — ISO date when market closes (typically same as eventDate)
 *   platforms: [{
 *     name:   String       — 'Polymarket' | 'Kalshi' | 'Novig'
 *     f1_ml:  String       — American moneyline for fighter1 e.g. '-130'
 *     f2_ml:  String       — American moneyline for fighter2 e.g. '+108'
 *     volume: Number       — USD volume (24h)
 *   }]
 *   method_props: [{
 *     label: String        — 'KO/TKO' | 'Submission' | 'Decision'
 *     ml:    String        — American moneyline for this method outcome
 *   }]
 * }
 *
 * Arbitrage detection: if min(f1 implied across platforms) + min(f2 implied across platforms) < 100,
 * a cross-platform arb opportunity exists. See MarketsScreen for the computation.
 */

export const MARKETS = [
  {
    id: 'ufc315-main',
    event: 'UFC 315',
    eventDate: '2026-03-21',
    fighter1: 'Arman Tsarukyan',
    fighter2: 'Justin Gaethje',
    weight: 'Lightweight',
    isTitle: true,
    closing: '2026-03-21',
    platforms: [
      { name: 'Polymarket', f1_ml: '-130', f2_ml: '+108', volume: 284000 },
      { name: 'Kalshi',     f1_ml: '-125', f2_ml: '+104', volume: 156000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '+155' },
      { label: 'Submission', ml: '+240' },
      { label: 'Decision',   ml: '-120' },
    ],
  },
  {
    id: 'ufc315-comain',
    event: 'UFC 315',
    eventDate: '2026-03-21',
    fighter1: 'Jack Della Maddalena',
    fighter2: 'Gilbert Burns',
    weight: 'Welterweight',
    isTitle: false,
    closing: '2026-03-21',
    platforms: [
      { name: 'Polymarket', f1_ml: '-185', f2_ml: '+152', volume: 44000 },
      { name: 'Kalshi',     f1_ml: '-180', f2_ml: '+148', volume: 28000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '-140' },
      { label: 'Submission', ml: '+340' },
      { label: 'Decision',   ml: '+280' },
    ],
  },
  {
    id: 'ufcfn-main',
    event: 'UFC Fight Night',
    eventDate: '2026-03-28',
    fighter1: 'Charles Oliveira',
    fighter2: 'Beneil Dariush',
    weight: 'Lightweight',
    isTitle: false,
    closing: '2026-03-28',
    // ARB ALERT: bestF1 (Polymarket -155 = 60.8%) + bestF2 (Kalshi +170 = 37.0%) = 97.8%
    platforms: [
      { name: 'Polymarket', f1_ml: '-155', f2_ml: '+130', volume: 68000 },
      { name: 'Kalshi',     f1_ml: '-195', f2_ml: '+170', volume: 38000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '+190' },
      { label: 'Submission', ml: '+115' },
      { label: 'Decision',   ml: '+210' },
    ],
  },
  {
    id: 'ufc316-main',
    event: 'UFC 316',
    eventDate: '2026-04-18',
    fighter1: 'Merab Dvalishvili',
    fighter2: 'Umar Nurmagomedov',
    weight: 'Bantamweight',
    isTitle: true,
    closing: '2026-04-18',
    platforms: [
      { name: 'Polymarket', f1_ml: '-145', f2_ml: '+118', volume: 152000 },
      { name: 'Kalshi',     f1_ml: '-140', f2_ml: '+114', volume: 96000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '+280' },
      { label: 'Submission', ml: '+260' },
      { label: 'Decision',   ml: '-160' },
    ],
  },
  {
    id: 'ufc316-comain',
    event: 'UFC 316',
    eventDate: '2026-04-18',
    fighter1: 'Dricus du Plessis',
    fighter2: 'Paulo Costa',
    weight: 'Middleweight',
    isTitle: true,
    closing: '2026-04-18',
    platforms: [
      { name: 'Polymarket', f1_ml: '-200', f2_ml: '+165', volume: 116000 },
      { name: 'Kalshi',     f1_ml: '-195', f2_ml: '+160', volume: 74000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '-110' },
      { label: 'Submission', ml: '+420' },
      { label: 'Decision',   ml: '+300' },
    ],
  },
  {
    id: 'ufc316-edwards',
    event: 'UFC 316',
    eventDate: '2026-04-18',
    fighter1: 'Leon Edwards',
    fighter2: 'Ian Garry',
    weight: 'Welterweight',
    isTitle: false,
    closing: '2026-04-18',
    platforms: [
      { name: 'Polymarket', f1_ml: '-140', f2_ml: '+112', volume: 82000 },
      { name: 'Kalshi',     f1_ml: '-145', f2_ml: '+118', volume: 58000 },
      { name: 'Novig',      f1_ml: '-150', f2_ml: '+125', volume: 12000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '+220' },
      { label: 'Submission', ml: '+480' },
      { label: 'Decision',   ml: '-145' },
    ],
  },
  {
    id: 'ufc317-main',
    event: 'UFC 317',
    eventDate: '2026-06-06',
    fighter1: 'Jon Jones',
    fighter2: 'Tom Aspinall',
    weight: 'Heavyweight',
    isTitle: true,
    closing: '2026-06-06',
    platforms: [
      { name: 'Polymarket', f1_ml: '-165', f2_ml: '+136', volume: 345000 },
      { name: 'Kalshi',     f1_ml: '-170', f2_ml: '+140', volume: 218000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '+130' },
      { label: 'Submission', ml: '+400' },
      { label: 'Decision',   ml: '+145' },
    ],
  },
  {
    id: 'ufc317-comain',
    event: 'UFC 317',
    eventDate: '2026-06-06',
    fighter1: 'Islam Makhachev',
    fighter2: 'Charles Oliveira',
    weight: 'Lightweight',
    isTitle: true,
    closing: '2026-06-06',
    platforms: [
      { name: 'Polymarket', f1_ml: '-195', f2_ml: '+162', volume: 284000 },
      { name: 'Kalshi',     f1_ml: '-200', f2_ml: '+165', volume: 176000 },
    ],
    method_props: [
      { label: 'KO/TKO',     ml: '+350' },
      { label: 'Submission', ml: '+120' },
      { label: 'Decision',   ml: '+165' },
    ],
  },
];
