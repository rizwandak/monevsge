import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  listUsers,
  createUser,
  createUserSchema,
  updateUser,
  updateUserSchema,
  deleteUser,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
