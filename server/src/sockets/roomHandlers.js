import Room from "../models/Room.js";
import Participant from "../models/Participant.js";

/**
 * This Map is our entire "database" for now - lives only in server RAM
 * Key: roomId (string) -> Values: Room instance
 */
const rooms = new Map();

/**
 * This function gets called once per client connection (from app.js)
 * and sets up all room-related event listeners for that one socket
 */
function registerRoomHandler(io, socket) {
  // fires when a client wants to create or join a room
  socket.on('join_room', ({ roomId, username }) => {
    let room = rooms.get(roomId);
    let role;

    if (!room) {
      // Room doesn't exist yet - this socket becomes the room's creator / Host
      room = new Room(roomId, socket.id);
      rooms.set(roomId, room);
      role = 'host';
    } else {
      role = 'participant';
    }

    const participant = new Participant(socket.id, username, role);
    room.addParticipant(participant);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    // Send initial synced state to the joiner
    socket.emit('sync_state', room.state);

    /**
     * Broadcast to EVERYONE in the room (including the joiner)
     * updated participants list so all UIs refresh who's in the room and their roles
     */
    room.broadcast(io, 'user_joined', {
      username,
      userId: socket.id,
      role,
      participants: room.getParticipantList(),
    });
  });

  // Fires when a client explicitly leaves (clicks a "leave" button)
  socket.on('leave_room', ({ roomId }) => {
    handleLeave(io, socket, roomId);
  });

  /**
   * Fires automatically when a client closes tab / loses connection / navigates away
   */
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      handleLeave(io, socket, roomId);
    }
  });
}

/**
 * Shared logic between leave_room and disconnect
 */
function handleLeave(io, socket, roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    return;
  }

  room.removeParticipant(socket.id);
  socket.leave(roomId);

  if (room.isEmpty()) {
    // Room empty = delete the room entirely
    rooms.delete(roomId);
  } else {
    // Other participants still in the room
    room.broadcast(io, 'user_left', {
      username: socket.data.username,
      userId: socket.id,
      participants: room.getParticipantList(),
    });
  }
}

export { registerRoomHandler, rooms };