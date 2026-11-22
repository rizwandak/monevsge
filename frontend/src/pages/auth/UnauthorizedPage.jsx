import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-lg font-bold text-slate-900 mb-2">Akses Ditolak</h1>
      <p className="text-sm text-slate-600 mb-6">
        Anda tidak memiliki hak akses untuk membuka halaman ini.
      </p>
      <Link
        to="/select-role"
        className="inline-block py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
      >
        Kembali ke Pemilihan Role
      </Link>
    </div>
  );
}
