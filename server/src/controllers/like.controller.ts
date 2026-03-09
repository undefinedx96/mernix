
import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts'
import type { CommentParams, GetAllVideosQueryType, TweetParams, VideoParams } from '../types/types.ts';
import mongoose, { isValidObjectId, type PipelineStage } from 'mongoose';
import { ApiError } from '../utils/ApiError.ts';
import { Video } from '../models/video.model.ts';
import { Like } from '../models/like.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { Comment } from '../models/comment.model.ts';
import { Tweet } from '../models/tweet.model.ts';




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


// ============= FASTER METHOD FOR LIKE/UNLIKE TOGGLE WITH DELETEONE() AND EXISTS() =============
const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as VideoParams;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }

    const unliked = await Like.deleteOne({
        video: videoId,
        likedBy: req.user?._id
    });

    if (unliked.deletedCount > 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, 'Video unliked successfully')
        );
    }

    const videoExists = await Video.exists({ _id: videoId });

    if (!videoExists) {
        throw new ApiError(404, 'Video does not exist')
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, {isLiked: true}, 'Video liked successfully')
    );
});
// ============= FASTER METHOD FOR LIKE/UNLIKE TOGGLE WITH DELETEONE() AND EXISTS() =============




const toggleCommentLike = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params as CommentParams;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid or missing comment ID');
    }

    const unliked = await Like.deleteOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (unliked.deletedCount > 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, 'Comment unliked successfully')
        );
    }

    const commentExists = await Comment.exists({ _id: commentId });

    if (!commentExists) {
        throw new ApiError(404, 'Comment does not exist');
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, {isLiked: true}, 'Comment liked successfully')
    );
});




const toggleTweetLike = asyncHandler(async (req: Request, res: Response) => {
    const { tweetId } = req.params as TweetParams;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid or missing tweet ID');
    }

    const unliked = await Like.deleteOne({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    if (unliked.deletedCount > 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, 'Tweet unliked successfully')
        );
    }

    const tweetExists = await Tweet.exists({ _id: tweetId });

    if (!tweetExists) {
        throw new ApiError(404, 'Tweet does not exist');
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, {isLiked: true}, 'Tweet liked successfully')
    );
});




const getLikedVideos = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { page = '1', limit = '10' } = req.query;
    
    const userId = req.user?._id;

    // if (!isValidObjectId(userId)) {
    //     throw new ApiError(400, 'Invalid or missing uer ID');
    // }

    const pipeline: PipelineStage[] = [
        {
            $match: {
                likedBy: userId,
                video: {
                    $exists: true,
                    $ne: null
                },
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
        },
        {
            $sort: {
                createdAt: -1
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
});



export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}