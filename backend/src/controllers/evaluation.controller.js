import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const saveDraftSchema = z.object({
  evaluation_type: z.enum(['SC', 'OC']),
  answers: z
    .array(
      z.object({
        section_key: z.string().min(1),
        question_key: z.string().min(1),
        answer_text: z.string().optional().nullable(),
        answer_json: z.any().optional().nullable(),
      })
    )
    .default([]),
  indicator_results: z
    .array(
      z.object({
        indicator_id: z.string().uuid(),
        realization_value: z.number().optional().nullable(),
        realization_text: z.string().optional().nullable(),
        evidence_url: z.string().optional().nullable(),
        achievement_notes: z.string().optional().nullable(),
      })
    )
    .default([]),
  recommendation: z
    .enum([
      'CONTINUE_AS_IS',
      'CONTINUE_WITH_IMPROVEMENT',
      'DEVELOP_NEW_CONCEPT',
      'MERGE_WITH_OTHER',
      'DISCONTINUE',
    ])
    .optional()
    .nullable(),
  recommendation_reason: z.string().optional().nullable(),
});

export const submitEvaluationSchema = z.object({
  evaluation_type: z.enum(['SC', 'OC']),
});

export const reviewEvaluationSchema = z.object({
  comparison_status: z.enum(['ALIGNED', 'PARTIALLY_DIFFERENT', 'SIGNIFICANTLY_DIFFERENT']),
  review_notes: z.string().optional().nullable(),
  is_confirmed: z.boolean().default(false),
});

const checkDeadlineLocked = async (evaluationType) => {
  const { data: period } = await supabaseAdmin
    .from('evaluation_periods')
    .select('*')
    .eq('period_type', evaluationType)
    .eq('is_active', true)
    .maybeSingle();

  if (!period) return { locked: false, period: null };
  const now = new Date();
  const deadline = new Date(period.deadline_at);
  return { locked: now > deadline, period };
};

export const listEvaluationPrograms = async (req, res, next) => {
  try {
    const roles = (req.assignments || []).map((a) => a.role);
    let query = supabaseAdmin
      .from('programs')
      .select(`
        id, name, directorate_id, ministry_id, evaluation_period_label,
        ministries(id, name),
        directorates(id, name),
        evaluation_submissions(id, evaluation_type, status, submitted_at, locked_at)
      `)
      .eq('is_active', true)
      .order('name');

    if (!roles.includes('ADMIN')) {
      if (roles.includes('DIRECTOR')) {
        const dirIds = req.assignments.filter((a) => a.role === 'DIRECTOR').map((a) => a.directorate_id);
        query = query.in('directorate_id', dirIds);
      } else if (roles.includes('C_LEVEL')) {
        const minIds = req.assignments.filter((a) => a.role === 'C_LEVEL').map((a) => a.ministry_id);
        query = query.in('ministry_id', minIds);
      } else if (roles.includes('KAPEL') || roles.includes('WAKAPEL')) {
        const { data: ocRows } = await supabaseAdmin
          .from('program_committee_members')
          .select('program_id')
          .eq('profile_id', req.user.id)
          .eq('is_active', true);
        const progIds = (ocRows || []).map((r) => r.program_id);
        if (progIds.length === 0) return successResponse(res, 'Daftar evaluasi proker', []);
        query = query.in('id', progIds);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return successResponse(res, 'Daftar evaluasi proker berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const getProgramEvaluation = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { data: program, error } = await supabaseAdmin
      .from('programs')
      .select(`
        *,
        directorates(id, name),
        ministries(id, name),
        program_indicators(*, program_indicator_results(*)),
        evaluation_submissions(*, evaluation_answers(*)),
        evaluation_reviews(*)
      `)
      .eq('id', programId)
      .maybeSingle();

    if (error) throw error;
    if (!program) return errorResponse(res, 'Proker tidak ditemukan', [], 404);

    return successResponse(res, 'Detail evaluasi proker berhasil diambil', program);
  } catch (err) {
    return next(err);
  }
};

export const saveDraft = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { evaluation_type, answers, indicator_results, recommendation, recommendation_reason } = req.body;

    const { locked, period } = await checkDeadlineLocked(evaluation_type);
    if (locked) {
      return errorResponse(res, `Periode pengisian ${evaluation_type} sudah melewati deadline`, [], 403);
    }

    let { data: submission } = await supabaseAdmin
      .from('evaluation_submissions')
      .select('*')
      .eq('program_id', programId)
      .eq('evaluation_type', evaluation_type)
      .maybeSingle();

    if (submission?.status === 'LOCKED') {
      return errorResponse(res, 'Formulir sudah terkunci dan tidak dapat diubah', [], 403);
    }

    if (!submission) {
      const { data: created, error: createErr } = await supabaseAdmin
        .from('evaluation_submissions')
        .insert({
          program_id: programId,
          period_id: period?.id || null,
          evaluation_type,
          status: 'DRAFT',
          primary_respondent_id: req.user.id,
          last_edited_by: req.user.id,
          recommendation: recommendation || null,
          recommendation_reason: recommendation_reason || null,
        })
        .select('*')
        .single();
      if (createErr) throw createErr;
      submission = created;
    } else {
      const { data: updated, error: updErr } = await supabaseAdmin
        .from('evaluation_submissions')
        .update({
          last_edited_by: req.user.id,
          recommendation: recommendation ?? submission.recommendation,
          recommendation_reason: recommendation_reason ?? submission.recommendation_reason,
          status: submission.status === 'NOT_STARTED' ? 'DRAFT' : submission.status,
        })
        .eq('id', submission.id)
        .select('*')
        .single();
      if (updErr) throw updErr;
      submission = updated;
    }

    if (answers.length > 0) {
      const rows = answers.map((a) => ({
        submission_id: submission.id,
        section_key: a.section_key,
        question_key: a.question_key,
        answer_text: a.answer_text ?? null,
        answer_json: a.answer_json ?? null,
        updated_by: req.user.id,
      }));
      const { error: ansErr } = await supabaseAdmin
        .from('evaluation_answers')
        .upsert(rows, { onConflict: 'submission_id,question_key' });
      if (ansErr) throw ansErr;
    }

    if (indicator_results.length > 0) {
      const indRows = indicator_results.map((r) => ({
        indicator_id: r.indicator_id,
        evaluation_type,
        realization_value: r.realization_value ?? null,
        realization_text: r.realization_text ?? null,
        evidence_url: r.evidence_url ?? null,
        achievement_notes: r.achievement_notes ?? null,
        updated_by: req.user.id,
      }));
      const { error: indErr } = await supabaseAdmin
        .from('program_indicator_results')
        .upsert(indRows, { onConflict: 'indicator_id,evaluation_type' });
      if (indErr) throw indErr;
    }

    return successResponse(res, 'Draft evaluasi berhasil disimpan', submission);
  } catch (err) {
    return next(err);
  }
};

export const submitEvaluation = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { evaluation_type } = req.body;

    const { locked } = await checkDeadlineLocked(evaluation_type);
    if (locked) {
      return errorResponse(res, `Deadline pengisian ${evaluation_type} sudah berakhir`, [], 403);
    }

    const { data: submission } = await supabaseAdmin
      .from('evaluation_submissions')
      .select('*, evaluation_answers(*)')
      .eq('program_id', programId)
      .eq('evaluation_type', evaluation_type)
      .maybeSingle();

    if (!submission) {
      return errorResponse(res, 'Draft evaluasi belum ditemukan', [], 404);
    }

    const { data: updated, error } = await supabaseAdmin
      .from('evaluation_submissions')
      .update({
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
        last_edited_by: req.user.id,
      })
      .eq('id', submission.id)
      .select('*')
      .single();
    if (error) throw error;

    // Simpan snapshot versi
    const { count } = await supabaseAdmin
      .from('evaluation_answer_versions')
      .select('*', { count: 'exact', head: true })
      .eq('submission_id', submission.id);

    await supabaseAdmin.from('evaluation_answer_versions').insert({
      submission_id: submission.id,
      version_number: (count || 0) + 1,
      snapshot_json: {
        answers: submission.evaluation_answers || [],
        recommendation: updated.recommendation,
        recommendation_reason: updated.recommendation_reason,
      },
      edited_by: req.user.id,
    });

    return successResponse(res, 'Evaluasi proker berhasil disubmit', updated);
  } catch (err) {
    return next(err);
  }
};

export const reviewEvaluation = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { comparison_status, review_notes, is_confirmed } = req.body;

    const { data, error } = await supabaseAdmin
      .from('evaluation_reviews')
      .upsert(
        {
          program_id: programId,
          reviewer_id: req.user.id,
          comparison_status,
          review_notes: review_notes || null,
          is_confirmed,
          confirmed_at: is_confirmed ? new Date().toISOString() : null,
        },
        { onConflict: 'program_id' }
      )
      .select('*')
      .single();

    if (error) throw error;
    return successResponse(res, 'Review evaluasi proker berhasil disimpan', data);
  } catch (err) {
    return next(err);
  }
};
