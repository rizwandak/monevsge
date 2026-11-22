import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getLeaderboard);

export default router;
