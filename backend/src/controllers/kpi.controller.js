import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const scoreSchema = z.object({
  final_score: z.number().min(0).max(100),
  adjustment_reason: z.string().optional().nullable(),
  lock: z.boolean().default(false),
});

export const getConfiguration = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kpi_categories')
      .select('*, kpi_indicators(*, kpi_rubrics(*, kpi_rubric_levels(*)), kpi_weights(*))')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return successResponse(res, 'Konfigurasi KPI berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kpi_results')
      .select('*, ministries(id, name, directorates(id, name))')
      .order('final_kpi_score', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return successResponse(res, 'Hasil KPI berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const submitDirectorAssessment = async (req, res, next) => {
  try {
    const { ministryId } = req.params;
    const { final_score, adjustment_reason, lock } = req.body;

    const { data, error } = await supabaseAdmin
      .from('kpi_assessments')
      .upsert(
        {
          ministry_id: ministryId,
          evaluation_period_label: '2026',
          assessor_type: 'DIRECTOR',
          assessor_id: req.user.id,
          final_score,
          adjustment_reason: adjustment_reason || null,
          status: lock ? 'LOCKED' : 'CONFIRMED',
          locked_at: lock ? new Date().toISOString() : null,
        },
        { onConflict: 'ministry_id,evaluation_period_label,assessor_type' }
      )
      .select('*')
      .single();

    if (error) throw error;
    return successResponse(res, 'Penilaian Director berhasil disimpan', data);
  } catch (err) {
    return next(err);
  }
};

export const submitKdAssessment = async (req, res, next) => {
  try {
    const { ministryId } = req.params;
    const { final_score, adjustment_reason, lock } = req.body;

    const { data, error } = await supabaseAdmin
      .from('kpi_assessments')
      .upsert(
        {
          ministry_id: ministryId,
          evaluation_period_label: '2026',
          assessor_type: 'KD',
          assessor_id: req.user.id,
          final_score,
          adjustment_reason: adjustment_reason || null,
          status: lock ? 'LOCKED' : 'CONFIRMED',
          locked_at: lock ? new Date().toISOString() : null,
        },
        { onConflict: 'ministry_id,evaluation_period_label,assessor_type' }
      )
      .select('*')
      .single();

    if (error) throw error;
    return successResponse(res, 'Penilaian KD berhasil disimpan', data);
  } catch (err) {
    return next(err);
  }
};

export const calculateKpi = async (req, res, next) => {
  try {
    const { ministryId } = req.params;
    const { data: assessments, error } = await supabaseAdmin
      .from('kpi_assessments')
      .select('*')
      .eq('ministry_id', ministryId)
      .eq('evaluation_period_label', '2026');
    if (error) throw error;

    const director = assessments?.find((a) => a.assessor_type === 'DIRECTOR');
    const kd = assessments?.find((a) => a.assessor_type === 'KD');

    if (director?.final_score == null || kd?.final_score == null) {
      const { data: incomplete } = await supabaseAdmin
        .from('kpi_results')
        .upsert(
          {
            ministry_id: ministryId,
            evaluation_period_label: '2026',
            director_score: director?.final_score ?? null,
            kd_score: kd?.final_score ?? null,
            final_kpi_score: null,
            is_eligible_for_ranking: false,
            status: 'INCOMPLETE',
          },
          { onConflict: 'ministry_id,evaluation_period_label' }
        )
        .select('*')
        .single();
      return successResponse(res, 'Data KPI belum lengkap (INCOMPLETE)', incomplete);
    }

    const finalScore = Number((Number(director.final_score) * 0.75 + Number(kd.final_score) * 0.25).toFixed(2));
    const { data: result, error: resErr } = await supabaseAdmin
      .from('kpi_results')
      .upsert(
        {
          ministry_id: ministryId,
          evaluation_period_label: '2026',
          director_score: director.final_score,
          kd_score: kd.final_score,
          final_kpi_score: finalScore,
          is_eligible_for_ranking: true,
          status: 'CONFIRMED',
          calculated_at: new Date().toISOString(),
        },
        { onConflict: 'ministry_id,evaluation_period_label' }
      )
      .select('*')
      .single();

    if (resErr) throw resErr;
    return successResponse(res, 'KPI Final berhasil dihitung', result);
  } catch (err) {
    return next(err);
  }
};
