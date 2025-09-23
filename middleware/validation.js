import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

export const validateRegistration = [
    body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .custom(async (username) => {
            const user = await User.findOne({ username });
            if (user) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .custom(async (email) => {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export const validateMeetingCreation = [
    body('title')
        .isLength({ min: 3, max: 100 })
        .withMessage('Meeting title must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('password')
        .optional()
        .isLength({ min: 4, max: 20 })
        .withMessage('Meeting password must be between 4 and 20 characters'),
    
    body('settings.maxParticipants')
        .optional()
        .isInt({ min: 2, max: 100 })
        .withMessage('Max participants must be between 2 and 100'),
];

export const validateJoinMeeting = [
    body('meetingId')
        .notEmpty()
        .withMessage('Meeting ID is required'),
    
    body('participant.name')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('participant.email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};