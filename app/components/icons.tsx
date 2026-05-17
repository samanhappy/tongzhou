// 同舟 · 图标库
// 全部内联 SVG，线条 1.6，端点圆，颜色用 currentColor

import type { CSSProperties, ReactNode } from "react";

type IconProps = {
  size?: number;
  sw?: number;
  fill?: string;
  style?: CSSProperties;
};

function Icon({
  d,
  size = 16,
  sw = 1.6,
  fill = "none",
  style,
}: IconProps & { d: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "0 0 auto", ...style }}
    >
      {d}
    </svg>
  );
}

export const I = {
  home: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
        </>
      }
    />
  ),
  course: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 9h18" />
        </>
      }
    />
  ),
  member: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="9" cy="9" r="3.2" />
          <path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5" />
          <circle cx="17" cy="8" r="2.4" />
          <path d="M15 14.5c2.7-.6 5.5.8 6 4.5" />
        </>
      }
    />
  ),
  usage: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15v-4" />
          <path d="M12 15V7" />
          <path d="M16 15v-6" />
        </>
      }
    />
  ),
  cog: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="2.6" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
        </>
      }
    />
  ),
  library: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="4" width="14" height="16" rx="1.4" />
          <path d="M7 4v16" />
          <rect x="17" y="6" width="4" height="14" rx="1" />
        </>
      }
    />
  ),
  bell: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M10 19a2 2 0 004 0" />
        </>
      }
    />
  ),
  search: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="11" cy="11" r="6.2" />
          <path d="M16 16l4 4" />
        </>
      }
    />
  ),
  plus: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M12 5v14M5 12h14" />
        </>
      }
    />
  ),
  grip: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="9" cy="6" r=".9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="6" r=".9" fill="currentColor" stroke="none" />
          <circle cx="9" cy="12" r=".9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r=".9" fill="currentColor" stroke="none" />
          <circle cx="9" cy="18" r=".9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="18" r=".9" fill="currentColor" stroke="none" />
        </>
      }
    />
  ),
  play: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={<path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none" />}
    />
  ),
  playC: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <path
            d="M10 8.5l6 3.5-6 3.5z"
            fill="currentColor"
            stroke="currentColor"
          />
        </>
      }
    />
  ),
  pause: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect
            x="7"
            y="5"
            width="4"
            height="14"
            rx="1"
            fill="currentColor"
            stroke="none"
          />
          <rect
            x="13"
            y="5"
            width="4"
            height="14"
            rx="1"
            fill="currentColor"
            stroke="none"
          />
        </>
      }
    />
  ),
  check: (p: IconProps = {}) => (
    <Icon {...p} d={<path d="M5 12l4 4 10-10" />} />
  ),
  chevR: (p: IconProps = {}) => <Icon {...p} d={<path d="M9 5l7 7-7 7" />} />,
  chevL: (p: IconProps = {}) => <Icon {...p} d={<path d="M15 5l-7 7 7 7" />} />,
  chevD: (p: IconProps = {}) => <Icon {...p} d={<path d="M5 9l7 7 7-7" />} />,
  link: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
        </>
      }
    />
  ),
  upload: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M12 4v12" />
          <path d="M8 8l4-4 4 4" />
          <path d="M5 20h14" />
        </>
      }
    />
  ),
  video: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="6" width="13" height="12" rx="1.5" />
          <path d="M16 10l5-3v10l-5-3z" />
        </>
      }
    />
  ),
  csv: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </>
      }
    />
  ),
  share: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="18" cy="5" r="2.4" />
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="19" r="2.4" />
          <path d="M8 11l8-5M8 13l8 5" />
        </>
      }
    />
  ),
  qr: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h2v2M20 14v3M14 18h3M17 20v1" />
        </>
      }
    />
  ),
  trash: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M5 7h14M10 7V5a1 1 0 011-1h2a1 1 0 011 1v2" />
          <path d="M7 7v12a1 1 0 001 1h8a1 1 0 001-1V7" />
          <path d="M10 11v6M14 11v6" />
        </>
      }
    />
  ),
  edit: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M4 20h4l11-11-4-4L4 16z" />
          <path d="M14 6l4 4" />
        </>
      }
    />
  ),
  warn: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M12 3l10 17H2z" />
          <path d="M12 10v4M12 17v.5" />
        </>
      }
    />
  ),
  info: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 8v.5" />
        </>
      }
    />
  ),
  clock: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </>
      }
    />
  ),
  user: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="9" r="3.4" />
          <path d="M5 19c1-3.4 3.6-5 7-5s6 1.6 7 5" />
        </>
      }
    />
  ),
  copy: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="8" y="8" width="12" height="12" rx="1.5" />
          <path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" />
        </>
      }
    />
  ),
  mail: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 7l9 7 9-7" />
        </>
      }
    />
  ),
  sparkle: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M12 4l1.6 4.2L18 10l-4.4 1.8L12 16l-1.6-4.2L6 10l4.4-1.8z" />
          <path d="M19 4l.6 1.4L21 6l-1.4.6L19 8l-.6-1.4L17 6l1.4-.6z" />
        </>
      }
    />
  ),
  cloud: (p: IconProps = {}) => (
    <Icon {...p} d={<path d="M7 18a4 4 0 010-8 5 5 0 0110-1 4 4 0 011 8z" />} />
  ),
  fullscr: (p: IconProps = {}) => (
    <Icon {...p} d={<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />} />
  ),
  vol: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <path d="M4 10v4h3l4 3V7L7 10z" />
          <path d="M14 9a4 4 0 010 6" />
        </>
      }
    />
  ),
  back: (p: IconProps = {}) => <Icon {...p} d={<path d="M15 5l-7 7 7 7" />} />,
  filter: (p: IconProps = {}) => (
    <Icon {...p} d={<path d="M3 5h18l-7 9v6l-4-2v-4z" />} />
  ),
  lock: (p: IconProps = {}) => (
    <Icon
      {...p}
      d={
        <>
          <rect x="5" y="11" width="14" height="9" rx="1.5" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </>
      }
    />
  ),
} as const;
