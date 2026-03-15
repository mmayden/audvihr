import { describe, it, expect } from 'vitest';
import {
  fightKey,
  probToML,
  normalizeOddsApiResponse,
  normalizePolymarketMarket,
  normalizeKalshiMarket,
  normalizePriceHistory,
} from './normalizeOdds';

// ── fightKey ────────────────────────────────────────────────────────────────

describe('fightKey', () => {
  it('returns sorted last-name tokens joined by underscore', () => {
    expect(fightKey('Islam Makhachev', 'Dustin Poirier')).toBe('makhachev_poirier');
  });

  it('is symmetric — order of args does not matter', () => {
    expect(fightKey('Dustin Poirier', 'Islam Makhachev')).toBe('makhachev_poirier');
  });

  it('handles single-word names', () => {
    expect(fightKey('Jones', 'Aspinall')).toBe('aspinall_jones');
  });

  it('returns empty-string tokens for empty input without crashing', () => {
    expect(() => fightKey('', '')).not.toThrow();
  });
});

// ── probToML ─────────────────────────────────────────────────────────────────

describe('probToML', () => {
  it('converts favorite probability to negative ML', () => {
    // 0.667 → approximately -200
    const ml = probToML(0.667);
    expect(ml).toBeTruthy();
    expect(ml.startsWith('-')).toBe(true);
  });

  it('converts underdog probability to positive ML', () => {
    // 0.4 → +150
    const ml = probToML(0.4);
    expect(ml).toBeTruthy();
    expect(ml.startsWith('+')).toBe(true);
  });

  it('returns null for out-of-range input', () => {
    expect(probToML(0)).toBeNull();
    expect(probToML(1)).toBeNull();
    expect(probToML(-0.1)).toBeNull();
    expect(probToML(1.1)).toBeNull();
  });

  it('returns null for non-number input', () => {
    expect(probToML('0.5')).toBeNull();
    expect(probToML(null)).toBeNull();
    expect(probToML(undefined)).toBeNull();
  });
});

// ── normalizeOddsApiResponse ─────────────────────────────────────────────────

const ODDS_API_EVENT = {
  id: 'abc123',
  sport_key: 'mma_mixed_martial_arts',
  commence_time: '2026-04-12T22:00:00Z',
  home_team: 'Islam Makhachev',
  away_team: 'Dustin Poirier',
  bookmakers: [
    {
      key: 'draftkings',
      title: 'DraftKings',
      markets: [
        {
          key: 'h2h',
          outcomes: [
            { name: 'Islam Makhachev', price: -230 },
            { name: 'Dustin Poirier',  price: 185 },
          ],
        },
      ],
    },
  ],
};

describe('normalizeOddsApiResponse', () => {
  it('returns [] for non-array input', () => {
    expect(normalizeOddsApiResponse(null)).toEqual([]);
    expect(normalizeOddsApiResponse({})).toEqual([]);
    expect(normalizeOddsApiResponse('string')).toEqual([]);
  });

  it('returns [] for empty array', () => {
    expect(normalizeOddsApiResponse([])).toEqual([]);
  });

  it('normalizes a valid event', () => {
    const result = normalizeOddsApiResponse([ODDS_API_EVENT]);
    expect(result).toHaveLength(1);
    const fight = result[0];
    expect(fight.fightKey).toBe('makhachev_poirier');
    expect(fight.fighter1).toBe('Islam Makhachev');
    expect(fight.fighter2).toBe('Dustin Poirier');
    expect(fight.eventDate).toBe('2026-04-12');
    expect(fight.sportsbook).toBeTruthy();
    expect(fight.sportsbook.f1_ml).toBe('-230');
    expect(fight.sportsbook.f2_ml).toBe('185');
    expect(fight.sportsbook.source).toBe('DraftKings');
  });

  it('skips events with no bookmakers', () => {
    const event = { ...ODDS_API_EVENT, bookmakers: [] };
    expect(normalizeOddsApiResponse([event])).toEqual([]);
  });

  it('skips events with missing fighter names', () => {
    const event = { ...ODDS_API_EVENT, home_team: '', away_team: 'Poirier' };
    expect(normalizeOddsApiResponse([event])).toEqual([]);
  });

  it('skips malformed individual items without crashing', () => {
    const result = normalizeOddsApiResponse([null, undefined, 'bad', ODDS_API_EVENT]);
    expect(result).toHaveLength(1);
  });
});

// ── normalizePolymarketMarket ─────────────────────────────────────────────────

const POLY_MARKET = {
  condition_id: '0xabc',
  question: 'Islam Makhachev vs Dustin Poirier — UFC 315: who wins?',
  tokens: [
    { token_id: '0xtok1', outcome: 'Yes', price: 0.70 },
    { token_id: '0xtok2', outcome: 'No',  price: 0.30 },
  ],
};

describe('normalizePolymarketMarket', () => {
  it('returns null for null/non-object input', () => {
    expect(normalizePolymarketMarket(null)).toBeNull();
    expect(normalizePolymarketMarket('string')).toBeNull();
  });

  it('returns null when condition_id is missing', () => {
    const m = { ...POLY_MARKET, condition_id: undefined };
    expect(normalizePolymarketMarket(m)).toBeNull();
  });

  it('returns null when tokens array is missing', () => {
    const m = { ...POLY_MARKET, tokens: undefined };
    expect(normalizePolymarketMarket(m)).toBeNull();
  });

  it('returns null when prices are out of range', () => {
    const m = {
      ...POLY_MARKET,
      tokens: [
        { token_id: '1', outcome: 'Yes', price: 1.5 },
        { token_id: '2', outcome: 'No',  price: -0.5 },
      ],
    };
    expect(normalizePolymarketMarket(m)).toBeNull();
  });

  it('normalizes a valid market', () => {
    const result = normalizePolymarketMarket(POLY_MARKET);
    expect(result).not.toBeNull();
    expect(result.fightKey).toBe('makhachev_poirier');
    expect(result.polymarket).toBeTruthy();
    expect(result.polymarket.f1_price).toBe(0.70);
    expect(result.polymarket.f2_price).toBe(0.30);
    expect(result.polymarket.conditionId).toBe('0xabc');
    expect(result.polymarket.token1Id).toBe('0xtok1');
    expect(result.polymarket.token2Id).toBe('0xtok2');
    // ML for 70% favorite should be negative
    expect(result.polymarket.f1_ml.startsWith('-')).toBe(true);
  });
});

// ── normalizeKalshiMarket ─────────────────────────────────────────────────────

const KALSHI_MARKET = {
  ticker: 'KXUFC315-MAKHACHEV',
  title: 'Islam Makhachev vs Dustin Poirier — UFC 315',
  last_price: 0.68,
  yes_bid: 0.66,
  yes_ask: 0.70,
};

describe('normalizeKalshiMarket', () => {
  it('returns null for null/non-object input', () => {
    expect(normalizeKalshiMarket(null)).toBeNull();
    expect(normalizeKalshiMarket('bad')).toBeNull();
  });

  it('returns null when ticker is missing', () => {
    expect(normalizeKalshiMarket({ title: 'UFC 315 fight' })).toBeNull();
  });

  it('returns null when price is invalid', () => {
    const m = { ...KALSHI_MARKET, last_price: 0, yes_bid: undefined, yes_ask: undefined };
    expect(normalizeKalshiMarket(m)).toBeNull();
  });

  it('normalizes a valid market using last_price', () => {
    const result = normalizeKalshiMarket(KALSHI_MARKET);
    expect(result).not.toBeNull();
    expect(result.fightKey).toBe('makhachev_poirier');
    expect(result.kalshi).toBeTruthy();
    expect(result.kalshi.f1_price).toBe(0.68);
    expect(result.kalshi.ticker).toBe('KXUFC315-MAKHACHEV');
  });

  it('falls back to bid/ask midpoint when last_price is 0', () => {
    const m = { ...KALSHI_MARKET, last_price: 0 };
    const result = normalizeKalshiMarket(m);
    expect(result).not.toBeNull();
    expect(result.kalshi.f1_price).toBeCloseTo(0.68, 4);
  });
});

// ── normalizePolymarketMarket — question pattern coverage ────────────────────

describe('normalizePolymarketMarket — question patterns', () => {
  it('parses "Will X beat Y at UFC N?" pattern', () => {
    const m = {
      condition_id: '0xbcd',
      question: 'Will Islam Makhachev beat Dustin Poirier at UFC 315?',
      tokens: [
        { token_id: '0x1', outcome: 'Yes', price: 0.68 },
        { token_id: '0x2', outcome: 'No',  price: 0.32 },
      ],
    };
    const result = normalizePolymarketMarket(m);
    expect(result).not.toBeNull();
    expect(result.fightKey).toBe('makhachev_poirier');
  });

  it('returns null when question does not match any known pattern', () => {
    const m = {
      condition_id: '0xbcd',
      question: 'Something completely unrelated about fighting.',
      tokens: [
        { token_id: '0x1', outcome: 'Yes', price: 0.5 },
        { token_id: '0x2', outcome: 'No',  price: 0.5 },
      ],
    };
    expect(normalizePolymarketMarket(m)).toBeNull();
  });
});

// ── normalizePriceHistory ─────────────────────────────────────────────────────

describe('normalizePriceHistory', () => {
  it('returns [] for non-array input', () => {
    expect(normalizePriceHistory(null)).toEqual([]);
    expect(normalizePriceHistory({})).toEqual([]);
  });

  it('filters out malformed entries', () => {
    const raw = [null, 'bad', { t: 'not_num', p: 0.5 }, { t: 1000, p: 0.6 }];
    const result = normalizePriceHistory(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ t: 1000, p: 0.6 });
  });

  it('filters out prices outside [0, 1]', () => {
    const raw = [{ t: 1000, p: 1.5 }, { t: 2000, p: -0.1 }, { t: 3000, p: 0.5 }];
    const result = normalizePriceHistory(raw);
    expect(result).toHaveLength(1);
  });

  it('sorts results by timestamp ascending', () => {
    const raw = [{ t: 3000, p: 0.7 }, { t: 1000, p: 0.5 }, { t: 2000, p: 0.6 }];
    const result = normalizePriceHistory(raw);
    expect(result.map((r) => r.t)).toEqual([1000, 2000, 3000]);
  });

  it('accepts Kalshi-style ts/value keys', () => {
    const raw = [{ ts: 5000, value: 0.55 }];
    const result = normalizePriceHistory(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ t: 5000, p: 0.55 });
  });
});
