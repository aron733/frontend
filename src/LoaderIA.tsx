const TEXTES = [
  'Réflexion',
  'Une seconde',
  'Analyse en cours',
  'Je formule ma réponse',
  'Rédaction',
  'Je vérifie',
];

interface Props {
  index: number;
}

export default function LoaderIA({ index }: Props) {
  const texte = TEXTES[index % TEXTES.length];

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
      <span style={styles.texte}>{texte}</span>
      <style>{`
        @keyframes loaderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
    letterSpacing: '0.2px',
  },
};
