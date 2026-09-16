import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface VokyvoPlusProps {
  onRetour?: () => void;
}

function VokyvoPlus({ onRetour }: VokyvoPlusProps) {
  const [badgeDemande, setBadgeDemande] = useState(false);
  const [badgeVerifie, setBadgeVerifie] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const getToken = () => localStorage.getItem('access_token') || '';

  useEffect(() => {
    const chargerStatut = async () => {
      try {
        const res = await axios.get(`${API_URL}/statut-badge/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setBadgeDemande(res.data.badge_demande);
        setBadgeVerifie(res.data.badge_verifie);
      } catch (e) {}
    };
    chargerStatut();
  }, []);

  const demanderBadge = async () => {
    setLoading(true);
    setErreur('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/demander-badge/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessage(res.data.message);
      setBadgeDemande(true);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => onRetour?.()} style={styles.backButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 style={styles.title}>VOKYVO+</h2>
      </div>

      <div style={styles.body}>
        <div style={styles.iconWrap}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M10 7V5h4v2" />
            <path d="M12 12v4" />
            <path d="M10 14h4" />
          </svg>
        </div>

        <h3 style={styles.heroTitle}>VOKYVO+</h3>
        <p style={styles.heroText}>
          Obtiens ton badge vérifié et rejoins les comptes officiels de VOKYVO.
        </p>

        {!badgeVerifie && !badgeDemande && (
          <button onClick={demanderBadge} disabled={loading} style={styles.btnPrimaire}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}/>
                </svg>
                Envoi...
              </span>
            ) : 'Demander le badge'}
          </button>
        )}

        {badgeDemande && !badgeVerifie && (
          <div style={styles.infoBox}>
            <p style={styles.infoTitle}>Demande en cours d'examen</p>
            <p style={styles.infoText}>Nous reviendrons vers toi prochainement.</p>
          </div>
        )}

        {badgeVerifie && (
          <div style={styles.successBox}>
            <p style={styles.successTitle}>Badge VOKYVO+ activé</p>
            <p style={styles.successText}>Ton compte est vérifié.</p>
          </div>
        )}

        {message && <p style={styles.message}>{message}</p>}
        {erreur && <p style={styles.erreur}>{erreur}</p>}

        <div style={styles.features}>
          <p style={styles.featuresTitle}>Bientôt disponible sur VOKYVO+</p>
          <div style={styles.featureItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Badge vérifié sur ton profil
          </div>
          <div style={styles.featureItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Statistiques avancées
          </div>
          <div style={styles.featureItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Support prioritaire
          </div>
          <div style={styles.featureItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Fonctionnalités exclusives
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' as const, background: '#0a0a0f', zIndex: 1000 },
  header: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: 'rgba(17,17,32,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  backButton: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px' },
  title: { color: 'white', margin: 0, fontSize: '17px', fontWeight: 600 },
  body: { flex: 1, overflowY: 'auto' as const, padding: '30px 20px', textAlign: 'center' as const },
  iconWrap: { width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(102,126,234,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  heroTitle: { color: 'white', fontSize: '26px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '2px' },
  heroText: { color: '#888', fontSize: '14px', margin: '0 0 25px', lineHeight: 1.5, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' },
  btnPrimaire: { padding: '14px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  infoBox: { background: 'rgba(240,173,78,0.1)', border: '1px solid rgba(240,173,78,0.3)', borderRadius: '12px', padding: '16px', marginTop: '15px' },
  infoTitle: { color: '#f0ad4e', fontSize: '15px', fontWeight: 600, margin: '0 0 6px' },
  infoText: { color: '#aaa', fontSize: '13px', margin: 0 },
  successBox: { background: 'rgba(40,167,69,0.1)', border: '1px solid rgba(40,167,69,0.3)', borderRadius: '12px', padding: '16px', marginTop: '15px' },
  successTitle: { color: '#28a745', fontSize: '15px', fontWeight: 600, margin: '0 0 6px' },
  successText: { color: '#aaa', fontSize: '13px', margin: 0 },
  message: { color: '#28a745', marginTop: '12px', fontSize: '14px' },
  erreur: { color: '#dc3545', marginTop: '12px', fontSize: '14px' },
  features: { marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', textAlign: 'left' as const },
  featuresTitle: { color: '#667eea', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 15px' },
  featureItem: { color: '#ccc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
};

export default VokyvoPlus;
