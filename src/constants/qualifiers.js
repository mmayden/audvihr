/**
 * qualifiers.js — color maps for qualitative fighter flags and news metadata.
 * Each map links a string rating/category to a CSS variable string for inline color styling.
 * CHIN_COLOR: chin/durability rating colors.
 * CARDIO_COLOR: cardio rating colors.
 * CUT_COLOR: weight cut severity colors.
 * ORG_COLOR: organization badge background colors.
 * RELEVANCE_COLOR: news item trading-relevance signal colors.
 * CATEGORY_COLOR: news item category badge colors.
 */

export const CHIN_COLOR      = { Iron:'var(--green)', Solid:'var(--green)', Questionable:'var(--orange)', 'Stopped Before':'var(--red)' };
export const CARDIO_COLOR    = { Elite:'var(--green)', Good:'var(--green)', Average:'var(--text)', Concern:'var(--red)' };
export const CUT_COLOR       = { Minimal:'var(--green)', Moderate:'var(--text)', 'Heavy Cutter':'var(--orange)', 'Drain Risk':'var(--red)' };
export const ORG_COLOR       = { UFC:'var(--red)', Bellator:'var(--blue)', PFL:'var(--orange)' };
export const RELEVANCE_COLOR = { high:'var(--accent)', medium:'var(--blue)', low:'var(--text-dim)' };
export const CATEGORY_COLOR  = { fight:'var(--green)', injury:'var(--red)', camp:'var(--purple)', 'weigh-in':'var(--orange)', result:'var(--blue)' };
