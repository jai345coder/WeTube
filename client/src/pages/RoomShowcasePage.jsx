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

const RoomShowcasePage = ({ theme, onToggleTheme, username: propUsername }) => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentUsername = propUsername || searchParams.get('username') || 'User';
  const displayRoomCode = roomId || 'ROOM';

  // Hook into real room socket state & actions
  const {
    participants: liveParticipants = [],
    videoState,
    myRole = 'participant',
    errorMessage,
    play,
    pause,
    seek,
    changeVideo,
    assignRole,
    removeParticipant,
  } = useRoom(roomId, currentUsername);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Playback State
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);

  const activeVideoId = videoState?.videoId && videoState.videoId !== 'null'
    ? videoState.videoId
    : null;
  const playState = videoState?.playState || 'paused';
  const canControl = myRole === 'host' || myRole === 'moderator';

  // Update local time when server sends sync_state
  useEffect(() => {
    if (typeof videoState?.currentTime === 'number') {
      setLocalCurrentTime(videoState.currentTime);
    }
  }, [videoState?.currentTime]);

  // Real connected participants
  const effectiveParticipants = liveParticipants && liveParticipants.length > 0
    ? liveParticipants.map((p) => ({
        ...p,
        isSelf: p.userId === socket.id || p.username === currentUsername,
      }))
    : [{ userId: socket.id || 'me', username: currentUsername, role: myRole, isSelf: true }];

  // Participant Management handlers (Host only)
  const handleAssignRole = (userId, role) => {
    if (assignRole) {
      assignRole(userId, role);
    }
  };

  const handlePromote = (userId) => {
    handleAssignRole(userId, 'moderator');
  };

  const handleDemote = (userId) => {
    handleAssignRole(userId, 'participant');
  };

  const handleTransferHost = (userId) => {
    if (assignRole) {
      assignRole(userId, 'host');
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
  };

  return (
    <div className="flex h-screen w-full bg-[#111214] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Left Sidebar Component */}
      <Sidebar
        roomCode={displayRoomCode}
        participants={effectiveParticipants}
        currentUserRole={myRole}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onTransferHost={handleTransferHost}
        onAssignRole={handleAssignRole}
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
                LIVE SYNC
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle, User Avatar, Leave Room */}
          <div className="flex items-center gap-2 sm:gap-3">
            <RoleBadge role={myRole} size="sm" />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
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

          {/* Video Player Frame */}
          <div className="relative w-full aspect-video rounded-2xl bg-[#1e1f22] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between group">
            
            {activeVideoId ? (
              <div className="absolute inset-0 w-full h-full">
                <VideoPlayer
                  videoId={activeVideoId}
                  playState={playState}
                  currentTime={videoState?.currentTime ?? localCurrentTime}
                  onTimeUpdate={(time) => setLocalCurrentTime(time)}
                  onDurationChange={(dur) => setLocalDuration(dur)}
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-[#1e1f22] to-slate-950/80 flex items-center justify-center">
                <div className="text-center space-y-3 z-10 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40 backdrop-blur-md shadow-2xl">
                    <svg className="w-8 h-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white max-w-md">
                    No Video Loaded Yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {canControl
                      ? 'Paste a YouTube video link or ID in the bar below to start the party!'
                      : 'Waiting for the room host to choose a video...'}
                  </p>
                </div>
              </div>
            )}

            {/* Top Video Header Overlay */}
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/80 text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE SYNC
                </span>
                {activeVideoId && (
                  <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                    YouTube ID: {activeVideoId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <RoleBadge role={myRole} size="sm" />
              </div>
            </div>

            {/* Bottom Floating Status Bar */}
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent text-xs text-slate-300 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono">
                  {effectiveParticipants.length} {effectiveParticipants.length === 1 ? 'member' : 'members'} online
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>1080p HD</span>
                <span>Role: <strong className="text-white capitalize">{myRole}</strong></span>
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

        </main>
      </div>
    </div>
  );
};

export default RoomShowcasePage;
