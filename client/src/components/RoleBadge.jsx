import React from 'react';

/**
 * Role configuration for styling and icons
 */
const ROLE_CONFIG = {
  host: {
    label: 'Host',
    badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30',
    icon: (
      <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
      </svg>
    ),
  },
  moderator: {
    label: 'Mod',
    badgeClass: 'bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/30 dark:bg-[#5865F2]/20 dark:text-[#7983f5] dark:border-[#5865F2]/40',
    icon: (
      <svg className="w-3 h-3 text-[#5865F2] dark:text-[#7983f5]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
    ),
  },
  participant: {
    label: 'Member',
    badgeClass: 'bg-slate-500/15 text-slate-400 border border-slate-500/25 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600/30',
    icon: (
      <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
};

/**
 * RoleBadge Component
 * 
 * Props:
 * @param {'host' | 'moderator' | 'participant'} props.role - Role assigned to the user
 * @param {'sm' | 'md'} [props.size='sm'] - Badge size
 * @param {boolean} [props.showIcon=true] - Whether to render role icon
 * @param {string} [props.className] - Additional Tailwind classes
 */
const RoleBadge = ({
  role = 'participant',
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const normalizedRole = (role || 'participant').toLowerCase();
  const config = ROLE_CONFIG[normalizedRole] || ROLE_CONFIG.participant;

  const sizeClasses = size === 'md'
    ? 'px-2.5 py-1 text-xs gap-1.5'
    : 'px-2 py-0.5 text-[11px] font-medium gap-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full select-none tracking-wide uppercase transition-all duration-200 shadow-sm ${config.badgeClass} ${sizeClasses} ${className}`}
      title={`Role: ${config.label}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default RoleBadge;
