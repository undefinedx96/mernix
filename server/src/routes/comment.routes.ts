import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addComment } from '../controllers/comment.controller.ts';

const commentRouter = Router();

commentRouter.use(verifyJWT);

commentRouter.route('/add-comment/:videoId').post(addComment);

export default commentRouter;