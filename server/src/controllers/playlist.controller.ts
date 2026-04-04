import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { PlaylistBody, PlaylistParams } from '../types/types.ts';
import { ApiError } from '../utils/ApiError.ts';
import { Playlist } from '../models/playlist.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.ts';




const createPlayList = asyncHandler(async (req: Request<{}, {}, PlaylistBody>, res: Response) => {
    const { name, description } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, 'Playlist name is required');
    }

    if (!description?.trim()) {
        throw new ApiError(400, 'Playlist description is required');
    }

    const existingPlaylist = await Playlist.exists({
        name: name?.trim(),
        owner: req.user?._id
    });

    if (existingPlaylist) {
        throw new ApiError(409, `You already have a playlist named ${name?.trim()}`);
    }
    // console.log('Existing Playlist: ', existingPlaylist);

    const playlist = await Playlist.create({
        name: name?.trim(),
        description: description?.trim(),
        videos: [],
        owner: req.user?._id
    });

    if (!playlist) {
        throw new ApiError(500, 'Something went wrong while creating the playlist');
    }
    // console.log('Playlist: ', playlist);

    return res
    .status(201)
    .json(
        new ApiResponse(201, playlist, 'Playlist created successfully')
    );
});




const  addVideoToPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId, videoId } = req.params as PlaylistParams;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid or missing playlist ID');
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (!video.isPublished && video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized! This video is private and cannot be added to your playlist');
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id,
            videos: {
                $ne: videoId
            }
        },
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            returnDocument: 'after'
        }
    ).populate('videos', 'title thumbnail duration views');

    if (!updatedPlaylist) {
        const playlistExists = await Playlist.exists({
            _id: playlistId,
            owner: req.user?._id
        });

        if (playlistExists) {
            throw new ApiError(409, 'Video already exists in this playlist');
        }

        throw new ApiError(404, 'Playlist not found or you do not have permission to edit it');
    }
    // console.log('Updated playlist: ', updatedPlaylist);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, `Added video ${video?.title} successfully`)
    );
});




const removeVideoFromPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId, videoId } = req.params as PlaylistParams;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid or missing playlist ID');
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id,
            videos: videoId
        },
        {
            $pull:{
                videos: videoId
            }
        },
        {
            returnDocument: 'after'
        }
    ).populate('videos', 'title thumbnail duration views');

    if (!updatedPlaylist) {
        const playlistExists = await Playlist.exists({
            _id: playlistId,
            owner: req.user?._id
        });

        if (playlistExists) {
            throw new ApiError(404, 'Video not found in this playlist');
        }

        throw new ApiError(404, 'Playlist not found or you do not have permission to delete it');
    }
    // console.log('Updated playlist: ', updatedPlaylist);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, 'Deleted video from playlist successfully')
    );
});




const updatePlaylist = asyncHandler(async  (req: Request<{}, {}, PlaylistBody>, res: Response) => {
    const { playlistId } = req.params as PlaylistParams;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,  'Invalid or missing playlist ID');
    }

    if (!name?.trim()) {
        throw new ApiError(400,'Playlist name is required');
    }

    if (!description?.trim()) {
        throw new ApiError(400, 'Playlist description is required');
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $set: {
                name: name.trim(),
                description: description.trim()
            }
        },
        {
            returnDocument:  'after'
        }
    );

    if (!updatedPlaylist) {
        const playlistExists = await Playlist.exists({ _id: playlistId });

        if (!playlistExists) {
            throw new ApiError(404, 'Playlist does not exist');
        }

        throw new ApiError(403, 'Unauthorized! You do not have permission to modify this playlist');
    }
    // console.log('Updated playlist: ', updatedPlaylist);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, 'Playlist metadata updated successfully')
    );
});



export {
    createPlayList,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
}