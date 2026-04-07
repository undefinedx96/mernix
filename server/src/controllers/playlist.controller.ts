import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { GetAllVideosQueryType, PlaylistBody, PlaylistParams, TweetUserParams } from '../types/types.ts';
import { ApiError } from '../utils/ApiError.ts';
import { Playlist } from '../models/playlist.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.ts';
import type { PaginatedPlaylistResponse, PaginatedPlaylistsResponse } from '../types/aggregation.types.ts';
import { User } from '../models/user.model.ts';




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




const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId } = req.params as PlaylistParams;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid or missing playlist ID');
    }

    const deletedPlaylist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user?._id
        },
    );

    if (!deletedPlaylist) {
        const playlistExists = await Playlist.exists({ _id: playlistId });

        if (!playlistExists) {
            throw new ApiError(404, 'Playlist does not exist');
        }

        throw new ApiError(403, 'Unauthorized! You do not have permission to delete this playlist');
    }
    // console.log('Deleted playlist: ', deletedPlaylist);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, 'Playlist deleted successfully')
    );
});




const getPlaylistById = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { playlistId } = req.params as PlaylistParams;
    const { page = '1', limit = '10' } = req.query;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid or missing playlist ID');
    }

    const playlist = Playlist.aggregate([
        {
            $match: {
                _id:  new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $unwind: '$videos'
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'videos',
                foreignField: '_id',
                as: 'videoDetails',
                pipeline: [
                    {
                        $match: {
                            isPublished:true
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        firstName: 1,
                                        lastName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoDetails: {
                    $first: '$videoDetails'
                }
            }
        },
        {
            $project: {
                name: 1,
                description:1,
                video: '$videoDetails'
            }
        }
    ]);

    const aggregatedPlaylist = (await Playlist.aggregatePaginate(playlist, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs:'totalVideos',
            docs: 'playlistArr'
        }
    })) as unknown as PaginatedPlaylistResponse;

    if (!aggregatedPlaylist || aggregatedPlaylist?.playlistArr?.length === 0) {
        const playlistExists = await Playlist.exists({ _id: playlistId });

        if (!playlistExists) {
            throw new ApiError(404, 'Playlist not found');
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, aggregatedPlaylist, 'Playlist is currently empty')
        );
    }
    // console.log('Aggregated playlist: ', aggregatedPlaylist);

    return res
    .status(200)
    .json(
        new ApiResponse(200, aggregatedPlaylist, 'Playlist fetched successfully')
    );
});




const getUserPlaylists = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { userId } = req.params as TweetUserParams;
    const { page = '1', limit = '10' } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid or missing user ID');
    }

    const playlists = Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                videoCount: {
                    $size: '$videos'
                },
                thumbnailVideo: {
                    $arrayElemAt: ['$videos', 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videoCount: 1,
                thumbnailVideo: 1,
                updatedAt: 1
            }
        },
        {
            $sort: {
                updatedAt: -1
            }
        }
    ]);

    const playlistsAggregated = (await Playlist.aggregatePaginate(playlists, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: 'totalPlaylists',
            docs: 'playlistsArr'
        }
    })) as unknown as PaginatedPlaylistsResponse;

    if (!playlistsAggregated || playlistsAggregated?.playlistsArr?.length === 0) {
        const userExists = await User.exists({ _id: userId });

        if (!userExists) {
            throw new ApiError(404, 'User does not exist');
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, playlistsAggregated, 'No playlists found')
        );
    }
    // console.log('Playlists aggregated and paginated: ', playlistsAggregated);

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlistsAggregated, 'Playlists fetched successfully')
    );
});



export {
    createPlayList,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists
}