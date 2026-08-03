import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from '../controllers/like.controller.ts'
import { validate } from '../middlewares/validate.middleware.ts'
import { getAllVideosQuerySchema, videoIdParamSchema } from '../validators/video.validator.ts'
import { commentParamsSchema } from '../validators/comment.validator.ts'
import { tweetParamsSchema } from '../validators/tweet.validator.ts'

const likeRouter = Router();

likeRouter.use(verifyJWT);

likeRouter.route('/toggle-video-like/:videoId').post(validate({ params: videoIdParamSchema }), toggleVideoLike);

likeRouter.route('/toggle-comment-like/:commentId').post(validate({ params: commentParamsSchema }), toggleCommentLike);

likeRouter.route('/toggle-tweet-like/:tweetId').post(validate({ params: tweetParamsSchema }), toggleTweetLike);

likeRouter.route('/get-liked-videos').get(validate({ query: getAllVideosQuerySchema }), getLikedVideos);

export default likeRouter;