import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from '../controllers/like.controller.ts';

const likeRouter = Router();

likeRouter.use(verifyJWT);

likeRouter.route('/toggle-video-like/:videoId').post(toggleVideoLike);
likeRouter.route('/toggle-comment-like/:commentId').post(toggleCommentLike);
likeRouter.route('/toggle-tweet-like/:tweetId').post(toggleTweetLike);
likeRouter.route('/get-liked-videos').get(getLikedVideos);

export default likeRouter;