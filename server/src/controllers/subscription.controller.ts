import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { ChannelParams } from '../types/types.ts';
import mongoose, { isValidObjectId, type PipelineStage } from 'mongoose';
import { ApiError } from '../utils/ApiError.ts';
import { User } from '../models/user.model.ts';
import { Subscription } from '../models/subscription.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';




const toggleSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { channelId } = req.params as ChannelParams;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid or missing channel ID');
    }

    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, 'You cannot subscribe your own channel');
    }

    const channelExists = await User.exists({ _id: channelId });

    if (!channelExists) {
        throw new ApiError(404, 'Channel does not exist');
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    });
    // console.log('Existing subs: ', existingSubscription);

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription?._id);
        return res
        .status(200)
        .json(
            new ApiResponse(200, { isSubscribed: false }, 'Channel unsubscribed successfully')
        );
    }

    const newSubscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    });

    if (!newSubscription) {
        throw new ApiError(500, 'Something went wrong while subscribing');
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, { isSubscribed: true }, 'Channel subscribed successfully')
    );
});




const getUserChannelSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const { channelId } = req.params as ChannelParams;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid or missing channel ID');
    }

    const channelExists = await User.exists({ _id: channelId });

    if (!channelExists) {
        throw new ApiError(404, 'Channel does not exist');
    }

    if (channelId.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized! Only the channel owner can view their subscriber list');
    }

    const subscribers: PipelineStage[] = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
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
            $addFields: {
                subscriber: {
                    $first: '$subscriber'
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ]);
    // console.log('Subscribers aggregated and subscribers count: ', subscribers, subscribers.length);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                subscribers,
                subscribersCount: subscribers.length
            },
            `Subscribers of channel ${channelExists._id} fetched successfully`
        )
    );
});



export {
    toggleSubscription,
    getUserChannelSubscribers,
}