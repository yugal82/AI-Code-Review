import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
    code: string;
    filename?: string;
    createdAt: Date;
    updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
    {
        code: {
            type: String,
            required: true,
        },
        filename: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema); 