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
    let room = rooms.get(roomId);
    let role;

    if (!room) {
      // First person to join automatically creates the room and becomes the Host
      room = new Room(roomId, socket.id);
      rooms.set(roomId, room);
      role = 'host';
    } else {
      // Any subsequent joiner enters as a standard participant
      role = 'participant';
    }

    const participant = new Participant(socket.id, username, role);
    room.addParticipant(participant);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    // Send the current room state (video ID, time, play status) to the joiner
    socket.emit('sync_state', room.state);

    // Broadcast updated participants and roles to everyone in the room
    room.broadcast(io, 'user_joined', {
      username,
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
  const room = rooms.get(roomId);
  if (!room) {
    return;
  }

  room.removeParticipant(socket.id);
  socket.leave(roomId);

  if (room.isEmpty()) {
    // Clean up empty room from memory
    rooms.delete(roomId);
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