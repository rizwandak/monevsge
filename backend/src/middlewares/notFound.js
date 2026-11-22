import { errorResponse } from '../utils/apiResponse.js';

export const notFound = (req, res) => {
  return errorResponse(res, `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`, [], 404);
};
