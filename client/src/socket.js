import { io } from 'socket.io-client';

/**
 * Single shared Socket.IO connection for the entire app.
 * Dynamically resolves localhost or local network IP so devices on LAN can connect.
 */
const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : `http://${window.location.hostname}:3000`;

const socket = io(SERVER_URL);

socket.on('connect', () => {
  console.log('⚡️ Connected to WeTube Socket server:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ Socket connection error:', err.message);
});

export default socket;