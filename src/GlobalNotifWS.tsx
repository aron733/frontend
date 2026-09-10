import { useEffect, useRef } from 'react';
import { useNotification } from './NotificationContext';

const WS_URL = 'wss://daphne-5mxe.onrender.com/ws/chat/';

export default function GlobalNotifWS() {
  const { notifier } = useNotification();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let actif = true;


    const connecter = () => {
      if (!actif) return;

      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
          console.log('🔔 WS Notif global connecté');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const myId = JSON.parse(localStorage.getItem('user') || '{}').user_id;

            if (data.type === 'message' && String(data.from_user_id) !== String(myId)) {
              notifier(
                data.from_username || 'Nouveau message',
                data.message || 'Fichier reçu'
              );
            }
          } catch (e) {
            console.warn('WS Notif parse err:', e);
          }
        };

        ws.onclose = () => {
          if (actif) setTimeout(connecter, 2000);
        };

        ws.onerror = () => {
          // Silencieux — on retente via onclose
        };

        wsRef.current = ws;
      } catch (e) {
        console.warn('WS Notif err:', e);
        if (actif) setTimeout(connecter, 3000);
      }
    };


    connecter();

    return () => {
      actif = false;
      wsRef.current?.close();
    };
  }, [notifier]);

  return null;
}
