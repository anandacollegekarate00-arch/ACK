import { describe, it, expect } from 'vitest';
import { phoneToParentEmail, initials, generateAdmissionId, displayName } from '../identity';

describe('phoneToParentEmail', () => {
  it('builds a synthetic email from the digits only', () => {
    expect(phoneToParentEmail('+94 77 123 4567')).toBe('94771234567@parent.anandakarateclub.local');
  });

  it('returns empty for missing input', () => {
    expect(phoneToParentEmail('')).toBe('');
    expect(phoneToParentEmail(null)).toBe('');
  });
});

describe('initials', () => {
  it('takes the first two words', () => {
    expect(initials('kamal perera silva')).toBe('KP');
    expect(initials('Kamal')).toBe('K');
    expect(initials('')).toBe('');
  });
});

describe('generateAdmissionId', () => {
  it('increments within the same year only', () => {
    const roster = [{ admission_id: 'ACK-2026-001' }, { admission_id: 'ACK-2026-002' }, { admission_id: 'ACK-2025-009' }];
    expect(generateAdmissionId(roster, '2026-08-15')).toBe('ACK-2026-003');
  });
});

describe('displayName', () => {
  it('prefers the short name, falls back to full_name', () => {
    expect(displayName({ name: 'Kamal', full_name: 'Kamal Perera' })).toBe('Kamal');
    expect(displayName({ full_name: 'Kamal Perera' })).toBe('Kamal Perera');
    expect(displayName(null)).toBe('Unnamed');
  });
});
