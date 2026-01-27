import { Router } from 'express'
import { upload } from '../middlewares/multer.middleware.ts'
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshTheAccessToken, registerUser, updateAccountDetails, updateUserAvatar } from '../controllers/user.controller.ts'
import { verifyJWT } from '../middlewares/auth.middleware.ts'

const userRouter = Router();

userRouter.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(verifyJWT, logoutUser);
userRouter.route('/refresh-token').post(refreshTheAccessToken);
userRouter.route('/change-current-password').post(verifyJWT, changeCurrentPassword);
userRouter.route('/get-current-user').get(verifyJWT, getCurrentUser);
userRouter.route('/update-account-details').patch(verifyJWT, updateAccountDetails);
userRouter.route('/update-user-avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);

export default userRouter;
