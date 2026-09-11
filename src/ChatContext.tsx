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
};

type ChatCtx = {
  wsRef: React.MutableRefObject<WebSocket | null>;
  connecte: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  presence: Record<string, string>;
  presenceTime: Record<string, string>;
  envoyer: (payload: any) => boolean;
};

const ChatContext = createContext<ChatCtx>({} as ChatCtx);
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { notifier } = useNotification();
  const [connecte, setConnecte] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presence, setPresence] = useState<Record<string, string>>({});
  const [presenceTime, setPresenceTime] = useState<Record<string, string>>({});
  const wsRef = useRef<WebSocket | null>(null);

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
            const myId = JSON.parse(localStorage.getItem('user') || '{}').user_id;

            if (data.type === 'message') {
              if (String(data.from_user_id) === String(myId)) return;
              setMessages((prev) => [...prev, {
                type: 'message',
                message: data.message || '',
                from_user_id: data.from_user_id,
                from_username: data.from_username,
                fichier_url: data.fichier_url || null,
              }]);

              notifier(
                data.from_username || 'Nouveau message',
                data.message || 'Fichier reçu'
              );
            }

            if (data.type === 'presence') {
              setPresence((prev) => ({ ...prev, [data.user_id]: data.status }));
              setPresenceTime((prev) => ({ ...prev, [data.user_id]: data.timestamp || new Date().toISOString() }));
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

  const envoyer = (payload: any): boolean => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  return (
    <ChatContext.Provider value={{ wsRef, connecte, messages, setMessages, presence, presenceTime, envoyer }}>
      {children}
    </ChatContext.Provider>
  );
}
