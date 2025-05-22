import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { submissionSchema } from '../schemas/validation';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/', validateRequest(submissionSchema), SubmissionController.createSubmission);
router.get('/:id', SubmissionController.getSubmission);

export default router; 