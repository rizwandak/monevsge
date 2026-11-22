import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  getConfiguration,
  getResults,
  submitDirectorAssessment,
  submitKdAssessment,
  calculateKpi,
  scoreSchema,
} from '../controllers/kpi.controller.js';

const router = Router();

router.use(authenticate);

router.get('/configuration', getConfiguration);
router.get('/results', getResults);
router.post('/director-review/:ministryId', authorize('ADMIN', 'DIRECTOR'), validate(scoreSchema), submitDirectorAssessment);
router.post('/kd-assess/:ministryId', authorize('ADMIN', 'KD'), validate(scoreSchema), submitKdAssessment);
router.post('/calculate/:ministryId', authorize('ADMIN', 'DIRECTOR', 'KD'), calculateKpi);

export default router;
