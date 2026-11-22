import { useEffect, useState } from 'react';
import { Save, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { hrService } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

export default function HrEvaluationFormPage() {
  const { activeRole, assignments } = useAuth();
  const respondentType = activeRole === 'C_LEVEL' ? 'C_LEVEL' : 'STAFF';
  const ministryId = assignments.find((a) => a.role === activeRole)?.ministry_id || null;

  const [template, setTemplate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([hrService.getTemplate(respondentType, ministryId), hrService.listEvaluations()])
      .then(([tplRes, evalRes]) => {
        const tpl = tplRes.data?.template;
        setTemplate(tpl);
        setCandidates(tplRes.data?.candidates || []);

        const existing = (evalRes.data || []).find((s) => s.template_id === tpl?.id);
        if (existing) {
          setSubmissionId(existing.id);
          const map = {};
          (existing.hr_answers || []).forEach((a) => {
            map[a.question_id] = {
              score_value: a.score_value,
              answer_text: a.answer_text || '',
              selected_member_id: a.selected_member_id || '',
            };
          });
          setAnswers(map);
        }
      })
      .catch((err) => setError(err.message || 'Gagal memuat form evaluasi SDM'))
      .finally(() => setLoading(false));
  }, [respondentType, ministryId]);

  const updateAnswer = (qId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || {}), [field]: value },
    }));
  };

  const handleSaveDraft = async () => {
    if (!template || !ministryId) {
      setError('Ministry penugasan tidak ditemukan');
      return null;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        template_id: template.id,
        ministry_id: ministryId,
        respondent_type: respondentType,
        answers: (template.hr_questions || []).map((q) => ({
          question_id: q.id,
          score_value: answers[q.id]?.score_value ? Number(answers[q.id].score_value) : null,
          answer_text: answers[q.id]?.answer_text || null,
          selected_member_id: answers[q.id]?.selected_member_id || null,
        })),
      };
      const res = await hrService.saveDraft(payload);
      setSubmissionId(res.data.id);
      setMessage('Draft evaluasi SDM berhasil disimpan');
      return res.data.id;
    } catch (err) {
      setError(err.message || 'Gagal menyimpan draft');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit evaluasi SDM ini?')) return;
    const id = (await handleSaveDraft()) || submissionId;
    if (!id) return;
    setSaving(true);
    try {
      await hrService.submit(id);
      setMessage('Evaluasi SDM berhasil disubmit!');
    } catch (err) {
      setError(err.message || 'Gagal submit evaluasi SDM');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Memuat formulir evaluasi SDM...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <span className="text-xs font-semibold text-blue-600 uppercase">Evaluasi Staff ({respondentType})</span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">{template?.title?.replace(/SDM/gi, 'Staff') || 'Evaluasi Staff'}</h2>
        <p className="text-xs text-slate-500 mt-1">{template?.description}</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        {(template?.hr_questions || [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((q) => (
            <div key={q.id} className="space-y-2 pb-4 border-b border-slate-100 last:border-none">
              <div className="flex items-center gap-2">
                {q.is_gacor_question && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                <span className="text-xs font-semibold text-blue-700">{q.aspect_name}</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{q.question_text}</p>

              {q.question_type === 'MEMBER_PICK_WITH_REASON' ? (
                <div className="space-y-3 pt-1">
                  <select
                    value={answers[q.id]?.selected_member_id || ''}
                    onChange={(e) => updateAnswer(q.id, 'selected_member_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="">-- Pilih Nama --</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.member_name} ({c.position_title})
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    value={answers[q.id]?.answer_text || ''}
                    onChange={(e) => updateAnswer(q.id, 'answer_text', e.target.value)}
                    placeholder="Jelaskan alasannya..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              ) : (
                <textarea
                  rows={3}
                  value={answers[q.id]?.answer_text || ''}
                  onChange={(e) => updateAnswer(q.id, 'answer_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              )}
            </div>
          ))}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-xs font-medium hover:bg-blue-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Simpan Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>
      </div>
    </div>
  );
}
