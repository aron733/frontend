export default function SocialSkeleton() {
  return (
    <div style={{ background: '#0f0f14', padding: '20px', marginBottom: '10px', borderBottom: '1px solid #1a1a2e' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '40%', height: '14px', borderRadius: '4px', background: '#1a1a2e', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '25%', height: '12px', borderRadius: '4px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Texte */}
      <div style={{ width: '80%', height: '14px', borderRadius: '4px', background: '#1a1a2e', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: '#1a1a2e', marginBottom: '15px', animation: 'pulse 1.5s ease-in-out infinite' }} />

      {/* Image */}
      <div style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#1a1a2e', marginBottom: '15px', animation: 'pulse 1.5s ease-in-out infinite' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, height: '40px', borderRadius: '10px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1, height: '40px', borderRadius: '10px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1, height: '40px', borderRadius: '10px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}
