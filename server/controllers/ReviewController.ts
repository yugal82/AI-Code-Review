import { Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { Review } from '../models/Review';
import { logger } from '../utils/logger';
import { aiFactory } from '../utils/aiFactory';

export const generateReview = async (req: Request, res: Response) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if review already exists
        let review = await Review.findOne({ submissionId: submission._id });
        if (review) {
            return res.json(review);
        }

        // Generate review using AI
        const analysis = await aiFactory.analyzeCode(submission.code);

        // Double-check if review was created while waiting for AI/cache
        review = await Review.findOne({ submissionId: submission._id });
        if (review) {
            return res.json(review);
        }

        // Create and save review
        review = new Review({
            submissionId: submission._id,
            categories: analysis
        });
        await review.save();

        res.json(review);
    } catch (error) {
        logger.error('Error generating review:', error);
        res.status(500).json({ message: 'Error generating review' });
    }
};

export const getReview = async (req: Request, res: Response) => {
    try {
        const review = await Review.findOne({ submission: req.params.id });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        logger.error('Error fetching review:', error);
        res.status(500).json({ message: 'Error fetching review' });
    }
};