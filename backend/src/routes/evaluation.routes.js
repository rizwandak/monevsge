import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  listEvaluationPrograms,
  getProgramEvaluation,
  saveDraft,
  saveDraftSchema,
  submitEvaluation,
  submitEvaluationSchema,
  reviewEvaluation,
  reviewEvaluationSchema,
} from '../controllers/evaluation.controller.js';

const router = Router();

router.use(authenticate);

router.get('/programs', listEvaluationPrograms);
router.get('/programs/:programId', getProgramEvaluation);
router.post(
  '/programs/:programId/draft',
  authorize('ADMIN', 'C_LEVEL', 'KAPEL', 'WAKAPEL'),
  validate(saveDraftSchema),
  saveDraft
);
router.post(
  '/programs/:programId/submit',
  authorize('ADMIN', 'C_LEVEL', 'KAPEL', 'WAKAPEL'),
  validate(submitEvaluationSchema),
  submitEvaluation
);
router.post(
  '/programs/:programId/review',
  authorize('ADMIN', 'DIRECTOR'),
  validate(reviewEvaluationSchema),
  reviewEvaluation
);

export default router;
