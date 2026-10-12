import { useState, useEffect } from 'react';

const TEXTES = [
  'Réflexion',
  'Une seconde',
  'Analyse en cours',
  'Je formule ma réponse',
  'Rédaction',
  'Je vérifie',
];

export default function LoaderIA() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % TEXTES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.wrap}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a8b0ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={styles.spinner}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span style={styles.texte}>{TEXTES[index]}</span>
      <style>{`
        @keyframes loaderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loaderFade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#2a2a3e',
    borderRadius: '16px',
    alignSelf: 'flex-start',
    marginLeft: '38px',
  },
  spinner: {
    animation: 'loaderSpin 1s linear infinite',
    flexShrink: 0,
  },
  texte: {
    color: '#c8c8e0',
    fontSize: '13.5px',
    fontWeight: 500,
    animation: 'loaderFade 2s ease-in-out infinite',
    letterSpacing: '0.2px',
  },
};

export default LoaderIA;
