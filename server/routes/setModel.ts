import { Router } from 'express';
import { aiFactory } from '../utils/aiFactory';

const router = Router();

router.post('/', (req, res) => {
    const { model } = req.body;
    if (model !== 'openai' && model !== 'llama') {
        return res.status(400).json({ message: 'Invalid model' });
    }
    aiFactory.setModel(model);
    res.json({ status: 'success', model });
});

export default router; 