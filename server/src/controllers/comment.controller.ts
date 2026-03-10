import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { CommentBody, VideoParams } from '../types/types.ts';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/ApiError.ts';
import { Comment } from '../models/comment.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { Video } from '../models/video.model.ts';




const addComment = asyncHandler(async (req: Request<{}, {}, CommentBody>, res:Response) => {
    const { videoId } = req.params as VideoParams;
    const { content } = req.body;

    // console.log(`VideoID: ${videoId}`);
    // console.log(`Content: ${content}`);

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }
    
    const videoExists = await Video.exists({ _id: videoId });

    if (!videoExists) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (!content?.trim()) {
        throw new ApiError(400, 'Comment is required');
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });
    // console.log('Comment: ', comment);

    if (!comment) {
        throw new ApiError(500, 'Falied to add comment');
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, comment, 'Comment created successfully')
    );
});



export {
    addComment,
}