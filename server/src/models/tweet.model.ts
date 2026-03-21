import mongoose, { Document, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface ITweet extends Document {
    owner: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITweetPopulated extends Omit<ITweet, 'owner'> {
    owner: {
        _id: mongoose.Types.ObjectId;
        username: string;
        avatar: string;
        firstName: string;
        lastName: string;
    };
    likesCount?: number;
    isLiked?: boolean;
}

const tweetSchema = new Schema<ITweet>(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            trim: true,
            maxlength: [280, 'Tweet cannot exceed 280 characters']
        }
    },
    {
        timestamps: true
    }
);

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model<ITweet, mongoose.AggregatePaginateModel<ITweet>>('Tweet', tweetSchema);