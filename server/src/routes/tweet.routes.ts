import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { createTweet } from '../controllers/tweet.controller.ts';

const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route('/create-tweet').post(createTweet);

export default tweetRouter;