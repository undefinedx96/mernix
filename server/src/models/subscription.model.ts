import mongoose, { Document, model, Schema } from 'mongoose'

export interface ISubscription extends Document {
    channel: mongoose.Types.ObjectId;
    subscriber: mongoose.Types.ObjectId;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        channel: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }
    },
    {
        timestamps: true
    }
);

// unique compound index prevents a user from subscribing twice to the same channel. this is a safety net at the database level.
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);