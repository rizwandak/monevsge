import { supabaseAdmin } from '../config/supabase.js';
import { successResponse } from '../utils/apiResponse.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kpi_results')
      .select('*, ministries(id, name, code, directorates(id, name, code))')
      .eq('evaluation_period_label', '2026')
      .order('final_kpi_score', { ascending: false, nullsFirst: false });

    if (error) throw error;

    const eligible = (data || []).filter((r) => r.is_eligible_for_ranking && r.final_kpi_score != null);
    const incomplete = (data || []).filter((r) => !r.is_eligible_for_ranking || r.final_kpi_score == null);

    return successResponse(res, 'Leaderboard KPI berhasil diambil', {
      best_ministry: eligible[0] || null,
      ranking: eligible,
      incomplete,
    });
  } catch (err) {
    return next(err);
  }
};
