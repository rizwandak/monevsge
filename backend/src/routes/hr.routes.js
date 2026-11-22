import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  getTemplateByType,
  listHrSubmissions,
  saveHrDraft,
  saveHrDraftSchema,
  submitHrEvaluation,
  createInterview,
  createObservation,
  hrNoteSchema,
  verifyFinding,
  verifyFindingSchema,
} from '../controllers/hr.controller.js';

const router = Router();

router.use(authenticate);

router.get('/templates/:type', getTemplateByType);
router.get('/evaluations', listHrSubmissions);
router.post('/evaluations/draft', authorize('ADMIN', 'C_LEVEL', 'STAFF'), validate(saveHrDraftSchema), saveHrDraft);
router.post('/evaluations/:id/submit', authorize('ADMIN', 'C_LEVEL', 'STAFF'), submitHrEvaluation);

router.post('/interviews', authorize('ADMIN', 'DIRECTOR'), validate(hrNoteSchema), createInterview);
router.post('/observations', authorize('ADMIN', 'DIRECTOR'), validate(hrNoteSchema), createObservation);
router.post('/findings/:id/verify', authorize('ADMIN', 'DIRECTOR'), validate(verifyFindingSchema), verifyFinding);

export default router;
