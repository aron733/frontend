export default function LoaderVokyvo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'loaderRotate 1.4s linear infinite' }}>
        <defs>
          <linearGradient id="vokyvoLoaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#vokyvoLoaderGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90 150"
          style={{ animation: 'loaderDash 1.4s ease-in-out infinite' }}
        />
      </svg>
      <style>{`
        @keyframes loaderRotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes loaderDash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
      `}</style>
    </div>
  );
}
