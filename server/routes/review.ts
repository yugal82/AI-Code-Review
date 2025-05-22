import { Router } from 'express';
import { generateReview, getReview } from '../controllers/ReviewController';
import { reviewRequestSchema } from '../schemas/validation';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// router.post('/:id', validateRequest(reviewRequestSchema), generateReview);
router.post('/:id', generateReview);
router.get('/:id', getReview);

export default router; 