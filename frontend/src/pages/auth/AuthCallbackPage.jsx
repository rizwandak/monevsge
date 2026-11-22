import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD_MAP } from '../../contexts/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { session, registered, assignments, activeRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    if (!registered) {
      navigate('/account-not-registered', { replace: true });
      return;
    }
    if (activeRole) {
      navigate(ROLE_DASHBOARD_MAP[activeRole] || '/select-role', { replace: true });
      return;
    }
    if (assignments.length === 1) {
      const onlyRole = assignments[0].role;
      navigate(ROLE_DASHBOARD_MAP[onlyRole] || '/select-role', { replace: true });
      return;
    }
    navigate('/select-role', { replace: true });
  }, [session, registered, assignments, activeRole, loading, navigate]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
      <p className="text-sm text-slate-600">Memverifikasi akun Google UB Anda...</p>
    </div>
  );
}
