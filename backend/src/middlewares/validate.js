import { errorResponse } from '../utils/apiResponse.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 'Validasi input gagal', errors, 400);
    }
    req[source] = result.data;
    return next();
  };
};
