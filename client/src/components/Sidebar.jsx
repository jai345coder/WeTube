import React, { useState } from 'react';
import Avatar from './Avatar';
import RoleBadge from './RoleBadge';

/**
 * Sidebar Component
 * 
 * Props:
 * @param {string} props.roomCode - Unique identifier or code for the room
 * @param {Array<{userId: string|number, username: string, role: string, isSelf?: boolean}>} props.participants - List of active users in the room
 * @param {'host' | 'moderator' | 'participant'} props.currentUserRole - Role of the active viewer
 * @param {Function} props.onPromote - Handler to promote user: onPromote(userId)
 * @param {Function} props.onDemote - Handler to demote user: onDemote(userId)
 * @param {Function} props.onRemove - Handler to kick/remove user: onRemove(userId)
 * @param {boolean} props.isMobileOpen - Mobile drawer open state
 * @param {Function} props.onCloseMobile - Handler to close mobile drawer
 * @param {string} [props.className] - Additional Tailwind classes
 */
const Sidebar = ({
  roomCode = 'ROOM-000',
  participants = [],
  currentUserRole = 'participant',
  onPromote,
  onDemote,
  onTransferHost,
  onAssignRole,
  onRemove,
  isMobileOpen = false,
  onCloseMobile,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = currentUserRole === 'host';

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Failed to copy room code:', err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] h-full bg-[#1e1f22] dark:bg-[#1e1f22] border-r border-white/10 shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${className}`}
      >
        {/* Header: Room Code & Quick Actions */}
        <div className="flex flex-col p-4 border-b border-white/10 bg-[#111214]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Room Details</h2>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="p-1.5 -mr-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 md:hidden transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Room Code Card with Copy Action */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#2b2d31] border border-white/5 group hover:border-[#5865F2]/40 transition-all duration-200">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Room Code</span>
              <span className="font-mono text-sm font-bold text-slate-100 truncate tracking-wide">{roomCode}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy room code to clipboard"
              title="Copy room code"
              className={`min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#5865F2]/20 text-[#7983f5] hover:bg-[#5865F2] hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Participant Count Section Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Participants ({participants.length})
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400">
            {participants.length} online
          </span>
        </div>

        {/* Scrollable Participant List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {participants.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No participants connected yet.
            </div>
          ) : (
            participants.map((p) => {
              const participantRole = (p.role || 'participant').toLowerCase();
              const isTargetHost = participantRole === 'host';
              const isTargetMod = participantRole === 'moderator';

              return (
                <div
                  key={p.userId || p.username}
                  className="group relative flex items-center justify-between p-2 rounded-xl hover:bg-[#2b2d31]/80 transition-all duration-200"
                >
                  {/* Avatar & User Details */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Avatar username={p.username} size="sm" showStatus={true} status="online" />
                    
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                          {p.username}
                        </span>
                        {p.isSelf && (
                          <span className="text-[10px] text-slate-500 font-normal">(You)</span>
                        )}
                      </div>
                      <RoleBadge role={participantRole} size="sm" />
                    </div>
                  </div>

                  {/* Host Action Buttons */}
                  {isHost && !p.isSelf && !isTargetHost && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {/* Promote to Moderator / Demote to Participant */}
                      {!isTargetMod ? (
                        <button
                          type="button"
                          onClick={() => onAssignRole ? onAssignRole(p.userId, 'moderator') : (onPromote && onPromote(p.userId))}
                          aria-label={`Promote ${p.username} to moderator`}
                          title="Promote to Moderator"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-[#5865F2]/20 transition-all active:scale-90"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAssignRole ? onAssignRole(p.userId, 'participant') : (onDemote && onDemote(p.userId))}
                          aria-label={`Demote ${p.username} to member`}
                          title="Demote to Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 transition-all active:scale-90"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </button>
                      )}

                      {/* Transfer Host Ownership */}
                      {(onTransferHost || onAssignRole) && (
                        <button
                          type="button"
                          onClick={() => onTransferHost ? onTransferHost(p.userId) : onAssignRole(p.userId, 'host')}
                          aria-label={`Transfer Host ownership to ${p.username}`}
                          title="Transfer Host Ownership"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 transition-all active:scale-90"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                          </svg>
                        </button>
                      )}

                      {/* Remove / Kick user */}
                      {onRemove && (
                        <button
                          type="button"
                          onClick={() => onRemove(p.userId)}
                          aria-label={`Remove ${p.username} from room`}
                          title="Kick from room"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-90"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info tag */}
        <div className="p-3 border-t border-white/10 bg-[#111214]/60 text-center">
          <p className="text-[11px] text-slate-500">
            WeTube Live Room Sync
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
