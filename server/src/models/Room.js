/**
 * @Represent one watch @party . Holds who's in it and the current video state.
 * @This is our "database" for now - @lives only in server memory
 */

class Room{
      constructor(roomId , hostSocketId){
            this.id = roomId;
            this.hostId = hostSocketId;
      

      /**
       * @Map instead of array - lets us look up a @participant by @socketId in O(1)
       * instead of looping through an array every time (join/leave/role-change all need this)
       * 
       */
      this.participants = new Map() //socketId -> Participant 

      this.state = {
      videoId: null,
      playState:'paused',
      currentTime:0
      };
}


/**
 * Called when a new @sockets joins this room
 */
addParticipant(particant){
      this.participants.set(particant.socketId , particant);
}

/**
 * Called on Leave_room or disconnect
 */
removeParticipant(socketId){
      this.participants.delete(socketId);
}

/**
 * Ouick lookup - used everywhere we need to check "who is this sockets"
 */

getParticipant(socketId){
return this.participants.get(socketId)
}

/**
 * Return a plain array (not a Map) - needed because @Socket_ID cnat;t send
 * a @Map directly over the wire as @JSON only plain objects /array
 */
getParticipantList(){
      return Array.from(this.participants.values()).map(p => ({
            userId:p.socketId,
            username:p.username,
            role:p.role
      }));
}

/**
 * 
 * @returns a plain is now empty - used to @decidewhether to delete the room 
 * from the server-s Map @sentirly (avoid memory leak from @abandoned rooms)
 */
isEmpty(){
      return this.participants.size === 0;
}


/**
 * @Central place to the send an event to @EVERYONE currently in this @room
 * 'io' is @passed in because the Room class itself @dosenthold doesnt hold a @refernce
 */
broadcast(io , event , data){
      io.to(this.id).emit(event, data);
}

}

export default Room;