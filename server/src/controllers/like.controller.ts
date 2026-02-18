
import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts'
import type { CommentParams, VideoParams } from '../types/types.ts';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/ApiError.ts';
import { Video } from '../models/video.model.ts';
import { Like } from '../models/like.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { Comment } from '../models/comment.model.ts';




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



export {
    toggleVideoLike,
    toggleCommentLike,
}