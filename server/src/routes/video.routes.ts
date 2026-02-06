import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { upload } from '../middlewares/multer.middleware.ts'
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, updateVideo } from '../controllers/video.controller.ts'

const videoRouter = Router();

videoRouter.use(verifyJWT);
videoRouter.route('/publish-video').post(
    upload.fields([
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
videoRouter.route('/update-video/:videoId').patch(upload.single('thumbnail'), updateVideo);
videoRouter.route('/delete-video/:videoId').delete(deleteVideo);
videoRouter.route('/get-videos').get(getAllVideos);

export default videoRouter;