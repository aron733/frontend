export default function NotFound({ onRetour }: { onRetour?: () => void }) {
  const retour = () => {
    if (onRetour) {
      onRetour();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>VOKYVO</h1>
        <div style={styles.code}>404</div>
        <h2 style={styles.title}>Page introuvable</h2>
        <p style={styles.text}>
          La page que tu cherches n'existe pas ou a été déplacée.
        </p>
        <button onClick={retour} style={styles.btn}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '20px',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  logo: {
    fontSize: '44px',
    fontWeight: 900,
    letterSpacing: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
    margin: 0,
    animation: 'gradientShift 3s ease-in-out infinite',
  },
  code: {
    fontSize: '120px',
    fontWeight: 900,
    color: '#1a1a2e',
    letterSpacing: '8px',
    lineHeight: 1,
    marginBottom: '20px',
    textShadow: '0 0 40px rgba(102,126,234,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  text: {
    color: '#888',
    fontSize: '15px',
    marginBottom: '30px',
    lineHeight: 1.6,
  },
  btn: {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(102,126,234,0.3)',
    fontFamily: 'inherit',
  },
};
