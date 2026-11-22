export const ROLES = {
  ADMIN: 'ADMIN',
  C_LEVEL: 'C_LEVEL',
  STAFF: 'STAFF',
  KAPEL: 'KAPEL',
  WAKAPEL: 'WAKAPEL',
  DIRECTOR: 'DIRECTOR',
  KD: 'KD',
  VIEWER: 'VIEWER',
};

export const ALLOWED_EMAIL_DOMAIN = '@student.ub.ac.id';

export const isAllowedUbEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
};
