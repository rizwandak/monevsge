import { useEffect, useState } from 'react';
import { Trophy, AlertCircle } from 'lucide-react';
import { kpiService } from '../../services/kpiService';

export default function LeaderboardPage() {
  const [data, setData] = useState({ best_ministry: null, ranking: [], incomplete: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpiService
      .getLeaderboard()
      .then((res) => setData(res.data || { best_ministry: null, ranking: [], incomplete: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Memuat leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Leaderboard & Best Ministry</h2>
        <p className="text-xs text-slate-500">Peringkat KPI Final Ministry yang telah memenuhi kelengkapan data.</p>
      </div>

      {data.best_ministry && (
        <div className="bg-emerald-700 text-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-300 font-bold">Best Ministry 2026</div>
              <div className="text-xl font-bold">{data.best_ministry.ministries?.name}</div>
              <div className="text-xs text-emerald-100">{data.best_ministry.ministries?.directorates?.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-300">{data.best_ministry.final_kpi_score}</div>
            <div className="text-xs text-emerald-100">KPI Final</div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Peringkat</th>
              <th className="py-3 px-4">Ministry</th>
              <th className="py-3 px-4">Director (75%)</th>
              <th className="py-3 px-4">KD (25%)</th>
              <th className="py-3 px-4 text-right">KPI Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.ranking.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Belum ada Ministry dengan nilai KPI lengkap.
                </td>
              </tr>
            ) : (
              data.ranking.map((r, idx) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-bold text-slate-700">#{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{r.ministries?.name}</td>
                  <td className="py-3 px-4 text-slate-600">{r.director_score}</td>
                  <td className="py-3 px-4 text-slate-600">{r.kd_score}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">{r.final_kpi_score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.incomplete.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-2">
            <AlertCircle className="w-4 h-4" /> Ministry Belum Lengkap (INCOMPLETE)
          </div>
          <div className="flex flex-wrap gap-2">
            {data.incomplete.map((r) => (
              <span key={r.id} className="px-2.5 py-1 rounded-md bg-white border border-amber-200 text-xs text-amber-800">
                {r.ministries?.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
