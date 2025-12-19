import React from 'react';

// Lock Icon for Teacher Mode
export const LockIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} text-slate-600`}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Exit Icon for "Exit Practice"
export const ExitIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} text-slate-600`}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Custom SVG for "Good Job" smile 😊 (Based on first provided image)
export const GoodJobEmoji: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

// Custom SVG for "Excellent" big laugh face 🤩 (Based on second provided image)
export const ExcellentEmoji: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M7 15s1 1 5 1 5-1 5-1" fill="currentColor" className="fill-current stroke-current" />
    <path d="M8 9.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
    <path d="M16 9.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
  </svg>
);

// Custom SVG for "Think Deeper" neutral face 😐 (Based on fourth provided image)
export const PonderEmoji: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="9" y1="14" x2="15" y2="14" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

// Custom SVG for "Sad/Poor" face 🙁 (Based on third provided image)
export const SadEmoji: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5-2 4-2 4 2 4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);


// Custom SVG for "Your Observations" header (magnifying glass)
export const ObservationIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} text-slate-800`}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// Custom SVG for "Tip for next time" (lightbulb)
export const TipIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} text-purple-600`}
  >
    <path d="M12 18h.01" />
    <path d="M12 22a4 4 0 0 0 0-8v4z" />
    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.92 2.02 5.37 4.7 6.44l-.16.16a1 1 0 0 0-.2.72v.32h10.46v-.32a1 1 0 0 0-.2-.72l-.16-.16C17.98 15.37 20 12.92 20 10c0-4.42-3.58-8-8-8z" />
  </svg>
);

// Custom SVG for the overall summary badge (e.g., a scroll or certificate)
export const SummaryIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} text-purple-600`}
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
    <path d="M16 16.12L12 20l-4-3.88" />
    <line x1="12" y1="12" x2="12" y2="20" />
  </svg>
);