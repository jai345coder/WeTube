import React from 'react';

/**
 * Generates a consistent hash number from a string
 * @param {string} str 
 * @returns {number}
 */
const hashString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Discord & modern web curated gradient palettes
const AVATAR_GRADIENTS = [
  'from-indigo-500 to-blue-600 text-white',
  'from-emerald-500 to-teal-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-violet-500 to-purple-600 text-white',
  'from-cyan-500 to-blue-500 text-white',
  'from-fuchsia-500 to-pink-600 text-white',
  'from-blue-600 to-indigo-700 text-white',
];

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs font-medium',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-16 h-16 text-xl font-bold',
};

const STATUS_SIZES = {
  xs: 'w-2 h-2 ring-1',
  sm: 'w-2.5 h-2.5 ring-2',
  md: 'w-3 h-3 ring-2',
  lg: 'w-3.5 h-3.5 ring-2',
  xl: 'w-4 h-4 ring-[3px]',
};

const STATUS_COLORS = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  dnd: 'bg-rose-500',
  offline: 'bg-slate-400',
};

/**
 * Extracts 1-2 initials from a username
 * @param {string} name 
 * @returns {string}
 */
const getInitials = (name = '') => {
  const clean = name.trim();
  if (!clean) return '?';
  const parts = clean.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

/**
 * Avatar Component
 * 
 * Props:
 * @param {string} props.username - Name of the user used for initials and color hashing
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Dimensions of the avatar
 * @param {'online'|'idle'|'dnd'|'offline'} [props.status] - Optional online status dot
 * @param {boolean} [props.showStatus=false] - Whether to render status dot
 * @param {string} [props.className] - Additional Tailwind classes
 */
const Avatar = ({
  username = 'Anonymous',
  size = 'md',
  status = 'online',
  showStatus = false,
  className = '',
}) => {
  const initials = getInitials(username);
  const colorIndex = hashString(username) % AVATAR_GRADIENTS.length;
  const gradientClass = AVATAR_GRADIENTS[colorIndex];
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const statusSize = STATUS_SIZES[size] || STATUS_SIZES.md;
  const statusBg = STATUS_COLORS[status] || STATUS_COLORS.online;

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none items-center justify-center ${className}`}>
      <div
        className={`rounded-full bg-gradient-to-br ${gradientClass} ${sizeClass} flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105`}
        title={username}
        aria-label={`Avatar for ${username}`}
      >
        <span>{initials}</span>
      </div>

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-slate-900 dark:ring-[#1e1f22] ${statusSize} ${statusBg}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;
