import React from 'react';

interface BottomNavProps {
  pageActive: string;
  setPageActive: (page: any) => void;
}

export default function BottomNav({ pageActive, setPageActive }: BottomNavProps) {
  const tabs = [
    {
      id: 'vokyvo',
      label: 'Vokyvo AI',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Chat',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'news',
      label: 'News',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M18 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
          <line x1="6" y1="8" x2="12" y2="8" />
          <line x1="6" y1="12" x2="12" y2="12" />
          <line x1="6" y1="16" x2="10" y2="16" />
        </svg>
      ),
    },
    {
      id: 'profil',
      label: 'Profil',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div style={styles.nav}>
      {tabs.map((tab) => {
        const estActif = pageActive === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setPageActive(tab.id)}
            style={{
              ...styles.btn,
              color: estActif ? '#667eea' : '#888',
            }}
          >
            {tab.icon}
            <span style={{ ...styles.label, color: estActif ? '#667eea' : '#888' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65px',
    background: '#0a0a0f',
    borderTop: '1px solid #2a2a3e',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    paddingBottom: '5px',
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '5px 10px',
    transition: 'all 0.2s',
  },
  label: {
    fontSize: '11px',
    fontWeight: 500,
  },
};
