import { Link } from 'react-router-dom';
import { Building2, Layers, Shield, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMinistryLogo } from '../../constants/ministryLogos';

const QUICK_ACTIONS = {
  C_LEVEL: [
    { label: 'Evaluasi Proker (SC)', desc: 'Isi atau lanjutkan draft evaluasi proker ministry Anda', to: '/c-level/evaluations/programs' },
    { label: 'Evaluasi SDM', desc: 'Isi formulir evaluasi SDM C-Level', to: '/c-level/evaluations/hr' },
  ],
  STAFF: [
    { label: 'Evaluasi SDM Staff', desc: 'Isi formulir evaluasi SDM Staff', to: '/staff/evaluations/hr' },
  ],
  KAPEL: [
    { label: 'Evaluasi Proker (OC)', desc: 'Isi evaluasi program kerja sebagai OC', to: '/oc/evaluations/programs' },
  ],
  WAKAPEL: [
    { label: 'Evaluasi Proker (OC)', desc: 'Isi evaluasi program kerja sebagai OC', to: '/oc/evaluations/programs' },
  ],
  DIRECTOR: [
    { label: 'Manajemen Proker', desc: 'Kelola proker & PIC di Directorate Anda', to: '/director/programs' },
    { label: 'Evaluasi Proker', desc: 'Tinjau hasil evaluasi SC & OC', to: '/director/evaluations/programs' },
    { label: 'KPI Assessment', desc: 'Berikan penilaian KPI Director (75%)', to: '/director/kpi' },
    { label: 'Leaderboard', desc: 'Lihat peringkat Ministry & Best Ministry', to: '/director/leaderboard' },
  ],
  KD: [
    { label: 'Penilaian KD', desc: 'Berikan penilaian KD (25%) untuk setiap Ministry', to: '/kd/assessments' },
    { label: 'Leaderboard', desc: 'Lihat hasil & peringkat KPI Final', to: '/kd/results' },
  ],
  ADMIN: [
    { label: 'Manajemen Pengguna', desc: 'Kelola akun & penugasan role pengguna', to: '/admin/users' },
    { label: 'Manajemen Proker', desc: 'Kelola seluruh program kerja kabinet', to: '/admin/programs' },
  ],
};

export default function RoleDashboardPage({ roleTitle }) {
  const { profile, activeRole, assignments } = useAuth();
  const activeAssignment = assignments.find((a) => a.role === activeRole);
  const actions = QUICK_ACTIONS[activeRole] || [];

  return (
    <div className="space-y-5">
      {/* Hero Banner Liquid Glass */}
      <div className="liquid-glass-emerald text-white rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              {roleTitle || activeRole}
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Selamat datang, {profile?.full_name || 'Pengguna'}
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl">
              Sistem Evaluasi Tahunan BEM FILKOM UB 2026 — Kabinet Bumi Cakrawala
            </p>
          </div>
          <img
            src="/logo/kabinet-bumi-cakrawala.png"
            alt="Kabinet Bumi Cakrawala"
            className="w-16 h-16 object-contain bg-white/95 rounded-2xl p-2 shadow-sm shrink-0"
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="liquid-glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Role Aktif</div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">{roleTitle || activeRole}</div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-5 flex items-center gap-4">
          {getMinistryLogo(activeAssignment?.ministries?.name) ? (
            <img
              src={getMinistryLogo(activeAssignment?.ministries?.name)}
              alt={activeAssignment?.ministries?.name}
              className="w-11 h-11 rounded-xl bg-white/90 p-1.5 object-contain shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Ministry / Bureau</div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {activeAssignment?.ministries?.name || 'Tingkat Organisasi'}
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Directorate</div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {activeAssignment?.directorates?.name || 'BEM FILKOM UB'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {actions.length > 0 && (
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 px-1">Akses Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {actions.map((act) => (
              <Link
                key={act.to}
                to={act.to}
                className="group liquid-glass hover:scale-[1.01] rounded-2xl p-5 transition flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {act.label}
                  </div>
                  <div className="text-xs text-slate-700 mt-1">{act.desc}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-700 shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
