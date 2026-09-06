import React, { useState } from 'react';

/**
 * Formats seconds into MM:SS or HH:MM:SS
 * @param {number} totalSeconds 
 * @returns {string}
 */
const formatTime = (totalSeconds = 0) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * PlaybackControls Component
 * 
 * Props:
 * @param {'playing'|'paused'|'buffering'|boolean} props.playState - Current playback status
 * @param {number} props.currentTime - Current playback position in seconds
 * @param {number} [props.duration=0] - Total video length in seconds (optional)
 * @param {boolean} props.canControl - Whether the user has permission to control playback
 * @param {Function} props.onPlay - Handler to play video
 * @param {Function} props.onPause - Handler to pause video
 * @param {Function} props.onSeek - Handler called with target time in seconds: onSeek(seconds)
 * @param {Function} props.onChangeVideo - Handler called with new videoId/URL: onChangeVideo(videoId)
 * @param {string} [props.className] - Additional Tailwind classes
 */
const PlaybackControls = ({
  playState = 'paused',
  currentTime = 0,
  duration = 0,
  canControl = true,
  onPlay,
  onPause,
  onSeek,
  onChangeVideo,
  className = '',
}) => {
  const [videoInput, setVideoInput] = useState('');
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(currentTime);

  const isPlaying = playState === 'playing' || playState === true;
  const currentDisplayTime = isSeeking ? seekValue : currentTime;
  const maxDuration = Math.max(duration || 0, currentTime || 0, 100);

  const handlePlayPause = () => {
    if (!canControl) return;
    if (isPlaying) {
      if (onPause) onPause();
    } else {
      if (onPlay) onPlay();
    }
  };

  const handleSliderChange = (e) => {
    if (!canControl) return;
    const value = parseFloat(e.target.value);
    setSeekValue(value);
    setIsSeeking(true);
  };

  const handleSliderCommit = (e) => {
    if (!canControl) return;
    const value = parseFloat(e.target.value);
    setIsSeeking(false);
    if (onSeek) onSeek(value);
  };

  const handleChangeVideoSubmit = (e) => {
    e.preventDefault();
    if (!canControl || !videoInput.trim()) return;
    if (onChangeVideo) {
      onChangeVideo(videoInput.trim());
      setVideoInput('');
    }
  };

  return (
    <div
      className={`relative w-full rounded-xl bg-[#1e1f22]/95 dark:bg-[#1e1f22]/95 light:bg-slate-100 p-4 border border-white/10 dark:border-white/10 shadow-lg backdrop-blur-md transition-all duration-200 ${className}`}
    >
      {/* Disabled overlay tooltip if user cannot control */}
      {!canControl && (
        <div
          className="absolute -top-3 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md backdrop-blur-sm animate-fade-in"
          role="status"
        >
          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          <span>Only host/moderator can control playback</span>
        </div>
      )}

      {/* Main control container with opacity state */}
      <div className={`space-y-4 ${!canControl ? 'opacity-55 cursor-not-allowed select-none' : ''}`}>
        
        {/* Top: Progress / Seek Bar & Timers */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 dark:text-slate-400">
            <span className="font-semibold text-white/90">{formatTime(currentDisplayTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : 'Live / Sync'}</span>
          </div>

          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={maxDuration}
              step={0.5}
              value={currentDisplayTime}
              disabled={!canControl}
              onChange={handleSliderChange}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              aria-label="Seek video playback time"
              title={!canControl ? 'Only host/moderator can control playback' : 'Seek video'}
              className="w-full h-2 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-[#5865F2] hover:bg-slate-700 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Bottom Row: Play/Pause button + Video input form */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          
          {/* Play / Pause Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canControl}
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              title={!canControl ? 'Only host/moderator can control playback' : (isPlaying ? 'Pause' : 'Play')}
              className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#5865F2] text-white hover:bg-[#4752C4] shadow-indigo-500/30'
              } disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#5865F2]`}
            >
              {isPlaying ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play</span>
                </>
              )}
            </button>
          </div>

          {/* Video URL Input & Change Video Button */}
          <form
            onSubmit={handleChangeVideoSubmit}
            className="flex-1 flex items-center gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              <input
                type="text"
                value={videoInput}
                disabled={!canControl}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder={canControl ? 'Paste YouTube link or Video ID...' : 'Controls locked to room host'}
                aria-label="Video URL or ID"
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm rounded-lg bg-[#111214] border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] disabled:cursor-not-allowed disabled:bg-[#111214]/60 transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={!canControl || !videoInput.trim()}
              aria-label="Load new video"
              title={!canControl ? 'Only host/moderator can control playback' : 'Load video for room'}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-lg bg-[#5865F2] text-white hover:bg-[#4752C4] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex-shrink-0"
            >
              Load Video
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
