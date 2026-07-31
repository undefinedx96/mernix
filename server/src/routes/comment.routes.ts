import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { commentBodySchema, commentParamsSchema } from '../validators/comment.validator.ts';
import { getAllVideosQuerySchema, videoIdParamSchema } from '../validators/video.validator.ts';

const commentRouter = Router();

commentRouter.use(verifyJWT);

commentRouter.route('/add-comment/:videoId').post(
    validate({
        params: videoIdParamSchema,
        body: commentBodySchema
    }),
    addComment
);

commentRouter.route('/update-comment/:commentId').patch(
    validate({
        params: commentParamsSchema,
        body: commentBodySchema
    }),
    updateComment
);

commentRouter.route('/delete-comment/:commentId').delete(validate({ params: commentParamsSchema }), deleteComment);

commentRouter.route('/get-video-comments/:videoId').get(
    validate({
        query: getAllVideosQuerySchema,
        params: videoIdParamSchema
    }),
    getVideoComments
);

export default commentRouter;