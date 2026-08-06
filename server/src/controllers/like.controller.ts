import type { Request, Response } from 'express'
import type { PipelineStage } from 'mongoose'
import { ApiError } from '../utils/ApiError.ts'
import { Video } from '../models/video.model.ts'
import { Like } from '../models/like.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import { Comment } from '../models/comment.model.ts'
import { Tweet } from '../models/tweet.model.ts'
import type { GetAllVideosQueryType, VideoParams } from '../validators/video.validator.ts'
import type { CommentParams } from '../validators/comment.validator.ts'
import type { TweetParams } from '../validators/tweet.validator.ts'
import mongoose from 'mongoose'




// ============= MULTIPLE DB TRIPS WHICH MIGHT FEEL SLOW =============
// const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
//     const { videoId } = req.params as VideoParams;

//     if (!isValidObjectId(videoId)) {
//         throw new ApiError(400, 'Invalid video ID');
//     }

//     const video = await Video.findById(videoId);

//     if (!video) {
//         throw new ApiError(404, 'Video does not exist');
//     }
    
//     const existingLike = await Like.findOne({
//         video: videoId,
//         likedBy: req.user?._id
//     });

//     if (existingLike) {
//         await Like.findByIdAndDelete(existingLike?._id);
//         return res
//         .status(200)
//         .json(
//             new ApiResponse(200, {isLiked: false}, 'Video unliked successfully')
//         );
//     }

//     await Like.create({
//         video: videoId,
//         likedBy: req.user?._id
//     });

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, {isLiked: true}, 'Video liked successfully')
//     );
// });
// ============= MULTIPLE DB TRIPS WHICH MIGHT FEEL SLOW =============


// ============= FASTER METHOD FOR LIKE/UNLIKE TOGGLE WITH FINDONEANDDELETE() AND EXISTS() =============
const toggleVideoLike = async (req: Request<VideoParams>, res: Response) => {
    const { videoId } = req.params;

    const unliked = await Like.findOneAndDelete({
        video: videoId,
        likedBy: req.user?._id
    });

    if (unliked) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: false }, 'Video unliked successfully')
        );
    }

    const videoExists = await Video.exists({ _id: videoId });

    if (!videoExists) {
        throw new ApiError(404, 'Video does not exist');
    }

    await Like.findOneAndUpdate(
        {
            video: videoId,
            likedBy: req.user?._id
        },
        {
            $setOnInsert: {
                video: videoId,
                likedBy: req.user?._id
            }
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    );

    return res
    .status(201)
    .json(
        new ApiResponse(201, {isLiked: true}, 'Video liked successfully')
    );
};
// ============= FASTER METHOD FOR LIKE/UNLIKE TOGGLE WITH FINDONEANDDELETE() AND EXISTS() =============




const toggleCommentLike = async (req: Request<CommentParams>, res: Response) => {
    const { commentId } = req.params;

    const unliked = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (unliked) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: false }, 'Comment unliked successfully')
        );
    }

    const commentExists = await Comment.exists({ _id: commentId });

    if (!commentExists) {
        throw new ApiError(404, 'Comment does not exist');
    }

    await Like.findOneAndUpdate(
        {
            comment: commentId,
            likedBy: req.user?._id
        },
        {
            $setOnInsert: {
                comment: commentId,
                likedBy: req.user?._id
            }
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    );

    return res
    .status(201)
    .json(
        new ApiResponse(201, { isLiked: true }, 'Comment liked successfully')
    );
};




const toggleTweetLike = async (req: Request<TweetParams>, res: Response) => {
    const { tweetId } = req.params;

    const unliked = await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    if (unliked) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: false }, 'Tweet unliked successfully')
        );
    }

    const tweetExists = await Tweet.exists({ _id: tweetId });

    if (!tweetExists) {
        throw new ApiError(404, 'Tweet does not exist');
    }

    await Like.findOneAndUpdate(
        {
            tweet: tweetId,
            likedBy: req.user?._id
        },
        {
            $setOnInsert: {
                tweet: tweetId,
                likedBy: req.user?._id
            }
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    );

    return res
    .status(201)
    .json(
        new ApiResponse(201, {isLiked: true}, 'Tweet liked successfully')
    );
};




const getLikedVideos = async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { page = '1', limit = '10' } = req.query;
    
    const userId = req.user?._id;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true,
                    $ne: null
                },
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video',
                pipeline: [
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

    // console.log('Pipeline: ', pipeline);
    
    const likedVideosAggregate = Like.aggregate(pipeline);
    // console.log('Liked videos aggregate: ', likedVideosAggregate);

    const likedVideos = await Like.aggregatePaginate(likedVideosAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('Liked videos: ', likedVideos);

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos, 'Liked videos fetched successfully')
    );
};



export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}