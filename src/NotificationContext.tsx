import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Notification = {
  id: number;
  titre: string;
  message: string;
  count: number;
  onClick?: () => void;
};

type Ctx = {
  notifier: (titre: string, message: string, onClick?: () => void) => void;
};

const NotificationContext = createContext<Ctx>({ notifier: () => {} });

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notif, setNotif] = useState<Notification | null>(null);

  const notifier = (titre: string, message: string, onClick?: () => void) => {
    setNotif((prev) => {
      // Si une notif est déjà affichée avec le même titre (ex: même expéditeur)
      if (prev && prev.titre === titre) {
        return {
          ...prev,
          count: prev.count + 1,
          message: message,
          id: Date.now(),
        };
      }
      return {
        id: Date.now(),
        titre,
        message,
        count: 1,
        onClick,
      };
    });
  };

  // Auto-dismiss après 4 secondes
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 4000);
    return () => clearTimeout(t);
  }, [notif?.id]);

  const retirer = () => setNotif(null);

  return (
    <NotificationContext.Provider value={{ notifier }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 0px)',
          left: 0,
          right: 0,
          zIndex: 999999,
          pointerEvents: 'none',
          paddingTop: '10px',
        }}
      >
        {notif && (
          <div
            key={notif.id}
            onClick={() => {
              if (notif.onClick) notif.onClick();
              retirer();
            }}
            style={{
              margin: '0 auto',
              maxWidth: '500px',
              width: 'calc(100% - 20px)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '14px 18px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(102,126,234,0.4)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'slideDown 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {notif.titre}
              </div>
              {notif.count > 1 && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  ×{notif.count}
                </div>
              )}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95 }}>{notif.message}</div>
          </div>
        )}
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
