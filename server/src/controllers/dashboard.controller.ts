import type { Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.ts'
import mongoose, { type PipelineStage } from 'mongoose'
import { Video } from '../models/video.model.ts'
import { Subscription } from '../models/subscription.model.ts'
import { Like } from '../models/like.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { ChannelVideoDataResponseObj, VideoStatsAggregateResult } from '../types/aggregation.types.ts'
import type { ChannelStatsResponse } from '../validators/dashboard.validator.ts'
import type { GetAllVideosQueryType } from '../validators/video.validator.ts'



const getChannelStats = async (req: Request, res: Response) =>{
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, 'Unauthenticated unauthorized request');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const [videoStats, totalSubscribers, channelVideoIds] = await Promise.all([
        Video.aggregate<VideoStatsAggregateResult>([
            {
                $match: {
                    owner: userObjectId
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
            channel: userObjectId
        }),

        Video.find({ owner: userObjectId }).distinct('_id')
    ]);

    const totalLikes = channelVideoIds.length > 0 
        ? await Like.countDocuments({
            video: {
                $in: channelVideoIds
            }
        })
        : 0;

    const allStats: ChannelStatsResponse = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        subscribers: totalSubscribers || 0,
        totalLikes
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
};




const getChannelVideos = async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const userId = req.user?._id;
    const { page = '1', limit = '10' } = req.query;

    if (!userId) {
        throw new ApiError(401, 'Unauthenticated unauthorized request');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [
        {
            $match: {
                owner: userObjectId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];

    const videoAggregate = Video.aggregate(pipeline);

    const videos = await Video.aggregatePaginate<ChannelVideoDataResponseObj>(videoAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });

    // console.log('Videos: ', videos);

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, 'Channel videos fetched successfully')
    );
};



export {
    getChannelStats,
    getChannelVideos
}