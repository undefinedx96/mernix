import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { PlaylistBody } from '../types/types.ts';
import { ApiError } from '../utils/ApiError.ts';
import { Playlist } from '../models/playlist.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';




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



export {
    createPlayList,
}