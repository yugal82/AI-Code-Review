import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiRateLimiter } from './middleware/rateLimiter';
import submissionRoutes from './routes/submissions';
import reviewRoutes from './routes/review';
import refactorRoutes from './routes/refactor';
import setModelRoutes from './routes/setModel';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(apiRateLimiter);

// Routes
app.get('/', async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the Code Review API',
    });
})
app.use('/api/submissions', submissionRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/refactor', refactorRoutes);
app.use('/api/set-model', setModelRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 