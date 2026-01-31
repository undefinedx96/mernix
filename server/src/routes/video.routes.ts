import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { upload } from '../middlewares/multer.middleware.ts'
import { publishAVideo } from '../controllers/video.controller.ts'

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

export default videoRouter;