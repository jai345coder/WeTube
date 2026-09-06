import { io } from 'socket.io-client';

/**
 * Single shared Socket.IO connection for the entire app.
 * Connects to VITE_SERVER_URL in production (Vercel -> Render)
 * with graceful fallback to localhost for local development.
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('⚡️ Connected to WeTube Socket server:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ Socket connection error:', err.message);
});

export default socket;