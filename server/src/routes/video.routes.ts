import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { uploadVideo } from '../middlewares/multer.middleware.ts'
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from '../controllers/video.controller.ts'

const videoRouter = Router();

videoRouter.route('/get-videos').get(getAllVideos);
videoRouter.use(verifyJWT);
videoRouter.route('/publish-video').post(
    uploadVideo.fields([
        {
            name: 'videoFile',
            maxCount: 1,
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]),
    publishAVideo
);
videoRouter.route('/get-video/:videoId').get(getVideoById);
videoRouter.route('/update-video/:videoId').patch(uploadVideo.single('thumbnail'), updateVideo);
videoRouter.route('/delete-video/:videoId').delete(deleteVideo);
videoRouter.route('/toggle-publish-status/:videoId').patch(togglePublishStatus);

export default videoRouter;