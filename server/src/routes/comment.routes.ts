import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addComment, updateComment } from '../controllers/comment.controller.ts';

const commentRouter = Router();

commentRouter.use(verifyJWT);

commentRouter.route('/add-comment/:videoId').post(addComment);
commentRouter.route('/update-comment/:commentId').patch(updateComment);

export default commentRouter;