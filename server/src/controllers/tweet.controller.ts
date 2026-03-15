import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { TweetBody, TweetParams } from '../types/types.ts';
import { ApiError } from '../utils/ApiError.ts';
import { Tweet } from '../models/tweet.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { isValidObjectId } from 'mongoose';




const createTweet = asyncHandler(async (req: Request<{}, {}, TweetBody>, res: Response) => {
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, 'Tweet content is required');
    }

    if (content.trim().length > 280) {
        throw new ApiError(400, 'Tweet content cannot exceed 280 characters');
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user?._id
    });

    if (!tweet) {
        throw new ApiError(500, 'Falied to create tweet');
    }
    // console.log('Tweet: ', tweet);

    const createdTweet = await Tweet.findById(tweet._id).populate('owner', 'username avatar firstName lastName');
    // console.log('Created tweet: ', createTweet);

    if (!createTweet) {
        throw new ApiError(500, 'Failed to retreive tweet');
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, createdTweet, 'Tweet created successfully')
    );
});




const updateTweet = asyncHandler(async(req: Request<{}, {}, TweetBody>, res: Response) => {
    const { tweetId } = req.params as TweetParams;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid or missing tweet ID');
    }

    if (!content?.trim()) {
        throw new ApiError(400, 'Tweet content is required');
    }

    if (content.trim().length > 280) {
        throw new ApiError(400, 'Tweet content cannot exceed 280 characters');
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user?._id
        },
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true
        }
    ).populate('owner', 'username avatar firstName lastName');

    if (!updatedTweet) {
        throw new ApiError(404, 'Tweet not found or unauthorized to edit');
    }
    // console.log('Updated tweet: ', updatedTweet);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, 'Tweet updated successfully')
    );
});



export {
    createTweet,
    updateTweet,
}