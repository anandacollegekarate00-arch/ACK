import React from 'react';
import { GlassHeader, BottomNav } from './components/nav';
import { displayName } from './lib/identity';
import { useAuth } from './hooks/useAuth';
import { useClubData } from './hooks/useClubData';
import { StudentsView, StudentProfilePage } from './features/students';
import { Dashboard } from './features/dashboard';
import { AttendanceView, ManageSessionsModal } from './features/attendance';
import { TournamentDetailPage, SeriesDetailPage, AchievementsView } from './features/achievements';
import { AnalyticsView } from './features/analytics';
import { computeNotifications, NotificationsView } from './features/notifications';
import { ChangePasswordModal, ProfileView, ParentView, ClubHistoryPage } from './features/profile';
import { SplashScreen, LoginScreen } from './features/auth';
import { createSupabaseClients, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from './lib/supabase';

export function AppRoot() {
  const [clients, setClients] = React.useState(null);

  React.useEffect(() => {
    // Always the club's own project — no storage overrides, no gate.
    try {
      setClients(createSupabaseClients(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY));
    } catch (e) {
      setClients(null);
    }
  }, []);

  if (!clients) return <SplashScreen />;
  return (
    <ErrorBoundary>
      <App supabaseClient={clients.client} supabaseSecondaryClient={clients.secondary} />
    </ErrorBoundary>
  );
}

// Render-time crash guard: the global error banner in index.html catches
// load-time failures; this catches React render errors and offers a reload
// instead of a frozen white screen.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center"
          style={{ background: 'var(--ack-bg)', color: 'var(--ack-text)', fontFamily: 'Inter, sans-serif' }}
        >
          <p className="font-semibold" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
            Something went wrong while rendering the app.
          </p>
          <p className="text-sm text-[var(--ack-muted)] max-w-sm break-words">{String(this.state.error.message || this.state.error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--ack-primary, #1F5EFF)' }}
          >
            Reload the app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App({ supabaseClient, supabaseSecondaryClient }) {
  const { session, profile, profileError, loading: authLoading, signIn, signOut, refreshProfile } = useAuth(supabaseClient);
  const isLoggedIn = !!session;
  const data = useClubData(supabaseClient, supabaseSecondaryClient, isLoggedIn, session?.user?.id);

  const [tab, setTab] = React.useState('dashboard');
  const [stack, setStack] = React.useState([]);
  const [pendingAction, setPendingAction] = React.useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('akc-dark-mode') === '1');
  const toggleDarkMode = React.useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('akc-dark-mode', next ? '1' : '0');
      return next;
    });
  }, []);

  const goToTab = React.useCallback((nextTab, action = undefined) => {
    setStack([]);
    setTab(nextTab);
    if (action) setPendingAction(action);
  }, []);
  const consumePendingAction = React.useCallback(() => setPendingAction({}), []);
  const push = React.useCallback((screen) => setStack((prev) => [...prev, screen]), []);
  const goBack = React.useCallback(() => setStack((prev) => prev.slice(0, -1)), []);
  const openStudent = React.useCallback((id) => push(`student:${id}`), [push]);
  const openTournament = React.useCallback((id) => push(`tournament:${id}`), [push]);
  const openSeries = React.useCallback((id) => push(`series:${id}`), [push]);

  // Forced password change: parents created via the coach flow sign in with a
  // random one-time password and a must_change_password flag; block the app
  // until they pick their own password.
  const [forcePwChange, setForcePwChange] = React.useState(false);
  React.useEffect(() => {
    const flagged = !!(isLoggedIn && profile?.role === 'parent' && session?.user?.user_metadata?.must_change_password);
    if (flagged !== forcePwChange) setForcePwChange(flagged);
  }, [isLoggedIn, profile, session, forcePwChange]);

  // Real unread badge: notifications dated after the last visit to the
  // Notifications screen. Parents get a minimal inbox (their own kid), so
  // this badge is computed the same way for them on their own data.
  const notifications = React.useMemo(
    () => (isLoggedIn ? computeNotifications(data.students, data.attendance, data.achievements) : []),
    [isLoggedIn, data.students, data.attendance, data.achievements]
  );
  const unreadCount = React.useMemo(() => {
    const seen = Number(localStorage.getItem('ack-notifications-seen') || 0);
    return notifications.filter((n) => {
      const t = new Date(n.date + 'T00:00:00').getTime();
      return t > seen;
    }).length;
  }, [notifications]);

  if (authLoading || (isLoggedIn && data.loading)) return <SplashScreen />;
  if (!isLoggedIn) return <LoginScreen onSignIn={signIn} />;
  if (!profile) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center gap-3 p-6 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 100%)' }}
      >
        <p className="text-white font-semibold">No profile found for this account.</p>
        <p className="text-gray-400 text-sm max-w-sm">
          Check that a row exists for this user in the `profiles` table with a `role` set (coach, captain, or parent).
        </p>
        {profileError && (
          <div className="mt-2 bg-black/30 rounded-lg p-3 max-w-sm text-left">
            <p className="text-red-300 text-xs font-mono break-words">
              {profileError.message ? `message: ${profileError.message}` : ''}
              {profileError.code ? `\ncode: ${profileError.code}` : ''}
              {profileError.details ? `\ndetails: ${profileError.details}` : ''}
              {profileError.hint ? `\nhint: ${profileError.hint}` : ''}
            </p>
          </div>
        )}
        <button onClick={signOut} className="mt-2 text-sm underline text-gray-300">
          Sign out
        </button>
      </div>
    );
  }

  if (profile.role === 'parent') {
    return (
      <div className={darkMode ? 'ack-dark' : ''}>
        <ParentView
          profile={profile}
          parentLinks={data.parentLinks}
          students={data.students}
          attendance={data.attendance}
          achievements={data.achievements}
          tournaments={data.tournaments}
          tournamentSeries={data.tournamentSeries}
          tournamentEvents={data.tournamentEvents}
          eventRegistrations={data.eventRegistrations}
          supabaseClient={supabaseClient}
          onSignOut={signOut}
        />
        {forcePwChange && <ChangePasswordModal supabaseClient={supabaseClient} required onClose={() => setForcePwChange(false)} />}
      </div>
    );
  }

  const top = stack[stack.length - 1] || null;
  let content, headerTitle;

  if (top === 'notifications') {
    content = <NotificationsView students={data.students} attendance={data.attendance} achievements={data.achievements} />;
    headerTitle = 'Notifications';
  } else if (top === 'history') {
    content = (
      <ClubHistoryPage
        clubHistory={data.clubHistory}
        clubHistoryEntries={data.clubHistoryEntries}
        isStaff={profile.role === 'coach' || profile.role === 'captain'}
        onAddYear={data.addClubYear}
        onUpdateYear={data.updateClubYear}
        onDeleteYear={data.deleteClubYear}
        onAddEntry={data.addClubHistoryEntry}
        onUpdateEntry={data.updateClubHistoryEntry}
        onDeleteEntry={data.deleteClubHistoryEntry}
      />
    );
    headerTitle = 'Club History';
  } else if (top === 'manageSessions') {
    content = (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <ManageSessionsModal sessions={data.sessions} onAdd={data.addSession} onDelete={data.deleteSession} onClose={goBack} />
      </div>
    );
    headerTitle = 'Practice Sessions';
  } else if (top && top.startsWith('student:')) {
    const student = data.students.find((s) => s.id === top.slice(8));
    content = student ? (
      <StudentProfilePage
        student={student}
        attendance={data.attendance}
        achievements={data.achievements}
        tournaments={data.tournaments}
        tournamentSeries={data.tournamentSeries}
        tournamentEvents={data.tournamentEvents}
        eventRegistrations={data.eventRegistrations}
        profiles={data.profiles}
        parentLinks={data.parentLinks}
        onUpdate={data.updateStudent}
        onMarkLeft={data.markStudentLeft}
        onReinstate={data.reinstateStudent}
        onDelete={data.deleteStudent}
        onAddAchievement={data.addAchievement}
        onUpdateAchievement={data.updateAchievement}
        onDeleteAchievement={data.deleteAchievement}
        onCreateParentAccount={data.createParentAccountByPhone}
        onResetParentPassword={data.resetParentPassword}
        openTournament={openTournament}
      />
    ) : (
      <p className="p-6 text-sm text-gray-400">Student not found.</p>
    );
    headerTitle = student ? displayName(student) : 'Student Profile';
  } else if (top && top.startsWith('tournament:')) {
    const tournament = data.tournaments.find((t) => t.id === top.slice(11));
    content = tournament ? (
      <TournamentDetailPage
        tournament={tournament}
        thisSeries={data.tournamentSeries.find((s) => s.id === tournament.series_id)}
        allSeries={data.tournamentSeries}
        students={data.students}
        events={data.tournamentEvents}
        registrations={data.eventRegistrations}
        achievements={data.achievements}
        onAddEvent={data.addEvent}
        onDeleteEvent={data.deleteEvent}
        onRegister={data.registerForEvent}
        onUnregister={data.unregisterFromEvent}
        onSaveResult={(a) => (a.id ? data.updateAchievement(a) : data.addAchievement(a))}
        onDeleteAchievement={data.deleteAchievement}
        onSaveTournament={data.updateTournament}
        onDeleteTournament={async (id) => {
          await data.deleteTournament(id);
          goBack();
        }}
        onCreateSeries={data.addSeries}
        openStudent={openStudent}
        openSeries={openSeries}
      />
    ) : (
      <p className="p-6 text-sm text-gray-400">Tournament not found.</p>
    );
    headerTitle = tournament ? tournament.name : 'Tournament';
  } else if (top && top.startsWith('series:')) {
    const series = data.tournamentSeries.find((s) => s.id === top.slice(7));
    content = series ? (
      <SeriesDetailPage
        series={series}
        tournaments={data.tournaments}
        events={data.tournamentEvents}
        registrations={data.eventRegistrations}
        achievements={data.achievements}
        openTournament={openTournament}
      />
    ) : (
      <p className="p-6 text-sm text-gray-400">Series not found.</p>
    );
    headerTitle = series ? series.name : 'Series';
  } else if (tab === 'dashboard') {
    content = (
      <Dashboard
        profile={profile}
        students={data.students}
        attendance={data.attendance}
        achievements={data.achievements}
        sessions={data.sessions}
        goToTab={goToTab}
        push={push}
      />
    );
    headerTitle = 'Ananda College Karate';
  } else if (tab === 'students') {
    content = (
      <StudentsView
        students={data.students}
        attendance={data.attendance}
        onAddStudent={data.addStudent}
        openStudent={openStudent}
        autoOpenAdd={!!pendingAction.addStudent}
        onConsumeAutoOpen={consumePendingAction}
        onImportStudents={data.addStudentsBatch}
      />
    );
    headerTitle = 'Students';
  } else if (tab === 'attendance') {
    content = (
      <AttendanceView
        students={data.students}
        attendance={data.attendance}
        sessions={data.sessions}
        onMark={data.markAttendance}
        onRemoveMark={data.deleteAttendance}
        onMarkAllAbsent={data.markAllAbsent}
        currentUser={{ ...session.user, name: profile.name }}
      />
    );
    headerTitle = 'Attendance';
  } else if (tab === 'achievements') {
    content = (
      <AchievementsView
        tournaments={data.tournaments}
        tournamentSeries={data.tournamentSeries}
        achievements={data.achievements}
        onAddTournament={data.addTournament}
        onCreateSeries={data.addSeries}
        autoOpenAdd={!!pendingAction.newTournament}
        onConsumeAutoOpen={consumePendingAction}
        openTournament={openTournament}
        openSeries={openSeries}
      />
    );
    headerTitle = 'Tournaments';
  } else if (tab === 'analytics') {
    content = (
      <AnalyticsView
        students={data.students}
        attendance={data.attendance}
        sessions={data.sessions}
        achievements={data.achievements}
        eventRegistrations={data.eventRegistrations}
        openStudent={openStudent}
      />
    );
    headerTitle = 'Analytics';
  } else if (tab === 'profile') {
    content = (
      <ProfileView
        profile={profile}
        user={session.user}
        students={data.students}
        profiles={data.profiles}
        parentLinks={data.parentLinks}
        userPermissions={data.userPermissions}
        supabaseClient={supabaseClient}
        onSignOut={signOut}
        onUpdateProfile={async (patch) => {
          await data.updateOwnProfile(session.user.id, patch);
          await refreshProfile();
        }}
        onCreateStaffAccount={data.createStaffAccount}
        onUpdateUserPermissions={data.updateUserPermissions}
        onDeleteUser={data.deleteUser}
        onResetParentPassword={data.resetParentPassword}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        push={push}
        onOpenHistory={() => push('history')}
      />
    );
    headerTitle = 'My Profile';
  }

  const screenKey = top || tab;

  return (
    <div className={`min-h-dvh bg-[var(--ack-bg)] sm:flex ${darkMode ? 'ack-dark' : ''}`}>
      <BottomNav tab={tab} setTab={goToTab} />
      <div className="flex-1 min-w-0">
        <GlassHeader
          title={headerTitle}
          avatarName={profile.name || session.user.email}
          avatarPhoto={profile.avatar_url}
          onBack={stack.length > 0 ? goBack : undefined}
          onAvatarClick={stack.length === 0 ? () => goToTab('profile') : undefined}
          onBellClick={stack.length === 0 ? () => push('notifications') : undefined}
          unread={unreadCount}
        />
        <div key={screenKey} className="ios-screen-in">
          {content}
        </div>
      </div>
    </div>
  );
}
