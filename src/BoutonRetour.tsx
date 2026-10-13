interface Props {
  onClick: () => void;
  size?: number;
}

export default function BoutonRetour({ onClick, size = 22 }: Props) {
  return (
    <button onClick={onClick} style={styles.btn} title="Retour">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255,255,255,0.06)',
    color: '#eee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
    transition: 'all 0.15s',
  },
};
