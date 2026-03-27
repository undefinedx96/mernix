import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller';

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);

subscriptionRouter.route('/toggle-subscription/:channelId').post(toggleSubscription);
subscriptionRouter.route('/get-user-channel-subs/:channelId').get(getUserChannelSubscribers);

export default subscriptionRouter;