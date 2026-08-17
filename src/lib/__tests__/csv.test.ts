import { describe, it, expect } from 'vitest';
import { parseCSV, normHeaderToken, normalizeISODate, normalizeBelt, csvToStudents } from '../csv';

describe('parseCSV', () => {
  it('parses plain rows with CRLF endings', () => {
    expect(parseCSV('a,b,c\r\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields with commas and escaped quotes', () => {
    expect(parseCSV('"hello, world","say ""hi""",x')).toEqual([['hello, world', 'say "hi"', 'x']]);
  });

  it('strips a UTF-8 BOM', () => {
    expect(parseCSV('\ufeffname,dob\nA,2026-01-01')).toEqual([
      ['name', 'dob'],
      ['A', '2026-01-01'],
    ]);
  });

  it('drops fully-blank lines', () => {
    expect(parseCSV('a\n\nb\n')).toEqual([['a'], ['b']]);
  });
});

describe('normHeaderToken', () => {
  it('normalizes case, spaces and punctuation', () => {
    expect(normHeaderToken('Student Name!')).toBe('studentname');
    expect(normHeaderToken('date of birth')).toBe('dateofbirth');
    expect(normHeaderToken('')).toBe('');
  });
});

describe('normalizeISODate', () => {
  it('passes ISO dates through (truncating a time component)', () => {
    expect(normalizeISODate('2026-08-15T10:00:00Z')).toBe('2026-08-15');
  });

  it('converts dd/mm/yyyy and dd-mm-yy', () => {
    expect(normalizeISODate('15/08/2026')).toBe('2026-08-15');
    expect(normalizeISODate('15-08-26')).toBe('2026-08-15');
  });

  it('returns empty for garbage', () => {
    expect(normalizeISODate('not a date')).toBe('');
    expect(normalizeISODate('')).toBe('');
  });
});

describe('normalizeBelt', () => {
  it('maps black belt variants to the Black label', () => {
    expect(normalizeBelt('Black Belt')).toBe('Black');
    expect(normalizeBelt('1st Dan')).toBe('Black');
  });

  it('maps color names and grey->yellow spelling', () => {
    expect(normalizeBelt('grey belt')).toBe('Yellow (9th Kyu)');
    expect(normalizeBelt('Yellow')).toBe('Yellow (9th Kyu)');
  });

  it('returns null for unrecognized belts', () => {
    expect(normalizeBelt('Rainbow')).toBeNull();
  });
});

describe('csvToStudents', () => {
  const headers = ['Student Name', 'Date of Birth', 'Belt', 'Grade', 'Guardian Name', 'Phone'];

  it('maps a valid row using header synonyms', () => {
    const { valid, skipped } = csvToStudents(headers, [['Amal Perera', '2009-05-14', 'Blue', '9', 'Sunil Perera', '0771234567']], []);
    expect(valid).toHaveLength(1);
    expect(skipped).toHaveLength(0);
    expect(valid[0]).toMatchObject({
      name: 'Amal Perera',
      dob: '2009-05-14',
      belt: 'Blue 1 (5th Kyu)',
      grade: '9',
      guardian_name: 'Sunil Perera',
      guardian_phone: '0771234567',
    });
  });

  it('skips rows with a missing name, reporting the 1-based file line', () => {
    const { valid, skipped } = csvToStudents(headers, [['', '2009-05-14', 'Blue', '9', '', '']], []);
    expect(valid).toHaveLength(0);
    expect(skipped[0]).toMatchObject({ row: 2, reason: expect.stringContaining('missing name') });
  });

  it('skips students already in the roster', () => {
    const roster = [{ name: 'Amal Perera', full_name: 'Amal Perera' }];
    const { valid, skipped } = csvToStudents(headers, [['Amal Perera', '2009-05-14', 'Blue', '9', '', '']], roster);
    expect(valid).toHaveLength(0);
    expect(skipped[0].reason).toContain('already in roster');
  });

  it('skips duplicates within the file', () => {
    const { valid, skipped } = csvToStudents(
      headers,
      [
        ['Amal Perera', '2009-05-14', 'Blue', '9', '', ''],
        ['Amal Perera', '2010-01-01', 'White', '8', '', ''],
      ],
      []
    );
    expect(valid).toHaveLength(1);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain('duplicate in file');
  });

  it('ignores admission-number columns (assigned by the DB trigger)', () => {
    const h = ['Name', 'DOB', 'Admission No'];
    const { valid } = csvToStudents(h, [['Nimal', '2010-02-02', 'ACK-2026-001']], []);
    expect(valid).toHaveLength(1);
    expect(valid[0]).not.toHaveProperty('admission_id');
  });
});
