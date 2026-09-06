import Room from "../models/Room.js";
import Participant from "../models/Participant.js";

/**
 * This @Map is our entires "database" for now - lives only in server @RAM
 * @Key: roomId (string) -> @Values : Room instance
 */

const rooms = new Map();

/**
 * This function gets called once per client @connection (from @app_js )
 * and sets up all @room_related event @listenser for that one @sockets
 */
function registerRoomHandler(io , socket){


      //fires when a client want to create or join a room 
      socket.on('join_room' , ({roomId , username}) => {
            let room = rooms.get(roomId);
            let role;


            if(!room){
                  //Room dosent exist yet - this socket become the room's creator /Host
                  room = new Room(roomId , socket.id);
                  rooms.set(roomId, room);
                  role= 'host';
            }else{
                  role = 'participant';
            }


            const participant = new Participant(socket.id , username , role);
            room.addParticipant(participant);

            /**
             * @Socket_IO own room mechanismr this socket and add it to the room
             * this is what makes io.to(roomId) .emit
             */
            socket.join(roomId)
            socket.data.roomId = roomId;

            socket.emit('sync_state' , room.state);//if someone comes late they will sync with the current flow of the room not from the beginning

            /**
             * broadcast @EVERYONE in the room (including the joiner)
             * @participant list - lets all UIs refresh who's in the room and their roles
             */ 

            room.broadcast(io,'user_joined',{
                  username,
                  userId:socket.id,
                  role,
                  participant:room.getParticipantsList
            } );
      });


      //Fires when a client explicitly leaves (clicks a "leave" button)
      socket.on("leave_room" , ({roomId})=>{
            handleLeave(io , socket, roomId);
      });

      /**
       * when client wants to close @fires automatically 
       * @navigates away -ly when a client closes tab / loses connection /
       * this is our safety net so rooms don't fill up wit "ghost" participants who never explicitly left 
       */
      socket.on('disconnect' , ()=>{
            const roomId = socket.data.roomId;
            if(roomId){
                  handleLeave(io , socket , roomId);
            }
      });
}

/**
 * @Shared logic Btw @leave_room and @disconnect - avoid duplicates
 * 
 */
function handleLeave(io , socket , roomId){
      const room = rooms.get(roomId);
      if(!room){
            return
 
      }

      room.addParticipant(socket.id);
      socket.leave(roomId);

      if(room.isEmpty()){
            //room empty = delete the room entirly
            room.delete(roomId);
      }else{
            //Some still there
            room.broadcast(io , 'user_left',{
                  /**let them know how @left_the_room */
                  username:socket.data.username,
                  userId:socket.id,
                  participants:room.getParticipantList()
            })
      }
}

export { registerRoomHandler , rooms};