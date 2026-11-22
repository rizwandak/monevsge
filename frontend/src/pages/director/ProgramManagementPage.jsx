import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Users, FolderKanban } from 'lucide-react';
import { programService } from '../../services/programService';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';

export default function ProgramManagementPage() {
  const { activeRole, assignments } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', ministry_id: '', description: '' });
  const [saving, setSaving] = useState(false);

  const directorateId = assignments.find((a) => a.role === 'DIRECTOR')?.directorate_id || null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [progRes, minRes] = await Promise.all([
        programService.list(directorateId ? { directorate_id: directorateId } : {}),
        organizationService.getMinistries(directorateId),
      ]);
      setPrograms(progRes.data || []);
      setMinistries(minRes.data || []);
      if (minRes.data?.length && !form.ministry_id) {
        setForm((prev) => ({ ...prev, ministry_id: minRes.data[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data proker');
    } finally {
      setLoading(false);
    }
  }, [directorateId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.ministry_id) return;
    setSaving(true);
    setError('');
    try {
      const selectedMin = ministries.find((m) => m.id === form.ministry_id);
      await programService.create({
        name: form.name.trim(),
        ministry_id: form.ministry_id,
        directorate_id: selectedMin?.directorate_id || directorateId,
        description: form.description.trim() || null,
      });
      setForm({ name: '', ministry_id: ministries[0]?.id || '', description: '' });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Gagal menambahkan proker');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus proker "${name}"?`)) return;
    try {
      await programService.remove(id);
      await loadData();
    } catch (err) {
      setError(err.message || 'Gagal menghapus proker');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manajemen Program Kerja</h2>
          <p className="text-xs text-slate-500">
            Kelola daftar Proker dan penanggung jawab OC ({activeRole === 'ADMIN' ? 'Semua Directorate' : 'Directorate Anda'}).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Proker
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Tambah Proker Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Proker</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                placeholder="Contoh: PKKMB & SA"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ministry</label>
              <select
                value={form.ministry_id}
                onChange={(e) => setForm({ ...form, ministry_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
              >
                {ministries.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Deskripsi (Opsional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan Proker'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          Memuat daftar proker...
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Belum ada proker terdaftar pada scope ini.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Nama Proker</th>
                <th className="py-3 px-4">Ministry</th>
                <th className="py-3 px-4">Penanggung Jawab OC</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {programs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.ministries?.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.program_committee_members || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Belum ada PIC</span>
                      ) : (
                        p.program_committee_members.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs"
                          >
                            <Users className="w-3 h-3" />
                            {m.member_name} ({m.role_title})
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Hapus Proker"
                    >
                      <Trash2 className="w-4 h-4" />
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
