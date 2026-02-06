import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.ts'
import type { GetAllVideosQueryType, PublishAVideoReqBody, VideoParams } from '../types/types.ts'
import { ApiError } from '../utils/ApiError.ts'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.ts';
import { Video } from '../models/video.model.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import mongoose, { isValidObjectId, type PipelineStage } from 'mongoose';
import { User } from '../models/user.model.ts';
import type { VideoDetailDataResponseObj } from '../types/aggregation.types.ts';





const publishAVideo = asyncHandler(async (req: Request<{}, {}, PublishAVideoReqBody>, res: Response) => {
    const { title, description } = req.body;

    if ([title, description].some(field => field?.trim() === '')) {
        throw new ApiError(400, 'Video title and description fields are required');
    }
    
    const files = req.files as {[fieldName: string]: Express.Multer.File[]};
    const thumbnailLocalPath = files?.thumbnail?.[0]?.path;
    const videoFileLocalPath = files?.videoFile?.[0]?.path;

    if (!thumbnailLocalPath || !videoFileLocalPath) {
        throw new ApiError(400, 'Thumbnail and video files are required');
    }

    let thumbnail, videoFile;

    try {
        [thumbnail, videoFile] = await Promise.all([
            uploadOnCloudinary(thumbnailLocalPath),
            uploadOnCloudinary(videoFileLocalPath)
        ]);

        if (!thumbnail) {
            throw new ApiError(400, 'Thumbnail is required');
        }

        if (!videoFile) {
            throw new ApiError(400, 'Video file is required');
        }

        const video = await Video.create({
            thumbnail: thumbnail?.url,
            thumbnailPublicId: thumbnail?.public_id || '',
            videoFile: videoFile?.url,
            videoFilePublicId: videoFile?.public_id || '',
            title,
            description,
            duration: videoFile?.duration || 0,
            isPublished: true,
            owner: req.user?._id
        });

        if (!video) {
            throw new ApiError(500, 'Internal server error while creating video record');
        }

        // console.log('Video : ', video);

        return res
        .status(201)
        .json(
            new ApiResponse(201, video, 'Video published successfully')
        );
    }
    catch (error: any) {
        if (thumbnail?.public_id) {
            await deleteFromCloudinary(thumbnail?.public_id, 'image');
        }

        if (videoFile?.public_id) {
            await deleteFromCloudinary(videoFile?.public_id, 'video');
        }

        throw new ApiError(500, error?.message || 'Something went wrong while publishing the video');
    }
});




const getVideoById = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as VideoParams;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }

    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        }
    );

    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $addToSet: {
                    watchHistory: new mongoose.Types.ObjectId(videoId)
                }
            }
        );
    }

    const currentUser: mongoose.Types.ObjectId | null = req.user?._id ? new mongoose.Types.ObjectId(req.user?._id) : null;

    const video = await Video.aggregate<VideoDetailDataResponseObj>([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
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
                            firstName: 1,
                            lastName: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as: 'likes'
            }
        },
        {
            $addFields: {
                owner: {
                    $first: '$owner'
                },
                likesCount: {
                    $size: '$likes'
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [currentUser, '$likes.likedBy']
                        },
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

    if (!video.length) {
        throw new ApiError(404, 'Video does not exist');
    }

    // console.log('Video[]: ', video);

    return res
    .status(200)
    .json(
        new ApiResponse(200, video[0], 'Video details fetched successfully')
    );
});




const updateVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as VideoParams;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing video ID');
    }

    const { title, description } = req.body as PublishAVideoReqBody;

    if ([title, description].some(field => field?.trim() === '')) {
        throw new ApiError(400, 'Video title and description fields are required');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized request! You do not own this video');
    }

    const thumbnailLocalPath = req.file?.path;

    let uploadedThumbnail;

    if (thumbnailLocalPath) {
        uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        
        if (!uploadedThumbnail) {
            throw new ApiError(500, 'Failed to upload thumbnail on cloudinary');
        }

        if (video.thumbnailPublicId) {
            await deleteFromCloudinary(video.thumbnailPublicId);
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: uploadedThumbnail?.url || video.thumbnail,
                thumbnailPublicId: uploadedThumbnail?.public_id || video.thumbnailPublicId
            }
        },
        {
            new: true
        }
    );

    // console.log('Updated video: ', updatedVideo);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, 'Video updated successfully')
    );
});




const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as VideoParams;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid or missing videoID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized request! You do not own this video');
    }

    if (video.videoFilePublicId) {
        await deleteFromCloudinary(video.videoFilePublicId, 'video');
    }

    if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId, 'image');
    }

    const deleteVideoAndWatchHistory = await Promise.all([
        Video.findByIdAndDelete(videoId),
        User.updateMany(
            {},
            {
                $pull: {
                    watchHistory: video?._id
                }
            }
        )
    ]);

    // console.log('Delete video and watch history: ', deleteVideoAndWatchHistory);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, 'Video deleted successfully')
    );
});




const getAllVideos = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {
    const { page = '1', limit = '10', searchQuery, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const pipeline: PipelineStage[] = [];

    if (searchQuery) {
        pipeline.push({
            $match: {
                $or: [
                    {
                        title: {
                            $regex: searchQuery,
                            $options: 'i'
                        }
                    },
                    {
                        description: {
                            $regex: searchQuery,
                            $options: 'i'
                        }
                    }
                ]
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, 'Invalid user ID');
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    const isOwnerRequesting = userId && req.user?._id.toString() === userId.toString();

    if (!isOwnerRequesting) {
        pipeline.push({
            $match: {
                isPublished: true
            }
        });
    }

    pipeline.push({
        $sort: {
            [sortBy]: sortType === 'asc' ? 1 : -1
        }
    });

    pipeline.push(
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
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$owner'
        }
    );

    console.log('Pipeline []: ', pipeline);
    const videoAggregate = Video.aggregate(pipeline);
    // console.log('Video aggregate: ', videoAggregate);

    const allVideos = await Video.aggregatePaginate(videoAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('All videos after aggregate Paginate: ', allVideos);

    return res
    .status(200)
    .json(
        new ApiResponse(200, allVideos, 'All videos fetched successfully')
    );
});



export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos,
}