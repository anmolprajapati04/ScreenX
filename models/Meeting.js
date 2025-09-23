import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    socketId: String,
    name: String,
    email: String,
    joinedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: Date,
    role: {
        type: String,
        enum: ['host', 'co-host', 'participant'],
        default: 'participant'
    },
    isAudioMuted: {
        type: Boolean,
        default: false
    },
    isVideoOff: {
        type: Boolean,
        default: false
    },
    handRaised: {
        type: Boolean,
        default: false
    }
});

const meetingSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    password: String,
    settings: {
        allowJoinBeforeHost: {
            type: Boolean,
            default: false
        },
        muteOnEntry: {
            type: Boolean,
            default: false
        },
        enableChat: {
            type: Boolean,
            default: true
        },
        enableRecording: {
            type: Boolean,
            default: true
        },
        maxParticipants: {
            type: Number,
            default: 20
        }
    },
    participants: [participantSchema],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    status: {
        type: String,
        enum: ['scheduled', 'active', 'ended'],
        default: 'active'
    },
    recording: {
        isRecording: {
            type: Boolean,
            default: false
        },
        startTime: Date,
        recordings: [{
            fileName: String,
            filePath: String,
            duration: Number,
            createdAt: Date
        }]
    }
}, {
    timestamps: true
});

meetingSchema.index({ meetingId: 1 });
meetingSchema.index({ host: 1 });
meetingSchema.index({ status: 1 });

export default mongoose.model('Meeting', meetingSchema);