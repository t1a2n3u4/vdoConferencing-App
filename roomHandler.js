import Rooms from '../models/room.js';
import User from '../models/user.js';
import { ObjectId } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
const roomId = uuidv4();

const rooms = new Map(); // In-memory storage (or use MongoDB)

// server/socket/roomHandler.js
const roomHandler = (io, socket) => {
  console.log('🟢 roomHandler initialized');

  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    console.log(`✅ ${socket.id} created & joined room: ${roomId}`);
    io.to(roomId).emit('room-created', { roomId });
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 ${socket.id} joined room: ${roomId}`);
    io.to(roomId).emit('user-joined', { socketId: socket.id });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`🚪 ${socket.id} left room: ${roomId}`);
    io.to(roomId).emit('user-left', { socketId: socket.id });
  });
};

export default roomHandler;
