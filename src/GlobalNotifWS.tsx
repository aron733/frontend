import { useEffect, useRef } from 'react';
import { useNotification } from './NotificationContext';

const WS_URL = 'wss://daphne-5mxe.onrender.com/ws/chat/';

export default function GlobalNotifWS() {
  const { notifier } = useNotification();
  const wsRef = useRef<WebSocket | null>(null);
  const usernamesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    let actif = true;

    const chargerUsernames = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'https://django-43v1.onrender.com/api';
        const res = await fetch(apiUrl + '/rechercher-users/?q=%20', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();
        const map: Record<string, string> = {};
        (data.users || []).forEach((u: any) => {
          if (u.id) map[String(u.id)] = u.username || u.first_name || 'Utilisateur';
        });
        usernamesRef.current = map;
      } catch (e) {
        console.warn('Chargement usernames echoue', e);
      }
    };

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
                usernamesRef.current[String(data.from_user_id)] || data.from_username || 'Nouveau message',
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

    chargerUsernames();

    connecter();

    return () => {
      actif = false;
      wsRef.current?.close();
    };
  }, [notifier]);

  return null;
}
