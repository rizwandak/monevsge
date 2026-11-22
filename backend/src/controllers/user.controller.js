import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createUserSchema = z.object({
  full_name: z.string().trim().min(2),
  email: z
    .string()
    .trim()
    .email()
    .refine((val) => val.toLowerCase().endsWith('@student.ub.ac.id'), {
      message: 'Email harus menggunakan domain @student.ub.ac.id',
    })
    .optional()
    .nullable(),
  nim: z.string().trim().optional().nullable(),
  role: z.enum(['ADMIN', 'C_LEVEL', 'STAFF', 'KAPEL', 'WAKAPEL', 'DIRECTOR', 'KD', 'VIEWER']).optional(),
  directorate_id: z.string().uuid().optional().nullable(),
  ministry_id: z.string().uuid().optional().nullable(),
});

export const updateUserSchema = z.object({
  full_name: z.string().trim().min(2).optional(),
  email: z
    .string()
    .trim()
    .email()
    .refine((val) => val.toLowerCase().endsWith('@student.ub.ac.id'), {
      message: 'Email harus menggunakan domain @student.ub.ac.id',
    })
    .optional()
    .nullable(),
  nim: z.string().trim().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const listUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, user_assignments(id, role, directorate_id, ministry_id, is_active, directorates(name), ministries(name))')
      .order('full_name');
    if (error) throw error;
    return successResponse(res, 'Daftar pengguna berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { full_name, email, nim, role, directorate_id, ministry_id } = req.body;
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .insert({ full_name, email: email || null, nim: nim || null })
      .select('*')
      .single();
    if (error) throw error;

    if (role) {
      const { error: assignErr } = await supabaseAdmin.from('user_assignments').insert({
        profile_id: profile.id,
        role,
        directorate_id: directorate_id || null,
        ministry_id: ministry_id || null,
        assigned_by: req.user?.id || null,
      });
      if (assignErr) throw assignErr;
    }

    return successResponse(res, 'Pengguna berhasil ditambahkan', profile, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return errorResponse(res, 'Pengguna tidak ditemukan', [], 404);
    return successResponse(res, 'Pengguna berhasil diperbarui', data);
  } catch (err) {
    return next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', req.params.id);
    if (error) throw error;
    return successResponse(res, 'Pengguna berhasil dihapus', {});
  } catch (err) {
    return next(err);
  }
};
