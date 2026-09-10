import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Notification = {
  id: number;
  titre: string;
  message: string;
  onClick?: () => void;
};

type Ctx = {
  notifier: (titre: string, message: string, onClick?: () => void) => void;
};

const NotificationContext = createContext<Ctx>({ notifier: () => {} });

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const notifier = (titre: string, message: string, onClick?: () => void) => {
    const id = Date.now();
    setNotifs((prev) => [...prev, { id, titre, message, onClick }]);
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const retirer = (id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifier }}>
      {children}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999, pointerEvents: 'none' }}>
        {notifs.map((n, i) => (
          <div
            key={n.id}
            onClick={() => {
              if (n.onClick) n.onClick();
              retirer(n.id);
            }}
            style={{
              margin: '10px auto',
              maxWidth: '500px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '14px 18px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(102,126,234,0.4)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'slideDown 0.3s ease-out',
              transform: `translateY(${i * 5}px)`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
              {n.titre}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95 }}>{n.message}</div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}
