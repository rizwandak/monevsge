import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ChevronDown, Check } from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/authService';
import { useAuth, ROLE_DASHBOARD_MAP } from '../../contexts/AuthContext';

const ROLE_OPTIONS = [
  { value: 'DIRECTOR', label: 'Board of Director' },
  { value: 'C_LEVEL', label: 'C-Level' },
  { value: 'KAPEL', label: 'Ketua Pelaksana' },
  { value: 'STAFF', label: 'Staff' },
];

function GlassSelect({ value, onChange, options, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm text-left flex items-center justify-between gap-2 transition cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-white/40 border-white/50 text-slate-400'
            : open
            ? 'bg-white/85 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900'
            : 'bg-white/55 hover:bg-white/80 border-white/70 text-slate-900'
        }`}
      >
        <span className={`truncate ${selected ? 'font-medium text-slate-900' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="!absolute left-0 right-0 mt-1.5 z-[100] liquid-glass rounded-2xl p-1.5 max-h-56 overflow-y-auto space-y-1 shadow-2xl">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 text-center">Tidak ada data</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-white/75 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

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

  const roleMembers = options.members.filter((m) => {
    if (m.role !== selectedRole) return false;
    if ((selectedRole === 'C_LEVEL' || selectedRole === 'STAFF') && ministryId) {
      return m.ministry_id === ministryId;
    }
    return true;
  });
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
    if ((selectedRole === 'C_LEVEL' || selectedRole === 'STAFF') && (!directorateId || !ministryId)) {
      setAuthError('Pilih Directorate dan Ministry/Bureau terlebih dahulu.');
      return;
    }
    if (selectedRole === 'KAPEL' && (!ministryId || !programId)) {
      setAuthError('Pilih Ministry/Bureau dan Program Kerja terlebih dahulu.');
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

        {selectedRole === 'DIRECTOR' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <GlassSelect
                value={fullName}
                onChange={setFullName}
                placeholder="-- Pilih Nama Anda --"
                options={roleMembers.map((m) => ({ value: m.full_name, label: m.full_name }))}
              />
            </div>

            {selectedMember?.directorate_name && (
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">Directorate:</span> {selectedMember.directorate_name}
                </div>
              </div>
            )}
          </>
        )}

        {(selectedRole === 'C_LEVEL' || selectedRole === 'STAFF') && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Directorate
              </label>
              <div className="grid grid-cols-2 gap-2">
                {options.directorates.map((d) => {
                  const active = directorateId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDirectorateId(d.id);
                        setMinistryId('');
                        setFullName('');
                      }}
                      className={`px-3 py-2 rounded-2xl text-xs font-semibold text-left transition cursor-pointer border ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-white/55 hover:bg-white/80 text-slate-700 border-white/70'
                      }`}
                    >
                      {d.name.replace(/^Directorate of /i, '')}
                    </button>
                  );
                })}
              </div>
            </div>

            {directorateId && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Ministry / Bureau
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filteredMinistries.map((m) => {
                    const active = ministryId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMinistryId(m.id);
                          setFullName('');
                        }}
                        className={`px-3 py-2 rounded-2xl text-xs font-semibold text-left transition cursor-pointer border ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-white/55 hover:bg-white/80 text-slate-700 border-white/70'
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {ministryId && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <GlassSelect
                  value={fullName}
                  onChange={setFullName}
                  placeholder="-- Pilih Nama Anda --"
                  options={roleMembers.map((m) => ({ value: m.full_name, label: m.full_name }))}
                />
              </div>
            )}
          </>
        )}

        {selectedRole === 'KAPEL' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ministry / Bureau
              </label>
              <GlassSelect
                value={ministryId}
                onChange={(val) => {
                  setMinistryId(val);
                  setProgramId('');
                }}
                placeholder="-- Pilih Ministry / Bureau --"
                options={options.ministries.map((m) => ({ value: m.id, label: m.name }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Program Kerja
              </label>
              <GlassSelect
                value={programId}
                disabled={!ministryId}
                onChange={setProgramId}
                placeholder="-- Pilih Program Kerja --"
                options={filteredPrograms.map((p) => ({ value: p.id, label: p.name }))}
              />
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
