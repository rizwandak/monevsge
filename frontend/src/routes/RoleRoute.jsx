import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleRoute({ allowedRoles = [] }) {
  const { assignments, activeRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memeriksa hak akses...
      </div>
    );
  }

  const userRoles = assignments.map((a) => a.role);
  if (!activeRole && userRoles.length > 1) {
    return <Navigate to="/select-role" replace />;
  }

  const effectiveRole = activeRole || userRoles[0];
  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
