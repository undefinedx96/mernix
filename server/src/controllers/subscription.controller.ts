import type { Request, Response } from 'express'
import mongoose, { type PipelineStage } from 'mongoose'
import { ApiError } from '../utils/ApiError.ts'
import { User } from '../models/user.model.ts'
import { Subscription } from '../models/subscription.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { ChannelParams, SubscriptionParams } from '../validators/subscription.validator.ts'
import type { GetAllVideosQueryType } from '../validators/video.validator.ts'
import type { ChannelSubscriberDataResponseObj, SubscribedChannelDataResponseObj } from '../types/aggregation.types.ts'




const toggleSubscription = async (req: Request<ChannelParams>, res: Response) => {
    const { channelId } = req.params;

    const subscriberId = req.user?._id;

    if (channelId.toString() === subscriberId?.toString()) {
        throw new ApiError(400, 'You cannot subscribe your own channel');
    }

    const channelExists = await User.exists({ _id: channelId });

    if (!channelExists) {
        throw new ApiError(404, 'Channel does not exist');
    }

    const existingSubscription = await Subscription.findOneAndDelete({
        subscriber: subscriberId,
        channel: channelId
    });
    // console.log('Existing subs: ', existingSubscription);

    if (existingSubscription) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, { isSubscribed: false }, 'Channel unsubscribed successfully')
        );
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, { isSubscribed: true }, 'Channel subscribed successfully')
    );
};




const getUserChannelSubscribers = async (req: Request<ChannelParams, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { channelId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const channelObjectId = new mongoose.Types.ObjectId(channelId);

    const channelExists = await User.exists({ _id: channelObjectId });

    if (!channelExists) {
        throw new ApiError(404, 'Channel does not exist');
    }

    if (channelId.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized! Only the channel owner can view their subscriber list');
    }

    const pipeline: PipelineStage[] = [
        {
            $match: {
                channel: channelObjectId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber',
                pipeline: [
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$subscriber'
        },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                createdAt: 1
            }
        }
    ];

    const subscriberAggregate = Subscription.aggregate(pipeline);

    const subscribers = await Subscription.aggregatePaginate<ChannelSubscriberDataResponseObj>(subscriberAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('Subscribers: ', subscribers);

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, 'Channel subscribers fetched successfully')
    );
};




const getSubscribedChannels = async (req: Request<SubscriptionParams, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { subscriberId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const subscriberObjectId = new mongoose.Types.ObjectId(req.user?._id);

    const existingSubscriber = await User.exists({ _id: subscriberObjectId });

    if (!existingSubscriber) {
        throw new ApiError(404, 'Subscriber does not exist');
    }

    if (subscriberId.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized! You do not have permission to view another user's subscription list");
    }

    const pipeline: PipelineStage[] = [
        {
            $match: {
                subscriber: subscriberObjectId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channel',
                pipeline: [
                    {
                        $lookup: {
                            from: 'videos',
                            localField: '_id',
                            foreignField: 'owner',
                            as: 'videos',
                            pipeline: [
                                {
                                    $match: {
                                        isPublished: true
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            totalVideos: {
                                $size: '$videos'
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            username: 1,
                            avatar: 1,
                            totalVideos: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$channel'
        },
        {
            $project: {
                _id: 1,
                channel: 1,
                createdAt: 1
            }
        }
    ];

    const subscriptionAggregate = Subscription.aggregate(pipeline);
    
    const subscribedChannels = await Subscription.aggregatePaginate<SubscribedChannelDataResponseObj>(subscriptionAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('Subscribed channels: ', subscribedChannels);

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, 'Subscribed channels fetched successfully')
    );
};



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}