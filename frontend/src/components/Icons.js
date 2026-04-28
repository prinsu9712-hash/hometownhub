const SvgIcon = ({ children, className = "h-5 w-5", viewBox = "0 0 24 24", strokeWidth = 1.8 }) => (
  <svg
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ArrowUpRightIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </SvgIcon>
);

export const BellIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M15 17H9a4 4 0 0 1-4-4v-2a7 7 0 0 1 14 0v2a4 4 0 0 1-4 4Z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </SvgIcon>
);

export const CalendarIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M7 3v3" />
    <path d="M17 3v3" />
    <rect x="4" y="5" width="16" height="16" rx="3" />
    <path d="M4 10h16" />
  </SvgIcon>
);

export const ChartIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M5 19V9" />
    <path d="M12 19V5" />
    <path d="M19 19v-7" />
    <path d="M4 19h16" />
  </SvgIcon>
);

export const CheckCircleIcon = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </SvgIcon>
);

export const ClipboardIcon = ({ className }) => (
  <SvgIcon className={className}>
    <rect x="6" y="4" width="12" height="16" rx="3" />
    <path d="M9 4.5h6A1.5 1.5 0 0 0 13.5 3h-3A1.5 1.5 0 0 0 9 4.5Z" />
    <path d="M9 10h6" />
    <path d="M9 14h4" />
  </SvgIcon>
);

export const CommunityIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 20h18" />
    <path d="M6 20v-7l4-3 4 3v7" />
    <path d="M14 20v-9l4-3 3 2v10" />
    <path d="M8.5 14h3" />
  </SvgIcon>
);

export const CompassIcon = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 15 6-6-2 5-4 1Z" />
  </SvgIcon>
);

export const CrownIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m4 8 4 4 4-6 4 6 4-4-2 10H6Z" />
  </SvgIcon>
);

export const FilterIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </SvgIcon>
);

export const FlagIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M5 21V4" />
    <path d="M5 5h10l-2 3 2 3H5" />
  </SvgIcon>
);

export const GlobeIcon = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a13.5 13.5 0 0 1 0 18" />
    <path d="M12 3a13.5 13.5 0 0 0 0 18" />
  </SvgIcon>
);

export const LayersIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m12 4 8 4-8 4-8-4 8-4Z" />
    <path d="m4 12 8 4 8-4" />
    <path d="m4 16 8 4 8-4" />
  </SvgIcon>
);

export const MailIcon = ({ className }) => (
  <SvgIcon className={className}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </SvgIcon>
);

export const MapPinIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
    <circle cx="12" cy="10" r="2" />
  </SvgIcon>
);

export const MegaphoneIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M4 12h3l8-4v8l-8-4H4Z" />
    <path d="M15 10.5a3.5 3.5 0 0 1 0 3" />
    <path d="M8 16v2a2 2 0 0 0 2 2" />
  </SvgIcon>
);

export const PulseIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 12h4l2-4 4 8 2-4h6" />
  </SvgIcon>
);

export const SearchIcon = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.2-4.2" />
  </SvgIcon>
);

export const ShieldIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M12 3 5 6v5c0 5 3.3 8.4 7 10 3.7-1.6 7-5 7-10V6Z" />
    <path d="m9.5 12 1.6 1.6 3.4-3.6" />
  </SvgIcon>
);

export const SparkIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m12 3 1.8 4.7L19 9.5l-4.2 2.1L13 17l-1.8-5.4L7 9.5l5.2-1.8Z" />
    <path d="m5 4 .8 1.8L7.5 7 5.8 7.8 5 9.5l-.8-1.7L2.5 7l1.7-.8Z" />
  </SvgIcon>
);

export const UserIcon = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </SvgIcon>
);

export const UsersIcon = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M17 12a2.5 2.5 0 1 0 0-5" />
    <path d="M4.5 19a4.5 4.5 0 0 1 9 0" />
    <path d="M14.5 19a3.5 3.5 0 0 1 6 0" />
  </SvgIcon>
);

export const XCircleIcon = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6" />
    <path d="m15 9-6 6" />
  </SvgIcon>
);
