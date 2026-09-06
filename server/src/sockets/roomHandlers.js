import Room from "../models/Room.js";
import Participant from "../models/Participant.js";

/**
 * In-memory room storage
 * Key: roomId (string) -> Values: Room instance
 */
const rooms = new Map();

/**
 * Registers room event listeners for a client socket connection
 */
function registerRoomHandler(io, socket) {
  // Client creates or joins a room
  socket.on('join_room', ({ roomId, username }) => {
    const normalizedRoomId = String(roomId || '').trim().toUpperCase();
    const cleanUsername = String(username || '').trim();

    if (!normalizedRoomId || !cleanUsername) {
      socket.emit('error', { message: 'Room ID and username are required' });
      return;
    }

    let room = rooms.get(normalizedRoomId);
    let role;

    if (!room) {
      // First person to join automatically creates the room and becomes the Host
      room = new Room(normalizedRoomId, socket.id);
      rooms.set(normalizedRoomId, room);
      role = 'host';
    } else {
      // Check if this socket or user is already the host or already in the room
      const existing = room.getParticipant(socket.id);
      if (existing) {
        role = existing.role;
      } else if (room.hostId === socket.id || room.participants.size === 0) {
        room.hostId = socket.id;
        role = 'host';
      } else {
        role = 'participant';
      }
    }

    const participant = new Participant(socket.id, cleanUsername, role);
    room.addParticipant(participant);

    socket.join(normalizedRoomId);
    socket.data.roomId = normalizedRoomId;
    socket.data.username = cleanUsername;

    // Send the current room state (video ID, time, play status) to the joiner
    socket.emit('sync_state', room.state);

    // Broadcast updated participants and roles to everyone in the room
    room.broadcast(io, 'user_joined', {
      username: cleanUsername,
      userId: socket.id,
      role,
      participants: room.getParticipantList(),
    });
  });

  // Client clicks "Leave" button
  socket.on('leave_room', ({ roomId }) => {
    handleLeave(io, socket, roomId);
  });

  // Client closes window / disconnects
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      handleLeave(io, socket, roomId);
    }
  });
}

/**
 * Handles leaving and host transfer
 */
function handleLeave(io, socket, roomId) {
  const normalizedRoomId = String(roomId || socket.data.roomId || '').trim().toUpperCase();
  const room = rooms.get(normalizedRoomId);
  if (!room) {
    return;
  }

  room.removeParticipant(socket.id);
  socket.leave(normalizedRoomId);

  if (room.isEmpty()) {
    // Clean up empty room from memory
    rooms.delete(normalizedRoomId);
  } else {
    // If the leaving user was the host, automatically pass host role to the next participant
    if (socket.id === room.hostId) {
      const remaining = Array.from(room.participants.values());
      if (remaining.length > 0) {
        remaining[0].setRole('host');
        room.hostId = remaining[0].socketId;
      }
    }

    // Broadcast updated participant roster to all remaining members
    room.broadcast(io, 'user_left', {
      username: socket.data.username,
      userId: socket.id,
      participants: room.getParticipantList(),
    });
  }
}

export { registerRoomHandler, rooms };