import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.ts';
import { addVideoToPlaylist, createPlayList, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { playlistBodySchema, playlistParamsSchema } from '../validators/playlist.validator.ts';
import { tweetUserParamsSchema } from '../validators/tweet.validator.ts';
import { getAllVideosQuerySchema } from '../validators/video.validator.ts';

const playlistRouter = Router();

playlistRouter.use(verifyJWT);

playlistRouter.route('/create-playlist').post(validate({ body: playlistBodySchema }), createPlayList);

playlistRouter.route('/add-video-to-playlist/:playlistId/:videoId').patch(validate({ params: playlistParamsSchema }), addVideoToPlaylist);

playlistRouter.route('/remove-video-from-playlist/:playlistId/:videoId').patch(validate({ params: playlistParamsSchema }), removeVideoFromPlaylist);

playlistRouter.route('/update-playlist/:playlistId').patch(
    validate({
        params: playlistParamsSchema,
        body: playlistBodySchema
    }),
    updatePlaylist
);

playlistRouter.route('/delete-playlist/:playlistId').delete(validate({ params: playlistParamsSchema }), deletePlaylist);

playlistRouter.route('/get-playlist-by-id/:playlistId').get(validate({ params: playlistParamsSchema }), getPlaylistById);

playlistRouter.route('/get-user-playlists/:userId').get(
    validate({
        params: tweetUserParamsSchema,
        query: getAllVideosQuerySchema
    }),
    getUserPlaylists
);

export default playlistRouter;