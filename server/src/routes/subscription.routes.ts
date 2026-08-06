import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller.ts'
import { validate } from '../middlewares/validate.middleware.ts'
import { channelParamsSchema, subscriptionParamsSchema } from '../validators/subscription.validator.ts'

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);

subscriptionRouter.route('/toggle-subscription/:channelId').post(validate({ params: channelParamsSchema }), toggleSubscription);

subscriptionRouter.route('/get-user-channel-subs/:channelId').get(validate({ params: channelParamsSchema }), getUserChannelSubscribers);

subscriptionRouter.route('/get-subscribed-channels/:subscriberId').get(validate({ params: subscriptionParamsSchema }), getSubscribedChannels);

export default subscriptionRouter;