import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  getDirectorates,
  getMinistries,
  getMinistryById,
} from '../controllers/organization.controller.js';

const router = Router();

router.use(authenticate);
router.get('/directorates', getDirectorates);
router.get('/ministries', getMinistries);
router.get('/ministries/:id', getMinistryById);

export default router;
