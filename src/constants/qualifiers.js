/**
 * qualifiers.js — color maps for qualitative fighter flags.
 * Each map links a string rating to a CSS variable string used for inline color styling.
 * CHIN_COLOR: chin/durability rating colors.
 * CARDIO_COLOR: cardio rating colors.
 * CUT_COLOR: weight cut severity colors.
 * ORG_COLOR: organization badge background colors (hex).
 */

export const CHIN_COLOR   = { Iron:'var(--green)', Solid:'var(--green)', Questionable:'var(--orange)', 'Stopped Before':'var(--red)' };
export const CARDIO_COLOR = { Elite:'var(--green)', Good:'var(--green)', Average:'var(--text)', Concern:'var(--red)' };
export const CUT_COLOR    = { Minimal:'var(--green)', Moderate:'var(--text)', 'Heavy Cutter':'var(--orange)', 'Drain Risk':'var(--red)' };
export const ORG_COLOR    = { UFC:'#d95f5f', Bellator:'#5b8dd9', PFL:'#d4804a' };
