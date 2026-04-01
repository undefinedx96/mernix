import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { createPlayList } from '../controllers/playlist.controller.ts';

const playlistRouter = Router();

playlistRouter.use(verifyJWT);

playlistRouter.route('/create-playlist').post(createPlayList);

export default playlistRouter;