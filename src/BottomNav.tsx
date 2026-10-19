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
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
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
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
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
