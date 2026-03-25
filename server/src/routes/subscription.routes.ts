import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { toggleSubscription } from '../controllers/subscription.controller';

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);

subscriptionRouter.route('/toggle-subscription/:channelId').post(toggleSubscription);

export default subscriptionRouter;