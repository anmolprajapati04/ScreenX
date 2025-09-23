import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RecordingService {
    constructor() {
        this.recordings = new Map();
        this.recordingDir = path.join(__dirname, '../../recordings');
        
        // Ensure recordings directory exists
        if (!fs.existsSync(this.recordingDir)) {
            fs.mkdirSync(this.recordingDir, { recursive: true });
        }
    }

    startRecording(meetingId, participants = []) {
        return new Promise((resolve, reject) => {
            const fileName = `recording-${meetingId}-${Date.now()}.webm`;
            const filePath = path.join(this.recordingDir, fileName);
            
            // For a real implementation, you would use ffmpeg or similar
            // This is a simplified version
            const recordingData = {
                meetingId,
                fileName,
                filePath,
                startTime: new Date(),
                participants,
                isRecording: true
            };
            
            this.recordings.set(meetingId, recordingData);
            
            // Simulate recording process
            console.log(`Recording started for meeting ${meetingId}`);
            
            resolve(recordingData);
        });
    }

    stopRecording(meetingId) {
        return new Promise((resolve, reject) => {
            const recording = this.recordings.get(meetingId);
            
            if (!recording) {
                reject(new Error('No recording found for this meeting'));
                return;
            }
            
            recording.isRecording = false;
            recording.endTime = new Date();
            recording.duration = Math.floor((recording.endTime - recording.startTime) / 1000);
            
            // Simulate file processing
            setTimeout(() => {
                this.recordings.delete(meetingId);
                
                console.log(`Recording stopped for meeting ${meetingId}`);
                console.log(`Duration: ${recording.duration} seconds`);
                
                resolve(recording);
            }, 1000);
        });
    }

    getRecordingStatus(meetingId) {
        return this.recordings.get(meetingId);
    }

    getAllRecordings() {
        return Array.from(this.recordings.values());
    }

    // Utility method to generate recording metadata
    generateMetadata(recording) {
        return {
            id: recording.meetingId,
            fileName: recording.fileName,
            filePath: recording.filePath,
            duration: recording.duration,
            startTime: recording.startTime,
            endTime: recording.endTime,
            participants: recording.participants,
            fileSize: this.getFileSize(recording.filePath)
        };
    }

    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // Clean up old recordings
    cleanupOldRecordings(maxAgeHours = 24) {
        const now = new Date();
        const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
        
        for (const [meetingId, recording] of this.recordings.entries()) {
            if (now - recording.startTime > maxAge) {
                this.recordings.delete(meetingId);
                console.log(`Cleaned up recording for meeting ${meetingId}`);
            }
        }
    }
}

export default new RecordingService();