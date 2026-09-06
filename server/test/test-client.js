import { io as ioClient } from 'socket.io-client';

// Client 1 - will become Host
const host = ioClient('http://localhost:3000');

host.on('connect', () => {
  console.log(`[HOST] connected: ${host.id}`);
  host.emit('join_room', { roomId: 'test123', username: 'HostUser' });
});

host.on('sync_state', (state) => console.log('[HOST] sync_state:', state));
host.on('user_joined', (data) => console.log('[HOST] user_joined:', data));

// Client 2 - joins same room, should become Participant
setTimeout(() => {
  const guest = ioClient('http://localhost:3000');

  guest.on('connect', () => {
    console.log(`[GUEST] connected: ${guest.id}`);
    guest.emit('join_room', { roomId: 'test123', username: 'GuestUser' });

    // Try an unauthorized action after joining
    setTimeout(() => {
      console.log('[GUEST] attempting play (should be rejected)...');
      guest.emit('play');
    }, 1000);
  });

  guest.on('sync_state', (state) => console.log('[GUEST] sync_state:', state));
  guest.on('user_joined', (data) => console.log('[GUEST] user_joined:', data));
  guest.on('error', (err) => console.log('[GUEST] ❌ error received:', err.message));

}, 1000);