import Participant from "../models/Participant.js";
import { rooms } from "./roomHandlers.js";

function registerRemoveParticipantHandler(io , socket){
      socket.on('remove_participant', ({userId}) => {
            const room = rooms.get(socket.data.roomId);
            if(!room) return;



            const requester = room.getParticipant(socket.io);
             if (!requester || !requester.isHost()) {
      socket.emit('error', { message: 'Only the host can remove participants' });
      return;
    }

    room.removeParticipant(userId);
    /**  
     * @Find the actual socket instance of the removed user not just their @id
     *   so we can @force them to leave the @Socket_IO room and notify them directly.
     */

    const targetSocket = io.socket.sockets.get();
    if(targetSocket){
      targetSocket.leave(room.id);
      targetSocket.emit('participant_removed' , {userId, participants:room.getParticipantsList()});
    }

    room.removeParticipant(userId);

    
    /** @Notify everyone else remaining in the room */
    room.broadcast(io,'participant_removed',{
      userId,
      participants:room.getParticipantsList()
    });
});
}

export {registerRemoveParticipantHandler} ;