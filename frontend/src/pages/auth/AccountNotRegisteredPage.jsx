import { UserX, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AccountNotRegisteredPage() {
  const { session, signOut } = useAuth();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <UserX className="w-6 h-6" />
      </div>
      <h1 className="text-lg font-bold text-slate-900 mb-2">Akun Belum Terdaftar</h1>
      <p className="text-sm text-slate-600 mb-2">
        Email <span className="font-medium text-slate-800">{session?.user?.email}</span> valid, namun belum memiliki penugasan di sistem evaluasi.
      </p>
      <p className="text-xs text-slate-500 mb-6">
        Silakan hubungi Admin untuk mendaftarkan email dan penugasan Anda.
      </p>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-2 py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </div>
  );
}
