import Participant from "../models/Participant.js";
import { rooms } from "./roomHandlers.js";

/**
 * @registerAssignRoleHandler reqgisters one @assign_role for one socket connection
 */
function registerAssignRoleHandler(io , socket){
      socket.on('assign_role' , ({userId , role})=>{
            const room = rooms.get(socket.data.roomId);
            if(!room){
                  return ;
            }

            const requester = room.getParticipant(socket.id);

            /**only the @HOST is allowed to assign role - reject */
            if(!requester || !requester.isHost()){
                  socket.emit('error', { message: 'Only the host can assign roles' });
      return;
            }

            const target = room.getParticipant(userId);
            if(!target){
              socket.emit('error', { message: 'Participant not found' });
      return;     
            }

            target.setRole(role);//alreeay defined on participant class
            //broadcast the role assigned to the room
            room.broadcast(io , 'role_assigned',{
                  userId,
                  username:target.username,
                  role,
                  Participant:room.getParticipantsList()

            });
      });
}

export {registerAssignRoleHandler};