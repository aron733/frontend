import { useState, useEffect } from 'react';
import { useChat } from './ChatContext';

export default function BandeauWS() {
  const { connecte } = useChat();
  const [affiche, setAffiche] = useState(false);
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    if (connecte) {
      setAffiche(false);
      setSecondes(0);
      return;
    }
    // Attendre 3 sec avant d'afficher (évite les faux positifs)
    const timer = setTimeout(() => setAffiche(true), 3000);
    return () => clearTimeout(timer);
  }, [connecte]);

  // Compteur de secondes quand affiché
  useEffect(() => {
    if (!affiche) return;
    const interval = setInterval(() => {
      setSecondes((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [affiche]);

  if (!affiche || connecte) return null;

  return (
    <div style={styles.bandeau}>
      <div style={styles.spinner}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
      <span style={styles.texte}>
        Reconnexion… {secondes > 0 ? `(${secondes}s)` : ''}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bandeau: {
    position: 'fixed',
    top: 'env(safe-area-inset-top, 0px)',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px',
    zIndex: 99998,
    background: 'rgba(245, 158, 11, 0.95)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.5)',
    animation: 'slideDown 0.3s ease-out',
    backdropFilter: 'blur(10px)',
    whiteSpace: 'nowrap' as const,
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texte: {
    fontSize: '13px',
  },
};
