import { supabase, supabaseAdmin } from '../config/supabase.js';
import { isAllowedUbEmail } from '../constants/roles.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return errorResponse(res, 'Konfigurasi Supabase Service Role belum tersedia di backend/.env', [], 503);
    }

    const authHeader = req.headers.authorization;
    const profileIdHeader = req.headers['x-profile-id'];
    let profile = null;
    let authUser = null;

    if (authHeader && authHeader.startsWith('Bearer ') && supabase) {
      const token = authHeader.split(' ')[1];
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !userData?.user) {
        return errorResponse(res, 'Token tidak valid atau sudah kedaluwarsa', [], 401);
      }
      authUser = userData.user;
      if (!isAllowedUbEmail(authUser.email)) {
        return errorResponse(res, 'Hanya akun @student.ub.ac.id yang diizinkan', [], 403);
      }

      const { data: byAuth } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();
      profile = byAuth;
    } else if (profileIdHeader) {
      const { data: byId } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', profileIdHeader)
        .maybeSingle();
      profile = byId;
    } else {
      return errorResponse(res, 'Sesi autentikasi tidak ditemukan', [], 401);
    }

    if (!profile) {
      req.authUser = authUser;
      req.user = null;
      req.assignments = [];
      return next();
    }

    if (!profile.is_active) {
      return errorResponse(res, 'Akun Anda dinonaktifkan. Hubungi Admin.', [], 403);
    }

    const { data: assignments } = await supabaseAdmin
      .from('user_assignments')
      .select('id, role, directorate_id, ministry_id, is_active, directorates(id, name, code), ministries(id, name, code)')
      .eq('profile_id', profile.id)
      .eq('is_active', true);

    req.authUser = authUser;
    req.user = profile;
    req.assignments = assignments || [];
    req.activeRole = req.headers['x-active-role'] || null;

    return next();
  } catch (err) {
    return next(err);
  }
};
