/**
 * checklist.js — trade checklist items and tab names.
 * CHECKLIST: array of 17 pre-fight analysis checklist items, grouped by category.
 * Each item: { id: Number, cat: String, cc: String (CSS variable), text: String, sub: String }
 * TABS: ordered list of fighter profile tab names.
 */

export const CHECKLIST = [
  {id:1, cat:'MARKET',   cc:'var(--accent)',  text:'Where is sharp money?',            sub:'Line movement open→current. RLM? Steam moves?'},
  {id:2, cat:'MARKET',   cc:'var(--accent)',  text:'Public inflation check',            sub:'Big name / viral KO / home crowd pushing price above real probability?'},
  {id:3, cat:'MARKET',   cc:'var(--accent)',  text:'Implied probability vs your edge',  sub:'Convert odds. Is there 5%+ edge? What price would you actually lay?'},
  {id:4, cat:'STYLES',   cc:'var(--green)',   text:'Who controls fight location?',      sub:'Who has tools to dictate range/position — TD defense, footwork, cage work?'},
  {id:5, cat:'STYLES',   cc:'var(--green)',   text:'Grappling matchup depth',           sub:'Is TD offense dangerous on top? Guard danger? Grinder vs sub hunter?'},
  {id:6, cat:'STYLES',   cc:'var(--green)',   text:'Striking quality vs quantity',      sub:'Volume for judges vs KO power. Who lands the cleaner, impactful shots?'},
  {id:7, cat:'STYLES',   cc:'var(--green)',   text:'Archetype matchup trap?',           sub:'Wrestler into sub hunter, brawler into counter striker — trap dynamic in lines?'},
  {id:8, cat:'PHYSICAL', cc:'var(--purple)',  text:'Reach & size edge',                 sub:'Wingspan is statistically significant. Using it via range control, jab, teep?'},
  {id:9, cat:'PHYSICAL', cc:'var(--purple)',  text:'Weight cut + rehydration',          sub:'Visible drain at weigh-ins? Bigger fighter night-of? Power never returned?'},
  {id:10,cat:'PHYSICAL', cc:'var(--purple)',  text:'Cardio across rounds',              sub:'Documented gas tank issue? Sig strike rate drop in R3?'},
  {id:11,cat:'RISK',     cc:'var(--red)',     text:'Chin & damage history',             sub:'Stopped before? By what? Comparable power level incoming?'},
  {id:12,cat:'RISK',     cc:'var(--red)',     text:'Layoff / camp / motivation',        sub:'Long layoff, gym switch, injury flag, home crowd vs travel?'},
  {id:13,cat:'RISK',     cc:'var(--red)',     text:'Competition level step-up',         sub:'Padded record, first elite opponent? Step-up fights fail above market rate.'},
  {id:14,cat:'RISK',     cc:'var(--red)',     text:'Judging tendencies in venue',       sub:'Known commission style. Who wins on a scorecard in this specific venue?'},
  {id:15,cat:'METHOD',   cc:'var(--blue)',    text:'Most likely finish method?',        sub:'KO, Sub, or Dec — which prop has value given the archetype matchup?'},
  {id:16,cat:'METHOD',   cc:'var(--blue)',    text:'Live betting angle?',               sub:'Mid-fight mispricing scenario? Set mental trigger before the fight starts.'},
  {id:17,cat:'METHOD',   cc:'var(--blue)',    text:'Round betting value?',              sub:'Late bloomer vs front-runner tag? Early/late round markets with archetype support?'},
];

export const TABS = ['OVERVIEW','STRIKING','GRAPPLING','PHYSICAL','HISTORY','MARKET'];
