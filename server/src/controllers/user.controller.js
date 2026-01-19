import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'




const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    // console.log(fullName, email, username, password);
    // console.log(req.files);

    if ([fullName, email, username, password].some(field => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, 'User with this email or username already exists');
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, 'Avatar is required');
    }

    const createUser = await User.create({
        fullName: fullName?.trim(),
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


export {
    registerUser,
}