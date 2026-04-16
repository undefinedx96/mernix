import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { getChannelStats } from '../controllers/dashboard.controller.ts';

const dashboardRouter = Router();

dashboardRouter.use(verifyJWT);

dashboardRouter.route('/get-channel-stats').get(getChannelStats);

export default dashboardRouter;