import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { ApiError } from '../utils/ApiError.ts';
import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.ts';
import { Subscription } from '../models/subscription.model.ts';
import { Like } from '../models/like.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import type { ChannelStatsResponse, GetAllVideosQueryType } from '../types/types.ts';
import type { PaginatedPlaylistResponse } from '../types/aggregation.types.ts';




const getChannelStats = asyncHandler(async (req: Request, res: Response) =>{
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, 'Unauthenticated unauthorized request');
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid or missing user ID');
    }

    const [videoStats, totalSubscribers, totalLikes] = await Promise.all([
        Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalVideos: {
                        $sum: 1
                    },
                    totalViews: {
                        $sum: '$views'
                    }
                }
            }
        ]),

        Subscription.countDocuments({
            channel: userId
        }),

        Like.aggregate([
            {
                $lookup: {
                    from: 'videos',
                    localField: 'video',
                    foreignField: '_id',
                    as: 'videoDetails'
                }
            },
            {
                $unwind: '$videoDetails'
            },
            {
                $match: {
                    'videoDetails.owner': new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikesCount: {
                        $sum: 1
                    }
                }
            }
        ])
    ]);

    const allStats: ChannelStatsResponse = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        subscribers: totalSubscribers || 0,
        totalLikes: totalLikes[0]?.totalLikesCount || 0
    };

    // console.log('Video stats: ', videoStats);
    // console.log('--------------------------------');
    // console.log('Total subscribers: ', totalSubscribers);
    // console.log('--------------------------------');
    // console.log('Total likes: ', totalLikes);
    // console.log('--------------------------------');

    return res
    .status(200)
    .json(
        new ApiResponse(200, allStats, 'Channel stats fetched successfully')
    );
});




const getChannelVideos = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const userId = req.user?._id;
    const { page = '1', limit = '10' } = req.query;

    if (!userId) {
        throw new ApiError(401, 'Unauthenticated unauthorized request');
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Unauthenticated unauthorized request');
    }

    const videoAggregate = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const videos = (await Video.aggregatePaginate(videoAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: 'totalVideos',
            docs: 'videos'
        }
    })) as unknown as PaginatedPlaylistResponse;

    // console.log('Videos: ', videos);

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, 'Channel videos fetched successfully')
    );
});



export {
    getChannelStats,
    getChannelVideos
}