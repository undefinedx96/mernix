import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controller.ts'
import { validate } from '../middlewares/validate.middleware.ts'
import { tweetBodySchema, tweetParamsSchema, tweetUserParamsSchema } from '../validators/tweet.validator.ts'
import { getAllVideosQuerySchema } from '../validators/video.validator.ts'

const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route('/create-tweet').post(validate({ body: tweetBodySchema }), createTweet);

tweetRouter.route('/update-tweet/:tweetId').patch(
    validate({
        params: tweetParamsSchema,
        body: tweetBodySchema
    }),
    updateTweet
);

tweetRouter.route('/delete-tweet/:tweetId').delete(validate({ params: tweetParamsSchema }), deleteTweet);

tweetRouter.route('/get-user-tweets/:userId').get(
    validate({
        params: tweetUserParamsSchema,
        query: getAllVideosQuerySchema
    }),
    getUserTweets
);

export default tweetRouter;