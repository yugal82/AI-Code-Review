import mongoose, { Document, Schema } from 'mongoose';

export interface IRefactor extends Document {
    submissionId: mongoose.Types.ObjectId;
    original: string;
    refactored: string;
    improvements: string[];
    createdAt: Date;
    updatedAt: Date;
}

const refactorSchema = new Schema<IRefactor>(
    {
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
            required: true,
        },
        original: {
            type: String,
            required: true,
        },
        refactored: {
            type: String,
            required: true,
        },
        improvements: {
            type: [String],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Refactor = mongoose.model<IRefactor>('Refactor', refactorSchema); 