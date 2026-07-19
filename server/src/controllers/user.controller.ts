import { asyncHandler } from '../utils/asyncHandler.ts'
import { ApiError } from '../utils/ApiError.ts'
import { User } from '../models/user.model.ts'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { Request, Response } from 'express'
import type { GetAllVideosQueryType, TokenResponse, UserParams } from '../types/types.ts'
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../constants.ts'
import jwt from 'jsonwebtoken'
import conf from '../conf/conf.ts'
import mongoose, { type PipelineStage } from 'mongoose'
import type { ChannelProfileDataResponseObj, WatchHistoryVideoDataResponseObj } from '../types/aggregation.types.ts'
import { Video } from '../models/video.model.ts'
import { registerFileSchema, type RegisterFilesReqBody, type RegisterReqBody, type LoginReqBody, loginUserSchema, registerUserSchema, type ChangeCurrentPasswordBody, changeCurrentPasswordSchema, type UpdateAccountDetailsBody, updateAccountDetailsSchema } from '../validators/auth.validator.ts'
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
        throw new ApiError(500, 'Something went wrong while generating access and refresh tokens.');
    }
};



const registerUser = asyncHandler(async (req: Request<{}, {}, RegisterReqBody>, res: Response) => {
    const validateData = registerUserSchema.parse(req.body);

    const { firstName, lastName, email, username, password } = validateData;
    // console.log(firstName, lastName, email, username, password);
    
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    if (existingUser) {
        throw new ApiError(409, 'User with this email or username already exists');
    }
    
    // const files = req.files as {[fieldName: string]: Express.Multer.File[]};
    const files: RegisterFilesReqBody = registerFileSchema.parse(req.files);
    // console.log(files);

    const avatarLocalPath = files?.avatar?.[0]?.path;

    const coverImageLocalPath = files?.coverImage?.[0]?.path;

    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
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
});




const loginUser = asyncHandler(async (req: Request<{}, {}, LoginReqBody>, res: Response) => {
    const validateData = loginUserSchema.parse(req.body);
    
    const { userIdentity, password } = validateData;
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
});




const logoutUser = asyncHandler(async (req: Request, res: Response) => {
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
});




const refreshTheAccessToken = asyncHandler(async (req: Request, res: Response) => {
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
});




const changeCurrentPassword = asyncHandler(async (req: Request<{}, {}, ChangeCurrentPasswordBody>, res: Response) => {
    const validateData = changeCurrentPasswordSchema.parse(req.body);

    const { oldPassword, newPassword } = validateData;
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
});




const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
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
});




const updateAccountDetails = asyncHandler(async (req: Request<{}, {}, UpdateAccountDetailsBody>, res: Response) => {
    const validateData = updateAccountDetailsSchema.parse(req.body);

    const { firstName, lastName, email } = validateData;
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
});




const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is missing');
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }

    const oldAvatarPublicId = user?.avatarPublicId;
    // console.log('Old avatar pub id: ', oldAvatarPublicId);

    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    // console.log('Avatar: ', avatar);

    if (!avatar?.url) {
        throw new ApiError(500, 'Error while uploading avatar to cloudinary');
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
                avatarPublicId: avatar.public_id
            }
        },
        {
            returnDocument: 'after'
        }
    ).select('-password -refreshToken');

    if (oldAvatarPublicId) {
        await deleteFromCloudinary(oldAvatarPublicId);
    }

    // console.log('Updated user: ', updatedUser);

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, 'Avatar updated successfully')
    );
});




const updateUserCoverImage = asyncHandler(async (req: Request, res: Response) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'Cover image file is missing');
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }

    const oldCoverImagePublicId = user?.coverImagePublicId;
    // console.log('Old cover pub id: ', oldCoverImagePublicId);

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    // console.log('coverimage: ', coverImage);

    if (!coverImage?.url) {
        throw new ApiResponse(500, 'Error while uploading cover image to cloudinary');
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage?.url,
                coverImagePublicId: coverImage?.public_id
            }
        },
        {
            returnDocument: 'after'
        }
    ).select('-password -refreshToken');

    
    if (oldCoverImagePublicId) {
        await deleteFromCloudinary(oldCoverImagePublicId);
    }

    // console.log('updated user: ', updatedUser);
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, 'Cover image updated successfully')
    );
});




const getUserChannelProfile = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params as UserParams;

    if (!username?.trim()) {
        throw new ApiError(400, 'Username is missing');
    }

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
});




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




const getWatchHistory = asyncHandler(async (req: Request<{}, {}, {}, GetAllVideosQueryType>, res: Response) => {

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
});



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