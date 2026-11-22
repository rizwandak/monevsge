import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { evaluationService } from '../../services/evaluationService';
import { useAuth } from '../../contexts/AuthContext';
import GlassLoader from '../../components/GlassLoader';

const SECTIONS = [
  { key: 'IDENTITY', title: '1. Identitas Proker' },
  { key: 'REALIZATION', title: '2. Target & Realisasi' },
  { key: 'PREPARATION', title: '3. Persiapan & Pelaksanaan' },
  { key: 'REFLECTION', title: '4. Evaluasi & Refleksi' },
  { key: 'RECOMMENDATION', title: '5. Rekomendasi' },
];

export default function ProgramEvaluationFormPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  const evaluationType = activeRole === 'C_LEVEL' ? 'SC' : 'OC';

  const [program, setProgram] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState('CONTINUE_WITH_IMPROVEMENT');
  const [recommendationReason, setRecommendationReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    evaluationService
      .getProgramEvaluation(programId)
      .then((res) => {
        const data = res.data;
        setProgram(data);
        const sub = data.evaluation_submissions?.find((s) => s.evaluation_type === evaluationType);
        if (sub) {
          const map = {};
          (sub.evaluation_answers || []).forEach((a) => {
            map[a.question_key] = a.answer_text || '';
          });
          setAnswers(map);
          if (sub.recommendation) setRecommendation(sub.recommendation);
          if (sub.recommendation_reason) setRecommendationReason(sub.recommendation_reason);
        }
      })
      .catch((err) => setError(err.message || 'Gagal memuat form evaluasi'))
      .finally(() => setLoading(false));
  }, [programId, evaluationType]);

  const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));

  const targetList = (() => {
    try {
      const parsed = JSON.parse(answers.target_list || '[]');
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ target: '', achievement: '' }];
    } catch {
      return [{ target: '', achievement: '' }];
    }
  })();

  const updateTargetList = (next) => {
    setAnswer('target_list', JSON.stringify(next));
  };

  const buildPayload = () => ({
    evaluation_type: evaluationType,
    answers: Object.entries(answers).map(([question_key, answer_text]) => ({
      section_key: SECTIONS[step].key,
      question_key,
      answer_text,
    })),
    recommendation,
    recommendation_reason: recommendationReason,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await evaluationService.saveDraft(programId, buildPayload());
      setMessage('Draft berhasil disimpan');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit evaluasi proker ini?')) return;
    setSaving(true);
    setError('');
    try {
      await evaluationService.saveDraft(programId, buildPayload());
      await evaluationService.submitEvaluation(programId, evaluationType);
      setMessage('Evaluasi berhasil disubmit!');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.message || 'Gagal submit evaluasi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <GlassLoader label="Memuat formulir evaluasi proker..." />;
  }

  const progress = Math.round(((step + 1) / SECTIONS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase">Evaluasi {evaluationType}</span>
            <h2 className="text-lg font-bold text-slate-900">{program?.name}</h2>
            <p className="text-xs text-slate-500">{program?.ministries?.name}</p>
          </div>
          <span className="text-xs font-medium text-slate-600">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {SECTIONS.map((s, idx) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                idx === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        {step === 0 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Link Google Drive Kepanitiaan
              </label>
              <input
                type="url"
                value={answers.lpj_link || ''}
                onChange={(e) => setAnswer('lpj_link', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Link Google Drive Dokumentasi Keseluruhan Proker
              </label>
              <input
                type="url"
                value={answers.doc_link || ''}
                onChange={(e) => setAnswer('doc_link', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-700">
                  1. Target sebenarnya yang ingin diraih & 2. Ketercapaian dari target-target yang dicanangkan
                </label>
                <button
                  type="button"
                  onClick={() => updateTargetList([...targetList, { target: '', achievement: '' }])}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 cursor-pointer"
                >
                  + Tambah Target
                </button>
              </div>
              <div className="space-y-3">
                {targetList.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Target #{idx + 1}</span>
                      {targetList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => updateTargetList(targetList.filter((_, i) => i !== idx))}
                          className="text-[11px] text-red-600 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.target}
                      onChange={(e) => {
                        const next = [...targetList];
                        next[idx] = { ...next[idx], target: e.target.value };
                        updateTargetList(next);
                      }}
                      placeholder={`Target #${idx + 1} yang ingin diraih...`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                    />
                    <input
                      type="text"
                      value={item.achievement}
                      onChange={(e) => {
                        const next = [...targetList];
                        next[idx] = { ...next[idx], achievement: e.target.value };
                        updateTargetList(next);
                      }}
                      placeholder={`Ketercapaian Target #${idx + 1}...`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                3. Menurut kamu, apakah target telah tercapai atau belum? Berikan deskripsinya
              </label>
              <textarea
                rows={4}
                value={answers.realization_summary || ''}
                onChange={(e) => setAnswer('realization_summary', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                placeholder="Jelaskan apakah target telah tercapai atau belum beserta alasannya..."
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                1. Menurutmu apakah koordinasi antara Steering Committee dan Organizing Committee sudah berjalan dengan baik?
              </label>
              <textarea
                rows={3}
                value={answers.preparation_quality || ''}
                onChange={(e) => setAnswer('preparation_quality', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                2. Apakah ada hambatan secara Internal atau Eksternal?
              </label>
              <textarea
                rows={3}
                value={answers.obstacles || ''}
                onChange={(e) => setAnswer('obstacles', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                1. Apa saja yang menurutmu sudah baik?
              </label>
              <textarea
                rows={3}
                value={answers.went_well || ''}
                onChange={(e) => setAnswer('went_well', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                2. Apa yang menurutmu perlu dievaluasi dan bisa jadi masukan untuk edisi selanjutnya?
              </label>
              <textarea
                rows={3}
                value={answers.needs_improvement || ''}
                onChange={(e) => setAnswer('needs_improvement', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">1. Rekomendasi Keberlanjutan</label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
              >
                <option value="CONTINUE_AS_IS">Dilanjutkan tanpa perubahan</option>
                <option value="CONTINUE_WITH_IMPROVEMENT">Dilanjutkan dengan perbaikan</option>
                <option value="DEVELOP_NEW_CONCEPT">Dikembangkan dengan konsep baru</option>
                <option value="MERGE_WITH_OTHER">Digabung dengan Proker lain</option>
                <option value="DISCONTINUE">Dihentikan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                2. Sebagai {evaluationType === 'SC' ? 'Steering Committee (SC)' : 'Organizing Committee (OC)'}, apa kesan kamu terhadap proker ini?
              </label>
              <textarea
                rows={4}
                value={recommendationReason}
                onChange={(e) => setRecommendationReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                placeholder="Tuliskan kesan dan pesanmu terhadap proker ini..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  3. Rate dari 1/10 sejujur-jujurnya dari lubuk hati yang paling dalam
                </label>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {answers.honest_rating || 8} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={Number(answers.honest_rating || 8)}
                onChange={(e) => setAnswer('honest_rating', e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-xs font-medium hover:bg-blue-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Draft
            </button>
            {step < SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Submit Evaluasi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
