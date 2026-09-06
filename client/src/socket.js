import { io } from 'socket.io-client';

/**
 * Single shared Socket.IO connection for the entire app.
 * Dynamically resolves localhost or local network IP so devices on LAN can connect.
 */
// Uses VITE_SERVER_URL in production (set on Render), 
// falls back to localhost for local development
const socket = io(import.meta.env.VITEURL|| 'http://localhost:3000');


// const socket = io(SERVER_URL);

socket.on('connect', () => {
  console.log('⚡️ Connected to WeTube Socket server:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ Socket connection error:', err.message);
});

export default socket;