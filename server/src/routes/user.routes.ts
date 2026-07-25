import { Router } from 'express'
import { uploadImage } from '../middlewares/multer.middleware.ts'
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshTheAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.ts'
import { verifyJWT } from '../middlewares/auth.middleware.ts'
import { validate } from '../middlewares/validate.middleware.ts'
import { changeCurrentPasswordSchema, getUserChannelProfileParamsSchema, loginUserSchema, registerFileSchema, registerUserSchema, singleAvatarUpdateSchema, singleCoverImageUpdateSchema, updateAccountDetailsSchema, watchHistoryQuerySchema } from '../validators/auth.validator.ts'
import { handleRegisterUploads } from '../middlewares/upload.middleware.ts'


const userRouter = Router();


userRouter.route('/register').post(
    handleRegisterUploads,
    validate({ body: registerUserSchema, files: registerFileSchema }),
    registerUser
);

userRouter.route('/login').post(
    validate({ body: loginUserSchema }),
    loginUser
);

userRouter.route('/logout').post(verifyJWT, logoutUser);
userRouter.route('/refresh-token').post(refreshTheAccessToken);

userRouter.route('/change-current-password').post(
    verifyJWT,
    validate({ body: changeCurrentPasswordSchema }),
    changeCurrentPassword
);

userRouter.route('/get-current-user').get(verifyJWT, getCurrentUser);

userRouter.route('/update-account-details').patch(
    verifyJWT,
    validate({ body: updateAccountDetailsSchema }),
    updateAccountDetails
);

userRouter.route('/update-user-avatar').patch(
    verifyJWT,
    uploadImage.single('avatar'),
    validate({ file: singleAvatarUpdateSchema }),
    updateUserAvatar
);

userRouter.route('/update-user-cover').patch(
    verifyJWT,
    uploadImage.single('coverImage'),
    validate({ file: singleCoverImageUpdateSchema }),
    updateUserCoverImage
);

userRouter.route('/get-user-channel-profile/:username').get(
    verifyJWT,
    validate({ params: getUserChannelProfileParamsSchema }),
    getUserChannelProfile
);
userRouter.route('/get-watch-history').get(
    verifyJWT,
    validate({ query: watchHistoryQuerySchema }),
    getWatchHistory
);

export default userRouter;