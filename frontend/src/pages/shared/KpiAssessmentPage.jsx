import { useEffect, useState, useCallback } from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { organizationService } from '../../services/organizationService';
import { kpiService } from '../../services/kpiService';
import { useAuth } from '../../contexts/AuthContext';

export default function KpiAssessmentPage() {
  const { activeRole, assignments } = useAuth();
  const isKd = activeRole === 'KD';
  const directorateId = assignments.find((a) => a.role === 'DIRECTOR')?.directorate_id || null;

  const [ministries, setMinistries] = useState([]);
  const [scores, setScores] = useState({});
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [minRes, resRes] = await Promise.all([
        organizationService.getMinistries(isKd ? null : directorateId),
        kpiService.getResults(),
      ]);
      setMinistries(minRes.data || []);
      const map = {};
      (resRes.data || []).forEach((r) => {
        map[r.ministry_id] = isKd ? r.kd_score ?? '' : r.director_score ?? '';
      });
      setScores(map);
    } catch (err) {
      setError(err.message || 'Gagal memuat data KPI');
    } finally {
      setLoading(false);
    }
  }, [directorateId, isKd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (ministryId) => {
    const val = Number(scores[ministryId]);
    if (Number.isNaN(val) || val < 0 || val > 100) {
      setError('Nilai harus antara 0 hingga 100');
      return;
    }
    setError('');
    setMessage('');
    try {
      const payload = { final_score: val, adjustment_reason: reasons[ministryId] || null, lock: false };
      if (isKd) {
        await kpiService.submitKd(ministryId, payload);
      } else {
        await kpiService.submitDirector(ministryId, payload);
      }
      await kpiService.calculate(ministryId);
      setMessage('Nilai KPI berhasil disimpan dan dihitung');
      await loadData();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan nilai KPI');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {isKd ? 'Penilaian KD (Bobot 25%)' : 'KPI Assessment Director (Bobot 75%)'}
        </h2>
        <p className="text-xs text-slate-500">
          KPI Final = (Director Score × 0.75) + (KD Score × 0.25). Status tetap INCOMPLETE jika salah satu belum terisi.
        </p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          Memuat daftar ministry...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Ministry</th>
                <th className="py-3 px-4">Nilai (0 - 100)</th>
                <th className="py-3 px-4">Catatan / Alasan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {ministries.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 px-4 font-medium text-slate-900">{m.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={scores[m.id] ?? ''}
                      onChange={(e) => setScores((p) => ({ ...p, [m.id]: e.target.value }))}
                      className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={reasons[m.id] ?? ''}
                      onChange={(e) => setReasons((p) => ({ ...p, [m.id]: e.target.value }))}
                      placeholder="Catatan penyesuaian..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSave(m.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" /> Simpan & Hitung
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
