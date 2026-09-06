/**
 * Represent one user's membership INside a single room - not a global user account  
 * A person joiing two diffrenent rooms would get two separate Participant objects 
 */

class Participant {
      constructor(socketId, username, role = 'participant') {
            this.socketId = socketId;/**Links this @participant to their live @WebSockets connections */
            this.username = username;/**
 * display @name shown in the room @particpants_list
 */
            this.role = role;/**
@role : host , moderator , 'particants - control 
 */
      }




      /**
       * Used tp @gate playback control event @( play/pause/seek/chnage_video).
       * @Both host and @moderate are allowed to control per the @assignment spec
       */

      canControlPlayback(){
            return this.role == 'host' || this.role === 'moderator';
      }

      /**
       * @Used to gate @host_only actions ()
       */
      isHost(){
            return this.role === 'host';
      }

      /**
       * Called when host promotes/demotes someone via assign_role event
       */
      setRole(newRole){
            this.role = newRole;
      }
}

export default Participant;