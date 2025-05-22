import { z } from 'zod';

export const submissionSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    filename: z.string().optional(),
});

export const reviewRequestSchema = z.object({
    submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid submission ID'),
});

export const refactorRequestSchema = z.object({
    submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid submission ID'),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
export type RefactorRequest = z.infer<typeof refactorRequestSchema>; 