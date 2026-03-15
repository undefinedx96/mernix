import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import type { CommentBody, CommentParams, VideoParams } from '../types/types.ts';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/ApiError.ts';
import { Comment } from '../models/comment.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { Video } from '../models/video.model.ts';
import { Like } from '../models/like.model.ts';




const addComment = asyncHandler(async (req: Request<{}, {}, CommentBody>, res:Response) => {
    const { videoId } = req.params as VideoParams;
    const { content } = req.body;

    // console.log(`VideoID: ${videoId}`);
    // console.log(`Content: ${content}`);

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }
    
    const video = await Video.findOne({ _id: videoId, isPublished: true });

    if (!video) {
        throw new ApiError(404, 'Video does not exist or is private');
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

    const createdComment = await Comment.findById(comment._id).populate(
        'owner',
        'username avatar firstName lastName'
    );

    if (!createdComment) {
        throw new ApiError(500, 'Failed to retreive comment');
    }

    // console.log('Created comment: ', createdComment);

    return res
    .status(201)
    .json(
        new ApiResponse(201, createdComment, 'Comment created successfully')
    );
});




const updateComment = asyncHandler(async (req: Request<{}, {}, CommentBody>, res: Response) => {
    const { commentId } = req.params as CommentParams;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid or missing comment ID');
    }

    if (!content?.trim()) {
        throw new ApiError(400, 'Content is required');
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
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

    if (!updatedComment) {
        throw new ApiError(404, 'Comment not found or unauthorized to edit');
    }

    // console.log('Updated comment: ', updatedComment);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, 'Comment updated successfully')
    );
});




const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params as CommentParams;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid or missing comment ID');
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment does not exist');
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized! You do not have permission to delete this comment');
    }

    await Promise.all([
        Comment.findByIdAndDelete(commentId),
        Like.deleteMany({ comment: commentId })
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, 'Comment deleted successfully')
    );
});



export {
    addComment,
    updateComment,
    deleteComment,
}