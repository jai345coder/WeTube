import { rooms } from "./roomHandlers.js";

/**
 * registerAssignRoleHandler registers assign_role listener for one socket connection.
 * Only the room's Host can promote or demote other participants.
 */
function registerAssignRoleHandler(io, socket) {
  socket.on('assign_role', ({ userId, role }) => {
    const validRoles = ['host', 'moderator', 'participant'];
    if (!validRoles.includes(role)) {
      socket.emit('error', { message: 'Invalid role specified' });
      return;
    }

    const room = rooms.get(socket.data.roomId);
    if (!room) {
      return;
    }

    const requester = room.getParticipant(socket.id);

    // Enforce that only the host can assign roles
    if (!requester || !requester.isHost()) {
      socket.emit('error', { message: 'Only the room host can assign roles' });
      return;
    }

    const target = room.getParticipant(userId);
    if (!target) {
      socket.emit('error', { message: 'Participant not found in this room' });
      return;
    }

    // Set target role
    target.setRole(role);

    // If host is transferring ownership to another participant
    if (role === 'host') {
      requester.setRole('moderator');
      room.hostId = target.socketId;
    }

    // Broadcast the updated roles and participant list to everyone in the room
    room.broadcast(io, 'role_assigned', {
      userId: target.socketId,
      username: target.username,
      role: target.role,
      participants: room.getParticipantList(),
    });
  });
}

export { registerAssignRoleHandler };