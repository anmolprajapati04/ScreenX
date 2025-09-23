import Recording from '../models/Recording.js';
import Meeting from '../models/Meeting.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startRecording = async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Check if user is host or co-host
        const participant = meeting.participants.find(p => 
            p.userId && p.userId.toString() === req.userId
        );
        
        if (!participant || !['host', 'co-host'].includes(participant.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only host or co-host can start recording'
            });
        }

        if (meeting.recording.isRecording) {
            return res.status(400).json({
                success: false,
                message: 'Recording is already in progress'
            });
        }

        meeting.recording.isRecording = true;
        meeting.recording.startTime = new Date();
        await meeting.save();

        // Notify all participants via socket
        req.io.to(meetingId).emit('recording-started', {
            startedBy: req.user.username,
            startTime: meeting.recording.startTime
        });

        res.json({
            success: true,
            message: 'Recording started successfully',
            recording: {
                isRecording: true,
                startTime: meeting.recording.startTime
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting recording',
            error: error.message
        });
    }
};

export const stopRecording = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { duration } = req.body;
        
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        if (!meeting.recording.isRecording) {
            return res.status(400).json({
                success: false,
                message: 'No recording in progress'
            });
        }

        // Create recording record
        const recording = new Recording({
            meetingId: meeting._id,
            fileName: `recording-${meetingId}-${Date.now()}.webm`,
            filePath: `/recordings/recording-${meetingId}-${Date.now()}.webm`,
            duration: duration || Math.floor((new Date() - meeting.recording.startTime) / 1000),
            fileSize: 0, // Would be calculated from actual file
            participants: meeting.participants.map(p => ({
                userId: p.userId,
                name: p.name
            })),
            createdBy: req.userId
        });

        await recording.save();

        // Update meeting recording status
        meeting.recording.isRecording = false;
        meeting.recording.recordings.push({
            fileName: recording.fileName,
            filePath: recording.filePath,
            duration: recording.duration,
            createdAt: new Date()
        });
        await meeting.save();

        // Notify all participants
        req.io.to(meetingId).emit('recording-stopped', {
            stoppedBy: req.user.username,
            recordingId: recording._id,
            duration: recording.duration
        });

        res.json({
            success: true,
            message: 'Recording stopped successfully',
            recording: {
                id: recording._id,
                fileName: recording.fileName,
                duration: recording.duration,
                createdAt: recording.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error stopping recording',
            error: error.message
        });
    }
};

export const getRecordings = async (req, res) => {
    try {
        const recordings = await Recording.find({ createdBy: req.userId })
            .populate('meetingId', 'title meetingId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            recordings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recordings',
            error: error.message
        });
    }
};

export const deleteRecording = async (req, res) => {
    try {
        const { recordingId } = req.params;
        
        const recording = await Recording.findById(recordingId);
        if (!recording) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found'
            });
        }

        if (recording.createdBy.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own recordings'
            });
        }

        // Delete file from storage (implementation depends on storage solution)
        // fs.unlinkSync(path.join(__dirname, '../public', recording.filePath));
        
        await Recording.findByIdAndDelete(recordingId);

        res.json({
            success: true,
            message: 'Recording deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting recording',
            error: error.message
        });
    }
};