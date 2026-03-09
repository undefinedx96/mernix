import mongoose, { Document, Schema, type AggregatePaginateModel } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface ILike extends Document {
    comment: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    likedBy: mongoose.Types.ObjectId;
    tweet: mongoose.Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    },
    {
        timestamps: true
    }
);

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model<ILike, AggregatePaginateModel<ILike>>('Like', likeSchema);