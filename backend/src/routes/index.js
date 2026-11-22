import { Router } from 'express';
import { successResponse } from '../utils/apiResponse.js';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import userRoutes from './user.routes.js';
import programRoutes from './program.routes.js';
import evaluationRoutes from './evaluation.routes.js';
import hrRoutes from './hr.routes.js';
import kpiRoutes from './kpi.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  return successResponse(res, 'Server berjalan dengan baik', {
    status: 'ok',
    service: 'bem-filkom-eval-backend',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/users', userRoutes);
router.use('/programs', programRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/hr', hrRoutes);
router.use('/kpi', kpiRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
