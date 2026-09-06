import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomUI from '../components/JoinRoomUI';
import ThemeToggle from '../components/ThemeToggle';

const SAMPLE_ROOM_CODES = [
  'CHILL-LOFI-402',
  'SYNTH-WAVE-911',
  'ANIME-NIGHT-204',
  'GAMING-SQUAD-77',
  'CODING-STREAM-55',
];

const JoinRoomPage = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('CyberDrifter');
  const [roomCode, setRoomCode] = useState('CHILL-LOFI-402');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateRoom = () => {
    const randomCode = SAMPLE_ROOM_CODES[Math.floor(Math.random() * SAMPLE_ROOM_CODES.length)] || `ROOM-${Math.floor(100 + Math.random() * 900)}`;
    setRoomCode(randomCode);
    setError('');
  };

  const handleJoin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a display name.');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter or generate a room code.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/room/${encodeURIComponent(roomCode.trim())}?username=${encodeURIComponent(username.trim())}`);
    }, 300);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#111214] text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Top Floating Utility Bar */}
      <header className="w-full flex items-center justify-between p-4 sm:p-6 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-400">12,480 users in sync</span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      {/* Main Join UI Card Showcase */}
      <main className="flex-1 flex items-center justify-center z-10">
        <JoinRoomUI
          username={username}
          setUsername={setUsername}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          onJoin={handleJoin}
          onGenerateRoom={handleGenerateRoom}
          isSubmitting={isSubmitting}
          error={error}
        />
      </main>

      {/* Bottom Showcase Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-500 z-10">
        WeTube UI Layer Showcase • Built with React & Tailwind CSS
      </footer>
    </div>
  );
};

export default JoinRoomPage;
