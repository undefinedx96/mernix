import { asyncHandler } from '../utils/asyncHandler.ts'
import { ApiError } from '../utils/ApiError.ts'
import { User } from '../models/user.model.ts'
import { uploadOnCloudinary } from '../utils/cloudinary.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { Request, Response } from 'express'
import type { LoginReqBody, TokenResponse, UpdateAccountDetailsBody } from '../types/types.ts'
import { options } from '../constants.ts'
import jwt from 'jsonwebtoken'
import conf from '../conf/conf.ts'





const generateAccessAndRefreshTokens = async (userId: string): Promise<TokenResponse> => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User does not exist');
        }

        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user?.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};
    }
    catch (error) {
        throw new ApiError(500, 'Something went wrong while generating access and refresh tokens.');
    }
};



const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, username, password } = req.body;
    // console.log(firstName, lastName, email, username, password);
    
    if ([firstName, lastName, email, username, password].some(field => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }
    
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    if (existingUser) {
        throw new ApiError(409, 'User with this email or username already exists');
    }
    
    const files = req.files as {[fieldName: string]: Express.Multer.File[]};
    // console.log(files);

    const avatarLocalPath = files?.avatar?.[0]?.path;

    const coverImageLocalPath = files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, 'Avatar is required');
    }

    const createUser = await User.create({
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        username: username?.toLowerCase().trim(),
        email: email?.trim(),
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

    return res
    .status(201)
    .json(
        new ApiResponse(201, createdUser, 'User registered successfully')
    );
});




const loginUser = asyncHandler(async (req: Request<{}, {}, LoginReqBody>, res: Response) => {
    const { userIdentity, email, username, password } = req.body;

    // console.log(`User identifier: ${userIdentity}, Email: ${email}, Username: ${username}, Password ${password}`);

    const loginIdentifier = (userIdentity || email || username || '')?.trim();
    // console.log(`Login identifier: "${loginIdentifier}"`);

    // if (!userIdentifier && !username && !email) {}
    if (!loginIdentifier) {
        throw new ApiError(400, 'Username or email is required');
    }

    const userExists = await User.findOne({
        $or: [
            {email: loginIdentifier?.toLowerCase()?.trim()},
            {username: loginIdentifier?.toLowerCase()?.trim()}
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
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, {...options, maxAge: 7 * 24 * 60 * 60 * 1000})
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
            new: true
        }
    );

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
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
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used');
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user?._id.toString());
    
        return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', newRefreshToken, {...options, maxAge: 7 * 24 * 60 * 60 * 1000})
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




const changeCurrentPassword = asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    // console.log('Old password', oldPassword);

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
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, 'Current user fetched successfully')
    );
});




const updateAccountDetails = asyncHandler(async (req: Request<{}, {}, UpdateAccountDetailsBody>, res: Response) => {
    const { firstName, lastName, email } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
        throw new ApiError(400, 'All fields are required and cannot be empty');
    }

    // check if email is already taken by different user
    const existingUser = await User.findOne({ email: email?.toLowerCase() });

    if (existingUser && existingUser?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(409, 'User with this email already exists');
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                email: email?.trim().toLowerCase()
            }
        },
        {
            new: true,
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


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshTheAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
}