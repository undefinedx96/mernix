import mongoose, { Document, Schema, type AggregatePaginateModel } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

export interface IVideo extends Document {
    videoFile: string;
    videoFilePublicId: string;
    thumbnail: string;
    thumbnailPublicId: string;
    title: string;
    description: string;
    duration: number;
    views: number;
    isPublished: boolean;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
    {
        videoFile: {
            type: String,
            required: true
        },
        videoFilePublicId: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        thumbnailPublicId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model<IVideo, AggregatePaginateModel<IVideo>>('Video', videoSchema);