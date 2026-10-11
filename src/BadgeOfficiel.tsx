interface BadgeOfficielProps {
  size?: number;
}

function BadgeOfficiel({ size = 18 }: BadgeOfficielProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="badgeOfficielGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#badgeOfficielGrad)" />
      {/* Étoile à 5 branches */}
      <polygon
        points="12,5 14.09,10.26 19.5,10.72 15.36,14.24 16.63,19.5 12,16.6 7.37,19.5 8.64,14.24 4.5,10.72 9.91,10.26"
        fill="white"
      />
    </svg>
  );
}

export default BadgeOfficiel;
