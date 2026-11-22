import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const ROLE_DASHBOARD_MAP = {
  ADMIN: '/admin/dashboard',
  C_LEVEL: '/c-level/dashboard',
  STAFF: '/staff/dashboard',
  KAPEL: '/oc/dashboard',
  WAKAPEL: '/oc/dashboard',
  DIRECTOR: '/director/dashboard',
  KD: '/kd/dashboard',
  VIEWER: '/director/leaderboard',
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const pid = localStorage.getItem('profile_id');
    return pid ? { profile_id: pid } : null;
  });
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [registered, setRegistered] = useState(true);
  const [activeRole, setActiveRoleState] = useState(() => localStorage.getItem('active_role'));
  const [loading, setLoading] = useState(true);

  const fetchBackendMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      const data = res.data;
      setRegistered(Boolean(data.registered));
      setProfile(data.profile || null);
      setAssignments(data.assignments || []);

      if (data.registered && data.assignments?.length === 1) {
        const onlyRole = data.assignments[0].role;
        localStorage.setItem('active_role', onlyRole);
        setActiveRoleState(onlyRole);
      }
    } catch {
      setProfile(null);
      setAssignments([]);
      setSession(null);
      localStorage.removeItem('profile_id');
      localStorage.removeItem('active_role');
    }
  }, []);

  useEffect(() => {
    const pid = localStorage.getItem('profile_id');
    if (pid) {
      fetchBackendMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchBackendMe]);

  const signInWithName = async (fullName, extra = {}) => {
    const res = await authService.loginByName(fullName, extra);
    const data = res.data;
    localStorage.setItem('profile_id', data.profile.id);
    setSession({ profile_id: data.profile.id });
    setRegistered(true);
    setProfile(data.profile);
    setAssignments(data.assignments || []);

    if (data.assignments?.length === 1) {
      const onlyRole = data.assignments[0].role;
      localStorage.setItem('active_role', onlyRole);
      setActiveRoleState(onlyRole);
      return ROLE_DASHBOARD_MAP[onlyRole] || '/select-role';
    }
    return '/select-role';
  };

  const selectRole = async (role, assignmentId) => {
    await authService.selectRole(role, assignmentId);
    localStorage.setItem('active_role', role);
    setActiveRoleState(role);
    return ROLE_DASHBOARD_MAP[role] || '/login';
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore backend logout error
    }
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('profile_id');
    localStorage.removeItem('active_role');
    setActiveRoleState(null);
    setProfile(null);
    setAssignments([]);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        assignments,
        registered,
        activeRole,
        loading,
        signInWithName,
        selectRole,
        signOut,
        refreshMe: fetchBackendMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
};
