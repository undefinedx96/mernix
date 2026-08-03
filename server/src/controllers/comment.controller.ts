import type { Request, Response } from 'express'
import mongoose, { type PipelineStage } from 'mongoose'
import { ApiError } from '../utils/ApiError.ts'
import { Comment } from '../models/comment.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import { Video } from '../models/video.model.ts'
import { Like } from '../models/like.model.ts'
import type { GetAllVideosQueryType, VideoParams } from '../validators/video.validator.ts'
import type { CommentBody, CommentParams } from '../validators/comment.validator.ts'




const addComment = async (req: Request<VideoParams, {}, CommentBody>, res:Response) => {
    const { videoId } = req.params;
    const { content } = req.body;

    // console.log(`VideoID: ${videoId}`);
    // console.log(`Content: ${content}`);
    
    const video = await Video.findOne({ _id: videoId, isPublished: true });

    if (!video) {
        throw new ApiError(404, 'Video does not exist or is private');
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

    await comment.populate('owner', 'username avatar firstName lastName');

    return res
    .status(201)
    .json(
        new ApiResponse(201, comment, 'Comment created successfully')
    );
};




const updateComment = async (req: Request<CommentParams, {}, CommentBody>, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
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

    if (!updatedComment) {
        throw new ApiError(404, 'Comment not found or unauthorized to edit');
    }

    // console.log('Updated comment: ', updatedComment);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, 'Comment updated successfully')
    );
};




const deleteComment = async (req: Request<CommentParams>, res: Response) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment does not exist');
    }

    const isCommentOwner = comment.owner.toString() === req.user?._id.toString();

    const video = await Video.findById(comment.video);
    
    const isVideoOwner = video?.owner.toString() === req.user?._id.toString();

    if (!isCommentOwner && !isVideoOwner) {
        throw new ApiError(403, 'Unauthorized! You do not have permission to delete this comment');
    }

    await Promise.all([
        Comment.findByIdAndDelete(commentId),
        Like.deleteMany({ comment: commentId })
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, { commentId }, 'Comment deleted successfully')
    );
};




const getVideoComments = async (req: Request<VideoParams, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { videoId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const currentUser = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                video: videoObjectId
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'commenter',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            firstName: 1,
                            lastName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                commenter: {
                    $first: '$commenter'
                }
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'comment',
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
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ];
    // console.log('Pipeline: ', pipeline);

    const commentAggregate = Comment.aggregate(pipeline);
    // console.log('Comments aggregated: ', commentAggregate);

    const comments = await Comment.aggregatePaginate(commentAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('Video comments: ', comments);

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, 'Comments fetched successfully')
    );
};



export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}