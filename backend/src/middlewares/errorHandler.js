import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';
  const errors = err.errors || [];

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  return errorResponse(res, message, errors, statusCode);
};
