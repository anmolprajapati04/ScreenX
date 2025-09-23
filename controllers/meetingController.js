import Meeting from '../models/Meeting.js';
import { v4 as uuidv4 } from 'uuid';

export const createMeeting = async (req, res) => {
    try {
        const { title, description, password, settings } = req.body;
        
        const meeting = new Meeting({
            meetingId: uuidv4(),
            title,
            description,
            password,
            settings: {
                ...settings,
                maxParticipants: settings?.maxParticipants || 20
            },
            host: req.userId,
            status: 'active'
        });

        await meeting.save();
        
        res.status(201).json({
            success: true,
            meeting: {
                id: meeting.meetingId,
                title: meeting.title,
                password: meeting.password,
                settings: meeting.settings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating meeting',
            error: error.message
        });
    }
};

export const joinMeeting = async (req, res) => {
    try {
        const { meetingId, password, participant } = req.body;
        
        const meeting = await Meeting.findOne({ meetingId })
            .populate('host', 'username email avatar');
        
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        if (meeting.password && meeting.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid meeting password'
            });
        }

        if (meeting.participants.length >= meeting.settings.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Meeting is full'
            });
        }

        // Add participant to meeting
        const participantData = {
            name: participant.name,
            email: participant.email,
            role: 'participant',
            joinedAt: new Date()
        };

        meeting.participants.push(participantData);
        await meeting.save();

        res.json({
            success: true,
            meeting: {
                id: meeting.meetingId,
                title: meeting.title,
                host: meeting.host,
                settings: meeting.settings,
                participants: meeting.participants
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error joining meeting',
            error: error.message
        });
    }
};

export const getMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId })
            .populate('host', 'username email avatar')
            .populate('participants.userId', 'username email avatar');
        
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.json({
            success: true,
            meeting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting',
            error: error.message
        });
    }
};

export const endMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId });
        
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        if (meeting.host.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only host can end the meeting'
            });
        }

        meeting.status = 'ended';
        meeting.endTime = new Date();
        await meeting.save();

        res.json({
            success: true,
            message: 'Meeting ended successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error ending meeting',
            error: error.message
        });
    }
};