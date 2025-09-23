import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    fileSize: Number,
    format: {
        type: String,
        default: 'webm'
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    privacy: {
        type: String,
        enum: ['public', 'private', 'shared'],
        default: 'private'
    }
}, {
    timestamps: true
});

export default mongoose.model('Recording', recordingSchema);