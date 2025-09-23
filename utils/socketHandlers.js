// import Meeting from "../models/Meeting.js";
// export const getMeetingParticipants = (meetingId) => {
//   const meeting = activeMeetings.get(meetingId);
//   return meeting ? Array.from(meeting.values()) : [];
// };

// export const setupSocketHandlers = (io) => {
//   // Store active meetings and their participants
//   const activeMeetings = new Map();

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // Join meeting room
//     socket.on("join-meeting", async (data) => {
//       const { meetingId, user } = data;

//       try {
//         console.log(`User ${user.name} joining meeting ${meetingId}`);

//         // Join the socket room
//         socket.join(meetingId);

//         // Initialize meeting in active meetings if not exists
//         if (!activeMeetings.has(meetingId)) {
//           activeMeetings.set(meetingId, new Map());
//         }

//         const meetingParticipants = activeMeetings.get(meetingId);

//         // Add participant to meeting
//         const participantData = {
//           socketId: socket.id,
//           name: user.name,
//           email: user.email,
//           joinedAt: new Date(),
//           isScreenSharing: false,
//         };

//         meetingParticipants.set(socket.id, participantData);

//         // Get all participants in this meeting
//         const participants = Array.from(meetingParticipants.values());

//         // Notify the new user about existing participants
//         socket.emit("meeting-participants", {
//           participants: participants,
//           meetingId: meetingId,
//         });

//         // Notify others about the new participant (excluding the new user)
//         socket.to(meetingId).emit("user-joined", {
//           user: participantData,
//           participants: participants,
//         });

//         console.log(
//           `User ${user.name} joined meeting ${meetingId}. Total participants: ${participants.length}`
//         );
//       } catch (error) {
//         console.error("Error joining meeting:", error);
//         socket.emit("join-error", { message: "Failed to join meeting" });
//       }
//     });

//     // Handle screen share events
//     socket.on("start-screen-share", (data) => {
//       const { meetingId, user } = data;
//       console.log(
//         `User ${user.name} started screen sharing in meeting ${meetingId}`
//       );

//       // Update participant's screen share status
//       const meetingParticipants = activeMeetings.get(meetingId);
//       if (meetingParticipants && meetingParticipants.has(socket.id)) {
//         meetingParticipants.get(socket.id).isScreenSharing = true;
//       }

//       // Notify all participants in the meeting
//       socket.to(meetingId).emit("screen-share-started", {
//         user: user,
//         socketId: socket.id,
//       });
//     });

//     socket.on("stop-screen-share", (data) => {
//       const { meetingId, user } = data;
//       console.log(
//         `User ${user.name} stopped screen sharing in meeting ${meetingId}`
//       );

//       // Update participant's screen share status
//       const meetingParticipants = activeMeetings.get(meetingId);
//       if (meetingParticipants && meetingParticipants.has(socket.id)) {
//         meetingParticipants.get(socket.id).isScreenSharing = false;
//       }

//       // Notify all participants in the meeting
//       socket.to(meetingId).emit("screen-share-stopped", {
//         user: user,
//         socketId: socket.id,
//       });
//     });

//     // Handle chat messages
//     socket.on("send-message", (data) => {
//       const { meetingId, message, user } = data;
//       console.log(
//         `Chat message from ${user.name} in meeting ${meetingId}: ${message}`
//       );

//       // Broadcast message to all participants in the meeting
//       io.to(meetingId).emit("new-message", {
//         user: user,
//         message: message,
//         timestamp: new Date(),
//       });
//     });

//     // Handle hand raise
//     socket.on("raise-hand", (data) => {
//       const { meetingId, user } = data;
//       console.log(`User ${user.name} raised hand in meeting ${meetingId}`);

//       // Broadcast hand raise to all participants
//       socket.to(meetingId).emit("hand-raised", {
//         user: user,
//         socketId: socket.id,
//       });
//     });

//     // Handle recording
//     socket.on("toggle-recording", (data) => {
//       const { meetingId, user } = data;
//       console.log(
//         `User ${user.name} toggled recording in meeting ${meetingId}`
//       );

//       // Broadcast recording status change
//       socket.to(meetingId).emit("recording-toggled", {
//         user: user,
//         socketId: socket.id,
//       });
//     });

//     // Handle WebRTC signaling (for future video/audio streaming)
//     socket.on("webrtc-offer", (data) => {
//       socket.to(data.target).emit("webrtc-offer", {
//         offer: data.offer,
//         from: socket.id,
//       });
//     });

//     socket.on("webrtc-answer", (data) => {
//       socket.to(data.target).emit("webrtc-answer", {
//         answer: data.answer,
//         from: socket.id,
//       });
//     });

//     socket.on("webrtc-ice-candidate", (data) => {
//       socket.to(data.target).emit("webrtc-ice-candidate", {
//         candidate: data.candidate,
//         from: socket.id,
//       });
//     });

//     // Handle disconnect
//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);

//       // Remove participant from all meetings
//       for (const [meetingId, participants] of activeMeetings.entries()) {
//         if (participants.has(socket.id)) {
//           const participant = participants.get(socket.id);
//           participants.delete(socket.id);

//           console.log(`User ${participant.name} left meeting ${meetingId}`);

//           // ✅ Fix: Send the full participant object, not just the name
//           socket.to(meetingId).emit("user-left", {
//             user: participant, // Send the full object
//             socketId: socket.id,
//             participants: Array.from(participants.values()),
//           });

//           // Remove meeting if empty
//           if (participants.size === 0) {
//             activeMeetings.delete(meetingId);
//             console.log(`Meeting ${meetingId} ended (no participants)`);
//           }
//         }
//       }
//     });

//     // Handle manual leave meeting
//     socket.on("leave-meeting", (data) => {
//       const { meetingId } = data;
//       console.log(`User manually leaving meeting ${meetingId}`);

//       const meetingParticipants = activeMeetings.get(meetingId);
//       if (meetingParticipants && meetingParticipants.has(socket.id)) {
//         const participant = meetingParticipants.get(socket.id);
//         meetingParticipants.delete(socket.id);

//         // ✅ Fix: Send the full participant object, not just the name
//         socket.to(meetingId).emit("user-left", {
//           user: participant, // Send the full object
//           socketId: socket.id,
//           participants: Array.from(meetingParticipants.values()),
//         });

//         // Leave the socket room
//         socket.leave(meetingId);

//         console.log(`User ${participant.name} left meeting ${meetingId}`);
//       }
//     });
//   });
// };




import Meeting from '../models/Meeting.js';
export const getMeetingParticipants = (meetingId) => {
        const meeting = activeMeetings.get(meetingId);
        return meeting ? Array.from(meeting.values()) : [];
    };
export const setupSocketHandlers = (io) => {
    // Store active meetings and their participants
    const activeMeetings = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join meeting room
        socket.on('join-meeting', async (data) => {
            const { meetingId, user } = data;
            
            try {
                console.log(`User ${user.name} joining meeting ${meetingId}`);
                
                // Join the socket room
                socket.join(meetingId);
                
                // Initialize meeting in active meetings if not exists
                if (!activeMeetings.has(meetingId)) {
                    activeMeetings.set(meetingId, new Map());
                }
                
                const meetingParticipants = activeMeetings.get(meetingId);
                
                // Add participant to meeting
                const participantData = {
                    socketId: socket.id,
                    name: user.name,
                    email: user.email,
                    joinedAt: new Date(),
                    isScreenSharing: false
                };
                
                meetingParticipants.set(socket.id, participantData);
                
                // Get all participants in this meeting
                const participants = Array.from(meetingParticipants.values());
                
                // Notify the new user about existing participants
                socket.emit('meeting-participants', {
                    participants: participants,
                    meetingId: meetingId
                });
                
                // Notify others about the new participant (excluding the new user)
                socket.to(meetingId).emit('user-joined', {
                    user: participantData,
                    participants: participants
                });
                
                console.log(`User ${user.name} joined meeting ${meetingId}. Total participants: ${participants.length}`);
                
            } catch (error) {
                console.error('Error joining meeting:', error);
                socket.emit('join-error', { message: 'Failed to join meeting' });
            }
        });

        // Handle screen share events
        socket.on('start-screen-share', (data) => {
            const { meetingId, user } = data;
            console.log(`User ${user.name} started screen sharing in meeting ${meetingId}`);
            
            // Update participant's screen share status
            const meetingParticipants = activeMeetings.get(meetingId);
            if (meetingParticipants && meetingParticipants.has(socket.id)) {
                meetingParticipants.get(socket.id).isScreenSharing = true;
            }
            
            // Notify all participants in the meeting
            socket.to(meetingId).emit('screen-share-started', {
                user: user,
                socketId: socket.id
            });
        });

        socket.on('stop-screen-share', (data) => {
            const { meetingId, user } = data;
            console.log(`User ${user.name} stopped screen sharing in meeting ${meetingId}`);
            
            // Update participant's screen share status
            const meetingParticipants = activeMeetings.get(meetingId);
            if (meetingParticipants && meetingParticipants.has(socket.id)) {
                meetingParticipants.get(socket.id).isScreenSharing = false;
            }
            
            // Notify all participants in the meeting
            socket.to(meetingId).emit('screen-share-stopped', {
                user: user,
                socketId: socket.id
            });
        });

        // Handle chat messages
        socket.on('send-message', (data) => {
            const { meetingId, message, user } = data;
            console.log(`Chat message from ${user.name} in meeting ${meetingId}: ${message}`);
            
            // Broadcast message to all participants in the meeting
            io.to(meetingId).emit('new-message', {
                user: user,
                message: message,
                timestamp: new Date()
            });
        });

        // Handle hand raise
        socket.on('raise-hand', (data) => {
            const { meetingId, user } = data;
            console.log(`User ${user.name} raised hand in meeting ${meetingId}`);
            
            // Broadcast hand raise to all participants
            socket.to(meetingId).emit('hand-raised', {
                user: user,
                socketId: socket.id
            });
        });

        // Handle recording
        socket.on('toggle-recording', (data) => {
            const { meetingId, user } = data;
            console.log(`User ${user.name} toggled recording in meeting ${meetingId}`);
            
            // Broadcast recording status change
            socket.to(meetingId).emit('recording-toggled', {
                user: user,
                socketId: socket.id
            });
        });

        // Handle WebRTC signaling (for future video/audio streaming)
        socket.on('webrtc-offer', (data) => {
            socket.to(data.target).emit('webrtc-offer', {
                offer: data.offer,
                from: socket.id
            });
        });

        socket.on('webrtc-answer', (data) => {
            socket.to(data.target).emit('webrtc-answer', {
                answer: data.answer,
                from: socket.id
            });
        });

        socket.on('webrtc-ice-candidate', (data) => {
            socket.to(data.target).emit('webrtc-ice-candidate', {
                candidate: data.candidate,
                from: socket.id
            });
        });

        // Handle disconnect - CORRECTED VERSION
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            
            // Remove participant from all meetings
            for (const [meetingId, participants] of activeMeetings.entries()) {
                if (participants.has(socket.id)) {
                    const participant = participants.get(socket.id);
                    participants.delete(socket.id);
                    
                    console.log(`User ${participant.name} left meeting ${meetingId}`);
                    
                    // ✅ CORRECTED: Send the full participant object
                    socket.to(meetingId).emit('user-left', {
                        user: participant,  // Full object instead of just participant.name
                        socketId: socket.id,
                        participants: Array.from(participants.values())
                    });
                    
                    // Remove meeting if empty
                    if (participants.size === 0) {
                        activeMeetings.delete(meetingId);
                        console.log(`Meeting ${meetingId} ended (no participants)`);
                    }
                }
            }
        });

        // Handle manual leave meeting - CORRECTED VERSION
        socket.on('leave-meeting', (data) => {
            const { meetingId } = data;
            console.log(`User manually leaving meeting ${meetingId}`);
            
            const meetingParticipants = activeMeetings.get(meetingId);
            if (meetingParticipants && meetingParticipants.has(socket.id)) {
                const participant = meetingParticipants.get(socket.id);
                meetingParticipants.delete(socket.id);
                
                // ✅ CORRECTED: Send the full participant object
                socket.to(meetingId).emit('user-left', {
                    user: participant,  // Full object instead of just participant.name
                    socketId: socket.id,
                    participants: Array.from(meetingParticipants.values())
                });
                
                // Leave the socket room
                socket.leave(meetingId);
                
                console.log(`User ${participant.name} left meeting ${meetingId}`);
            }
        });
    });

    // Utility function to get meeting participants
    // export const getMeetingParticipants = (meetingId) => {
    //     const meeting = activeMeetings.get(meetingId);
    //     return meeting ? Array.from(meeting.values()) : [];
    // };
};