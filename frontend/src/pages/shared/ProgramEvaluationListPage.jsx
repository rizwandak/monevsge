import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { evaluationService } from '../../services/evaluationService';
import { useAuth } from '../../contexts/AuthContext';

export default function ProgramEvaluationListPage({ basePath = '/c-level/evaluations/programs' }) {
  const { activeRole } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    evaluationService
      .listPrograms()
      .then((res) => setPrograms(res.data || []))
      .catch((err) => setError(err.message || 'Gagal memuat daftar evaluasi'))
      .finally(() => setLoading(false));
  }, []);

  const targetType = activeRole === 'C_LEVEL' ? 'SC' : activeRole === 'KAPEL' || activeRole === 'WAKAPEL' ? 'OC' : null;

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Evaluasi Program Kerja</h2>
        <p className="text-xs text-emerald-100/90 mt-0.5">
          Pilih program kerja untuk mengisi atau meninjau evaluasi {targetType ? `(${targetType})` : '(SC & OC)'}.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="liquid-glass rounded-2xl p-8 text-center text-sm text-slate-700">
          Memuat daftar proker...
        </div>
      ) : programs.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-8 text-center">
          <ClipboardCheck className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-800">Tidak ada proker yang ditugaskan untuk evaluasi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {programs.map((p) => {
            const scSub = p.evaluation_submissions?.find((s) => s.evaluation_type === 'SC');
            const ocSub = p.evaluation_submissions?.find((s) => s.evaluation_type === 'OC');
            return (
              <Link
                key={p.id}
                to={`${basePath}/${p.id}`}
                className="liquid-glass hover:scale-[1.01] rounded-2xl p-5 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.ministries?.name}</div>
                  <div className="flex gap-2 mt-3">
                    {[
                      { prefix: 'SC', status: scSub?.status },
                      { prefix: 'OC', status: ocSub?.status },
                    ].map(({ prefix, status }) => {
                      const label =
                        status === 'DRAFT' || status === 'NEEDS_CLARIFICATION'
                          ? `${prefix} - Sedang Mengisi`
                          : status === 'SUBMITTED' ||
                            status === 'REVIEWED' ||
                            status === 'CONFIRMED' ||
                            status === 'LOCKED'
                          ? `${prefix} - Sudah Mengisi`
                          : `${prefix} - Belum Mengisi`;
                      return (
                        <span
                          key={prefix}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
