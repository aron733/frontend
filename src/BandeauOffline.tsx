import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export default function BandeauOffline() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // État initial
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setOffline(!status.connected);
    };
    checkNetwork();

    // Écoute les changements
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>Pas de connexion Internet</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bandeau: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    background: '#dc3545',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    animation: 'slideDown 0.3s ease-out',
  },
};
