import { rooms } from "./roomHandlers.js";

function registerRemoveParticipantHandler(io, socket) {
  socket.on('remove_participant', ({ userId }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;

    const requester = room.getParticipant(socket.id);
    if (!requester || !requester.isHost()) {
      socket.emit('error', { message: 'Only the host can remove participants' });
      return;
    }

    room.removeParticipant(userId);

    // Find the target socket instance to force leave the room
    const targetSocket = io.sockets.sockets.get(userId);
    if (targetSocket) {
      targetSocket.leave(room.id);
      targetSocket.emit('participant_removed', {
        userId,
        participants: room.getParticipantList(),
      });
    }

    // Notify everyone remaining in the room
    room.broadcast(io, 'participant_removed', {
      userId,
      participants: room.getParticipantList(),
    });
  });
}

export { registerRemoveParticipantHandler };