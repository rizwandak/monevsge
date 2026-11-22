import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/authService';
import { useAuth, ROLE_DASHBOARD_MAP } from '../../contexts/AuthContext';

const ROLE_OPTIONS = [
  { value: 'DIRECTOR', label: 'Board of Director' },
  { value: 'C_LEVEL', label: 'C-Level' },
  { value: 'KAPEL', label: 'Ketua Pelaksana' },
  { value: 'STAFF', label: 'Staff' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, registered, assignments, activeRole, signInWithName } = useAuth();
  const [selectedRole, setSelectedRole] = useState('C_LEVEL');
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [directorateId, setDirectorateId] = useState('');
  const [ministryId, setMinistryId] = useState('');
  const [programId, setProgramId] = useState('');
  const [options, setOptions] = useState({ members: [], directorates: [], ministries: [], programs: [] });
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

    authService
      .getLoginOptions()
      .then((res) => {
        if (active && res.data) setOptions(res.data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const roleMembers = options.members.filter((m) => m.role === selectedRole);
  const selectedMember = roleMembers.find((m) => m.full_name === fullName) || null;
  const filteredMinistries = options.ministries.filter((m) => !directorateId || m.directorate_id === directorateId);
  const filteredPrograms = options.programs.filter((p) => !ministryId || p.ministry_id === ministryId);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFullName('');
    setNim('');
    setDirectorateId('');
    setMinistryId('');
    setProgramId('');
    setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRole === 'KAPEL' && (!directorateId || !ministryId || !programId)) {
      setAuthError('Pilih Directorate, Ministry/Bureau, dan Program Kerja terlebih dahulu.');
      return;
    }
    if (!fullName.trim()) {
      setAuthError('Pilih atau masukkan nama lengkap Anda.');
      return;
    }
    if (!nim.trim()) {
      setAuthError('Masukkan NIM Anda sebagai kredensial.');
      return;
    }
    setAuthError('');
    setSubmitting(true);
    try {
      const targetPath = await signInWithName(fullName.trim(), {
        nim: nim.trim(),
        role: selectedRole,
        program_id: programId || undefined,
      });
      navigate(targetPath, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Gagal masuk. Pastikan nama dan NIM sudah sesuai.');
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
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((r) => {
              const active = selectedRole === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRoleChange(r.value)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-semibold text-left transition cursor-pointer border ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-white/55 hover:bg-white/80 text-slate-700 border-white/70'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {selectedRole !== 'KAPEL' ? (
          <>
            <div>
              <label htmlFor="fullNameSelect" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <select
                id="fullNameSelect"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">-- Pilih Nama Anda --</option>
                {roleMembers.map((m) => (
                  <option key={m.assignment_id} value={m.full_name}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMember && (
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1">
                {selectedMember.directorate_name && (
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Directorate:</span> {selectedMember.directorate_name}
                  </div>
                )}
                {selectedMember.ministry_name && (
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Ministry / Bureau:</span> {selectedMember.ministry_name}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label htmlFor="directorate" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Directorate
              </label>
              <select
                id="directorate"
                value={directorateId}
                onChange={(e) => {
                  setDirectorateId(e.target.value);
                  setMinistryId('');
                  setProgramId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">-- Pilih Directorate --</option>
                {options.directorates.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ministry" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ministry / Bureau
              </label>
              <select
                id="ministry"
                value={ministryId}
                disabled={!directorateId}
                onChange={(e) => {
                  setMinistryId(e.target.value);
                  setProgramId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">-- Pilih Ministry / Bureau --</option>
                {filteredMinistries.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="program" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Program Kerja
              </label>
              <select
                id="program"
                value={programId}
                disabled={!ministryId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">-- Pilih Program Kerja --</option>
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="kapelName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Ketua Pelaksana
              </label>
              <input
                id="kapelName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="nim" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            NIM
          </label>
          <input
            id="nim"
            type="text"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            placeholder="Masukkan NIM Anda"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
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
