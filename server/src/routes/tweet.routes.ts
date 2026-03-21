import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controller.ts';

const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route('/create-tweet').post(createTweet);
tweetRouter.route('/update-tweet/:tweetId').patch(updateTweet);
tweetRouter.route('/delete-tweet/:tweetId').delete(deleteTweet);
tweetRouter.route('/get-user-tweets/:userId').get(getUserTweets);

export default tweetRouter;