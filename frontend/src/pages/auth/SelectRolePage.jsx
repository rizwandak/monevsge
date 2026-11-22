import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { profile, assignments, selectRole, signOut } = useAuth();
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const handleSelect = async (assignment) => {
    setError('');
    setLoadingId(assignment.id);
    try {
      const targetPath = await selectRole(assignment.role, assignment.id);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal memilih role');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Pilih Role Akses</h1>
            <p className="text-xs text-slate-500">{profile?.full_name} ({profile?.email})</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {assignments.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={loadingId === a.id}
            onClick={() => handleSelect(a)}
            className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition cursor-pointer"
          >
            <div className="font-semibold text-sm text-slate-900">{a.role}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {a.ministries?.name || a.directorates?.name || 'Akses Tingkat Organisasi'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
