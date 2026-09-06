import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PlaybackControls from '../components/PlaybackControls';
import RoleBadge from '../components/RoleBadge';
import Avatar from '../components/Avatar';
import ThemeToggle from '../components/ThemeToggle';

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

const RoomShowcasePage = ({ theme, onToggleTheme }) => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentUsername = searchParams.get('username') || 'Alex Chen';
  const displayRoomCode = roomId || 'CHILL-LOFI-402';

  // Permission testing state: 'host' | 'moderator' | 'participant'
  const [currentUserRole, setCurrentUserRole] = useState('host');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Presentational Video State (for UI testing)
  const [currentVideo, setCurrentVideo] = useState(SAMPLE_VIDEOS[0]);
  const [playState, setPlayState] = useState('playing'); // 'playing' | 'paused'
  const [currentTime, setCurrentTime] = useState(1458); // 24:18

  // Participants State
  const [participants, setParticipants] = useState(() => [
    { userId: 'u-self', username: currentUsername, role: currentUserRole, isSelf: true },
    ...INITIAL_PARTICIPANTS.filter((p) => p.username !== currentUsername),
  ]);

  // Sync self participant role when switcher changes
  const handleRoleSwitch = (newRole) => {
    setCurrentUserRole(newRole);
    setParticipants((prev) =>
      prev.map((p) => (p.isSelf ? { ...p, role: newRole } : p))
    );
  };

  // Participant Management (Presentational Mock Handlers)
  const handlePromote = (userId) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, role: 'moderator' } : p))
    );
  };

  const handleDemote = (userId) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, role: 'participant' } : p))
    );
  };

  const handleRemove = (userId) => {
    setParticipants((prev) => prev.filter((p) => p.userId !== userId));
  };

  // Playback Control Handlers (Presentational UI)
  const canControl = currentUserRole === 'host' || currentUserRole === 'moderator';

  const handlePlay = () => setPlayState('playing');
  const handlePause = () => setPlayState('paused');
  const handleSeek = (time) => setCurrentTime(time);
  const handleChangeVideo = (videoIdOrUrl) => {
    const videoId = videoIdOrUrl.includes('v=')
      ? videoIdOrUrl.split('v=')[1].split('&')[0]
      : videoIdOrUrl;

    setCurrentVideo({
      id: videoId,
      title: `Custom Video (${videoId})`,
      duration: 3600,
    });
    setCurrentTime(0);
    setPlayState('playing');
  };

  return (
    <div className="flex h-screen w-full bg-[#111214] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Left Sidebar Component */}
      <Sidebar
        roomCode={displayRoomCode}
        participants={participants}
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

          {/* Right: Role Switcher Showcase, Theme Toggle, Leave Room */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Interactive Role Switcher for Showcase Testing */}
            <div className="hidden sm:flex items-center bg-[#111214] p-1 rounded-xl border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400 px-2">Role:</span>
              {(['host', 'moderator', 'participant']).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSwitch(role)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                    currentUserRole === role
                      ? 'bg-[#5865F2] text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
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

        {/* Room Stage Body */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col max-w-6xl w-full mx-auto space-y-4">
          
          {/* Mobile Role Switcher Bar */}
          <div className="flex sm:hidden items-center justify-between p-2 rounded-xl bg-[#1e1f22] border border-white/10">
            <span className="text-xs text-slate-400 font-semibold">Test Permission Role:</span>
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

          {/* Video Player Presentation Frame */}
          <div className="relative w-full aspect-video rounded-2xl bg-[#1e1f22] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between group">
            
            {/* Ambient Background Artwork / Simulation */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-[#1e1f22] to-slate-950/80 flex items-center justify-center">
              
              {/* Center Play Watermark / Pulse */}
              <div className="text-center space-y-3 z-10 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40 backdrop-blur-md shadow-2xl transition-transform duration-300 group-hover:scale-110">
                  {playState === 'playing' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-7 bg-[#5865F2] rounded-full animate-pulse" />
                      <span className="w-2 h-7 bg-[#5865F2] rounded-full animate-pulse delay-75" />
                    </div>
                  ) : (
                    <svg className="w-10 h-10 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white max-w-md truncate">
                  {currentVideo.title}
                </h3>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span>Synced Stream</span>
                  <span>•</span>
                  <span>{participants.length} viewers in room</span>
                </div>
              </div>
            </div>

            {/* Top Video Header Overlay */}
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
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
            <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono">Sync latency &lt; 25ms</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>1080p HD</span>
                <span>Stereo Audio</span>
              </div>
            </div>
          </div>

          {/* 3. PlaybackControls Component */}
          <div className="w-full">
            <PlaybackControls
              playState={playState}
              currentTime={currentTime}
              duration={currentVideo.duration}
              canControl={canControl}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onChangeVideo={handleChangeVideo}
            />
          </div>

          {/* 4. Showcase Quick Action & Permission Info Box */}
          <div className="p-4 rounded-xl bg-[#1e1f22]/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>
                <strong>UI Showcase Mode:</strong> Switch roles above to preview controls as <em>Host</em>, <em>Moderator</em>, or <em>Participant</em> (locked state).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Video Presets:</span>
              {SAMPLE_VIDEOS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={!canControl}
                  onClick={() => {
                    setCurrentVideo(v);
                    setCurrentTime(0);
                    setPlayState('playing');
                  }}
                  className="px-2 py-1 rounded bg-[#2b2d31] hover:bg-[#5865F2] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[11px]"
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
