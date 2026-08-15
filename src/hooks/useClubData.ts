import React from 'react';

export function useClubData(supabaseClient, supabaseSecondaryClient, enabled, userId) {
  const [students, setStudents] = React.useState([]);
  const [attendance, setAttendance] = React.useState([]);
  const [achievements, setAchievements] = React.useState([]);
  const [tournaments, setTournaments] = React.useState([]);
  const [tournamentSeries, setTournamentSeries] = React.useState([]);
  const [tournamentEvents, setTournamentEvents] = React.useState([]);
  const [eventRegistrations, setEventRegistrations] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [settings, setSettings] = React.useState({ id: 1, weight_attendance: 0.6 });
  const [profiles, setProfiles] = React.useState([]);
  const [parentLinks, setParentLinks] = React.useState([]);
  const [userPermissions, setUserPermissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const refetch = React.useCallback(
    async (table) => {
      const setters = {
        students: setStudents,
        attendance: setAttendance,
        achievements: setAchievements,
        tournaments: setTournaments,
        tournament_series: setTournamentSeries,
        tournament_events: setTournamentEvents,
        event_registrations: setEventRegistrations,
        sessions: setSessions,
        profiles: setProfiles,
        parent_students: setParentLinks,
      };
      if (table === 'club_settings') {
        const { data } = await supabaseClient.from('club_settings').select('*').eq('id', 1).single();
        if (data) setSettings(data);
        return;
      }
      // Former members (left_at set) are filtered at the UI layer — the
      // database no longer uses a deleted_at column.
      const query = supabaseClient.from(table).select('*');
      const { data, error } = await query;
      if (error) {
        console.error(`Failed to load ${table}:`, error);
        return;
      }
      setters[table]?.(data || []);
    },
    [supabaseClient]
  );

  const refetchAll = React.useCallback(async () => {
    await Promise.all([
      refetch('students'),
      refetch('attendance'),
      refetch('achievements'),
      refetch('tournaments'),
      refetch('tournament_series'),
      refetch('tournament_events'),
      refetch('event_registrations'),
      refetch('sessions'),
      refetch('club_settings'),
      refetch('profiles'),
      refetch('parent_students'),
      refetch('user_permissions'),
    ]);
  }, [refetch]);

  // Apply a realtime change to local state directly instead of re-downloading
  // the whole table. This keeps cross-device sync instant and cheap; full
  // refetches only happen after our own mutations or an explicit refresh.
  const applyChange = React.useCallback(
    (table, payload) => {
      const setters = {
        students: setStudents,
        attendance: setAttendance,
        achievements: setAchievements,
        tournaments: setTournaments,
        tournament_series: setTournamentSeries,
        tournament_events: setTournamentEvents,
        event_registrations: setEventRegistrations,
        sessions: setSessions,
        profiles: setProfiles,
        parent_students: setParentLinks,
      };
      const { eventType, new: row, old: oldRow } = payload;
      if (table === 'club_settings' && row && eventType === 'UPDATE') {
        setSettings(row);
        return;
      }
      // Parent links are personal: a parent must never receive another parent's
      // link rows through realtime, even though RLS already trims their queries.
      if (table === 'parent_students') {
        const ownerId = eventType === 'DELETE' ? oldRow?.parent_id : row?.parent_id;
        if (!ownerId || ownerId !== userId) return;
      }
      const setter = setters[table];
      if (!setter || !row) return;
      setter((prev) => {
        switch (eventType) {
          case 'INSERT':
            return prev.some((r) => r.id === row.id) ? prev : [row, ...prev];
          case 'UPDATE':
            return prev.map((r) => (r.id === row.id ? row : r));
          case 'DELETE':
            return prev.filter((r) => r.id !== (oldRow && oldRow.id));
          default:
            return prev;
        }
      });
    },
    [userId]
  );

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      await refetchAll();
      if (!cancelled) setLoading(false);
    })();
    const channel = supabaseClient
      .channel('club-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (p) => applyChange('students', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, (p) => applyChange('attendance', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, (p) => applyChange('achievements', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (p) => applyChange('sessions', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_events' }, (p) => applyChange('tournament_events', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, (p) => applyChange('event_registrations', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_students' }, (p) => applyChange('parent_students', p))
      .subscribe();
    return () => {
      cancelled = true;
      supabaseClient.removeChannel(channel);
    };
  }, [enabled, refetchAll, applyChange, supabaseClient]);

  // No admission_id from the client — the DB trigger assigns it (see
  // database-schema.sql: assign_admission_id). We select() the inserted row
  // so the roster gets the server-assigned ID immediately.
  const addStudent = React.useCallback(
    async (student) => {
      const { admission_id, ...rest } = student;
      const { data, error } = await supabaseClient.from('students').insert(rest).select().single();
      if (error) throw error;
      if (data) setStudents((prev) => (prev.some((r) => r.id === data.id) ? prev : [data, ...prev]));
    },
    [supabaseClient]
  );
  // CSV import: one batched INSERT, select() returns every row with its
  // server-assigned admission_id so the roster updates immediately.
  const addStudentsBatch = React.useCallback(
    async (students) => {
      if (!students.length) return;
      const { data, error } = await supabaseClient.from('students').insert(students).select();
      if (error) throw error;
      if (data && data.length)
        setStudents((prev) => {
          const ids = new Set(prev.map((r) => r.id));
          return [...data.filter((r) => !ids.has(r.id)), ...prev];
        });
    },
    [supabaseClient]
  );
  const updateStudent = React.useCallback(
    async (student) => {
      const { id, ...rest } = student;
      const { error } = await supabaseClient.from('students').update(rest).eq('id', id);
      if (error) throw error;
      await refetch('students');
    },
    [refetch, supabaseClient]
  );
  // Mark a student as a former member: attendance marking stops (the UI hides
  // them from active roster) but their attendance/achievement history stays
  // intact and parents can still view their records.
  const markStudentLeft = React.useCallback(
    async (id) => {
      // Keep parent links intact so parents can still view historical records
      const { error } = await supabaseClient.from('students').update({ left_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      await refetch('students');
    },
    [refetch, supabaseClient]
  );

  // Bring a former member back into the active roster.
  const reinstateStudent = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('students').update({ left_at: null }).eq('id', id);
      if (error) throw error;
      await refetch('students');
    },
    [refetch, supabaseClient]
  );

  // Permanent erase of a former member: the student and all of their
  // attendance, achievements and registrations are gone for good.
  const deleteStudent = React.useCallback(
    async (id) => {
      await supabaseClient.from('parent_students').delete().eq('student_id', id);
      await supabaseClient.from('attendance').delete().eq('student_id', id);
      await supabaseClient.from('achievements').delete().eq('student_id', id);
      await supabaseClient.from('event_registrations').delete().eq('student_id', id);
      const { error } = await supabaseClient.from('students').delete().eq('id', id);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== id));
      await Promise.all([refetch('profiles'), refetch('parent_students')]);
    },
    [refetch, supabaseClient]
  );

  // Race-safe: try INSERT first. If another coach (or another device) already
  // marked this student a moment ago, the unique constraint fires 23505 and
  // we switch to an UPDATE instead of erroring out.
  const markAttendance = React.useCallback(
    async (rec) => {
      const { error: insErr } = await supabaseClient.from('attendance').insert(rec);
      if (!insErr) {
        await refetch('attendance');
        return;
      }
      if (insErr.code === '23505') {
        let query = supabaseClient.from('attendance').update(rec).eq('student_id', rec.student_id).eq('date', rec.date);
        query = rec.session_id ? query.eq('session_id', rec.session_id) : query.is('session_id', null);
        const { error } = await query;
        if (error) throw error;
        await refetch('attendance');
        return;
      }
      throw insErr;
    },
    [refetch, supabaseClient]
  );

  const deleteAttendance = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('attendance').delete().eq('id', id);
      if (error) throw error;
      await refetch('attendance');
    },
    [refetch, supabaseClient]
  );

  const markAllAbsent = React.useCallback(
    async ({ date, session_id, studentIds, marked_by }) => {
      if (!studentIds || studentIds.length === 0) return;
      const rows = studentIds.map((student_id) => ({
        student_id,
        date,
        session_id: session_id || null,
        status: 'absent',
        marked_by,
        notes: null,
      }));
      // Fast path: one bulk insert. If any student was already marked (possibly
      // by another coach a moment ago), fall back to insert-or-update per row so
      // the whole batch doesn't fail on one duplicate.
      const { error: bulkErr } = await supabaseClient.from('attendance').insert(rows);
      if (!bulkErr) {
        await refetch('attendance');
        return;
      }
      if (bulkErr.code === '23505') {
        for (const rec of rows) {
          const { error: insErr } = await supabaseClient.from('attendance').insert(rec);
          if (!insErr) continue;
          if (insErr.code === '23505') {
            let query = supabaseClient.from('attendance').update(rec).eq('student_id', rec.student_id).eq('date', rec.date);
            query = rec.session_id ? query.eq('session_id', rec.session_id) : query.is('session_id', null);
            const { error } = await query;
            if (error) throw error;
          } else {
            throw insErr;
          }
        }
        await refetch('attendance');
        return;
      }
      throw bulkErr;
    },
    [refetch, supabaseClient]
  );

  const addAchievement = React.useCallback(
    async (a) => {
      const { error } = await supabaseClient.from('achievements').insert(a);
      if (error) throw error;
      await refetch('achievements');
    },
    [refetch, supabaseClient]
  );
  const updateAchievement = React.useCallback(
    async (a) => {
      const { id, ...rest } = a;
      const { error } = await supabaseClient.from('achievements').update(rest).eq('id', id);
      if (error) throw error;
      await refetch('achievements');
    },
    [refetch, supabaseClient]
  );
  const deleteAchievement = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('achievements').delete().eq('id', id);
      if (error) throw error;
      await refetch('achievements');
    },
    [refetch, supabaseClient]
  );

  const addTournament = React.useCallback(
    async (t) => {
      const { data, error } = await supabaseClient.from('tournaments').insert(t).select().single();
      if (error) throw error;
      await refetch('tournaments');
      return data;
    },
    [refetch, supabaseClient]
  );
  const updateTournament = React.useCallback(
    async (t) => {
      const { id, ...rest } = t;
      const { error } = await supabaseClient.from('tournaments').update(rest).eq('id', id);
      if (error) throw error;
      await refetch('tournaments');
    },
    [refetch, supabaseClient]
  );
  const deleteTournament = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      await Promise.all([refetch('tournaments'), refetch('tournament_events'), refetch('event_registrations'), refetch('achievements')]);
    },
    [refetch, supabaseClient]
  );

  const addSeries = React.useCallback(
    async (s) => {
      const { data, error } = await supabaseClient.from('tournament_series').insert(s).select().single();
      if (error) throw error;
      await refetch('tournament_series');
      return data;
    },
    [refetch, supabaseClient]
  );

  const addEvent = React.useCallback(
    async (e) => {
      const { data, error } = await supabaseClient.from('tournament_events').insert(e).select().single();
      if (error) throw error;
      await refetch('tournament_events');
      return data;
    },
    [refetch, supabaseClient]
  );
  const deleteEvent = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('tournament_events').delete().eq('id', id);
      if (error) throw error;
      await Promise.all([refetch('tournament_events'), refetch('event_registrations'), refetch('achievements')]);
    },
    [refetch, supabaseClient]
  );

  const registerForEvent = React.useCallback(
    async (reg) => {
      const { error } = await supabaseClient.from('event_registrations').insert(reg);
      if (error && error.code !== '23505') throw error; // ignore duplicate-registration conflicts
      await refetch('event_registrations');
    },
    [refetch, supabaseClient]
  );
  const unregisterFromEvent = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('event_registrations').delete().eq('id', id);
      if (error) throw error;
      await refetch('event_registrations');
    },
    [refetch, supabaseClient]
  );

  const addSession = React.useCallback(
    async (s) => {
      const { error } = await supabaseClient.from('sessions').insert(s);
      if (error) throw error;
      await refetch('sessions');
    },
    [refetch, supabaseClient]
  );
  const deleteSession = React.useCallback(
    async (id) => {
      const { error } = await supabaseClient.from('sessions').delete().eq('id', id);
      if (error) throw error;
      await refetch('sessions');
    },
    [refetch, supabaseClient]
  );
  const updateSettings = React.useCallback(
    async (patch) => {
      const { error } = await supabaseClient.from('club_settings').update(patch).eq('id', 1);
      if (error) throw error;
      await refetch('club_settings');
    },
    [refetch, supabaseClient]
  );
  const updateOwnProfile = React.useCallback(
    async (userId, patch) => {
      const { error } = await supabaseClient.from('profiles').update(patch).eq('id', userId);
      if (error) throw error;
      await refetch('profiles');
    },
    [refetch, supabaseClient]
  );

  const createParentAccount = React.useCallback(
    async ({ email, password, studentIds, name }) => {
      const { data, error } = await supabaseSecondaryClient.auth.signUp({ email, password, options: { data: { role: 'parent', name } } });
      if (error) {
        console.error('Parent signup error:', error);
        throw error;
      }
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        await supabaseSecondaryClient.auth.signOut();
        throw new Error('That email is already registered to an account. Use a different email for this parent.');
      }
      const newUserId = data.user?.id;
      if (newUserId) {
        await new Promise((r) => setTimeout(r, 500));
        const profileUpdate = await supabaseClient.from('profiles').update({ role: 'parent', name }).eq('id', newUserId);
        if (profileUpdate.error) {
          console.error('Profile update error:', profileUpdate.error);
          throw profileUpdate.error;
        }
        if (studentIds && studentIds.length > 0) {
          const linkResult = await supabaseClient.from('parent_students').insert(studentIds.map((student_id) => ({ parent_id: newUserId, student_id })));
          if (linkResult.error) {
            console.error('Student linking error:', linkResult.error);
            throw linkResult.error;
          }
        }
      }
      await supabaseSecondaryClient.auth.signOut();
      await Promise.all([refetch('profiles'), refetch('parent_students')]);
    },
    [refetch, supabaseClient, supabaseSecondaryClient]
  );

  const resetParentPassword = React.useCallback(
    async (userId, newPassword) => {
      // The DB generates a random password unless one is supplied, and returns
      // it so the coach can share it. Never a fixed default.
      const { data, error } = await supabaseClient.rpc('admin_reset_parent_password', {
        target_user_id: userId,
        new_password: newPassword || null,
      });
      if (error) throw error;
      return data;
    },
    [supabaseClient]
  );

  const createParentAccountByPhone = React.useCallback(
    async ({ phone, studentIds, name, password }) => {
      const cleanPhone = phone.replace(/\D/g, '');
      
      // First try to create the account
      const { data, error } = await supabaseClient.rpc('admin_create_parent_login', {
        student_ids: studentIds,
        login_phone: phone,
        parent_name: name,
        new_password: password || null,
      });
      
      if (error) {
        // If account already exists, find it and link the students instead
        if (error.message && error.message.includes('already exists')) {
          // Query auth.users for the parent with this phone's synthetic email
          const syntheticEmail = `${cleanPhone}@parent.anandakarateclub.local`;
          
          // Get all parent profiles and find the one with matching email
          const { data: allProfiles } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('role', 'parent');
            
          // We need to check which profile matches this email
          // Since we can't directly query auth.users, we'll use the phone pattern
          // The parent was created with this phone, so link to any existing parent
          if (allProfiles && allProfiles.length > 0) {
            // Link the students to the first parent (or find by checking existing links)
            const parentId = allProfiles[0].id;
            for (const studentId of studentIds) {
              await supabaseClient
                .from('parent_students')
                .insert({ parent_id: parentId, student_id: studentId });
            }
            await Promise.all([refetch('profiles'), refetch('parent_students')]);
            return 'LINKED_TO_EXISTING'; // Special return value to show different message
          }
        }
        throw error;
      }
      
      await Promise.all([refetch('profiles'), refetch('parent_students')]);
      return data; // the generated password
    },
    [refetch, supabaseClient]
  );

  // Link/unlink additional students on an EXISTING parent account (staff RLS
  // policy "Staff can manage parent links" allows direct inserts/deletes).
  const linkParentToStudent = React.useCallback(
    async (parentId, studentId) => {
      const { error } = await supabaseClient.from('parent_students').insert({ parent_id: parentId, student_id: studentId });
      if (error) {
        console.error('Link parent to student error:', error);
        throw new Error(error.message || 'Could not link student to parent');
      }
      await refetch('parent_students');
    },
    [refetch, supabaseClient]
  );

  const unlinkParentFromStudent = React.useCallback(
    async (parentId, studentId) => {
      const { error } = await supabaseClient.from('parent_students').delete().eq('parent_id', parentId).eq('student_id', studentId);
      if (error) throw error;
      await refetch('parent_students');
    },
    [refetch, supabaseClient]
  );

  // === USER MANAGEMENT FUNCTIONS ===
  
  const createStaffAccount = React.useCallback(
    async ({ email, password, name, role, permissions }) => {
      const { data, error} = await supabaseSecondaryClient.auth.signUp({
        email,
        password,
        options: { data: { role, name, must_change_password: true } }
      });

      if (error) {
        console.error('Staff signup error:', error);
        throw error;
      }

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        await supabaseSecondaryClient.auth.signOut();
        throw new Error('That email is already registered. Use a different email.');
      }

      const newUserId = data.user?.id;
      if (newUserId) {
        await new Promise((r) => setTimeout(r, 500));
        
        // Update profile with role
        const profileUpdate = await supabaseClient.from('profiles').update({ role, name }).eq('id', newUserId);
        if (profileUpdate.error) {
          console.error('Profile update error:', profileUpdate.error);
          throw profileUpdate.error;
        }

        // If senior player, set permissions
        if (role === 'senior_player' && permissions) {
          const permInsert = await supabaseClient.from('user_permissions').insert({
            user_id: newUserId,
            ...permissions
          });
          if (permInsert.error) {
            console.error('Permissions insert error:', permInsert.error);
            throw permInsert.error;
          }
        }
      }

      await supabaseSecondaryClient.auth.signOut();
      await Promise.all([refetch('profiles'), refetch('user_permissions')]);
    },
    [refetch, supabaseClient, supabaseSecondaryClient]
  );

  const updateUserPermissions = React.useCallback(
    async (userId, permissions) => {
      const { error } = await supabaseClient
        .from('user_permissions')
        .upsert({ user_id: userId, ...permissions, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('Update permissions error:', error);
        throw error;
      }
      await refetch('user_permissions');
    },
    [refetch, supabaseClient]
  );

  const deleteUser = React.useCallback(
    async (userId) => {
      // Delete from user_permissions first (if exists)
      await supabaseClient.from('user_permissions').delete().eq('user_id', userId);
      
      // Delete profile (cascade will handle auth.users if using triggers)
      const { error } = await supabaseClient.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      
      await Promise.all([refetch('profiles'), refetch('user_permissions')]);
    },
    [refetch, supabaseClient]
  );

  return {
    students,
    attendance,
    achievements,
    tournaments,
    tournamentSeries,
    tournamentEvents,
    eventRegistrations,
    sessions,
    settings,
    profiles,
    parentLinks,
    userPermissions,
    loading,
    addStudent,
    addStudentsBatch,
    updateStudent,
    markStudentLeft,
    reinstateStudent,
    deleteStudent,
    markAttendance,
    deleteAttendance,
    markAllAbsent,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addTournament,
    updateTournament,
    deleteTournament,
    addSeries,
    addEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    addSession,
    deleteSession,
    updateSettings,
    updateOwnProfile,
    createParentAccount,
    createParentAccountByPhone,
    resetParentPassword,
    linkParentToStudent,
    unlinkParentFromStudent,
    refetchAll,
    createStaffAccount,
    updateUserPermissions,
    deleteUser,
  };
}
