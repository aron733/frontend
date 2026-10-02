function BandeauRentree() {
  return (
    <div style={styles.bandeau}>
      <div style={styles.texte}>
        🎓 BONNE RENTRÉE SCOLAIRE AUX ÉLÈVES ET ÉTUDIANTS 🎓 &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🎓 BONNE RENTRÉE SCOLAIRE AUX ÉLÈVES ET ÉTUDIANTS 🎓 &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🎓 BONNE RENTRÉE SCOLAIRE AUX ÉLÈVES ET ÉTUDIANTS 🎓 &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
      </div>
      <style>{`
        @keyframes bandeauDefile {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  bandeau: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
    paddingBottom: '8px',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  texte: {
    display: 'inline-block',
    paddingLeft: '100%',
    animation: 'bandeauDefile 30s linear infinite',
    letterSpacing: '0.5px',
  },
};

export default BandeauRentree;
