import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { uploadVideo } from '../middlewares/multer.middleware.ts'
import { handlePublishVideoUploads } from '../middlewares/upload.middleware.ts'
import { validate } from '../middlewares/validate.middleware.ts'
import { publishVideoReqBodySchema, publishVideoFilesSchema, updateVideoReqBodySchema, singleThumbnailUpdateSchema, videoIdParamSchema, getAllVideosQuerySchema } from '../validators/video.validator.ts'
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from '../controllers/video.controller.ts'

const videoRouter = Router();

videoRouter.route('/get-videos').get(validate({ query: getAllVideosQuerySchema }), getAllVideos);

videoRouter.use(verifyJWT);

videoRouter.route('/publish-video').post(
    handlePublishVideoUploads,
    validate({
        body: publishVideoReqBodySchema,
        files: publishVideoFilesSchema
    }),
    publishAVideo
);

videoRouter.route('/get-video/:videoId').get(validate({ params: videoIdParamSchema }), getVideoById);

videoRouter
    .route('/update-video/:videoId')
    .patch(
        uploadVideo.single('thumbnail'),
        validate({
            params: videoIdParamSchema,
            body: updateVideoReqBodySchema,
            file: singleThumbnailUpdateSchema
        }),
        updateVideo
    );

videoRouter.route('/delete-video/:videoId').delete(validate({ params: videoIdParamSchema }), deleteVideo);

videoRouter.route('/toggle-publish-status/:videoId').patch(validate({ params: videoIdParamSchema }), togglePublishStatus);

export default videoRouter;