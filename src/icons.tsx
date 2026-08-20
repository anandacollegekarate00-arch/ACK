export function makeIcon(children) {
  return function IconComp({ size = 18, color = 'currentColor', className = '', style = undefined }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
      >
        {children}
      </svg>
    );
  };
}

export const Home = makeIcon(
  <>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </>
);
export const Users = makeIcon(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    <circle cx="17" cy="9" r="2.3" />
    <path d="M15.5 14.2c2.6.5 4.5 2.5 4.5 5.8" />
  </>
);
export const Calendar = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </>
);
export const Trophy = makeIcon(
  <>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
    <path d="M7 5H4a3 3 0 0 0 3 4" />
    <path d="M17 5h3a3 3 0 0 1-3 4" />
    <line x1="12" y1="13" x2="12" y2="17" />
    <path d="M9 17h6l1 4H8l1-4z" />
  </>
);
export const User = makeIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </>
);
export const Bell = makeIcon(
  <>
    <path d="M6 10a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>
);
export const Search = makeIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
  </>
);
export const Plus = makeIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);
export const Check = makeIcon(<polyline points="4 12 10 18 20 6" />);
export const X = makeIcon(
  <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </>
);
export const Clock = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </>
);
export const ArrowLeft = makeIcon(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </>
);
export const Edit3 = makeIcon(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </>
);
export const Edit2 = makeIcon(
  <>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </>
);
export const Download = makeIcon(
  <>
    <path d="M12 3v12" />
    <polyline points="7 10 12 15 17 10" />
    <path d="M4 19h16" />
  </>
);
export const Trash2 = makeIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M8 6V4h8v2" />
  </>
);
export const ChevronLeft = makeIcon(<polyline points="15 6 9 12 15 18" />);
export const ChevronRight = makeIcon(<polyline points="9 6 15 12 9 18" />);
export const Award = makeIcon(
  <>
    <circle cx="12" cy="8" r="6" />
    <path d="M9 13l-2 8 5-3 5 3-2-8" />
  </>
);
export const Camera = makeIcon(
  <>
    <path d="M4 8h3l2-2h6l2 2h3v11H4V8z" />
    <circle cx="12" cy="13" r="3.3" />
  </>
);
export const CameraOff = makeIcon(
  <>
    <path d="M4 8h3l2-2h6l2 2h3v11H4V8z" />
    <circle cx="12" cy="13" r="3.3" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </>
);
export const QrCode = makeIcon(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <line x1="14" y1="14" x2="14" y2="21" />
    <line x1="21" y1="14" x2="21" y2="21" />
    <line x1="14" y1="17.5" x2="21" y2="17.5" />
  </>
);
export const Mail = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 6 12 13 21 6" />
  </>
);
export const Phone = makeIcon(<path d="M6 3h4l1 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 1v4a2 2 0 0 1-2 2C10.5 20 4 13.5 4 5a2 2 0 0 1 2-2z" />);
export const KeyRound = makeIcon(
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.5 12.5L20 3" />
    <path d="M17 6l2 2" />
    <path d="M14 9l2 2" />
  </>
);
export const Moon = makeIcon(<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />);
export const LogOut = makeIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);
export const Eye = makeIcon(
  <>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
export const EyeOff = makeIcon(
  <>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </>
);
export const AlertTriangle = makeIcon(
  <>
    <path d="M12 3l10 18H2L12 3z" />
    <line x1="12" y1="9" x2="12" y2="14" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </>
);
export const Shield = makeIcon(<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />);
export const Medal = makeIcon(
  <>
    <circle cx="12" cy="15" r="6" />
    <path d="M9 10L7 2h4l1 4 1-4h4l-2 8" />
  </>
);
export const UserPlus = makeIcon(
  <>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21c0-4.4 3.6-7 8-7" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="16" y1="11" x2="22" y2="11" />
  </>
);
export const TrendingUp = makeIcon(
  <>
    <polyline points="3 17 9 11 13 15 21 6" />
    <polyline points="15 6 21 6 21 12" />
  </>
);
export const TrendingDown = makeIcon(
  <>
    <polyline points="3 7 9 13 13 9 21 17" />
    <polyline points="15 17 21 17 21 11" />
  </>
);
export const Activity = makeIcon(
  <>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </>
);
export const ArrowRight = makeIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);
export const UploadCloud = makeIcon(
  <>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </>
);
export const FileText = makeIcon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </>
);
export const Star = makeIcon(<polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.5 5.5 21 7.5 13.5 2 9 9 9" />);
export const RefreshCw = makeIcon(
  <>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </>
);
export const PieChartIcon = makeIcon(
  <>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </>
);

export const BookOpen = makeIcon(
  <>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>
);
