import { Router } from 'express'
import { upload } from '../middlewares/multer.middleware.ts'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.ts'
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

export default userRouter;