import type { Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.ts'
import { Playlist } from '../models/playlist.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import mongoose, { type PipelineStage } from 'mongoose'
import { Video } from '../models/video.model.ts'
import type { VideoDetailDataResponseObj, UserPlaylistSummary } from '../types/aggregation.types.ts'
import { User } from '../models/user.model.ts'
import type { PlaylistBody, PlaylistParams } from '../validators/playlist.validator.ts'
import type { TweetUserParams } from '../validators/tweet.validator.ts'
import type { GetAllVideosQueryType } from '../validators/video.validator.ts'




const createPlayList = async (req: Request<{}, {}, PlaylistBody>, res: Response) => {
    const { name, description } = req.body;

    const existingPlaylist = await Playlist.exists({
        name,
        owner: req.user?._id
    }).collation({ locale: 'en', strength: 2 });

    if (existingPlaylist) {
        throw new ApiError(409, `You already have a playlist named "${name}"`);
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user?._id
    });
    // console.log('Playlist: ', playlist);

    return res
    .status(201)
    .json(
        new ApiResponse(201, playlist, 'Playlist created successfully')
    );
};




const addVideoToPlaylist = async (req: Request<PlaylistParams>, res: Response) => {
    const { playlistId, videoId } = req.params;

    const video = await Video.findById(videoId).select('_id isPublished owner title');

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (!video.isPublished && video.owner.equals(req.user?._id)) {
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
        new ApiResponse(200, updatedPlaylist, `Added video "${video?.title}" successfully`)
    );
};




const removeVideoFromPlaylist = async (req: Request<PlaylistParams>, res: Response) => {
    const { playlistId, videoId } = req.params;

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
};




const updatePlaylist = async (req: Request<PlaylistParams, {}, PlaylistBody>, res: Response) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const duplicatePlaylist = await Playlist.exists({
        owner: req.user?._id,
        name,
        _id: {
            $ne: playlistId
        }
    }).collation({ locale: 'en', strength: 2 });

    if (duplicatePlaylist) {
        throw new ApiError(409, `You already have another playlist named "${name}"`);
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $set: {
                name,
                description
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
};




const deletePlaylist = async (req: Request<PlaylistParams>, res: Response) => {
    const { playlistId } = req.params;

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
};




const getPlaylistById = async (req: Request<PlaylistParams, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { playlistId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const playlistObjectId = new mongoose.Types.ObjectId(playlistId);

    const playlist = await Playlist.findById(playlistObjectId).select('_id name description owner');

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }
    // console.log('Playlist metadata: ', playlist);

    const pipeline: PipelineStage[] = [
        {
            $match: {
                _id:  playlistObjectId
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
                as: 'video',
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
                        $unwind: '$owner'
                    }
                ]
            }
        },
        {
            $unwind: '$video'
        },
        {
            $replaceRoot: {
                newRoot: '$video'
            }
        }
    ];

    const playlistAggregate = Playlist.aggregate(pipeline);

    const paginatedVideos = await Playlist.aggregatePaginate<VideoDetailDataResponseObj>(playlistAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('Paginated videos: ', paginatedVideos);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                playlist,
                videos: paginatedVideos
            },
            'Playlist fetched successfully'
        )
    );
};




const getUserPlaylists = async (req: Request<TweetUserParams, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { userId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const userExists = await User.exists({ _id: userObjectId });

    if (!userExists) {
        throw new ApiError(404, 'User does not exist');
    }

    const pipeline: PipelineStage[] = [
        {
            $match: {
                owner: userObjectId
            }
        },
        {
            $sort: {
                updatedAt: -1
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'videos.0',
                foreignField: '_id',
                as: 'firstVideo',
                pipeline: [
                    {
                        $project: {
                            thumbnail: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoCount: {
                    $size: '$videos'
                },
                firstVideo: {
                    $arrayElemAt: ['$firstVideo', 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videoCount: 1,
                thumbnailVideo: '$firstVideo.thumbnail',
                updatedAt: 1
            }
        }
    ];

    const playlistAggregate = Playlist.aggregate(pipeline);

    const paginatedPlaylists = await Playlist.aggregatePaginate<UserPlaylistSummary>(playlistAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });

    // console.log('Paginated playlists: ', paginatedPlaylists);
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            paginatedPlaylists,
            paginatedPlaylists.docs.length === 0 ? 'No playlists found for this user' : 'Playlists fetched successfully'
        )
    );
}


export {
    createPlayList,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists
}