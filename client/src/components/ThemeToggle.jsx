import React from 'react';

/**
 * ThemeToggle Component
 * 
 * Props:
 * @param {'dark' | 'light'} props.theme - Current theme mode
 * @param {Function} props.onToggle - Handler called when the toggle button is clicked
 * @param {string} [props.className] - Additional Tailwind classes
 */
const ThemeToggle = ({
  theme = 'dark',
  onToggle,
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`group relative inline-flex items-center justify-between w-14 h-8 min-w-[44px] min-h-[32px] p-1 rounded-full cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] focus-visible:ring-offset-2 ${
        isDark
          ? 'bg-[#1e1f22] border border-white/10 hover:border-[#5865F2]/50'
          : 'bg-slate-200 border border-slate-300 hover:border-[#5865F2]/50'
      } ${className}`}
    >
      {/* Sun Icon (Light side) */}
      <span
        className={`flex items-center justify-center w-4 h-4 ml-0.5 text-amber-500 transition-opacity duration-200 ${
          isDark ? 'opacity-30 group-hover:opacity-60' : 'opacity-0'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>

      {/* Moon Icon (Dark side) */}
      <span
        className={`flex items-center justify-center w-4 h-4 mr-0.5 text-indigo-400 transition-opacity duration-200 ${
          isDark ? 'opacity-0' : 'opacity-40 group-hover:opacity-70'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </span>

      {/* Sliding Thumb */}
      <span
        className={`absolute top-1 left-1 flex items-center justify-center w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-out active:scale-95 ${
          isDark
            ? 'translate-x-6 bg-[#5865F2] text-white shadow-indigo-500/30'
            : 'translate-x-0 bg-white text-amber-500 shadow-slate-400/40'
        }`}
      >
        {isDark ? (
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.1 22c-5.5 0-10-4.5-10-10 0-4.8 3.4-8.8 8-9.8.5-.1.9.3.8.8-.4 1.7-.1 3.5.9 4.9 1 1.4 2.6 2.3 4.4 2.4.5 0 .8.5.6 1-1.3 6.1-6.7 10.7-12.7 10.7z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
