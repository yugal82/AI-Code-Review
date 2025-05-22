import { Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { Refactor } from '../models/Refactor';
import { logger } from '../utils/logger';
import { aiFactory } from '../utils/aiFactory';

export const generateRefactor = async (req: Request, res: Response) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if refactor already exists
        let refactor = await Refactor.findOne({ submissionId: submission._id });
        if (refactor) {
            return res.json(refactor);
        }

        // Generate refactored code using AI
        const result = await aiFactory.refactorCode(submission.code);
        console.log("Result in Refactor Controller: ", result);
        // Create and save refactor
        refactor = new Refactor({
            submissionId: submission._id,
            original: result.original,
            refactored: result.refactored,
            improvements: result.improvements
        });
        await refactor.save();

        res.json(refactor);
    } catch (error) {
        logger.error('Error generating refactor:', error);
        res.status(500).json({ message: 'Error generating refactor' });
    }
};

export const getRefactor = async (req: Request, res: Response) => {
    try {
        const refactor = await Refactor.findOne({ submission: req.params.id });
        if (!refactor) {
            return res.status(404).json({ message: 'Refactor not found' });
        }
        res.json(refactor);
    } catch (error) {
        logger.error('Error fetching refactor:', error);
        res.status(500).json({ message: 'Error fetching refactor' });
    }
}; 