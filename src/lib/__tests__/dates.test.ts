import { describe, it, expect } from 'vitest';
import { ymd, ackDateParts, todayISO, ACK_TZ } from '../dates';

describe('ymd', () => {
  it('formats from local calendar fields, not UTC', () => {
    expect(ymd(new Date(2026, 7, 15))).toBe('2026-08-15');
    expect(ymd(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('ackDateParts / todayISO', () => {
  it('resolves dates in Asia/Colombo regardless of device timezone', () => {
    const lateNight = ackDateParts(new Date('2026-08-14T20:00:00Z')); // 01:30 Aug 15 in Colombo
    expect(lateNight).toEqual({ y: '2026', m: '08', day: '15' });
    expect(ACK_TZ).toBe('Asia/Colombo');
  });

  it('todayISO always yields a yyyy-mm-dd string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
