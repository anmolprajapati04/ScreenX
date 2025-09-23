import express from 'express';
import { 
    createMeeting, 
    joinMeeting, 
    getMeeting, 
    endMeeting 
} from '../controllers/meetingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create a new meeting (requires authentication)
router.post('/create', authenticate, createMeeting);

// Join an existing meeting (authentication optional)
router.post('/join', optionalAuth, joinMeeting);

// Get meeting details
router.get('/:meetingId', optionalAuth, getMeeting);

// End a meeting (requires authentication - must be meeting host)
router.post('/:meetingId/end', authenticate, endMeeting);

export default router;