import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  loginByName,
  loginByNameSchema,
  getMe,
  getAssignments,
  selectRole,
  selectRoleSchema,
  logout,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/login-name', validate(loginByNameSchema), loginByName);
router.get('/me', authenticate, getMe);
router.get('/assignments', authenticate, getAssignments);
router.post('/select-role', authenticate, validate(selectRoleSchema), selectRole);
router.post('/logout', authenticate, logout);

export default router;
