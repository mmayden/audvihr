/**
 * events.js — GENERATED FILE. Do not edit manually.
 * Run `npm run fetch-data` to refresh from UFCStats.com.
 *
 * Event object schema:
 * {
 *   id: Number,
 *   name: String,             // e.g. 'UFC 314'
 *   org: String,              // 'UFC' | 'Bellator' | 'PFL'
 *   date: String,             // ISO date 'YYYY-MM-DD'
 *   venue: String,
 *   city: String,
 *   card: {
 *     main:         { f1: String, f2: String, weight: String, title: Boolean, weigh_in?: String|null, judges?: String[] },
 *     comain:       { f1: String, f2: String, weight: String, title: Boolean, weigh_in?: String|null, judges?: String[] },
 *     prelims:      [{ f1: String, f2: String, weight: String, weigh_in?: String|null, judges?: String[] }],
 *     early_prelims:[{ f1: String, f2: String, weight: String, weigh_in?: String|null, judges?: String[] }],
 *   }
 * }
 */

export const EVENTS = [
  { id:1, name:'UFC 314', org:'UFC', date:'2026-02-15', venue:'Moody Center', city:'Austin, TX',
    card:{
      main:   {f1:'Islam Makhachev',  f2:'Dustin Poirier',       weight:'Lightweight',   title:true,  weigh_in:'made',judges:["Sal D'Amato","Derek Cleary","Dave Hagen"]},
      comain: {f1:'Dricus du Plessis',f2:'Sean Strickland',      weight:'Middleweight',  title:true,  weigh_in:'made',judges:["Sal D'Amato","Derek Cleary","Dave Hagen"]},
      prelims:[
        {f1:'Justin Gaethje',       f2:'Dan Hooker',            weight:'Lightweight',  weigh_in:'made',judges:["Sal D'Amato","Derek Cleary","Dave Hagen"]},
        {f1:'Paddy Pimblett',       f2:'Tony Ferguson',         weight:'Lightweight',  weigh_in:'made',judges:["Sal D'Amato","Derek Cleary","Dave Hagen"]},
        {f1:'Cub Swanson',          f2:'Arnold Allen',          weight:'Featherweight'},
        {f1:'Brendan Allen',        f2:'Joe Pyfer',             weight:'Middleweight'},
      ],
      early_prelims:[
        {f1:'Aiemann Zahabi',       f2:'Cody Durden',           weight:'Flyweight'},
      ],
    }},
  { id:2, name:'UFC 315', org:'UFC', date:'2026-03-21', venue:'Scotiabank Arena', city:'Toronto, Canada',
    card:{
      main:   {f1:'Arman Tsarukyan', f2:'Justin Gaethje',        weight:'Lightweight',   title:true,  judges:["Sal D'Amato","Ron McCarthy","Chris Lee"]},
      comain: {f1:'Jack Della Maddalena',f2:'Gilbert Burns',     weight:'Welterweight',  title:false, judges:["Sal D'Amato","Ron McCarthy","Chris Lee"]},
      prelims:[
        {f1:'Paddy Pimblett',       f2:'Michael Chandler',      weight:'Lightweight'},
        {f1:"Sean O'Malley",        f2:'Marlon Vera',           weight:'Bantamweight'},
        {f1:'Kevin Holland',        f2:'Caio Borralho',         weight:'Middleweight'},
        {f1:'Arnold Allen',         f2:'Lerone Murphy',         weight:'Featherweight'},
      ],
      early_prelims:[
        {f1:'Melsik Baghdasaryan',  f2:'Danny Silva',           weight:'Featherweight'},
        {f1:'Aiemann Zahabi',       f2:'Jeff Molina',           weight:'Flyweight'},
      ],
    }},
  { id:3, name:'UFC Fight Night', org:'UFC', date:'2026-03-28', venue:'UFC APEX', city:'Las Vegas, NV',
    card:{
      main:   {f1:'Charles Oliveira',f2:'Beneil Dariush',        weight:'Lightweight',   title:false},
      comain: {f1:'Caio Borralho',  f2:'Roman Dolidze',          weight:'Middleweight',  title:false},
      prelims:[
        {f1:'Cub Swanson',          f2:'Edson Barboza',         weight:'Featherweight'},
        {f1:'Kevin Jousset',        f2:'Josh Quinlan',          weight:'Welterweight'},
        {f1:'Josiane Nunes',        f2:'Ketlen Vieira',         weight:'Bantamweight'},
      ],
      early_prelims:[],
    }},
  { id:4, name:'UFC 316', org:'UFC', date:'2026-04-18', venue:'Kaseya Center', city:'Miami, FL',
    card:{
      main:   {f1:'Merab Dvalishvili',f2:'Umar Nurmagomedov',   weight:'Bantamweight',  title:true,  judges:["Sal D'Amato","Derek Cleary","Mike Bell"]},
      comain: {f1:'Dricus du Plessis',f2:'Paulo Costa',          weight:'Middleweight',  title:true,  judges:["Sal D'Amato","Derek Cleary","Mike Bell"]},
      prelims:[
        {f1:'Leon Edwards',         f2:'Ian Garry',             weight:'Welterweight'},
        {f1:'Dustin Poirier',       f2:'Arman Tsarukyan',       weight:'Lightweight'},
        {f1:'Jiri Prochazka',       f2:'Alex Pereira',          weight:'Light Heavyweight'},
        {f1:'Bryce Mitchell',       f2:'Movsar Evloev',         weight:'Featherweight'},
      ],
      early_prelims:[
        {f1:'Abus Magomedov',       f2:'Nassourdine Imavov',    weight:'Middleweight'},
      ],
    }},
  { id:5, name:'UFC 317', org:'UFC', date:'2026-06-06', venue:'T-Mobile Arena', city:'Las Vegas, NV',
    card:{
      main:   {f1:'Jon Jones',      f2:'Tom Aspinall',           weight:'Heavyweight',   title:true,  judges:["Sal D'Amato","Ron McCarthy","Dave Hagen"]},
      comain: {f1:'Islam Makhachev',f2:'Charles Oliveira',       weight:'Lightweight',   title:true,  judges:["Sal D'Amato","Ron McCarthy","Dave Hagen"]},
      prelims:[
        {f1:"Sean O'Malley",        f2:'Merab Dvalishvili',     weight:'Bantamweight'},
        {f1:'Belal Muhammad',       f2:'Jack Della Maddalena',  weight:'Welterweight'},
        {f1:'Paddy Pimblett',       f2:'Beneil Dariush',        weight:'Lightweight'},
      ],
      early_prelims:[
        {f1:'Jamie Pickett',        f2:'Gregory Rodrigues',     weight:'Middleweight'},
      ],
    }},
];
