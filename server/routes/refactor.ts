import { Router } from 'express';
import { generateRefactor, getRefactor } from '../controllers/RefactorController';
import { refactorRequestSchema } from '../schemas/validation';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// router.post('/:id', validateRequest(refactorRequestSchema), generateRefactor);
router.post('/:id', generateRefactor);

router.get('/:id', getRefactor);

export default router; 