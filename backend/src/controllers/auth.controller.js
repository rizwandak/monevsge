import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const loginByNameSchema = z.object({
  full_name: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter'),
  nim: z.string().trim().optional(),
  role: z.enum(['ADMIN', 'C_LEVEL', 'STAFF', 'KAPEL', 'WAKAPEL', 'DIRECTOR', 'KD', 'VIEWER']).optional(),
  program_id: z.string().uuid().optional(),
});

export const selectRoleSchema = z.object({
  role: z.enum(['ADMIN', 'C_LEVEL', 'STAFF', 'KAPEL', 'WAKAPEL', 'DIRECTOR', 'KD', 'VIEWER']),
  assignment_id: z.string().uuid().optional(),
});

export const loginByName = async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return errorResponse(res, 'Konfigurasi Supabase belum tersedia di backend/.env', [], 503);
    }

    const { full_name, nim } = req.body;
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('full_name', full_name)
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      return errorResponse(
        res,
        `Nama "${full_name}" belum terdaftar di sistem. Silakan hubungi Admin.`,
        [],
        404
      );
    }

    if (!profile.is_active) {
      return errorResponse(res, 'Akun Anda dinonaktifkan. Hubungi Admin.', [], 403);
    }

    if (profile.nim && nim && profile.nim.trim() !== nim.trim()) {
      return errorResponse(res, 'NIM tidak sesuai dengan data yang terdaftar.', [], 401);
    }

    const { data: assignments } = await supabaseAdmin
      .from('user_assignments')
      .select('id, role, directorate_id, ministry_id, is_active, directorates(id, name, code), ministries(id, name, code)')
      .eq('profile_id', profile.id)
      .eq('is_active', true);

    return successResponse(res, 'Login berhasil', {
      registered: true,
      profile,
      assignments: assignments || [],
    });
  } catch (err) {
    return next(err);
  }
};

export const getLoginOptions = async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return errorResponse(res, 'Konfigurasi Supabase belum tersedia', [], 503);
    }

    const [membersRes, dirRes, minRes, progRes] = await Promise.all([
      supabaseAdmin
        .from('user_assignments')
        .select('id, role, directorate_id, ministry_id, profiles!inner(id, full_name, is_active), directorates(id, name, code), ministries(id, name, code)')
        .in('role', ['DIRECTOR', 'C_LEVEL', 'STAFF'])
        .eq('is_active', true)
        .eq('profiles.is_active', true),
      supabaseAdmin.from('directorates').select('id, name, code').eq('is_active', true).order('name'),
      supabaseAdmin.from('ministries').select('id, name, code, directorate_id').eq('is_active', true).order('name'),
      supabaseAdmin.from('programs').select('id, name, ministry_id').eq('is_active', true).order('name'),
    ]);

    const members = (membersRes.data || [])
      .map((m) => ({
        assignment_id: m.id,
        role: m.role,
        full_name: m.profiles?.full_name,
        directorate_id: m.directorate_id,
        directorate_name: m.directorates?.name || null,
        ministry_id: m.ministry_id,
        ministry_name: m.ministries?.name || null,
      }))
      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    return successResponse(res, 'Opsi login berhasil diambil', {
      members,
      directorates: dirRes.data || [],
      ministries: minRes.data || [],
      programs: progRes.data || [],
    });
  } catch (err) {
    return next(err);
  }
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return successResponse(res, 'Akun valid namun belum terdaftar di sistem', {
      registered: false,
      email: req.authUser?.email || null,
      full_name: req.authUser?.user_metadata?.full_name || null,
      profile: null,
      assignments: [],
    });
  }

  return successResponse(res, 'Data profil berhasil diambil', {
    registered: true,
    profile: req.user,
    assignments: req.assignments,
  });
};

export const getAssignments = async (req, res) => {
  if (!req.user) {
    return errorResponse(res, 'Akun belum terdaftar dalam sistem', [], 403);
  }
  return successResponse(res, 'Daftar penugasan berhasil diambil', {
    assignments: req.assignments,
  });
};

export const selectRole = async (req, res) => {
  if (!req.user) {
    return errorResponse(res, 'Akun belum terdaftar dalam sistem', [], 403);
  }

  const { role, assignment_id } = req.body;
  const matched = req.assignments.find(
    (a) => a.role === role && (!assignment_id || a.id === assignment_id)
  );

  if (!matched) {
    return errorResponse(res, 'Role yang dipilih tidak terdaftar pada penugasan Anda', [], 403);
  }

  return successResponse(res, 'Role berhasil diverifikasi', {
    selected_role: matched.role,
    assignment: matched,
  });
};

export const logout = async (req, res) => {
  return successResponse(res, 'Logout berhasil', {});
};
