import { ApiError } from '../utils/ApiError.ts'
import { User } from '../models/user.model.ts'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { Request, Response } from 'express'
import type { TokenResponse } from '../types/types.ts'
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../constants.ts'
import jwt from 'jsonwebtoken'
import conf from '../conf/conf.ts'
import mongoose, { type PipelineStage } from 'mongoose'
import type { ChannelProfileDataResponseObj, WatchHistoryVideoDataResponseObj } from '../types/aggregation.types.ts'
import { Video } from '../models/video.model.ts'
import { type RegisterReqBody, type LoginReqBody, type ChangeCurrentPasswordBody, type UpdateAccountDetailsBody, type RegisterFilesReqBody, type WatchHistoryQuery, type UserParams } from '../validators/auth.validator.ts'
import bcrypt from 'bcrypt'




const generateAccessAndRefreshTokens = async (userId: string): Promise<TokenResponse> => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User does not exist');
        }

        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefreshToken();
        
        user.refreshToken = await bcrypt.hash(refreshToken, conf.bcryptSaltRounds);
        await user?.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};
    }
    catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 'Something went wrong while generating access and refresh tokens.');
    }
};



const registerUser = async (req: Request<{}, {}, RegisterReqBody>, res: Response) => {
    const { firstName, lastName, email, username, password } = req.body;
    // console.log(firstName, lastName, email, username, password);
    
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    if (existingUser) {
        throw new ApiError(409, 'User with this email or username already exists');
    }
    
    const files = (req.files as unknown) as RegisterFilesReqBody;

    const avatarLocalPath = files.avatar[0].path;

    const coverImageLocalPath = files.coverImage?.[0]?.path;

    let avatar, coverImage;

    try {
        [avatar, coverImage] = await Promise.all([
            uploadOnCloudinary(avatarLocalPath),
            coverImageLocalPath ? uploadOnCloudinary(coverImageLocalPath) : Promise.resolve(null)
        ]);

        if (!avatar?.url) {
            throw new ApiError(400, 'Avatar upload failed to process');
        }

        const createUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            avatar: avatar?.url,
            avatarPublicId: avatar?.public_id,
            coverImage: coverImage?.url || '',
            coverImagePublicId: coverImage?.public_id,
            password
        });

        const createdUser = await User.findById(createUser?._id).select('-password -refreshToken');

        if (!createdUser) {
            throw new ApiError(500, 'Something went wrong while registering the user');
        }
        // console.log(createUser)

        return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, 'User registered successfully')
        );
    }
    catch (error: any) {
        const cleanUpPromises: Promise<unknown>[] = [];

        if (avatar?.public_id) {
            cleanUpPromises.push(deleteFromCloudinary(avatar.public_id, 'image'));
        }

        if (coverImage?.public_id) {
            cleanUpPromises.push(deleteFromCloudinary(coverImage.public_id, 'image'));
        }

        if (cleanUpPromises.length > 0) {
            await Promise.allSettled(cleanUpPromises);
        }

        if (error instanceof ApiError) throw error;

        const errorMessage = error instanceof Error ? error.message : 'Something went wrong while registering the user';

        throw new ApiError(500, errorMessage);
    }
};




const loginUser = async (req: Request<{}, {}, LoginReqBody>, res: Response) => {
    const { userIdentity, password } = req.body;
    // console.log(`User identifier: ${userIdentity}, Password ${password}`);

    const userExists = await User.findOne({
        $or: [
            {email: userIdentity},
            {username: userIdentity}
        ]
    });

    if (!userExists) {
        throw new ApiError(404, 'User does not exist');
    }

    const isPasswordValid = await userExists.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userExists?._id.toString());

    const loggedInUser = await User.findById(userExists?._id).select('-password -refreshToken');

    return res
    .status(200)
    .cookie('accessToken', accessToken, accessTokenCookieOptions)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken: accessToken,
                refreshToken
            },
            'User logged in successfully'
        )
    );
};




const logoutUser = async (req: Request, res: Response) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            returnDocument: 'after'
        }
    );

    return res
    .status(200)
    .clearCookie('accessToken', accessTokenCookieOptions)
    .clearCookie('refreshToken', refreshTokenCookieOptions)
    .json(
        new ApiResponse(200, {}, 'User logged out successfully')
    );
};




const refreshTheAccessToken = async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header('Authorization')?.replace('Bearer ', '').trim();
    // console.log('Incoming refresh token: ', incomingRefreshToken);
    
    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request');
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, conf.refreshTokenSecret) as jwt.JwtPayload;
        // console.log('Decoded token: ', decodedToken);
    
        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }
    
        const isRefreshTokenValid = await bcrypt.compare(incomingRefreshToken, user?.refreshToken || '');
        
        if (!isRefreshTokenValid) {
            throw new ApiError(401, 'Refresh token is expired or used');
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user?._id.toString());
    
        return res
        .status(200)
        .cookie('accessToken', accessToken, accessTokenCookieOptions)
        .cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                'Access token refreshed'
            )
        );
    }
    catch (error: any) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
};




const changeCurrentPassword = async (req: Request<{}, {}, ChangeCurrentPasswordBody>, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    // console.log(`Old password: ${oldPassword}  New password: ${newPassword}`);

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(400, 'User does not exist');
    }

    const isPasswordCorrect = await user?.isPasswordCorrect(oldPassword);
    // console.log('Is password correct: ', isPasswordCorrect.valueOf());

    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Invalid old password');
    }

    user.password = newPassword;
    // console.log('New password: ', user.password, newPassword);
    await user?.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, 'Password changed successfully')
    );
};




const getCurrentUser = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'validVideos'
            }
        },
        {
            $addFields: {
                watchHistory: '$validVideos._id'
            }
        },
        {
            $project: {
                validVideos: 0,
                password: 0,
                refreshToken: 0,
                __v: 0
            }
        }
    ]);

    if (!user || user.length === 0) {
        throw new ApiError(404, 'User does not exist');
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0], 'Current user fetched successfully')
    );
};




const updateAccountDetails = async (req: Request<{}, {}, UpdateAccountDetailsBody>, res: Response) => {
    const { firstName, lastName, email } = req.body;
    // console.log('Check email casing: ',email);

    // check if email is already taken by different user
    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(409, 'User with this email already exists');
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                firstName,
                lastName,
                email
            }
        },
        {
            returnDocument: 'after',
            // runValidators: true     // ensures schema rules (like minLength) are checked
        }
    ).select('-password -refreshToken');

    if (!updatedUser) {
        throw new ApiError(404, 'User does not exist');
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, 'Account details updated successfully')
    );
};




const updateUserAvatar = async (req: Request, res: Response) => {
    const avatarLocalPath = req.file?.path;

    if (!req.user?._id) {
        throw new ApiError(401, 'Unauthorized request');
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }

    const oldAvatarPublicId = user?.avatarPublicId;
    // console.log('Old avatar pub id: ', oldAvatarPublicId);

    let newAvatar;

    try {
        newAvatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
        // console.log('New Avatar: ', newAvatar);
        
        if (!newAvatar?.url) {
            throw new ApiError(500, 'Error while uploading avatar to cloudinary');
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: newAvatar.url,
                    avatarPublicId: newAvatar.public_id
                }
            },
            {
                returnDocument: 'after'
            }
        ).select('-password -refreshToken');

        if (!updatedUser) {
            throw new ApiError(500, 'Failed to update user avatar in database');
        }

        if (oldAvatarPublicId) {
            await deleteFromCloudinary(oldAvatarPublicId, 'image');
        }

        // console.log('Updated user: ', updatedUser);

        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, 'Avatar updated successfully')
        );
    }
    catch (error: any) {
        if (newAvatar?.public_id) {
            await deleteFromCloudinary(newAvatar.public_id, 'image');
        }

        if (error instanceof ApiError) throw error;

        const errorMessage = error instanceof Error ? error.message : 'Something went wrong while updating user avatar';
        throw new ApiError(500, errorMessage);
    }
};




const updateUserCoverImage = async (req: Request, res: Response) => {
    const coverImageLocalPath = req.file?.path;

    if (!req.user?._id) {
        throw new ApiError(401, 'Unauthorized request');
    }

    if (!coverImageLocalPath) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, 'No cover image file provided. Profile remains unchanged')
        );
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }
    
    const oldCoverImagePublicId = user?.coverImagePublicId;
    // console.log('Old cover pub id: ', oldCoverImagePublicId);

    let newCoverImage;

    try {
        newCoverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
        // console.log('coverimage: ', newCoverImage);
    
        if (!newCoverImage?.url) {
            throw new ApiError(500, 'Error while uploading cover image to cloudinary');
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: newCoverImage?.url,
                    coverImagePublicId: newCoverImage?.public_id
                }
            },
            {
                returnDocument: 'after'
            }
        ).select('-password -refreshToken');

        if (!updatedUser) {
            throw new ApiError(500, 'Failed to update user coverImage in database');
        }

        if (oldCoverImagePublicId) {
            await deleteFromCloudinary(oldCoverImagePublicId, 'image');
        }

        // console.log('updated user: ', updatedUser);
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, 'Cover image updated successfully')
        );
    }
    catch (error: any) {
        if (newCoverImage?.public_id) {
            await deleteFromCloudinary(newCoverImage.public_id, 'image');
        }

        if (error instanceof ApiError) throw error;

        const errorMessage = error instanceof Error ? error.message : 'Something went wrong while updating user cover image';
        throw new ApiError(500, errorMessage);
    }
};




const getUserChannelProfile = async (req: Request<UserParams>, res: Response) => {
    const { username } = req.params;

    const channel = await User.aggregate<ChannelProfileDataResponseObj>([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: '$subscribers'       // how many people follow THIS chanel
                },
                channelsSubscribedToCount: {
                    $size: '$subscribedTo'      // how many channel THIS channel follows
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [new mongoose.Types.ObjectId(req.user?._id), '$subscribers.subscriber']
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                firstName: 1,
                lastName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt: 1
            }
        }
    ]);

    if (!channel.length) {
        throw new ApiError(404, 'Channel does not exist');
    }

    // console.log('Channel: ', channel);

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], 'User channel fetched successfully')
    );
};




// const getWatchHistory = asyncHandler(async (req: Request, res: Response) => {

//     const user = await User.aggregate<{watchHistory: WatchHistoryVideoDataResponseObj}>([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(req.user?._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: 'videos',
//                 localField: 'watchHistory',
//                 foreignField: '_id',
//                 as: 'watchHistory',
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: 'users',
//                             localField: 'owner',
//                             foreignField: '_id',
//                             as: 'owner',
//                             pipeline: [
//                                 {
//                                     $project: {
//                                         firstName: 1,
//                                         lastName: 1,
//                                         username: 1,
//                                         avatar: 1
//                                     }
//                                 }
//                             ]
//                         }
//                     },
//                     {
//                         $addFields: {
//                             owner: {
//                                 $first: '$owner'
//                             }
//                         }
//                     }
//                 ]
//             }
//         }
//     ]);

//     if (!user.length) {
//         throw new ApiError(404, 'User does not exist');
//     }

//     // console.log('User with watch history: ', user[0]?.watchHistory);

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, user[0]?.watchHistory, 'Watch history fetched successfully')
//     );
// });




const getWatchHistory = async (req: Request<{}, {}, {}, WatchHistoryQuery>, res: Response) => {

    const { page = '1', limit = '10' } = req.query;

    const user = await User.findById(req.user?._id).select('watchHistory');

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }

    const historyIds = user.watchHistory || [];
    // console.log(historyIds);

    if (historyIds.length === 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, {
                docs: [],
                totalDocs: 0,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }, 'Watch history is currently empty')
        );
    }

    const pipeline: PipelineStage[] = [
        {
            $match: {
                _id: { $in: historyIds }
            }
        },
        {
            $addFields: {
                watchIndex: {
                    $indexOfArray: [historyIds, '$_id']
                }
            }
        },
        {
            $sort: {
                watchIndex: -1
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
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$owner'
        }
    ];

    const videoAggregate = Video.aggregate(pipeline);

    const paginatedWatchHistory = await Video.aggregatePaginate<WatchHistoryVideoDataResponseObj>(videoAggregate, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, paginatedWatchHistory, 'Watch history fetched successfully')
    );
};



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshTheAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}