interface BadgeVerifieProps {
  size?: number;
}

function BadgeVerifie({ size = 18 }: BadgeVerifieProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#badgeGrad)" />
      <polyline
        points="7.5 12 10.5 15 16.5 8.5"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default BadgeVerifie;
