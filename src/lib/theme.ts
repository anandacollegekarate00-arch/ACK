export const NAVY = '#0B1F3A';
export const NAVY_SOFT = '#132A4C';
export const ROYAL = '#1F5EFF';
export const GOLD = '#D4AF37';
export const LIGHT_GRAY = '#F6F8FC';
export const SUCCESS = '#34C759';
export const DANGER = '#FF3B30';
export const WARNING = '#FF9500';

// Full Kyu/Dan ranking system. Several ranks (3rd/2nd/1st Kyu) share the
// same "Brown" color, so the belt value stored on a student is the whole
// rank label (e.g. "Brown (3rd Kyu)") — beltColorKey() below maps that back
// to a color for badge styling.
export const BELTS = [
  'White (10th Kyu)',
  'Gray (9th Kyu)',
  'Orange (8th Kyu)',
  'Yellow (7th Kyu)',
  'Green (6th Kyu)',
  'Blue (5th Kyu)',
  'Purple (4th Kyu)',
  'Brown (3rd Kyu)',
  'Brown (2nd Kyu)',
  'Brown (1st Kyu)',
  'Black (1st Dan)',
];

export const BELT_COLOR_STYLE = {
  White: { bg: '#F5F5F0', fg: '#111827', border: '#E3E3DD' },
  Gray: { bg: '#9CA3AF', fg: '#111827', border: '#6B7280' },
  Orange: { bg: '#FF9500', fg: '#fff', border: '#D97C00' },
  Yellow: { bg: '#FFD60A', fg: '#1A1A1A', border: '#E0B800' },
  Green: { bg: '#34C759', fg: '#fff', border: '#249C42' },
  Blue: { bg: '#1F5EFF', fg: '#fff', border: '#154BD9' },
  Purple: { bg: '#8B5CF6', fg: '#fff', border: '#6D28D9' },
  Brown: { bg: '#7B4B2A', fg: '#fff', border: '#5C3717' },
  Black: { bg: '#161616', fg: '#D4AF37', border: '#000' },
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
