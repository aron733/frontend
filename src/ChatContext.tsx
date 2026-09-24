import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNotification } from './NotificationContext';

const WS_URL = 'wss://ws.vokyvo.com/ws/chat/';

// Flag global : arret de la reconnexion si banni
let STOP_RECONNECT = false;

type Message = {
  id?: number;
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
  setPresenceFromRest: (userId: number | string, estEnLigne: boolean, derniereActivite: string | null) => void;
  envoyer: (payload: any) => boolean;
};

const ChatContext = createContext<ChatCtx>({} as ChatCtx);
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { notifier } = useNotification();
  const notifierRef = useRef(notifier);
  useEffect(() => { notifierRef.current = notifier; }, [notifier]);
  const [connecte, setConnecte] = useState(false);
  const [convActive, setConvActive] = useState<string | null>(null);
  const [messagesParConv, setMessagesParConv] = useState<Record<string, Message[]>>({});
  const [presence, setPresence] = useState<Record<string, string>>({});
  const [presenceTime, setPresenceTime] = useState<Record<string, string>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const connecterRef = useRef<(() => void) | null>(null);
  const convActiveRef = useRef<string | null>(null);

  // Garde la conv active à jour dans la ref (pour le onmessage)
  useEffect(() => {
    convActiveRef.current = convActive;
  }, [convActive]);


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
    let reconnectDelay = 0;

    const connecter = () => {
      if (!actif || STOP_RECONNECT) return;

      const token = localStorage.getItem('access_token');
      if (!token) {
        setTimeout(connecter, 2000);
        return;
      }

      try {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
          console.log('🌐 WS Global connecté');
          reconnectDelay = 0; // Reset backoff
          setConnecte(true);
          // Notifie les pages de se resynchroniser (messages manques)
          window.dispatchEvent(new CustomEvent('ws-reconnect'));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const myId = userData.user_id;

            if (data.type === 'message') {
              // Ignore ses propres messages
              if (String(data.from_user_id) === String(myId)) return;

              // Son de notification (message reçu)
              try {
                const audio = new Audio('/ping.mp3');
                audio.volume = 0.4;
                audio.play().catch(() => {});
              } catch (e) {}

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
                notifierRef.current(
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

            if (data.type === 'badge_update') {
              // Met à jour le badge du user dans le localStorage
              const userData = JSON.parse(localStorage.getItem('user') || '{}');
              const updated = {
                ...userData,
                badge_verifie: data.badge_verifie,
              };
              localStorage.setItem('user', JSON.stringify(updated));

              // Force un refresh de l'app pour refléter le changement
              // (Profil, Chat, etc. lisent depuis localStorage)
              window.dispatchEvent(new CustomEvent('user-updated', { detail: updated }));
            }

            if (data.type === 'user_banned' || data.type === 'global_banned') {
              // STOP la reconnexion auto
              STOP_RECONNECT = true;

              // Supprime les tokens
              try {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                localStorage.removeItem('vokyvo_page');
              } catch (e) {}

              // Stocke la raison + le type
              try {
                localStorage.setItem('ban_raison', data.raison || 'Non spécifiée');
                localStorage.setItem('ban_type', data.type); // 'user_banned' ou 'global_banned'
              } catch (e) {}

              // Redirige vers la landing (elle affichera le message)
              window.location.href = '/';
            }
          } catch (e) {
            console.warn('WS parse err:', e);
          }
        };

        ws.onclose = () => {
          setConnecte(false);
          if (actif && !STOP_RECONNECT) {
            // Backoff court : 300ms -> 600ms -> 1.2s -> 3s max
            reconnectDelay = Math.min(reconnectDelay * 2 || 100, 3000);
            setTimeout(connecter, reconnectDelay);
          }
        };

        ws.onerror = () => {
          // Rien (onclose gerera le backoff)
        };
        wsRef.current = ws;
      } catch (e) {
        console.warn('WS err:', e);
        if (actif && !STOP_RECONNECT) setTimeout(connecter, 3000);
      }
    };

    connecterRef.current = connecter;
    connecter();

    return () => {
      actif = false;
      wsRef.current?.close();
    };
  }, []);

  // Reconnexion IMMEDIATE au retour sur l'app (visibility / online)
  useEffect(() => {
    const reconnecterImmediat = () => {
      if (STOP_RECONNECT) return;
      const ws = wsRef.current;
      if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        connecterRef.current?.();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') reconnecterImmediat();
    };
    const onOnline = () => reconnecterImmediat();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, []);  // notifier via notifierRef (evite reconnexion WS)

  // Keep-alive : ping toutes les 10s pour garder le WS ouvert
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

  // Initialise la presence depuis les donnees REST (pour les users deja hors ligne)
  const setPresenceFromRest = (userId: number | string, estEnLigne: boolean, derniereActivite: string | null) => {
    setPresence((prev) => ({ ...prev, [userId]: estEnLigne ? 'online' : 'offline' }));
    if (derniereActivite) {
      setPresenceTime((prev) => {
        const ancien = prev[userId];
        // Garde TOUJOURS la date la plus recente (WS > REST)
        if (ancien) {
          try {
            const dAncien = new Date(ancien).getTime();
            const dNouveau = new Date(derniereActivite).getTime();
            if (dAncien > dNouveau) return prev; // On garde l'ancien (plus recent)
          } catch (e) {}
        }
        return { ...prev, [userId]: derniereActivite };
      });
    }
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
        setPresenceFromRest,
        envoyer,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
