import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export default function BandeauOffline() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setOffline(!status.connected);
    };
    checkNetwork();

    const listener = Network.addListener('networkStatusChange', (status) => {
      setOffline(!status.connected);
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  if (!offline) return null;

  return (
    <div style={styles.bandeau}>
      <div style={styles.iconWrap}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      <div style={styles.textWrap}>
        <div style={styles.titre}>Pas de connexion Internet</div>
        <div style={styles.sousTitre}>Vérifie ta connexion et réessaie</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bandeau: {
    position: 'fixed',
    top: 'env(safe-area-inset-top, 0px)',
    left: 0,
    right: 0,
    zIndex: 99999,
    background: 'linear-gradient(135deg, #dc3545 0%, #a01a2a 100%)',
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 4px 20px rgba(220, 53, 69, 0.4)',
    animation: 'slideDown 0.3s ease-out',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  titre: {
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    marginBottom: '1px',
  },
  sousTitre: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 500,
  },
};
