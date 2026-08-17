export const NAVY = '#0B1F3A';
export const NAVY_SOFT = '#132A4C';
export const ROYAL = '#1F5EFF';
export const GOLD = '#D4AF37';
export const LIGHT_GRAY = '#F6F8FC';
export const SUCCESS = '#34C759';
export const DANGER = '#FF3B30';
export const WARNING = '#FF9500';

// Full Kyu ranking system. Several ranks (3rd/2nd/1st Kyu) share the
// same "Brown" color, and Blue is split into Blue 1 / Blue 2 —
// beltColorKey() extracts the first word of the label to map back to a color.
export const BELTS = [
  'White (10th Kyu)',
  'Yellow (9th Kyu)',
  'Orange (8th Kyu)',
  'Green (7th Kyu)',
  'Purple (6th Kyu)',
  'Blue 1 (5th Kyu)',
  'Blue 2 (4th Kyu)',
  'Brown 1 (3rd Kyu)',
  'Brown 2 (2nd Kyu)',
  'Brown 3 (1st Kyu)',
  'Black',
];

export const BELT_COLOR_STYLE = {
  White:  { bg: '#F5F5F0', fg: '#111827', border: '#E3E3DD' },
  Yellow: { bg: '#FFD60A', fg: '#1A1A1A', border: '#E0B800' },
  Orange: { bg: '#FF9500', fg: '#fff',    border: '#D97C00' },
  Green:  { bg: '#34C759', fg: '#fff',    border: '#249C42' },
  Purple: { bg: '#8B5CF6', fg: '#fff',    border: '#6D28D9' },
  Blue:   { bg: '#1F5EFF', fg: '#fff',    border: '#154BD9' },
  Brown:  { bg: '#7B4B2A', fg: '#fff',    border: '#5C3717' },
  Black:  { bg: '#161616', fg: '#D4AF37', border: '#000'    },
};

export function beltColorKey(belt) {
  const word = (belt || '').split(' ')[0];
  return BELT_COLOR_STYLE[word] ? word : 'White';
}

export function beltStyle(belt) {
  return BELT_COLOR_STYLE[beltColorKey(belt)];
}

export const LEVEL_STYLE = {
  School: { color: '#9CA3AF' },
  Zonal: { color: '#1F5EFF' },
  Provincial: { color: '#34C759' },
  National: { color: '#FF9500' },
  International: { color: '#D4AF37' },
};
export const LEVELS = Object.keys(LEVEL_STYLE);

export const PLACEMENT_STYLE = {
  Gold: { bg: '#D4AF371A', fg: '#B8860B' },
  Silver: { bg: '#9CA3AF1A', fg: '#6B7280' },
  Bronze: { bg: '#CD7F321A', fg: '#B4622A' },
  'Best 8': { bg: '#1F5EFF1A', fg: '#1F5EFF' },
  Participant: { bg: '#F3F4F6', fg: '#6B7280' },
  'Did Not Participate': { bg: '#FF3B301A', fg: '#FF3B30' },
};
export const PLACEMENTS = Object.keys(PLACEMENT_STYLE);
export const EVENT_PRESETS = { individual: ['Kata', 'Kumite'], team: ['Team Kata', 'Team Kumite'] };
