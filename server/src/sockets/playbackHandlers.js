import {rooms} from './roomHandlers.js'

function registerPlaybackHandlers(io, socket){

      /**
       * @Small_shared_helper - every one of the 4 events below needs the same
       * @find room find @requester check @permission_logic , so we avoid 
       * @repeatting it 4 times by @centralizing it here
       */
      function getAuthorizedRoom(socket){
            const room = rooms.get(socket.data.roomId);
            if(!room) return null;

            const requester = room.getParticipant(socket.id);
            if(!requester || !requester.canControlPlayback()){
                  socket.emit('error', { message: 'You do not have permission to control playback' });
      return null;  
            }

            return room;
      }



      socket.on('play',()=>{
            const room = getAuthorizedRoom(socket);
            if(!room) return;

            room.state.playState = 'playing';
            room.broadcast(io,'sync_state', room.state);
      });

      socket.on('pause' , ()=>{
            const room = getAuthorizedRoom(socket);
            if(!room) return;
            room.state.playState = 'paused';
    room.broadcast(io, 'sync_state', room.state);
      });

      socket.on('seek', ({ time }) => {
    const room = getAuthorizedRoom(socket);
    if (!room) return;

    room.state.currentTime = time;
    room.broadcast(io, 'sync_state', room.state);
  });


  socket.on('change_video',({videoId})=>{
      const room = getAuthorizedRoom(socket);
      if(!room) return;

      room.state.videoId = videoId;
       room.state.currentTime = 0;      // new video starts from the beginning
    room.state.playState = 'paused'; // don't auto-play - let host press play explicitly
    room.broadcast(io, 'sync_state', room.state);
  })
}

export {registerPlaybackHandlers};