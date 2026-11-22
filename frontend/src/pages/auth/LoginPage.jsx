import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth, ROLE_DASHBOARD_MAP } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, registered, assignments, activeRole, signInWithName } = useAuth();
  const [fullName, setFullName] = useState('');
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Memeriksa koneksi server...' });
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      if (!registered) {
        navigate('/account-not-registered', { replace: true });
      } else if (activeRole) {
        navigate(ROLE_DASHBOARD_MAP[activeRole] || '/select-role', { replace: true });
      } else if (assignments.length > 1) {
        navigate('/select-role', { replace: true });
      }
    }
  }, [session, registered, assignments, activeRole, navigate]);

  useEffect(() => {
    let active = true;
    api
      .get('/health')
      .then((res) => {
        if (active) setBackendStatus({ state: 'ok', message: res.message || 'Server terhubung' });
      })
      .catch(() => {
        if (active) setBackendStatus({ state: 'error', message: 'Backend belum terhubung' });
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAuthError('Masukkan nama lengkap Anda');
      return;
    }
    setAuthError('');
    setSubmitting(true);
    try {
      const targetPath = await signInWithName(fullName.trim());
      navigate(targetPath, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Gagal masuk. Pastikan nama sudah terdaftar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="liquid-glass rounded-3xl p-8">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Kabinet Bumi Cakrawala 2026
      </div>

      <div className="flex items-center gap-3.5 mb-6">
        <img
          src="/logo/kabinet-bumi-cakrawala.png"
          alt="Logo Kabinet Bumi Cakrawala"
          className="w-11 h-11 object-contain shrink-0"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Sistem Evaluasi Tahunan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            BEM FILKOM Universitas Brawijaya
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Contoh: Muhammad Abdillah"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2">
            Gunakan nama lengkap sesuai data kepengurusan yang terdaftar.
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          {submitting ? 'Memeriksa...' : 'Masuk ke Sistem'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {backendStatus.state === 'ok' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-medium">{backendStatus.message}</span>
            </>
          ) : backendStatus.state === 'error' ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-medium">{backendStatus.message}</span>
            </>
          ) : (
            <span className="text-slate-500">{backendStatus.message}</span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-medium">v1.0</span>
      </div>
    </div>
  );
}
