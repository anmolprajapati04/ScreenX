import express from 'express';
import authRoutes from './authRoutes.js';
import meetingRoutes from './meetingRoutes.js';

const router = express.Router();

// API status endpoint
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'ScreenX API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/meetings', meetingRoutes);

export default router;