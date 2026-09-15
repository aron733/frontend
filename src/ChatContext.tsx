import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNotification } from './NotificationContext';

const WS_URL = 'wss://daphne-5mxe.onrender.com/ws/chat/';

type Message = {
  type: string;
  message: string;
  from_user_id: number | string;
  from_username: string;
  fichier_url: string | null;
  audio_url?: string | null;
  lu?: boolean;
};

type ChatCtx = {
  connecte: boolean;
  convActive: string | null;
  setConvActive: (convId: string | null) => void;
  messagesParConv: Record<string, Message[]>;
  ajouterMessage: (convId: string, msg: Message) => void;
  setMessagesConv: (convId: string, msgs: Message[]) => void;
  presence: Record<string, string>;
  presenceTime: Record<string, string>;
  envoyer: (payload: any) => boolean;
};

const ChatContext = createContext<ChatCtx>({} as ChatCtx);
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { notifier } = useNotification();
  const [connecte, setConnecte] = useState(false);
  const [convActive, setConvActive] = useState<string | null>(null);
  const [messagesParConv, setMessagesParConv] = useState<Record<string, Message[]>>({});
  const [presence, setPresence] = useState<Record<string, string>>({});
  const [presenceTime, setPresenceTime] = useState<Record<string, string>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const convActiveRef = useRef<string | null>(null);

  // Garde la conv active à jour dans la ref (pour le onmessage)
  useEffect(() => {
    convActiveRef.current = convActive;
  }, [convActive]);


  // Marque en ligne au démarrage + hors ligne au déchargement
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // En ligne
    fetch('https://django-43v1.onrender.com/api/presence/en-ligne/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});

    // Hors ligne au déchargement
    const handleUnload = () => {
      const t = localStorage.getItem('access_token');
      if (!t) return;
      fetch('https://django-43v1.onrender.com/api/presence/hors-ligne/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
        keepalive: true
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleUnload);
  }, []);

  // Ping /presence/en-ligne/ toutes les 60s pour garder derniere_activite fraîche
  useEffect(() => {
    const ping = () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      fetch('https://django-43v1.onrender.com/api/presence/en-ligne/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    };
    const interval = setInterval(ping, 60000);
    return () => clearInterval(interval);
  }, []);

  const ajouterMessage = (convId: string, msg: Message) => {
    setMessagesParConv((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), msg],
    }));
  };

  const setMessagesConv = (convId: string, msgs: Message[]) => {
    setMessagesParConv((prev) => ({ ...prev, [convId]: msgs }));
  };

  useEffect(() => {
    let actif = true;

    const connecter = () => {
      if (!actif) return;

      const token = localStorage.getItem('access_token');
      if (!token) {
        setTimeout(connecter, 2000);
        return;
      }

      try {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
          console.log('🌐 WS Global connecté');
          setConnecte(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const myId = userData.user_id;

            if (data.type === 'message') {
              // Ignore ses propres messages
              if (String(data.from_user_id) === String(myId)) return;

              const msg: Message = {
                type: 'message',
                message: data.message || '',
                from_user_id: data.from_user_id,
                from_username: data.from_username,
                fichier_url: data.fichier_url || null,
              };

              // Détermine dans quelle conv ajouter
              const active = convActiveRef.current;
              let convId: string;
              if (active && active.startsWith('groupe_')) {
                // Message de groupe → met dans la conv groupe active
                convId = active;
              } else {
                // Message privé → conv avec l'émetteur
                convId = `user_${data.from_user_id}`;
              }

              // Ajoute au state
              setMessagesParConv((prev) => ({
                ...prev,
                [convId]: [...(prev[convId] || []), msg],
              }));

              // Notifie si la conv n'est PAS active
              if (convActiveRef.current !== convId) {
                notifier(
                  data.from_username || 'Nouveau message',
                  data.message || 'Fichier reçu'
                );
              }
            }

            if (data.type === 'presence') {
              setPresence((prev) => ({ ...prev, [data.user_id]: data.status }));
              setPresenceTime((prev) => ({
                ...prev,
                [data.user_id]: data.timestamp || new Date().toISOString(),
              }));
            }
          } catch (e) {
            console.warn('WS parse err:', e);
          }
        };

        ws.onclose = () => {
          setConnecte(false);
          if (actif) setTimeout(connecter, 2000);
        };

        ws.onerror = () => {};
        wsRef.current = ws;
      } catch (e) {
        console.warn('WS err:', e);
        if (actif) setTimeout(connecter, 3000);
      }
    };

    connecter();

    return () => {
      actif = false;
      wsRef.current?.close();
    };
  }, [notifier]);

  // Keep-alive : ping toutes les 10s pour garder le WS ouvert (Render Free coupe à ~21s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'ping' }));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const envoyer = (payload: any): boolean => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  return (
    <ChatContext.Provider
      value={{
        connecte,
        convActive,
        setConvActive,
        messagesParConv,
        ajouterMessage,
        setMessagesConv,
        presence,
        presenceTime,
        envoyer,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
