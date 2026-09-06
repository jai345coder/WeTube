import React from 'react';

/**
 * JoinRoomUI Component
 * 
 * Props:
 * @param {string} props.username - Current username input value
 * @param {Function} props.setUsername - State setter for username: setUsername(val)
 * @param {string} props.roomCode - Current room code input value
 * @param {Function} props.setRoomCode - State setter for room code: setRoomCode(val)
 * @param {Function} props.onJoin - Callback triggered to join the room: onJoin(e)
 * @param {Function} props.onGenerateRoom - Callback triggered to generate/create a random room code: onGenerateRoom()
 * @param {string} [props.error] - Optional error message to display
 * @param {boolean} [props.isSubmitting=false] - Loading state for join action
 * @param {string} [props.className] - Additional Tailwind classes
 */
const JoinRoomUI = ({
  username = '',
  setUsername,
  roomCode = '',
  setRoomCode,
  onJoin,
  onGenerateRoom,
  error = '',
  isSubmitting = false,
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onJoin) {
      onJoin(e);
    }
  };

  return (
    <div className={`min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 ${className}`}>
      {/* Centered Glass / Dark Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#1e1f22] dark:bg-[#1e1f22] border border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-300">
        
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl" />

        {/* Brand Header */}
        <div className="relative text-center mb-8">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5865F2] text-white shadow-lg shadow-indigo-500/30 mb-4 transition-transform duration-300 hover:scale-110">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>We</span>
            <span className="text-[#5865F2]">Tube</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Watch videos together in real-time with synchronized playback and live chat.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="relative space-y-5">
          {/* Display Name / Username Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Display Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername && setUsername(e.target.value)}
                placeholder="e.g. CyberDrifter"
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#111214] border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/40 transition-all duration-200"
              />
            </div>
          </div>

          {/* Room Code Field with Generate action */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="roomCode"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Room Code <span className="text-rose-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={onGenerateRoom}
                className="text-xs font-semibold text-[#7983f5] hover:text-[#5865F2] transition-colors focus:outline-none flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generate Code</span>
              </button>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 font-mono text-sm">
                #
              </span>
              <input
                id="roomCode"
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode && setRoomCode(e.target.value.toUpperCase())}
                placeholder="CHILL-ROOM-402"
                className="w-full min-h-[44px] pl-9 pr-4 py-2.5 text-sm font-mono tracking-wider uppercase rounded-xl bg-[#111214] border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/40 transition-all duration-200"
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in"
              role="alert"
            >
              <svg className="w-4 h-4 flex-shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Buttons Stack */}
          <div className="pt-2 space-y-3">
            {/* Primary Join Button */}
            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !roomCode.trim()}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5865F2] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Join Watch Party</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Secondary Create / Generate Room Button */}
            <button
              type="button"
              onClick={onGenerateRoom}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#2b2d31] hover:bg-[#35373c] text-slate-300 hover:text-white font-medium text-xs border border-white/5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Room with Random Code</span>
            </button>
          </div>

          {/* Subtext info */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500">
              👑 The creator of a new room automatically becomes the <span className="text-amber-400 font-medium">Room Host</span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomUI;
