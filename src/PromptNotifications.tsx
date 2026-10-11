import { useState, useEffect } from 'react';
import { useChat } from './ChatContext';
import { demanderPermissionNotifications } from './notifications';
import { Capacitor } from '@capacitor/core';

export default function PromptNotifications() {
  const { messagesParConv } = useChat();
  const [affiche, setAffiche] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dernierMessageVu, setDernierMessageVu] = useState<number>(0);

  useEffect(() => {
    // Sur APK (Capacitor), Web Push ne marche pas → on skip (FCM à venir)
    if (Capacitor.isNativePlatform()) return;
    // Vérifier que Notification est supporté
    if (typeof Notification === 'undefined') return;
    // Vérifier si déjà activé
    if (Notification.permission === 'granted') return;
    if (localStorage.getItem('prompt_notifs_dismiss') === 'true') return;

    // Compter les messages totaux
    let total = 0;
    if (messagesParConv && typeof messagesParConv === 'object') {
      Object.values(messagesParConv).forEach((msgs: any) => {
        if (Array.isArray(msgs)) total += msgs.length;
      });
    }

    // Si nouveau message reçu et prompt pas affiché
    if (total > dernierMessageVu && dernierMessageVu > 0) {
      setAffiche(true);
    }
    setDernierMessageVu(total);
  }, [messagesParConv, dernierMessageVu]);

  const activer = async () => {
    setLoading(true);
    const ok = await demanderPermissionNotifications();
    setLoading(false);
    if (ok) {
      setAffiche(false);
      localStorage.setItem('prompt_notifs_dismiss', 'true');
    }
  };

  const plusTard = () => {
    setAffiche(false);
    // Réafficher après 1h
    const date = Date.now() + 60 * 60 * 1000;
    localStorage.setItem('prompt_notifs_dismiss_until', String(date));
  };

  if (!affiche) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.icon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <h3 style={styles.title}>Active les notifications</h3>
        <p style={styles.text}>
          Ne rate plus aucun message important. Tu recevras une alerte quand quelqu'un t'écrit, même quand VOKYVO est fermé.
        </p>
        <div style={styles.buttons}>
          <button onClick={plusTard} style={styles.btnSecondaire} disabled={loading}>
            Plus tard
          </button>
          <button onClick={activer} style={styles.btnPrimaire} disabled={loading}>
            {loading ? 'Activation…' : 'Activer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 99997,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '20px',
    padding: '30px 24px',
    maxWidth: '380px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  icon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 12px 0',
  },
  text: {
    color: '#a8a8c0',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: '0 0 24px 0',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
  },
  btnPrimaire: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSecondaire: {
    flex: 1,
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
