import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { registerRoomHandler } from './sockets/roomHandlers.js';
import { registerAssignRoleHandler } from './sockets/assign_role.js';
import { registerRemoveParticipantHandler } from './sockets/remove_participant.js';
import { registerPlaybackHandlers } from './sockets/playbackHandlers.js';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;
const allowedOrigins = CLIENT_URL
  ? [CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint (for Render ping & uptime monitoring)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'WeTube backend is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

/**
 * Wrap Express inside a raw Node HTTP server for Socket.IO
 */
const server = http.createServer(app);

/**
 * Creating Socket.IO server with CORS and supported transports
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

/**
 * Connection event handler
 */
io.on('connection', (socket) => {
  console.log(`⚡️ New Client connected: ${socket.id}`);
  registerRoomHandler(io, socket);
  registerAssignRoleHandler(io, socket);
  registerRemoveParticipantHandler(io, socket);
  registerPlaybackHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

export default server;