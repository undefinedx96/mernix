import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addVideoToPlaylist, createPlayList, removeVideoFromPlaylist } from '../controllers/playlist.controller.ts';

const playlistRouter = Router();

playlistRouter.use(verifyJWT);

playlistRouter.route('/create-playlist').post(createPlayList);
playlistRouter.route('/add-video-to-playlist/:playlistId/:videoId').patch(addVideoToPlaylist);
playlistRouter.route('/remove-video-from-playlist/:playlistId/:videoId').patch(removeVideoFromPlaylist);

export default playlistRouter;