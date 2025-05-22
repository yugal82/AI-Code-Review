import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Maximum requests per window

export const apiRateLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: MAX_REQUESTS,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.',
    },
    handler: (req, res, next, options) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
        });
        res.status(429).json(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 