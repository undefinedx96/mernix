import type { Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.ts'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.ts'
import { Video } from '../models/video.model.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import mongoose, { type PipelineStage } from 'mongoose'
import { User } from '../models/user.model.ts'
import type { VideoDetailDataResponseObj } from '../types/aggregation.types.ts'
import type { PublishAVideoReqBody, VideoParams,  GetAllVideosQueryType, PublishVideoFiles, UpdateVideoReqBody } from '../validators/video.validator.ts'
import { Like } from '../models/like.model.ts'
import { Comment } from '../models/comment.model.ts'





const publishAVideo = async (req: Request<{}, {}, PublishAVideoReqBody>, res: Response) => {
    const { title, description } = req.body;
    
    const files = (req.files as unknown) as PublishVideoFiles;
    const thumbnailLocalPath = files?.thumbnail?.[0]?.path;
    const videoFileLocalPath = files?.videoFile?.[0]?.path;

    let thumbnail, videoFile;

    try {
        [thumbnail, videoFile] = await Promise.all([
            uploadOnCloudinary(thumbnailLocalPath),
            uploadOnCloudinary(videoFileLocalPath)
        ]);

        if (!thumbnail || !videoFile) {
            throw new ApiError(500, 'Failed to upload files to Cloudinary');
        }

        const video = await Video.create({
            thumbnail: thumbnail?.url,
            thumbnailPublicId: thumbnail?.public_id || '',
            videoFile: videoFile?.url,
            videoFilePublicId: videoFile?.public_id || '',
            title,
            description,
            duration: videoFile?.duration || 0,
            isPublished: false,
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
        const cleanUpPromises: Promise<unknown>[] = [];

        if (thumbnail?.public_id) {
            cleanUpPromises.push(deleteFromCloudinary(thumbnail?.public_id, 'image'));
        }

        if (videoFile?.public_id) {
            cleanUpPromises.push(deleteFromCloudinary(videoFile?.public_id, 'video'));
        }

        if (cleanUpPromises.length > 0) {
            await Promise.allSettled(cleanUpPromises);
        }

        if (error instanceof ApiError) {
            throw error;
        }

        const errorMessage = error instanceof Error ? error.message : 'Something went wrong while publishing the video';

        throw new ApiError(500, errorMessage);
    }
};




const getVideoById = async (req: Request, res: Response) => {
    const { videoId } = req.params as unknown as VideoParams;

    const updateTasks: Promise<any>[] = [
        Video.findByIdAndUpdate(
            videoId,
            {
                $inc: {
                    views: 1
                }
            }
        )
    ];

    if (req.user?._id) {
        updateTasks.push(
            User.findByIdAndUpdate(
                req.user._id,
                {
                    $addToSet: {
                        watchHistory: new mongoose.Types.ObjectId(videoId)
                    }
                }
            )
        );
    }

    await Promise.all(updateTasks);

    const currentUser = req.user?._id ? new mongoose.Types.ObjectId(req.user?._id) : null;

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

    if (!video || video.length === 0) {
        throw new ApiError(404, 'Video does not exist');
    }

    // console.log('Video[]: ', video);

    return res
    .status(200)
    .json(
        new ApiResponse(200, video[0], 'Video details fetched successfully')
    );
};




const updateVideo = async (req: Request<{}, {}, UpdateVideoReqBody>, res: Response) => {
    const { videoId } = req.params as unknown as VideoParams;

    const { title, description } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized request! You do not own this video');
    }

    const thumbnailLocalPath = req.file?.path;
    
    const oldThumbnailPublicId = video.thumbnailPublicId;

    let uploadedThumbnail;

    try {
        if (thumbnailLocalPath) {
            uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

            if (!uploadedThumbnail?.url) {
                throw new ApiError(500, 'Failed to upload thumbnail to Cloudinary');
            }
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title: title ?? video.title,
                    description: description ?? video.description,
                    thumbnail: uploadedThumbnail?.url || video.thumbnail,
                    thumbnailPublicId: uploadedThumbnail?.public_id || video.thumbnailPublicId
                }
            },
            {
                returnDocument: 'after'
            }
        );

        if (!updatedVideo) {
            throw new ApiError(500, 'Failed to update video details in database');
        }

        console.log('Updated video:', updateVideo);

        if (thumbnailLocalPath && oldThumbnailPublicId) {
            await deleteFromCloudinary(oldThumbnailPublicId, 'image');
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, 'Video updated successfully')
        );
    }
    catch (error) {
        if (uploadedThumbnail?.public_id) {
            await deleteFromCloudinary(uploadedThumbnail.public_id, 'image');
        }

        if (error instanceof ApiError) {
            throw error;
        }

        const errorMessage = error instanceof Error ? error.message : 'Something went wrong while updating the video';
        throw new ApiError(500, errorMessage);
    }
};




const deleteVideo = async (req: Request, res: Response) => {
    const { videoId } = req.params as unknown as VideoParams;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized request! You do not own this video');
    }

    await Promise.all([
        Video.findByIdAndDelete(videoId),
        User.updateMany(
            {
                watchHistory: videoId
            },
            {
                $pull: {
                    watchHistory: videoId
                }
            }
        ),
        Like.deleteMany({
            video: videoId
        }),
        Comment.deleteMany({
            video: videoId
        })
    ]);

    const cleanUpPromises: Promise<unknown>[] = [];

    if (video.videoFilePublicId) {
        cleanUpPromises.push(deleteFromCloudinary(video.videoFilePublicId, 'video'));
    }

    if (video.thumbnailPublicId) {
        cleanUpPromises.push(deleteFromCloudinary(video.thumbnailPublicId, 'image'));
    }

    if (cleanUpPromises.length > 0) {
        await Promise.allSettled(cleanUpPromises);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, 'Video deleted and watch history purged successfully')
    );
};




const getAllVideos = async (req: Request, res: Response) => {
    const { page = '1', limit = '10', searchQuery, sortBy = 'createdAt', sortType = 'desc', userId } = req.query as unknown as GetAllVideosQueryType;

    const pipeline: PipelineStage[] = [];

    if (searchQuery) {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        pipeline.push({
            $match: {
                $or: [
                    {
                        title: {
                            $regex: escapedQuery,
                            $options: 'i'
                        }
                    },
                    {
                        description: {
                            $regex: escapedQuery,
                            $options: 'i'
                        }
                    }
                ]
            }
        });
    }

    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    const isOwnerRequesting = Boolean(userId && req.user?._id.toString() === userId.toString());

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

    // console.log('Pipeline []: ', pipeline);
    const videoAggregate = Video.aggregate(pipeline);
    // console.log('Video aggregate: ', videoAggregate);

    const allVideos = await Video.aggregatePaginate(videoAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });
    // console.log('All videos after aggregate Paginate: ', allVideos);

    // if (!allVideos || allVideos.docs.length === 0) {
    //     return res
    //     .status(200)
    //     .json(
    //         new ApiResponse(200, {
    //             docs: [],
    //             totalDocs: 0,
    //             page: parseInt(page, 10),
    //             limit: parseInt(limit, 10),
    //             totalPages: 1,
    //             pagingCounter: 1,
    //             hasNextPage: false,
    //             hasPrevPage: false,
    //             prevPage: null,
    //             nextPage: null,
    //         }, 'No videos found matching your criteria')
    //     );
    // }

    return res
    .status(200)
    .json(
        new ApiResponse(200, allVideos, 'All videos fetched successfully')
    );
};




const togglePublishStatus = async (req: Request, res: Response) => {
    const { videoId } = req.params as unknown as VideoParams;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, 'Unauthorized request! You cannot change the status of this video');
    }

    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                videoId: video._id,
                isPublished: video.isPublished
            },
            `Video publish status: ${video.isPublished? 'Published' : 'Unpublished'}`
        )
    );
};



export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos,
    togglePublishStatus
}