import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, RefreshCw, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout({ title = 'Dashboard', navItems = [] }) {
  const { profile, activeRole, assignments, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (profile?.full_name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="min-h-screen bg-emerald-950 bg-cover bg-center bg-fixed p-3 sm:p-4 md:p-5 flex gap-4 md:gap-5 relative overflow-x-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(6, 78, 59, 0.55), rgba(15, 23, 42, 0.45)), url('/images/bg-liquid.png')",
      }}
    >
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating Sidebar Glass (Desktop: static, Mobile: slide-over only when open) */}
      <aside
        className={`${
          mobileOpen ? '!fixed top-3 bottom-6 left-3 z-[100] flex max-h-[calc(100dvh-2.25rem)] overflow-y-auto' : 'hidden'
        } lg:static lg:flex w-64 liquid-glass rounded-3xl flex-col justify-between shrink-0 lg:min-h-[calc(100vh-2.5rem)] lg:self-start`}
      >
        <div>
          <div className="h-16 px-5 border-b border-slate-900/10 flex items-center gap-3">
            <img
              src="/logo/kabinet-bumi-cakrawala.png"
              alt="Logo Kabinet Bumi Cakrawala"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                MONEV <span className="text-emerald-700">2026</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-medium">Bumi Cakrawala</div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="ml-auto p-1.5 rounded-xl text-slate-500 hover:bg-white/60 lg:hidden cursor-pointer"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 pt-5 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
              Menu Utama
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard
                    className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-900/10 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {profile?.full_name}
              </div>
              <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-emerald-600/15 text-emerald-800 text-[10px] font-semibold">
                {activeRole === 'C_LEVEL' ? 'C-Level' : activeRole}
              </div>
              {(() => {
                const activeAssignment = assignments.find((a) => a.role === activeRole);
                const unitName = activeAssignment?.ministries?.name || activeAssignment?.directorates?.name;
                return unitName ? (
                  <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5" title={unitName}>
                    {unitName}
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {assignments.length > 1 && (
            <Link
              to="/select-role"
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Ganti Role
            </Link>
          )}
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50/80 hover:bg-red-100 text-red-700 text-sm font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area with Floating Topbar */}
      <div className="flex-1 flex flex-col min-w-0 gap-4 md:gap-5">
        <header className="h-14 sm:h-16 liquid-glass rounded-3xl px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-white/60 lg:hidden cursor-pointer shrink-0"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-[11px] sm:text-xs font-semibold">
              Periode 2026
            </span>
          </div>
        </header>
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
