import mongoose, { Document, model, Schema } from 'mongoose'

export interface ISubscription extends Document {
    channel: mongoose.Types.ObjectId;
    subscriber: mongoose.Types.ObjectId;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        channel: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);