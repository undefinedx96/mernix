import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller.ts';

const commentRouter = Router();

commentRouter.use(verifyJWT);

commentRouter.route('/add-comment/:videoId').post(addComment);
commentRouter.route('/update-comment/:commentId').patch(updateComment);
commentRouter.route('/delete-comment/:commentId').delete(deleteComment);
commentRouter.route('/get-video-comments/:videoId').get(getVideoComments);

export default commentRouter;