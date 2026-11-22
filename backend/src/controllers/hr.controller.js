import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const saveHrDraftSchema = z.object({
  template_id: z.string().uuid(),
  ministry_id: z.string().uuid(),
  respondent_type: z.enum(['C_LEVEL', 'STAFF']),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      score_value: z.number().optional().nullable(),
      answer_text: z.string().optional().nullable(),
      selected_member_id: z.string().uuid().optional().nullable(),
    })
  ),
});

export const hrNoteSchema = z.object({
  subject_id: z.string().uuid(),
  notes: z.string().min(2),
  evidence_url: z.string().optional().nullable(),
});

export const verifyFindingSchema = z.object({
  verification_status: z.enum(['UNVERIFIED', 'VERIFIED', 'REJECTED', 'NEEDS_CLARIFICATION']),
  verification_notes: z.string().optional().nullable(),
});

export const getTemplateByType = async (req, res, next) => {
  try {
    const type = req.params.type.toUpperCase();
    if (!['C_LEVEL', 'STAFF'].includes(type)) {
      return errorResponse(res, 'Tipe template harus C_LEVEL atau STAFF', [], 400);
    }

    const { data: template, error } = await supabaseAdmin
      .from('hr_evaluation_templates')
      .select('*, hr_questions(*)')
      .eq('respondent_type', type)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!template) return errorResponse(res, 'Template evaluasi SDM tidak ditemukan', [], 404);

    // Ambil kandidat anggota ministry untuk pertanyaan paling gacor
    const ministryId = req.query.ministry_id;
    let candidates = [];
    if (ministryId) {
      const targetIsCLevel = type === 'STAFF'; // Staff memilih C-level, C-level memilih Staff
      const { data: members } = await supabaseAdmin
        .from('ministry_members')
        .select('id, member_name, position_title, is_c_level')
        .eq('ministry_id', ministryId)
        .eq('is_c_level', targetIsCLevel)
        .eq('is_active', true)
        .order('member_name');
      candidates = members || [];
    }

    return successResponse(res, 'Template evaluasi SDM berhasil diambil', {
      template,
      candidates,
    });
  } catch (err) {
    return next(err);
  }
};

export const listHrSubmissions = async (req, res, next) => {
  try {
    const roles = (req.assignments || []).map((a) => a.role);
    let query = supabaseAdmin
      .from('hr_submissions')
      .select(`
        *,
        ministries(id, name, directorate_id),
        profiles(id, full_name),
        hr_answers(*, hr_questions(aspect_name, question_text, is_gacor_question))
      `)
      .order('updated_at', { ascending: false });

    if (!roles.includes('ADMIN')) {
      if (roles.includes('DIRECTOR')) {
        const dirIds = req.assignments.filter((a) => a.role === 'DIRECTOR').map((a) => a.directorate_id);
        const { data: mins } = await supabaseAdmin
          .from('ministries')
          .select('id')
          .in('directorate_id', dirIds);
        const minIds = (mins || []).map((m) => m.id);
        if (minIds.length === 0) return successResponse(res, 'Daftar evaluasi SDM', []);
        query = query.in('ministry_id', minIds);
      } else {
        query = query.eq('respondent_id', req.user.id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return successResponse(res, 'Daftar evaluasi SDM berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const saveHrDraft = async (req, res, next) => {
  try {
    const { template_id, ministry_id, respondent_type, answers } = req.body;

    const { data: submission, error: subErr } = await supabaseAdmin
      .from('hr_submissions')
      .upsert(
        {
          template_id,
          ministry_id,
          respondent_id: req.user.id,
          respondent_type,
          status: 'DRAFT',
        },
        { onConflict: 'template_id,respondent_id' }
      )
      .select('*')
      .single();

    if (subErr) throw subErr;

    if (answers.length > 0) {
      const rows = answers.map((a) => ({
        submission_id: submission.id,
        question_id: a.question_id,
        score_value: a.score_value ?? null,
        answer_text: a.answer_text ?? null,
        selected_member_id: a.selected_member_id ?? null,
      }));
      const { error: ansErr } = await supabaseAdmin
        .from('hr_answers')
        .upsert(rows, { onConflict: 'submission_id,question_id' });
      if (ansErr) throw ansErr;
    }

    return successResponse(res, 'Draft evaluasi SDM berhasil disimpan', submission);
  } catch (err) {
    return next(err);
  }
};

export const submitHrEvaluation = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hr_submissions')
      .update({
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('respondent_id', req.user.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return errorResponse(res, 'Submission SDM tidak ditemukan', [], 404);
    return successResponse(res, 'Evaluasi SDM berhasil disubmit', data);
  } catch (err) {
    return next(err);
  }
};

export const createInterview = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hr_interviews')
      .insert({ ...req.body, director_id: req.user.id })
      .select('*')
      .single();
    if (error) throw error;
    return successResponse(res, 'Catatan wawancara berhasil disimpan', data, 201);
  } catch (err) {
    return next(err);
  }
};

export const createObservation = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hr_observations')
      .insert({ ...req.body, director_id: req.user.id })
      .select('*')
      .single();
    if (error) throw error;
    return successResponse(res, 'Catatan observasi berhasil disimpan', data, 201);
  } catch (err) {
    return next(err);
  }
};

export const verifyFinding = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hr_findings')
      .update({
        ...req.body,
        verified_by: req.user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return errorResponse(res, 'Temuan tidak ditemukan', [], 404);
    return successResponse(res, 'Status verifikasi temuan diperbarui', data);
  } catch (err) {
    return next(err);
  }
};
