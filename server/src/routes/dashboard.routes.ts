import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller.ts';

const dashboardRouter = Router();

dashboardRouter.use(verifyJWT);

dashboardRouter.route('/get-channel-stats').get(getChannelStats);
dashboardRouter.route('/get-channel-videos').get(getChannelVideos);

export default dashboardRouter;