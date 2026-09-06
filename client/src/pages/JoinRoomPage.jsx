import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomUI from '../components/JoinRoomUI';
import ThemeToggle from '../components/ThemeToggle';
import socket from '../socket';

const SAMPLE_ROOM_CODES = [
  'CHILL-LOFI-402',
  'SYNTH-WAVE-911',
  'ANIME-NIGHT-204',
  'GAMING-SQUAD-77',
  'CODING-STREAM-55',
];

const JoinRoomPage = ({
  theme,
  onToggleTheme,
  username: parentUsername = '',
  setUsername: setParentUsername,
  roomId: parentRoomId = '',
  setRoomId: setParentRoomId,
}) => {
  const navigate = useNavigate();
  const [username, setLocalUsername] = useState(parentUsername || 'CyberDrifter');
  const [roomCode, setLocalRoomCode] = useState(parentRoomId || 'CHILL-LOFI-402');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = (val) => {
    setLocalUsername(val);
    if (setParentUsername) setParentUsername(val);
  };

  const handleRoomCodeChange = (val) => {
    setLocalRoomCode(val);
    if (setParentRoomId) setParentRoomId(val);
  };

  const handleGenerateRoom = () => {
    const randomCode = SAMPLE_ROOM_CODES[Math.floor(Math.random() * SAMPLE_ROOM_CODES.length)] || `ROOM-${Math.floor(100 + Math.random() * 900)}`;
    handleRoomCodeChange(randomCode);
    setError('');
  };

  const handleJoin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanUser = (username || '').trim();
    const cleanRoom = (roomCode || '').trim().toUpperCase();

    if (!cleanUser) {
      setError('Please enter a display name.');
      return;
    }
    if (!cleanRoom) {
      setError('Please enter or generate a room code.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    if (setParentUsername) setParentUsername(cleanUser);
    if (setParentRoomId) setParentRoomId(cleanRoom);

    // Join room via socket
    socket.emit('join_room', { roomId: cleanRoom, username: cleanUser });

    // Navigate to watch room
    navigate(`/room/${encodeURIComponent(cleanRoom)}?username=${encodeURIComponent(cleanUser)}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#111214] text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Top Floating Utility Bar */}
      <header className="w-full flex items-center justify-between p-4 sm:p-6 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-400">WeTube Live Sync Ready</span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      {/* Main Join UI Card */}
      <main className="flex-1 flex items-center justify-center z-10">
        <JoinRoomUI
          username={username}
          setUsername={handleUsernameChange}
          roomCode={roomCode}
          setRoomCode={handleRoomCodeChange}
          onJoin={handleJoin}
          onGenerateRoom={handleGenerateRoom}
          isSubmitting={isSubmitting}
          error={error}
        />
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-500 z-10">
        WeTube Watch Party • Real-Time Playback & Community
      </footer>
    </div>
  );
};

export default JoinRoomPage;
