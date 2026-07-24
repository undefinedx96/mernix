import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt, { type Secret } from 'jsonwebtoken'
import conf from '../conf/conf.ts'

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    avatar: string;
    avatarPublicId?: string;
    coverImage?: string;
    coverImagePublicId?: string;
    watchHistory: mongoose.Types.ObjectId[];
    password: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            index: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
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

userSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, conf.bcryptSaltRounds);
});

userSchema.methods.isPasswordCorrect = async function (this: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function (this: IUser): string {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName
        },
        conf.accessTokenSecret as Secret,
        {
            expiresIn: conf.accessTokenExpiry as any
        }
    )
}

userSchema.methods.generateRefreshToken = function (this: IUser): string {
    return jwt.sign(
        {
            _id: this._id
        },
        conf.refreshTokenSecret as Secret,
        {
            expiresIn: conf.refreshTokenExpiry as any
        }
    )
}

export const User = mongoose.model<IUser>('User', userSchema);




// NOTES:
// .pre() method is used to define middleware functions (hooks) that run before a specific operation is executed.
// These hooks are defined at the schema level and allow to insert custom logic for tasks such as data validation, modification, or logging.