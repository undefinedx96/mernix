import type { Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.ts'
import { Tweet } from '../models/tweet.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import mongoose from 'mongoose'
import { Like } from '../models/like.model.ts'
import type { TweetBody, TweetParams, TweetUserParams } from '../validators/tweet.validator.ts'
import type { GetAllVideosQueryType } from '../validators/video.validator.ts'




const createTweet = async (req: Request<{}, {}, TweetBody>, res: Response) => {
    const { content } = req.body;

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    });

    if (!tweet) {
        throw new ApiError(500, 'Falied to create tweet');
    }
    
    await tweet.populate('owner', 'username avatar firstName lastName');
    // console.log('Tweet: ', tweet);
    
    return res
    .status(201)
    .json(
        new ApiResponse(201, tweet, 'Tweet created successfully')
    );
};




const updateTweet = async(req: Request<TweetParams, {}, TweetBody>, res: Response) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user?._id
        },
        {
            $set: {
                content
            }
        },
        {
            returnDocument: 'after'
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
};




const deleteTweet = async(req: Request<TweetParams>, res: Response) => {
    const { tweetId } = req.params;

    const deletedTweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user?._id
    });

    if (!deletedTweet) {
        throw new ApiError(404, 'Tweet not found or you are not authorized to delete it');
    }
    
    await Like.deleteMany({ tweet: tweetId });

    return res
    .status(200)
    .json(
        new ApiResponse(200, { tweetId }, 'Tweet deleted successfully')
    );
};




const getUserTweets = async (req: Request<TweetUserParams, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { userId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const currentUser = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweetAggregate = Tweet.aggregate([
        {
            $match: {
                owner: userObjectId
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
                        if: { $in: [currentUser, '$likes.likedBy'] },
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
        limit: parseInt(limit, 10)
    });
    // console.log('Tweets: ', tweets);

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, 'User tweets fetched successfully')
    );
};



export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}