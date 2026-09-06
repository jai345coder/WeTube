import { rooms } from "./roomHandlers.js";

/**
 * registerAssignRoleHandler registers assign_role listener for one socket connection
 */
function registerAssignRoleHandler(io, socket) {
  socket.on('assign_role', ({ userId, role }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) {
      return;
    }

    const requester = room.getParticipant(socket.id);
    const target = room.getParticipant(userId || socket.id);

    if (!target) {
      socket.emit('error', { message: 'Participant not found' });
      return;
    }

    // Allow switching role (self-switch or host-assigned switch)
    target.setRole(role);

    // If target becomes host, update room.hostId
    if (role === 'host') {
      room.hostId = target.socketId;
    }

    // Broadcast the updated role and participant list to the room
    room.broadcast(io, 'role_assigned', {
      userId: target.socketId,
      username: target.username,
      role,
      participants: room.getParticipantList(),
    });
  });
}

export { registerAssignRoleHandler };