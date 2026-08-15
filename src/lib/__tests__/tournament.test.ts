import { describe, it, expect } from 'vitest';
import { rosterForEvent, tournamentAnalytics, seriesYearlyStats } from '../tournament';

const reg = (id: string, eventId: string, studentId: string) => ({ id, event_id: eventId, student_id: studentId });
const event = (id: string, tournamentId: string) => ({ id, tournament_id: tournamentId, name: id });
const ach = (id: string, tournamentId: string, eventId: string, studentId: string, placement: string) => ({
  id,
  tournament_id: tournamentId,
  event_id: eventId,
  student_id: studentId,
  placement,
  title: 'x',
  level: 'School',
  date: '2026-08-01',
});

describe('rosterForEvent', () => {
  it('returns registrations joined to students, dropping unknowns', () => {
    const students = [{ id: 's1' }, { id: 's2' }];
    const out = rosterForEvent(
      'e1',
      [reg('r1', 'e1', 's1'), reg('r2', 'e1', 's2'), reg('r3', 'e2', 's1'), reg('r4', 'e1', 's9')],
      students
    );
    expect(out.map((r) => r.registration.id)).toEqual(['r1', 'r2']);
    expect(out.every((r) => r.student)).toBe(true);
  });
});

describe('tournamentAnalytics', () => {
  const events = [event('e1', 't1'), event('e2', 't1')];
  const registrations = [reg('r1', 'e1', 's1'), reg('r2', 'e1', 's2'), reg('r3', 'e2', 's1')];
  const achievements = [
    ach('a1', 't1', 'e1', 's1', 'Gold'),
    ach('a2', 't1', 'e1', 's2', 'Silver'),
    ach('a3', 't1', 'e1', 's1', 'Best 8'),
    ach('a4', 't2', 'e2', 's1', 'Gold'), // different tournament — excluded
  ];

  it('tallies medals, unique participants and per-event detail', () => {
    const a = tournamentAnalytics('t1', events, registrations, achievements);
    expect(a).toMatchObject({ events: 2, participants: 2, results: 3, medals: { Gold: 1, Silver: 1, Bronze: 0 } });
    expect(a.byEvent.find((e) => e.event.id === 'e1')).toMatchObject({
      registered: 2,
      results: 3,
      medals: { Gold: 1, Silver: 1, Bronze: 0 },
    });
    expect(a.byEvent.find((e) => e.event.id === 'e2')).toMatchObject({
      registered: 1,
      results: 0,
      medals: { Gold: 0, Silver: 0, Bronze: 0 },
    });
  });

  it('counts each participant once', () => {
    const regs = [reg('r1', 'e1', 's1'), reg('r2', 'e2', 's1')];
    expect(tournamentAnalytics('t1', events, regs, []).participants).toBe(1);
  });
});

describe('seriesYearlyStats', () => {
  it('returns one analytics row per year, sorted by tournament date', () => {
    const tournaments = [
      { id: 't1', series_id: 'ser1', name: '2026', date: '2026-08-01' },
      { id: 't2', series_id: 'ser1', name: '2025', date: '2025-08-01' },
      { id: 't3', series_id: 'ser2', name: 'Other', date: '2026-09-01' },
    ];
    const out = seriesYearlyStats('ser1', tournaments, [], [], []);
    expect(out.map((x) => x.tournament.id)).toEqual(['t2', 't1']);
    expect(out[0]).toHaveProperty('events');
    expect(out[0]).toHaveProperty('medals');
  });
});
