import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [[true, 'Email is required']],
            unique: true,
            lowercase: true,
            trim: true
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: [true, 'Avatar is required']
        },
        avatarPublicId: {
            type: String
        },
        coverImage: {
            type: String
        },
        coverImagePublicId: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model('User', userSchema);