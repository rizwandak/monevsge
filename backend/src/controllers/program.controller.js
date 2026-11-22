import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createProgramSchema = z.object({
  directorate_id: z.string().uuid(),
  ministry_id: z.string().uuid(),
  name: z.string().trim().min(2),
  description: z.string().optional().nullable(),
  evaluation_period_label: z.string().trim().default('2026'),
  is_active: z.boolean().default(true),
});

export const updateProgramSchema = createProgramSchema.partial();

export const committeeMemberSchema = z.object({
  member_name: z.string().trim().min(2),
  email: z
    .string()
    .trim()
    .email()
    .refine((v) => v.toLowerCase().endsWith('@student.ub.ac.id'), {
      message: 'Email harus @student.ub.ac.id',
    })
    .optional()
    .nullable(),
  role_title: z.enum(['KAPEL', 'WAKAPEL', 'PIC_TAMBAHAN']),
  is_confirmed: z.boolean().default(true),
});

export const indicatorSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().optional().nullable(),
  indicator_type: z.enum(['QUANTITATIVE', 'QUALITATIVE']).default('QUANTITATIVE'),
  target_value: z.number().optional().nullable(),
  target_text: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  sort_order: z.number().int().default(0),
});

const getDirectorDirectorateIds = (req) =>
  (req.assignments || []).filter((a) => a.role === 'DIRECTOR' && a.directorate_id).map((a) => a.directorate_id);

const isAdmin = (req) => (req.assignments || []).some((a) => a.role === 'ADMIN');

export const listPrograms = async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('programs')
      .select(`
        *,
        directorates(id, code, name),
        ministries(id, code, name),
        program_committee_members(id, member_name, email, role_title, is_confirmed),
        evaluation_submissions(id, evaluation_type, status, submitted_at)
      `)
      .order('name');

    if (req.query.directorate_id) query = query.eq('directorate_id', req.query.directorate_id);
    if (req.query.ministry_id) query = query.eq('ministry_id', req.query.ministry_id);

    // Scope filtering untuk non-Admin
    if (!isAdmin(req)) {
      const directorDirs = getDirectorDirectorateIds(req);
      const cLevelMinistries = (req.assignments || [])
        .filter((a) => a.role === 'C_LEVEL' && a.ministry_id)
        .map((a) => a.ministry_id);

      if (directorDirs.length > 0) {
        query = query.in('directorate_id', directorDirs);
      } else if (cLevelMinistries.length > 0) {
        query = query.in('ministry_id', cLevelMinistries);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return successResponse(res, 'Daftar proker berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const getProgramById = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select(`
        *,
        directorates(id, code, name),
        ministries(id, code, name),
        program_committee_members(*),
        program_indicators(*),
        program_documents(*),
        evaluation_submissions(*)
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return errorResponse(res, 'Proker tidak ditemukan', [], 404);
    return successResponse(res, 'Detail proker berhasil diambil', data);
  } catch (err) {
    return next(err);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      const directorDirs = getDirectorDirectorateIds(req);
      if (!directorDirs.includes(req.body.directorate_id)) {
        return errorResponse(res, 'Anda hanya dapat menambah proker pada Directorate Anda', [], 403);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('programs')
      .insert({ ...req.body, created_by: req.user?.id || null })
      .select('*')
      .single();
    if (error) throw error;
    return successResponse(res, 'Proker berhasil ditambahkan', data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const { data: existing } = await supabaseAdmin
      .from('programs')
      .select('id, directorate_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!existing) return errorResponse(res, 'Proker tidak ditemukan', [], 404);

    if (!isAdmin(req) && !getDirectorDirectorateIds(req).includes(existing.directorate_id)) {
      return errorResponse(res, 'Anda tidak berhak mengubah proker Directorate lain', [], 403);
    }

    const { data, error } = await supabaseAdmin
      .from('programs')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw error;
    return successResponse(res, 'Proker berhasil diperbarui', data);
  } catch (err) {
    return next(err);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const { data: existing } = await supabaseAdmin
      .from('programs')
      .select('id, directorate_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!existing) return errorResponse(res, 'Proker tidak ditemukan', [], 404);

    if (!isAdmin(req) && !getDirectorDirectorateIds(req).includes(existing.directorate_id)) {
      return errorResponse(res, 'Anda tidak berhak menghapus proker Directorate lain', [], 403);
    }

    const { error } = await supabaseAdmin.from('programs').delete().eq('id', req.params.id);
    if (error) throw error;
    return successResponse(res, 'Proker berhasil dihapus', {});
  } catch (err) {
    return next(err);
  }
};

export const addCommitteeMember = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('program_committee_members')
      .insert({ ...req.body, program_id: req.params.id })
      .select('*')
      .single();
    if (error) throw error;
    return successResponse(res, 'Penanggung jawab OC berhasil ditambahkan', data, 201);
  } catch (err) {
    return next(err);
  }
};

export const deleteCommitteeMember = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('program_committee_members')
      .delete()
      .eq('id', req.params.memberId)
      .eq('program_id', req.params.id);
    if (error) throw error;
    return successResponse(res, 'Penanggung jawab OC berhasil dihapus', {});
  } catch (err) {
    return next(err);
  }
};

export const addIndicator = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('program_indicators')
      .insert({ ...req.body, program_id: req.params.id })
      .select('*')
      .single();
    if (error) throw error;
    return successResponse(res, 'Indikator proker berhasil ditambahkan', data, 201);
  } catch (err) {
    return next(err);
  }
};

export const deleteIndicator = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('program_indicators')
      .delete()
      .eq('id', req.params.indicatorId)
      .eq('program_id', req.params.id);
    if (error) throw error;
    return successResponse(res, 'Indikator proker berhasil dihapus', {});
  } catch (err) {
    return next(err);
  }
};
