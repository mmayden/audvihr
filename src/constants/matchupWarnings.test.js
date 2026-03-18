import { describe, it, expect } from 'vitest';
import { computeMatchupWarnings } from './matchupWarnings';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fighter(overrides = {}) {
  return {
    archetype: 'WRESTLER',
    mods: [],
    ...overrides,
  };
}

// ── Guard / null input ────────────────────────────────────────────────────────

describe('computeMatchupWarnings — guard', () => {
  it('returns [] when f1 is null', () => {
    expect(computeMatchupWarnings(null, fighter())).toEqual([]);
  });

  it('returns [] when f2 is null', () => {
    expect(computeMatchupWarnings(fighter(), null)).toEqual([]);
  });

  it('returns [] when both are null', () => {
    expect(computeMatchupWarnings(null, null)).toEqual([]);
  });

  it('returns [] when both fighters have no matching rules', () => {
    // Two archetypes with no defined interaction
    const result = computeMatchupWarnings(
      fighter({ archetype: 'CLINCH FIGHTER' }),
      fighter({ archetype: 'CLINCH FIGHTER' }),
    );
    // STYLE_CLASHES has no CLINCH FIGHTER vs CLINCH FIGHTER entry — should be 0
    expect(result).toEqual([]);
  });
});

// ── Warning shape ─────────────────────────────────────────────────────────────

describe('computeMatchupWarnings — warning shape', () => {
  it('every warning has type, headline, body, and subject fields', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER' }),
      fighter({ archetype: 'COUNTER STRIKER' }),
    );
    expect(result.length).toBeGreaterThan(0);
    for (const w of result) {
      expect(w).toHaveProperty('type');
      expect(w).toHaveProperty('headline');
      expect(w).toHaveProperty('body');
      expect(w).toHaveProperty('subject');
      expect(typeof w.headline).toBe('string');
      expect(typeof w.body).toBe('string');
    }
  });

  it('type is one of style, risk, fade, clash', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'BRAWLER', mods: ['DURABILITY RISK'] }),
      fighter({ archetype: 'PRESSURE FIGHTER' }),
    );
    const validTypes = new Set(['style', 'risk', 'fade', 'clash']);
    for (const w of result) {
      expect(validTypes.has(w.type)).toBe(true);
    }
  });

  it('subject is f1, f2, or null', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER' }),
      fighter({ archetype: 'WRESTLER' }),
    );
    for (const w of result) {
      expect([null, 'f1', 'f2']).toContain(w.subject);
    }
  });
});

// ── Directional archetype rules ───────────────────────────────────────────────

describe('computeMatchupWarnings — ARCHETYPE_RULES (directional)', () => {
  it('WRESTLER (f1) vs COUNTER STRIKER (f2) → style warning with subject f1', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER' }),
      fighter({ archetype: 'COUNTER STRIKER' }),
    );
    const match = result.find(w => w.subject === 'f1' && w.type === 'style');
    expect(match).toBeDefined();
    expect(match.headline).toMatch(/Wrestling disrupts counter timing/i);
  });

  it('COUNTER STRIKER (f1) vs WRESTLER (f2) → style warning with subject f2', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'COUNTER STRIKER' }),
      fighter({ archetype: 'WRESTLER' }),
    );
    const match = result.find(w => w.subject === 'f2' && w.type === 'style');
    expect(match).toBeDefined();
    expect(match.headline).toMatch(/Wrestling disrupts counter timing/i);
  });

  it('PRESSURE FIGHTER (f1) vs KICKBOXER (f2) → style warning subject f1', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'PRESSURE FIGHTER' }),
      fighter({ archetype: 'KICKBOXER' }),
    );
    const match = result.find(w => w.subject === 'f1' && w.type === 'style');
    expect(match).toBeDefined();
  });

  it('no duplicate directional rules for same pair', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER' }),
      fighter({ archetype: 'KICKBOXER' }),
    );
    const headlines = result.map(w => w.headline);
    const unique = new Set(headlines);
    expect(headlines.length).toBe(unique.size);
  });
});

// ── Symmetric style clashes ───────────────────────────────────────────────────

describe('computeMatchupWarnings — STYLE_CLASHES (symmetric)', () => {
  it('WRESTLER vs WRESTLER → clash warning with subject null', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER' }),
      fighter({ archetype: 'WRESTLER' }),
    );
    const clash = result.find(w => w.type === 'clash' && w.subject === null);
    expect(clash).toBeDefined();
    expect(clash.headline).toMatch(/Wrestling mirror/i);
  });

  it('BRAWLER vs BRAWLER → firefight clash', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'BRAWLER' }),
      fighter({ archetype: 'BRAWLER' }),
    );
    const clash = result.find(w => w.type === 'clash');
    expect(clash).toBeDefined();
    expect(clash.headline).toMatch(/Firefight/i);
  });

  it('KICKBOXER vs MUAY THAI → clash (bidirectional)', () => {
    const fwd = computeMatchupWarnings(
      fighter({ archetype: 'KICKBOXER' }),
      fighter({ archetype: 'MUAY THAI' }),
    );
    const rev = computeMatchupWarnings(
      fighter({ archetype: 'MUAY THAI' }),
      fighter({ archetype: 'KICKBOXER' }),
    );
    const fwdClash = fwd.find(w => w.type === 'clash');
    const revClash = rev.find(w => w.type === 'clash');
    expect(fwdClash).toBeDefined();
    expect(revClash).toBeDefined();
    expect(fwdClash.headline).toBe(revClash.headline);
  });

  it('COUNTER STRIKER vs COUNTER STRIKER → clash warning', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'COUNTER STRIKER' }),
      fighter({ archetype: 'COUNTER STRIKER' }),
    );
    const clash = result.find(w => w.type === 'clash');
    expect(clash).toBeDefined();
    expect(clash.headline).toMatch(/Counter chess/i);
  });
});

// ── Modifier rules ────────────────────────────────────────────────────────────

describe('computeMatchupWarnings — MOD_RULES', () => {
  it('DURABILITY RISK on f1 → risk warning with subject f1', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'KICKBOXER', mods: ['DURABILITY RISK'] }),
      fighter({ archetype: 'WRESTLER' }),
    );
    const risk = result.find(w => w.type === 'risk' && w.subject === 'f1');
    expect(risk).toBeDefined();
    expect(risk.headline).toMatch(/Durability/i);
  });

  it('DURABILITY RISK on f2 → risk warning with subject f2', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER' }),
      fighter({ archetype: 'KICKBOXER', mods: ['DURABILITY RISK'] }),
    );
    const risk = result.find(w => w.type === 'risk' && w.subject === 'f2');
    expect(risk).toBeDefined();
  });

  it('DURABILITY RISK + BRAWLER opponent → fires both generic and archetype-specific rules', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'COUNTER STRIKER', mods: ['DURABILITY RISK'] }),
      fighter({ archetype: 'BRAWLER' }),
    );
    const riskWarnings = result.filter(w => w.type === 'risk' && w.subject === 'f1');
    // generic (vsArchetype: null) + specific (vsArchetype: BRAWLER) = 2
    expect(riskWarnings.length).toBeGreaterThanOrEqual(2);
  });

  it('DURABILITY RISK vs BRAWLER only fires generic when opponent is not BRAWLER', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER', mods: ['DURABILITY RISK'] }),
      fighter({ archetype: 'WRESTLER' }),
    );
    const riskWarnings = result.filter(w => w.type === 'risk' && w.subject === 'f1');
    // only generic fires (vsArchetype: null rule)
    expect(riskWarnings.length).toBe(1);
  });

  it('CARDIO CONCERN → risk warning', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'KICKBOXER', mods: ['CARDIO CONCERN'] }),
      fighter({ archetype: 'WRESTLER' }),
    );
    const risk = result.find(w => w.type === 'risk' && w.subject === 'f1' && /Cardio/i.test(w.headline));
    expect(risk).toBeDefined();
  });

  it('CARDIO CONCERN + PRESSURE FIGHTER opponent → fires both rules', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'COUNTER STRIKER', mods: ['CARDIO CONCERN'] }),
      fighter({ archetype: 'PRESSURE FIGHTER' }),
    );
    const riskWarnings = result.filter(w => w.type === 'risk' && w.subject === 'f1' && /Cardio/i.test(w.headline));
    expect(riskWarnings.length).toBe(2);
  });

  it('LATE BLOOMER → fade warning', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER', mods: ['LATE BLOOMER'] }),
      fighter({ archetype: 'BRAWLER' }),
    );
    const fade = result.find(w => w.type === 'fade' && w.subject === 'f1');
    expect(fade).toBeDefined();
    expect(fade.headline).toMatch(/Late bloomer/i);
  });

  it('STEP-UP CONCERN → risk warning', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'KICKBOXER', mods: ['STEP-UP CONCERN'] }),
      fighter({ archetype: 'WRESTLER' }),
    );
    const risk = result.find(w => w.type === 'risk' && w.subject === 'f1' && /Step-up/i.test(w.headline));
    expect(risk).toBeDefined();
  });

  it('mods: [] triggers no modifier warnings', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'WRESTLER', mods: [] }),
      fighter({ archetype: 'KICKBOXER', mods: [] }),
    );
    const modWarnings = result.filter(w => ['risk', 'fade'].includes(w.type));
    expect(modWarnings.length).toBe(0);
  });

  it('fighter with no mods field triggers no modifier warnings', () => {
    const f1 = { archetype: 'WRESTLER' }; // no mods field
    const f2 = { archetype: 'KICKBOXER' };
    const result = computeMatchupWarnings(f1, f2);
    const modWarnings = result.filter(w => ['risk', 'fade'].includes(w.type));
    expect(modWarnings.length).toBe(0);
  });
});

// ── Combined scenarios ────────────────────────────────────────────────────────

describe('computeMatchupWarnings — combined output', () => {
  it('accumulates archetype + modifier warnings in one call', () => {
    const result = computeMatchupWarnings(
      fighter({ archetype: 'PRESSURE FIGHTER', mods: ['DURABILITY RISK'] }),
      fighter({ archetype: 'BJJ / SUB HUNTER' }),
    );
    const hasStyle = result.some(w => w.type === 'style');
    const hasRisk  = result.some(w => w.type === 'risk');
    expect(hasStyle).toBe(true);
    expect(hasRisk).toBe(true);
  });

  it('same fighter pair always returns same result (deterministic)', () => {
    const f1 = fighter({ archetype: 'MUAY THAI', mods: ['FRONT-RUNNER'] });
    const f2 = fighter({ archetype: 'KICKBOXER', mods: [] });
    const a = computeMatchupWarnings(f1, f2);
    const b = computeMatchupWarnings(f1, f2);
    expect(a).toEqual(b);
  });
});
