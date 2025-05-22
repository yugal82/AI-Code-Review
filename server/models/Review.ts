import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    submissionId: mongoose.Types.ObjectId;
    categories: {
        style: string[];
        performance: string[];
        security: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
            required: true,
        },
        categories: {
            style: [String],
            performance: [String],
            security: [String],
        },
    },
    {
        timestamps: true,
    }
);

export const Review = mongoose.model<IReview>('Review', reviewSchema); 