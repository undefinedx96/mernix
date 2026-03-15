import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { TweetBody } from '../types/types.ts';
import { ApiError } from '../utils/ApiError.ts';
import { Tweet } from '../models/tweet.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';




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



export {
    createTweet,
}