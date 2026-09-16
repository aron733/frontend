import { useState } from 'react';

interface CoursProps {
  onRetour?: () => void;
}

function Cours({ onRetour }: CoursProps) {
  const [etape, setEtape] = useState<'accueil' | 'upload' | 'lecture' | 'chat' | 'quizz'>('accueil');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => onRetour ? onRetour() : null}
          style={styles.backButton}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 style={styles.title}>Cours</h2>
      </div>

      <div style={styles.body}>
        <p style={styles.placeholder}>Page Cours en construction</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#0a0a0f',
    zIndex: 1000,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    background: 'rgba(17,17,32,0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  backButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
  },
  title: {
    color: 'white',
    margin: 0,
    fontSize: '17px',
    fontWeight: 600,
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#666',
    fontSize: '16px',
  },
};

export default Cours;
