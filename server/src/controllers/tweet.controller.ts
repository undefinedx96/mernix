import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { GetAllVideosQueryType, TweetBody, TweetParams, TweetUserParams } from '../types/types.ts';
import { ApiError } from '../utils/ApiError.ts';
import { Tweet } from '../models/tweet.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/like.model.ts';
import { User } from '../models/user.model.ts';




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




const deleteTweet = asyncHandler(async(req: Request, res: Response) => {
    const { tweetId } = req.params as TweetParams;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid or missing tweet ID');
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, 'Tweet does not exist');
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized! You do not have permission to delete this tweet');
    }

    await Promise.all([
        Tweet.findByIdAndDelete(tweetId),
        Like.deleteMany({ tweet: tweetId })
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, { tweetId }, 'Tweet deleted successfully')
    );
});




const getUserTweets = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { userId } = req.params as TweetUserParams;
    const { page = '1', limit = '10' } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid or missing user ID');
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
        throw new ApiError(404, 'User does not exist');
    }

    const tweetAggregate = Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            firstName: 1,
                            lastName: 1,
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
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'tweet',
                as: 'likes'
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: '$likes'
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, '$likes.likedBy'] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]);
    // console.log('Tweets aggregate: ', tweetAggregate);

    const tweets = await Tweet.aggregatePaginate(tweetAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: 'totalTweets',
            docs: 'tweets'
        }
    });
    // console.log('Tweets: ', tweets);

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, 'User tweets fetched successfully')
    );
});



export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}