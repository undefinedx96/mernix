import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { createTweet, updateTweet } from '../controllers/tweet.controller.ts';

const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route('/create-tweet').post(createTweet);
tweetRouter.route('/update-tweet/:tweetId').patch(updateTweet);

export default tweetRouter;