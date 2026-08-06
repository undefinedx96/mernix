import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { getAllVideosQuerySchema } from '../validators/video.validator.ts';

const dashboardRouter = Router();

dashboardRouter.use(verifyJWT);

dashboardRouter.route('/get-channel-stats').get(getChannelStats);

dashboardRouter.route('/get-channel-videos').get(validate({ query: getAllVideosQuerySchema }), getChannelVideos);

export default dashboardRouter;