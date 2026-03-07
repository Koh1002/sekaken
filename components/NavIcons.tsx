// モノグサ風のシンプルなラインアイコン
interface IconProps {
  size?: number;
  active?: boolean;
}

const color = (active: boolean) => active ? "currentColor" : "currentColor";
const sw = (active: boolean) => active ? 2.2 : 1.8;

export function HomeIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

export function ListIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function MapIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 3c-2.5 3-4 6-4 9s1.5 6 4 9c2.5-3 4-6 4-9s-1.5-6-4-9z" />
    </svg>
  );
}

export function CameraIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function QuizIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
      <path d="M15 14l-1.5 1.5L15 17" />
    </svg>
  );
}

export function ReviewIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function ChartIcon({ size = 20, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color(active)} strokeWidth={sw(active)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}
