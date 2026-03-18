/**
 * matchupWarnings — archetype matchup rules, style clash notes, and modifier
 * interaction warnings for the CompareScreen MATCHUP NOTES section.
 *
 * Three rule sets:
 *   ARCHETYPE_RULES  — directional: attacker archetype has an edge over defender
 *   STYLE_CLASHES    — symmetric: notable interaction regardless of who has the edge
 *   MOD_RULES        — modifier-triggered warnings, optionally conditioned on opponent archetype
 *
 * computeMatchupWarnings(f1, f2) → Warning[]
 *
 * Warning shape:
 * {
 *   type:      'style' | 'risk' | 'fade' | 'clash',
 *   headline:  string,   // short label shown as the note title
 *   body:      string,   // 1–2 sentence research note
 *   subject:   'f1' | 'f2' | null,  // which fighter the note applies to (null = both)
 * }
 *
 * All strings are static — no fighter names interpolated here. CompareScreen
 * substitutes fighter last names when rendering.
 */

// ── Archetype matchup rules ──────────────────────────────────────────────────
// Directional: attacker archetype has a structural edge over defender archetype.
// Both directions are checked — the returned warning includes `subject` so the
// UI can label it "F1 EDGE" or "F2 EDGE".

const ARCHETYPE_RULES = [
  {
    attacker: 'WRESTLER',
    defender: 'COUNTER STRIKER',
    headline: 'Wrestling disrupts counter timing',
    body: 'Takedowns and cage control force the counter striker to worry about the shot, destroying the footwork and patience their game depends on. Watch for early cage work.',
  },
  {
    attacker: 'WRESTLER',
    defender: 'KICKBOXER',
    headline: 'Takedowns negate kicking range',
    body: 'Persistent level changes and shot attempts crowd the kickboxer\'s range, making long kicks risky. Top control limits offensive output to near zero.',
  },
  {
    attacker: 'WRESTLER',
    defender: 'BRAWLER',
    headline: 'Wrestling controls the pace',
    body: 'The brawler needs exchanges; wrestling denies them. Cage clinch and takedown threats slow the fight into a controlled grind rather than a firefight.',
  },
  {
    attacker: 'PRESSURE FIGHTER',
    defender: 'COUNTER STRIKER',
    headline: 'Pressure collapses counter structure',
    body: 'Counter strikers need space and patience to set traps. Relentless forward pressure eliminates the range and rhythm that makes their counter timing dangerous.',
  },
  {
    attacker: 'PRESSURE FIGHTER',
    defender: 'KICKBOXER',
    headline: 'Inside pressure nullifies the kicking game',
    body: 'High kicks need distance; front kicks need space. Constant forward pressure crowds the kickboxer into tight exchanges where their range advantage disappears.',
  },
  {
    attacker: 'PRESSURE FIGHTER',
    defender: 'BJJ / SUB HUNTER',
    headline: 'Pressure can outpace the submission game',
    body: 'Sub hunters need controlled situations — body locks, clinch entries, or ground positions. Explosive forward pressure can overwhelm before those setups develop.',
  },
  {
    attacker: 'BJJ / SUB HUNTER',
    defender: 'WRESTLER',
    headline: 'Guard danger neutralizes single-leg attacks',
    body: 'The sub hunter\'s guard is a weapon, not just a defensive position. The wrestler\'s ground game becomes risky if they can\'t maintain top control and avoid submission attempts.',
  },
  {
    attacker: 'BJJ / SUB HUNTER',
    defender: 'BRAWLER',
    headline: 'Clinch and guard nullify brawling',
    body: 'Brawlers generate power in open exchanges; the sub hunter denies those exchanges with clinch work, trips, and guard pulls. Ground game neutralizes heavy hands.',
  },
  {
    attacker: 'COUNTER STRIKER',
    defender: 'BRAWLER',
    headline: 'Counter punishing forward aggression',
    body: 'Brawlers walk into shots. The counter striker\'s accuracy and timing off the back foot is ideally suited to punish telegraphed forward lunges. Power does not matter if it does not land.',
  },
  {
    attacker: 'COUNTER STRIKER',
    defender: 'PRESSURE FIGHTER',
    headline: 'Counter striker needs to create distance',
    body: 'Pressure disrupts counter structure, but a disciplined counter striker can exploit over-commitment. Key factor: can they use footwork to create counter opportunities before the pace takes over?',
  },
  {
    attacker: 'KICKBOXER',
    defender: 'BRAWLER',
    headline: 'Range and volume over raw power',
    body: 'The kickboxer\'s accuracy, footwork, and varied attack levels give them a structural edge over the brawler who relies on power and forward pressure without technical variety.',
  },
  {
    attacker: 'MUAY THAI',
    defender: 'KICKBOXER',
    headline: 'Clinch dominance disrupts kickboxing rhythm',
    body: 'Muay Thai fighters are dangerous in the pocket and on the tie-up. Kickboxers who prefer range and combinations struggle when repeatedly tied up and elbowed or kneed.',
  },
  {
    attacker: 'MUAY THAI',
    defender: 'COUNTER STRIKER',
    headline: 'Clinch eliminates the counter striker\'s range',
    body: 'Muay Thai clinch ties up the counter striker where their footwork and distance management can\'t function. Elbows and short knees work where jabs and crosses do not.',
  },
  {
    attacker: 'CLINCH FIGHTER',
    defender: 'KICKBOXER',
    headline: 'Clinch neutralizes the kick arsenal',
    body: 'Every clinch entry takes away the kickboxer\'s range. Repeated tie-ups drain energy and prevent the footwork-reset combinations that define the kickboxing style.',
  },
];

// ── Style clashes ────────────────────────────────────────────────────────────
// Symmetric: notable style interaction regardless of edge direction.
// `a` and `b` are archetype strings; the match is bidirectional.

const STYLE_CLASHES = [
  {
    a: 'WRESTLER',
    b: 'WRESTLER',
    headline: 'Wrestling mirror — who controls the cage?',
    body: 'Both fighters want the takedown. The better wrestler controls cage placement and dictates bottom-top dynamics. Watch for who is more comfortable defending shots while also shooting.',
  },
  {
    a: 'PRESSURE FIGHTER',
    b: 'PRESSURE FIGHTER',
    headline: 'Pace war — who breaks first?',
    body: 'Two pressure fighters create the highest-output fights. Key factors: cardio depth in rounds 3–5, who absorbs damage better, and who can sustain pace without burning out early.',
  },
  {
    a: 'COUNTER STRIKER',
    b: 'COUNTER STRIKER',
    headline: 'Counter chess match — low output likely',
    body: 'Both fighters prefer to react rather than initiate. Expect a cautious, tactical affair with low volume. Judges will likely be needed; octagon control and aggression become crucial scoring factors.',
  },
  {
    a: 'BJJ / SUB HUNTER',
    b: 'BJJ / SUB HUNTER',
    headline: 'Ground chess — submission or control?',
    body: 'Both fighters are dangerous on the ground. The fight may stay standing as each respects the other\'s submission game. If it goes to the mat, look for who has positional vs. submission grappling advantage.',
  },
  {
    a: 'KICKBOXER',
    b: 'MUAY THAI',
    headline: 'Range vs clinch — distance management is the fight',
    body: 'The kickboxer thrives at range; Muay Thai thrives in the pocket and clinch. This fight is decided by who controls distance. Footwork, feints, and clinch breaking are the decisive skills.',
  },
  {
    a: 'BRAWLER',
    b: 'BRAWLER',
    headline: 'Firefight — who has the better chin?',
    body: 'Neither fighter will avoid exchanges. Chin, durability, and power become the primary variables. Expect early highlight-reel potential in both directions.',
  },
  {
    a: 'WRESTLER',
    b: 'BJJ / SUB HUNTER',
    headline: 'Takedown vs guard — top control is everything',
    body: 'The wrestler wants top position; the sub hunter wants bottom. This is a pure grappling contrast: can the wrestler take the back or achieve dominant position, or does the sub hunter reverse and threaten from guard?',
  },
  {
    a: 'MUAY THAI',
    b: 'CLINCH FIGHTER',
    headline: 'Clinch battle — both fighters want the tie-up',
    body: 'Both are dangerous in the clinch. Key differentiator is striking output inside — elbows, knees, dirty boxing — and who can achieve dominant clinch positioning.',
  },
];

// ── Modifier interaction rules ───────────────────────────────────────────────
// Triggered when a fighter carries a specific modifier tag.
// `vsArchetype`: if set, the warning only fires when the opponent has that archetype.
// `vsModPresent`: if set, only fires when the opponent ALSO has that modifier.
// `vsModAbsent`: if set, only fires when the opponent does NOT have that modifier.

const MOD_RULES = [
  {
    mod: 'DURABILITY RISK',
    vsArchetype: null,
    headline: 'Durability concern on the feet',
    body: 'Has been stopped before. Opponent\'s ability to land clean and accumulate damage is elevated as a factor. Watch for early-round pressure to test the chin.',
    type: 'risk',
  },
  {
    mod: 'DURABILITY RISK',
    vsArchetype: 'BRAWLER',
    headline: 'Durability risk vs power puncher',
    body: 'Chin concerns are amplified when facing a brawler whose primary weapon is heavy strikes. Any sustained exchange is high variance.',
    type: 'risk',
  },
  {
    mod: 'DURABILITY RISK',
    vsArchetype: 'PRESSURE FIGHTER',
    headline: 'Durability risk vs high volume',
    body: 'High-volume pressure fighters accumulate damage quickly. A fighter with durability questions absorbing sustained output is a significant red flag.',
    type: 'risk',
  },
  {
    mod: 'CARDIO CONCERN',
    vsArchetype: null,
    headline: 'Cardio concern — watch late rounds',
    body: 'Performance may drop significantly in rounds 3–5. Early round output may not represent the full fight. High-volume opponents become more dangerous as time passes.',
    type: 'risk',
  },
  {
    mod: 'CARDIO CONCERN',
    vsArchetype: 'PRESSURE FIGHTER',
    headline: 'Cardio concern vs non-stop pressure',
    body: 'The worst opponent for a fighter with cardio questions is a relentless pressure fighter who maintains pace for 25 minutes. Late-round fade risk is significantly elevated.',
    type: 'risk',
  },
  {
    mod: 'WEIGHT CUT FLAG',
    vsArchetype: null,
    headline: 'Weight cut watch',
    body: 'History of difficult cuts. Monitor weigh-in day for drain signs. Fighters who struggle to make weight often perform below baseline in the early rounds regardless of rehydration.',
    type: 'risk',
  },
  {
    mod: 'FRONT-RUNNER',
    vsArchetype: null,
    headline: 'Front-runner — early rounds not the full story',
    body: 'Performs strongly when ahead but shows vulnerability when behind or tired. If they do not score early, output and aggression may drop substantially in later rounds.',
    type: 'risk',
  },
  {
    mod: 'FRONT-RUNNER',
    vsArchetype: 'PRESSURE FIGHTER',
    headline: 'Front-runner vs sustained pressure',
    body: 'A front-runner who cannot get off first and establish control against a pressure fighter is in trouble. If the pace overwhelms them early, the mental and physical drop-off can be rapid.',
    type: 'risk',
  },
  {
    mod: 'LATE BLOOMER',
    vsArchetype: null,
    headline: 'Late bloomer — trajectory worth noting',
    body: 'Recent performance arc suggests the market may be anchored to older results. Upside may be underpriced relative to current form. Check if recent wins signal a genuine level-up.',
    type: 'fade',
  },
  {
    mod: 'STEP-UP CONCERN',
    vsArchetype: null,
    headline: 'Step-up concern — level jump',
    body: 'Significant jump in competition level. Unknowns around training camp quality, nerves, and how their game translates against higher-caliber opposition. Weight this against the odds.',
    type: 'risk',
  },
];

// ── Compute function ─────────────────────────────────────────────────────────

/**
 * Compute matchup warnings for two fighters.
 * Returns an array of warning objects for display in the MATCHUP NOTES section.
 *
 * @param {object} f1 - fighter 1 from FIGHTERS
 * @param {object} f2 - fighter 2 from FIGHTERS
 * @returns {Array<{ type: string, headline: string, body: string, subject: 'f1'|'f2'|null }>}
 */
export function computeMatchupWarnings(f1, f2) {
  if (!f1 || !f2) return [];
  const warnings = [];

  // 1. Directional archetype rules
  for (const rule of ARCHETYPE_RULES) {
    if (f1.archetype === rule.attacker && f2.archetype === rule.defender) {
      warnings.push({ type: 'style', headline: rule.headline, body: rule.body, subject: 'f1' });
    } else if (f2.archetype === rule.attacker && f1.archetype === rule.defender) {
      warnings.push({ type: 'style', headline: rule.headline, body: rule.body, subject: 'f2' });
    }
  }

  // 2. Symmetric style clashes
  for (const clash of STYLE_CLASHES) {
    const match =
      (f1.archetype === clash.a && f2.archetype === clash.b) ||
      (f1.archetype === clash.b && f2.archetype === clash.a) ||
      (clash.a === clash.b && f1.archetype === clash.a && f2.archetype === clash.a);
    if (match) {
      warnings.push({ type: 'clash', headline: clash.headline, body: clash.body, subject: null });
    }
  }

  // 3. Modifier-triggered warnings
  const f1Mods = f1.mods || [];
  const f2Mods = f2.mods || [];
  for (const rule of MOD_RULES) {
    if (f1Mods.includes(rule.mod)) {
      if (!rule.vsArchetype || f2.archetype === rule.vsArchetype) {
        warnings.push({ type: rule.type, headline: rule.headline, body: rule.body, subject: 'f1' });
      }
    }
    if (f2Mods.includes(rule.mod)) {
      if (!rule.vsArchetype || f1.archetype === rule.vsArchetype) {
        warnings.push({ type: rule.type, headline: rule.headline, body: rule.body, subject: 'f2' });
      }
    }
  }

  return warnings;
}
