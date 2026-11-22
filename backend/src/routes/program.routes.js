import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  listPrograms,
  getProgramById,
  createProgram,
  createProgramSchema,
  updateProgram,
  updateProgramSchema,
  deleteProgram,
  addCommitteeMember,
  committeeMemberSchema,
  deleteCommitteeMember,
  addIndicator,
  indicatorSchema,
  deleteIndicator,
} from '../controllers/program.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listPrograms);
router.get('/:id', getProgramById);

router.post('/', authorize('ADMIN', 'DIRECTOR'), validate(createProgramSchema), createProgram);
router.patch('/:id', authorize('ADMIN', 'DIRECTOR'), validate(updateProgramSchema), updateProgram);
router.delete('/:id', authorize('ADMIN', 'DIRECTOR'), deleteProgram);

router.post('/:id/committee', authorize('ADMIN', 'DIRECTOR'), validate(committeeMemberSchema), addCommitteeMember);
router.delete('/:id/committee/:memberId', authorize('ADMIN', 'DIRECTOR'), deleteCommitteeMember);

router.post('/:id/indicators', authorize('ADMIN', 'DIRECTOR', 'C_LEVEL', 'KAPEL', 'WAKAPEL'), validate(indicatorSchema), addIndicator);
router.delete('/:id/indicators/:indicatorId', authorize('ADMIN', 'DIRECTOR'), deleteIndicator);

export default router;
