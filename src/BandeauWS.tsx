import { useState, useEffect } from 'react';
import { useChat } from './ChatContext';

export default function BandeauWS() {
  const { connecte } = useChat();
  const [affiche, setAffiche] = useState(false);

  useEffect(() => {
    if (connecte) {
      // WS connecté → cacher immédiatement
      setAffiche(false);
      return;
    }
    // WS down → attendre 3 sec avant d'afficher
    const timer = setTimeout(() => {
      setAffiche(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [connecte]);

  if (!affiche || connecte) return null;

  return (
    <div style={styles.bandeau}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <span style={{ flex: 1 }}>Reconnexion en cours…</span>
      <button
        onClick={() => window.location.reload()}
        style={styles.btn}
      >
        Recharger
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bandeau: {
    position: 'fixed',
    top: 'env(safe-area-inset-top, 0px)',
    left: 0,
    right: 0,
    zIndex: 99998,
    background: '#f59e0b',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    animation: 'slideDown 0.3s ease-out',
  },
  btn: {
    background: 'rgba(255, 255, 255, 0.25)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
