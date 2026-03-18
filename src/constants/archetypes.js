/**
 * archetypes.js — color maps for fighter archetypes and modifier tags.
 * All values are CSS variable references matching the design system in app.css.
 * ARCH_COLORS: maps primary archetype labels (10) to CSS color strings.
 * MOD_COLORS: maps modifier tag labels to CSS color strings.
 */

export const ARCH_COLORS = {
  'WRESTLER':         'var(--blue)',
  'BJJ / SUB HUNTER': 'var(--green)',
  'PRESSURE FIGHTER': 'var(--accent)',
  'COUNTER STRIKER':  'var(--purple)',
  'KICKBOXER':        'var(--orange)',
  'BOXER-PUNCHER':    'var(--red)',
  'BRAWLER':          'var(--dark-red)',
  'COMPLETE FIGHTER': 'var(--text)',
  'MUAY THAI':        'var(--teal)',
  'CLINCH FIGHTER':   'var(--gold)',
};

export const MOD_COLORS = {
  'SOUTHPAW':          'var(--purple)',
  'VOLUME STRIKER':    'var(--blue)',
  'KO POWER':          'var(--red)',
  'CARDIO CONCERN':    'var(--orange)',
  'WEIGHT CUT FLAG':   'var(--accent)',
  'LATE BLOOMER':      'var(--green)',
  'FRONT-RUNNER':      'var(--dark-red)',
  'STEP-UP CONCERN':   'var(--text-dim)',
  'DURABILITY RISK':   'var(--red)',
  'GUARD DANGER':      'var(--green)',
};
