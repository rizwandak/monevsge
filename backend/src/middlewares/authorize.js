import { errorResponse } from '../utils/apiResponse.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Akun belum terdaftar dalam sistem. Hubungi Admin.', [], 403);
    }

    const userRoles = (req.assignments || []).map((a) => a.role);
    if (userRoles.length === 0) {
      return errorResponse(res, 'Akun belum memiliki penugasan role.', [], 403);
    }

    const hasAllowedRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasAllowedRole) {
      return errorResponse(res, 'Anda tidak memiliki hak akses untuk resource ini.', [], 403);
    }

    if (req.activeRole && !userRoles.includes(req.activeRole)) {
      return errorResponse(res, 'Role aktif tidak sesuai dengan penugasan Anda.', [], 403);
    }

    return next();
  };
};
