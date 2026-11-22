import { supabaseAdmin } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getDirectorates = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('directorates')
      .select('*, ministries(id, code, name, is_active)')
      .order('name');
    if (error) throw error;
    return successResponse(res, 'Daftar directorate berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const getMinistries = async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('ministries')
      .select('*, directorates(id, code, name)')
      .order('name');

    if (req.query.directorate_id) {
      query = query.eq('directorate_id', req.query.directorate_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return successResponse(res, 'Daftar ministry berhasil diambil', data || []);
  } catch (err) {
    return next(err);
  }
};

export const getMinistryById = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ministries')
      .select('*, directorates(id, code, name), ministry_members(id, member_name, position_title, is_c_level, is_active)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return errorResponse(res, 'Ministry tidak ditemukan', [], 404);
    return successResponse(res, 'Detail ministry berhasil diambil', data);
  } catch (err) {
    return next(err);
  }
};
