import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { toggleVideoLike } from '../controllers/like.controller.ts';

const likeRouter = Router();

likeRouter.use(verifyJWT);

likeRouter.route('/toggle-video-like/:videoId').post(toggleVideoLike);

export default likeRouter;