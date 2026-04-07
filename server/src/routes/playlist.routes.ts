import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addVideoToPlaylist, createPlayList, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.ts';

const playlistRouter = Router();

playlistRouter.use(verifyJWT);

playlistRouter.route('/create-playlist').post(createPlayList);
playlistRouter.route('/add-video-to-playlist/:playlistId/:videoId').patch(addVideoToPlaylist);
playlistRouter.route('/remove-video-from-playlist/:playlistId/:videoId').patch(removeVideoFromPlaylist);
playlistRouter.route('/update-playlist/:playlistId').patch(updatePlaylist);
playlistRouter.route('/delete-playlist/:playlistId').delete(deletePlaylist);
playlistRouter.route('/get-playlist-by-id/:playlistId').get(getPlaylistById);
playlistRouter.route('/get-user-playlists/:userId').get(getUserPlaylists);

export default playlistRouter;