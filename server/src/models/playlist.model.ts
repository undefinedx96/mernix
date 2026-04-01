import mongoose, { Document, Schema, type AggregatePaginateModel } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IPlaylist extends Document {
    name: string;
    description: string;
    videos: mongoose.Types.ObjectId[];
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>(
    {
        name: {
            type: String,
            required: [true, 'Playlist name is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Playlist description is required'],
            trim: true
        },
        videos: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Video'
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }
    },
    {
        timestamps: true
    }
);

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model<IPlaylist, AggregatePaginateModel<IPlaylist>>('Playlist', playlistSchema);