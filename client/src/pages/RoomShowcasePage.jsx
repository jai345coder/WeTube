import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PlaybackControls from '../components/PlaybackControls';
import RoleBadge from '../components/RoleBadge';
import Avatar from '../components/Avatar';
import ThemeToggle from '../components/ThemeToggle';
import VideoPlayer from '../components/VideoPlayer';
import useRoom from '../hooks/useRoom';
import socket from '../socket';

const INITIAL_PARTICIPANTS = [
  { userId: 'u-1', username: 'Alex Chen', role: 'host', isSelf: true },
  { userId: 'u-2', username: 'Sarah_Dev', role: 'moderator' },
  { userId: 'u-3', username: 'NeonVibe', role: 'participant' },
  { userId: 'u-4', username: 'K-Dog', role: 'participant' },
  { userId: 'u-5', username: 'LofiLover', role: 'participant' },
];

const SAMPLE_VIDEOS = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio 24/7 — Beats to Relax/Study to', duration: 3600 },
  { id: '4xDzrJKXOOY', title: 'synthwave radio - chill synth / retro beats', duration: 5400 },
  { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to', duration: 7200 },
];

/**
 * Robust YouTube video ID parser (handles youtu.be, watch?v=, embed, shorts, and raw IDs)
 */
const extractYouTubeId = (input = '') => {
  const clean = input.trim();
  if (!clean) return '';
  if (clean.includes('youtu.be/')) {
    return clean.split('youtu.be/')[1].split(/[?#&]/)[0];
  }
  if (clean.includes('watch?v=')) {
    return clean.split('watch?v=')[1].split(/[?#&]/)[0];
  }
  if (clean.includes('/embed/')) {
    return clean.split('/embed/')[1].split(/[?#&]/)[0];
  }
  if (clean.includes('/shorts/')) {
    return clean.split('/shorts/')[1].split(/[?#&]/)[0];
  }
  return clean;
};

const RoomShowcasePage = ({ theme, onToggleTheme, username }) => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentUsername = username || searchParams.get('username') || 'Alex Chen';
  const displayRoomCode = roomId || 'CHILL-LOFI-402';

  // Hook into real room socket state & actions
  const {
    participants: liveParticipants = [],
    videoState,
    myRole,
    errorMessage,
    play,
    pause,
    seek,
    changeVideo,
    assignRole,
    removeParticipant,
  } = useRoom(roomId, currentUsername);

  // Dynamic role switcher state (lets user switch between Host, Moderator, Participant)
  const [customRole, setCustomRole] = useState(null);
  const currentUserRole = customRole || myRole || 'host';
  const canControl = currentUserRole === 'host' || currentUserRole === 'moderator';

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Video State
  const [currentVideo, setCurrentVideo] = useState(SAMPLE_VIDEOS[0]);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(3600);

  const activeVideoId = videoState?.videoId && videoState.videoId !== 'null'
    ? videoState.videoId
    : currentVideo.id;
  const playState = videoState?.playState || 'playing';

  // Update local time when server sends sync_state
  useEffect(() => {
    if (typeof videoState?.currentTime === 'number') {
      setLocalCurrentTime(videoState.currentTime);
    }
  }, [videoState?.currentTime]);

  // Use live socket participants if available; otherwise use showcase initial participants
  const rawParticipants = liveParticipants && liveParticipants.length > 0
    ? liveParticipants
    : INITIAL_PARTICIPANTS;

  // Synchronize current user's role in the participants list
  const effectiveParticipants = rawParticipants.map((p) => {
    const isMe = p.userId === socket.id || p.username === currentUsername || p.isSelf;
    return isMe ? { ...p, role: currentUserRole, isSelf: true } : p;
  });

  // Switch role handler: updates local state and notifies backend socket
  const handleRoleSwitch = (newRole) => {
    setCustomRole(newRole);
    if (assignRole && socket.id) {
      assignRole(socket.id, newRole);
    }
  };

  // Participant Management handlers
  const handlePromote = (userId) => {
    if (assignRole) {
      assignRole(userId, 'moderator');
    }
  };

  const handleDemote = (userId) => {
    if (assignRole) {
      assignRole(userId, 'participant');
    }
  };

  const handleRemove = (userId) => {
    if (removeParticipant) {
      removeParticipant(userId);
    }
  };

  // Playback Control Handlers (emits socket event to all clients in the room)
  const handlePlay = () => {
    if (play) play();
  };

  const handlePause = () => {
    if (pause) pause();
  };

  const handleSeek = (time) => {
    setLocalCurrentTime(time);
    if (seek) seek(time);
  };

  const handleChangeVideo = (videoIdOrUrl) => {
    const parsedId = extractYouTubeId(videoIdOrUrl);
    if (!parsedId) return;

    if (changeVideo) {
      changeVideo(parsedId);
    }
    setCurrentVideo({
      id: parsedId,
      title: `YouTube Video (${parsedId})`,
      duration: 3600,
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#111214] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Left Sidebar Component */}
      <Sidebar
        roomCode={displayRoomCode}
        participants={effectiveParticipants}
        currentUserRole={currentUserRole}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onRemove={handleRemove}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Stage & Video Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-white/10 bg-[#1e1f22]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
          
          {/* Left: Mobile hamburger & Room Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open participants sidebar"
              className="p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 md:hidden transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              <span className="font-bold text-lg hidden sm:inline text-white">We<span className="text-[#5865F2]">Tube</span></span>
            </div>

            <div className="h-5 w-px bg-white/10 hidden sm:block" />

            {/* Room Identifier Pill */}
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-mono text-slate-400 truncate">
                #{displayRoomCode}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYNCED • 1080p60
              </span>
            </div>
          </div>

          {/* Right: Role Switcher Toolbar, Theme Toggle, Leave Room */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Interactive Role Switcher */}
            <div className="hidden sm:flex items-center bg-[#111214] p-1 rounded-xl border border-white/10 shadow-inner">
              <span className="text-[11px] font-semibold text-slate-400 px-2">Role:</span>
              {(['host', 'moderator', 'participant']).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSwitch(role)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                    currentUserRole === role
                      ? 'bg-[#5865F2] text-white shadow-md font-semibold scale-100'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            {/* User Avatar */}
            <Avatar username={currentUsername} size="sm" showStatus={true} status="online" />

            {/* Leave Room Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Leave room"
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </header>

        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Room Stage Body */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col max-w-6xl w-full mx-auto space-y-4">
          
          {/* Mobile Role Switcher Bar */}
          <div className="flex sm:hidden items-center justify-between p-2 rounded-xl bg-[#1e1f22] border border-white/10">
            <span className="text-xs text-slate-400 font-semibold">Switch Role:</span>
            <div className="flex items-center gap-1">
              {(['host', 'moderator', 'participant']).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSwitch(role)}
                  className={`px-2 py-1 text-[11px] rounded-lg capitalize transition-all ${
                    currentUserRole === role
                      ? 'bg-[#5865F2] text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Video Player Frame with VideoPlayer */}
          <div className="relative w-full aspect-video rounded-2xl bg-[#1e1f22] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between group">
            
            <div className="absolute inset-0 w-full h-full">
              <VideoPlayer
                videoId={activeVideoId}
                playState={playState}
                currentTime={videoState?.currentTime ?? localCurrentTime}
                onTimeUpdate={(time) => setLocalCurrentTime(time)}
                onDurationChange={(dur) => setLocalDuration(dur)}
              />
            </div>

            {/* Top Video Header Overlay */}
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/80 text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE SYNC
                </span>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                  {currentVideo.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RoleBadge role={currentUserRole} size="sm" />
              </div>
            </div>

            {/* Bottom Floating Status Bar */}
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent text-xs text-slate-300 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono">Sync latency &lt; 25ms</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>1080p HD</span>
                <span>Active Role: <strong className="text-white capitalize">{currentUserRole}</strong></span>
              </div>
            </div>
          </div>

          {/* 3. PlaybackControls Component */}
          <div className="w-full">
            <PlaybackControls
              playState={playState}
              currentTime={localCurrentTime}
              duration={localDuration}
              canControl={canControl}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onChangeVideo={handleChangeVideo}
            />
          </div>

          {/* 4. Quick Video Presets Guide Banner */}
          <div className="p-4 rounded-xl bg-[#1e1f22]/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-base">🎬</span>
              <span>
                <strong>Video Controls Active:</strong> Paste any YouTube link above or choose a preset below. Playback syncs to all users in the room.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Quick Presets:</span>
              {SAMPLE_VIDEOS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={!canControl}
                  onClick={() => handleChangeVideo(v.id)}
                  className="px-2.5 py-1 rounded bg-[#2b2d31] hover:bg-[#5865F2] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[11px] font-medium"
                >
                  Track {i + 1}
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default RoomShowcasePage;
