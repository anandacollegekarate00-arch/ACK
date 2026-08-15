// Registrations + achievements for one event — used by the roster card to
// show who's signed up and whether their result has been entered yet.
export function rosterForEvent(eventId, registrations, students) {
  return registrations
    .filter((r) => r.event_id === eventId)
    .map((r) => ({ registration: r, student: students.find((s) => s.id === r.student_id) }))
    .filter((r) => r.student);
}

// Medal summary for one tournament instance — powers the Tournament
// Analytics card on the tournament detail page.
export function tournamentAnalytics(tournamentId, events, registrations, achievements) {
  const evs = events.filter((e) => e.tournament_id === tournamentId);
  const results = achievements.filter((a) => a.tournament_id === tournamentId);
  const registeredIds = new Set(registrations.filter((r) => evs.some((e) => e.id === r.event_id)).map((r) => r.student_id));
  const medals = { Gold: 0, Silver: 0, Bronze: 0 };
  results.forEach((a) => {
    if (medals[a.placement] !== undefined) medals[a.placement]++;
  });
  const byEvent = evs.map((e) => {
    const evResults = results.filter((a) => a.event_id === e.id);
    const evMedals = { Gold: 0, Silver: 0, Bronze: 0 };
    evResults.forEach((a) => {
      if (evMedals[a.placement] !== undefined) evMedals[a.placement]++;
    });
    return {
      event: e,
      registered: registrations.filter((r) => r.event_id === e.id).length,
      results: evResults.length,
      medals: evMedals,
    };
  });
  return { events: evs.length, participants: registeredIds.size, results: results.length, medals, byEvent };
}

// One row per year this series has an instance for — powers the Series
// (cross-year) analytics page, e.g. "Senior School Championship" 26→27→28.
export function seriesYearlyStats(seriesId, tournaments, events, registrations, achievements) {
  return tournaments
    .filter((t) => t.series_id === seriesId)
    .map((t) => ({ tournament: t, ...tournamentAnalytics(t.id, events, registrations, achievements) }))
    .sort((a, b) => (a.tournament.date || '').localeCompare(b.tournament.date || ''));
}

// Formats a Date using its LOCAL calendar fields (no UTC conversion) —
// unlike `d.toISOString().slice(0,10)`, which silently rolls the date back
// a day for any timezone ahead of UTC (e.g. Sri Lanka, UTC+5:30). Every
// place in this app that needs "today" or does date-shifting arithmetic
// should go through this, not toISOString.
