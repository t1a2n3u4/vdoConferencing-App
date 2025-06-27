// server/index.js
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import pkg from 'agora-access-token';

import roomHandler from './socket/roomHandler.js';

dotenv.config();
const { RtmTokenBuilder, RtmRole } = pkg;

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('✅ Video conferencing server running'));

// === MongoDB Connect ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// === Agora RTM Token Route ===
app.post('/api/get-rtm-token', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const token = RtmTokenBuilder.buildToken(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    userId,
    RtmRole.Rtm_User,
    Math.floor(Date.now() / 1000) + 3600
  );

  res.json({ token });
});

// === Agora App ID Route ===
app.get('/api/agora/app-id', (req, res) => {
  const appId = process.env.AGORA_APP_ID;
  if (appId) {
    res.json({ appId });
  } else {
    res.status(500).json({ error: 'Agora App ID not found' });
  }
});

// === Socket.IO Setup ===
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', socket => {
  console.log('⚡ Client connected:', socket.id);

  // WebRTC Events
  socket.on('offer', offer => socket.broadcast.emit('offer', offer));
  socket.on('answer', answer => socket.broadcast.emit('answer', answer));
  socket.on('ice-candidate', candidate => socket.broadcast.emit('ice-candidate', candidate));

  // Chat Events
  socket.on('chat-message', ({ roomId, userId, text }) => {
    io.to(`chat-${roomId}`).emit('chat-message', { userId, text });
  });

  socket.on('join-chat', ({ roomId }) => socket.join(`chat-${roomId}`));
  socket.on('leave-chat', ({ roomId }) => socket.leave(`chat-${roomId}`));

  // Room Handling
  roomHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 6001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
