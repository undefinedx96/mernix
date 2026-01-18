import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import conf from '../conf/conf.js'

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

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        conf.accessTokenSecret,
        {
            expiresIn: conf.accessTokenExpiry
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        conf.refreshTokenSecret,
        {
            expiresIn: conf.refreshTokenExpiry
        }
    )
}

export const User = mongoose.model('User', userSchema);




// NOTES:
// .pre() method is used to define middleware functions (hooks) that run before a specific operation is executed.
// These hooks are defined at the schema level and allow to insert custom logic for tasks such as data validation, modification, or logging.