import { Request, Response, NextFunction } from 'express';
import { Submission } from '../models/Submission';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class SubmissionController {
    static async createSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const submission = await Submission.create(req.body);
            logger.info('New submission created', { id: submission._id });
            res.status(201).json({
                status: 'success',
                data: { id: submission._id },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const submission = await Submission.findById(req.params.id);
            if (!submission) {
                throw new AppError(404, 'Submission not found');
            }
            res.json({
                status: 'success',
                data: submission,
            });
        } catch (error) {
            next(error);
        }
    }
} 