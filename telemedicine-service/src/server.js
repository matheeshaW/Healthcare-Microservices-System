const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

const telemedicineRoutes = require('./routes/telemedicineRoutes');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5006;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'telemedicine-service' });
});

app.use('/api/telemedicine', telemedicineRoutes);

// ==========================================
// 📡 SOCKET.IO SIGNALING SERVER 
// ==========================================
io.on('connection', (socket) => {
  console.log(`🔌 New user connected: ${socket.id}`);

  // 1. User joins the consultation room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
    
    // Alert others in the room that a new person joined
    socket.broadcast.to(roomId).emit('user-connected', userId);
  });

  // 2. WebRTC Signaling Data Handlers
  socket.on('offer', (payload) => {
    socket.broadcast.to(payload.roomId).emit('offer', payload.offer);
  });

  socket.on('answer', (payload) => {
    socket.broadcast.to(payload.roomId).emit('answer', payload.answer);
  });

  socket.on('ice-candidate', (payload) => {
    socket.broadcast.to(payload.roomId).emit('ice-candidate', payload.candidate);
  });
  socket.on('send-chat-message', (payload) => {
    // Forward the message to everyone else in the room
    socket.broadcast.to(payload.roomId).emit('receive-chat-message', payload);
  });
  socket.on('camera-toggle', (payload) => {
    socket.broadcast.to(payload.roomId).emit('camera-toggle', payload.isVideoOff);
  });

  // 3. Handle Disconnects
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});
// ==========================================

// Start Server 
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Telemedicine Service');

        server.listen(PORT, () => {
            console.log(`🚀 Telemedicine API & Signaling Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start Telemedicine Service:', err);
        process.exit(1); 
    }
}

startServer();