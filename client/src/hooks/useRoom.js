import { useState, useEffect, useCallback } from 'react';
import socket from '../socket';

/**
 * Hook is the single source of truth for everything happening inside
 * a room - who is in it, video state, and actions the current user can take.
 * RoomShowcasePage calls this and passes the result down to UI components.
 */
function useRoom(roomId, username) {
  const [participants, setParticipants] = useState([]);
  const [videoState, setVideoState] = useState({
    videoId: null,
    playState: 'paused',
    currentTime: 0,
  });

  const [errorMessage, setErrorMessage] = useState(null);

  /**
   * Derive "my role" by finding in the participants list using socket.id
   */
  const myParticipant = Array.isArray(participants)
    ? participants.find((p) => p.userId === socket.id)
    : null;
  const myRole = myParticipant?.role || 'participant';

  useEffect(() => {
    const onSyncState = (state) => {
      if (state) {
        setVideoState(state);
      }
    };

    const onUserJoined = (data) => {
      if (Array.isArray(data?.participants)) {
        setParticipants(data.participants);
      }
    };

    const onUserLeft = (data) => {
      if (Array.isArray(data?.participants)) {
        setParticipants(data.participants);
      }
    };

    const onRoleAssigned = (data) => {
      if (Array.isArray(data?.participants)) {
        setParticipants(data.participants);
      }
    };

    const onParticipantRemoved = (data) => {
      if (Array.isArray(data?.participants)) {
        setParticipants(data.participants);
      }
    };

    const onError = (err) => {
      setErrorMessage(err?.message || 'An unexpected error occurred');
      setTimeout(() => setErrorMessage(null), 5000);
    };

    const emitJoin = () => {
      if (roomId && username) {
        const cleanRoom = String(roomId).trim().toUpperCase();
        const cleanUser = String(username).trim();
        socket.emit('join_room', { roomId: cleanRoom, username: cleanUser });
      }
    };

    socket.on('sync_state', onSyncState);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('role_assigned', onRoleAssigned);
    socket.on('participant_removed', onParticipantRemoved);
    socket.on('error', onError);
    socket.on('connect', emitJoin);

    // If socket is already connected, emit immediately
    if (socket.connected) {
      emitJoin();
    }

    return () => {
      socket.off('sync_state', onSyncState);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('role_assigned', onRoleAssigned);
      socket.off('participant_removed', onParticipantRemoved);
      socket.off('error', onError);
      socket.off('connect', emitJoin);
    };
  }, [roomId, username]);

  /**
   * Action functions passed to PlaybackControls & Sidebar as props
   */
  const play = useCallback(() => socket.emit('play'), []);
  const pause = useCallback(() => socket.emit('pause'), []);
  const seek = useCallback((time) => socket.emit('seek', { time }), []);
  const changeVideo = useCallback((videoId) => socket.emit('change_video', { videoId }), []);
  const assignRole = useCallback((userId, role) => socket.emit('assign_role', { userId, role }), []);
  const removeParticipant = useCallback((userId) => socket.emit('remove_participant', { userId }), []);

  return {
    participants,
    videoState,
    myRole,
    errorMessage,
    play,
    pause,
    seek,
    changeVideo,
    assignRole,
    removeParticipant,
  };
}

export default useRoom;