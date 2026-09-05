import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function Landing({ onLogin }: { onLogin: (data: any) => void }) {
  const [mode, setMode] = useState<'inscription' | 'connexion'>('connexion');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    prenom: '',
    nom: '',
    age: '',
    sexe: 'M',
    numero: '',
    pays: ''
  });
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cookiesAcceptes, setCookiesAcceptes] = useState(localStorage.getItem('cookies_acceptes') === 'true');
  const [showPolitique, setShowPolitique] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInscription = async () => {
    setLoading(true);
    setErreur('');
    setMessage('');
    try {
      await axios.post(`${API_URL}/inscription/`, form);
      setMessage('Compte créé ! Connecte-toi maintenant.');
      setMode('connexion');
      setForm({ ...form, password: '' });
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleConnexion = async () => {
    setLoading(true);
    setErreur('');
    try {
      const response = await axios.post(`${API_URL}/connexion/`, {
        email: form.email,
        password: form.password
      });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      onLogin(response.data);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || err.response?.data?.raison || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const accepterCookies = () => {
    localStorage.setItem('cookies_acceptes', 'true');
    setCookiesAcceptes(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'connexion') {
      await handleConnexion();
    } else {
      await handleInscription();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>VOKYVO</h1>
        <p style={styles.subtitle}>Ta plateforme tout-en-un</p>

        <div style={styles.switchContainer}>
          <button
            onClick={() => { setMode('connexion'); setErreur(''); setMessage(''); }}
            style={{ ...styles.switchButton, background: mode === 'connexion' ? '#667eea' : 'transparent', color: mode === 'connexion' ? 'white' : '#aaa' }}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode('inscription'); setErreur(''); setMessage(''); }}
            style={{ ...styles.switchButton, background: mode === 'inscription' ? '#667eea' : 'transparent', color: mode === 'inscription' ? 'white' : '#aaa' }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'inscription' ? (
            <>
              <input type="text" name="nom" placeholder="Nom" onChange={handleChange} style={styles.input} />
              <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} style={styles.input} />
              <input type="number" name="age" placeholder="Âge" onChange={handleChange} style={styles.input} />
              <select name="sexe" onChange={handleChange} style={styles.input}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="A">Autre</option>
              </select>
              <input type="text" name="numero" placeholder="Numéro" onChange={handleChange} style={styles.input} />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
              <input type="text" name="username" placeholder="Pseudo" onChange={handleChange} required style={styles.input} />
              <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required style={styles.input} />
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? '...' : "S'inscrire"}
              </button>
            </>
          ) : (
            <>
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.input} />
              <input type="password" name="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required style={styles.input} />
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? '...' : 'Se connecter'}
              </button>
            </>
          )}
        </form>

        {message && <p style={styles.success}>{message}</p>}
        {erreur && <p style={styles.error}>{erreur}</p>}
      </div>

      {/* Bandeau cookies RGPD */}
      {!cookiesAcceptes && (
        <div style={styles.cookieBanner}>
          <p style={styles.cookieText}>
            VOKYVO LABS utilise des cookies essentiels.
            <a href="#" onClick={(e) => { e.preventDefault(); setShowPolitique(true); }} style={styles.cookieLink}>Politique de confidentialité</a>
          </p>
          <button onClick={accepterCookies} style={styles.cookieBtn}>Accepter</button>
        </div>
      )}

      {/* Modal politique de confidentialité */}
      {showPolitique && (
        <div style={styles.overlay} onClick={() => setShowPolitique(false)}>
          <div style={styles.politiquePanel} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.politiqueTitle}>Politique de confidentialité</h2>
            <div style={styles.politiqueContent}>
              <h3>1. Collecte des données</h3>
              <p>VOKYVO LABS collecte les données suivantes lors de l'inscription : nom, prénom, email, âge, sexe, numéro de téléphone, pays. Ces informations sont nécessaires pour créer votre compte et fournir nos services.</p>
              
              <h3>2. Utilisation des données</h3>
              <p>Vos données sont utilisées pour : la création de votre profil, la mise en relation avec d'autres utilisateurs, l'envoi de notifications, l'amélioration de nos services. Nous ne vendons JAMAIS vos données personnelles à des tiers.</p>
              
              <h3>3. Cookies</h3>
              <p>Nous utilisons des cookies essentiels au fonctionnement du service : cookies de session pour vous garder connecté, cookies de préférences pour vos paramètres. Aucun cookie publicitaire n'est utilisé.</p>
              
              <h3>4. Stockage des données</h3>
              <p>Vos données sont stockées de manière sécurisée sur des serveurs en Europe et aux États-Unis via nos partenaires certifiés (Render, Cloudinary). Les mots de passe sont chiffrés avec des algorithmes robustes.</p>
              
              <h3>5. Vos droits (RGPD)</h3>
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité, d'opposition. Pour exercer ces droits, contactez-nous à aronvokouma01@gmail.com.</p>
              
              <h3>6. Sécurité</h3>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données, accès restreint, surveillance continue, sauvegardes régulières.</p>
              
              <h3>7. Conservation</h3>
              <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment. Les données sont supprimées sous 30 jours après la demande.</p>
              
              <h3>8. Contact</h3>
              <p>Pour toute question concernant vos données : aronvokouma01@gmail.com</p>
              
              <h3>9. Modifications</h3>
              <p>Cette politique peut être mise à jour. Les modifications seront publiées sur cette page. Dernière mise à jour : 5 septembre 2026.</p>
            </div>
            <button onClick={() => setShowPolitique(false)} style={styles.cookieBtn}>Fermer</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 VOKYVO LABS - Tous droits réservés</p>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Confidentialité</a>
          <a href="#" style={styles.footerLink}>Conditions</a>
          <a href="#" style={styles.footerLink}>RGPD</a>
        </div>
        <a href="https://stats.uptimerobot.com/0DXeqdPiLO" target="_blank" style={styles.uptime}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#28a745">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Status
        </a>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100dvh',
    maxHeight: '100dvh',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '15px',
    gap: '15px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '25px 20px',
    maxWidth: '400px',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  logo: { textAlign: 'center' as const, color: 'white', fontSize: '32px', marginBottom: '5px', fontWeight: 900 as const, letterSpacing: '3px' },
  subtitle: { textAlign: 'center' as const, color: '#aaa', marginBottom: '30px' },
  switchContainer: { display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '5px' },
  switchButton: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', transition: 'all 0.3s' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  input: { padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const },
  submitButton: { padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  success: { color: '#28a745', textAlign: 'center' as const, marginTop: '15px' },
  cookieBanner: {
    position: 'fixed' as const,
    bottom: '60px',
    left: '8px',
    right: '8px',
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  cookieText: { color: '#aaa', fontSize: '12px', margin: 0, flex: 1 },
  cookieLink: { color: '#667eea', textDecoration: 'none' },
  cookieBtn: {
    padding: '8px 15px',
    borderRadius: '10px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  footer: {
    padding: '10px',
    textAlign: 'center' as const,
    borderTop: '1px solid #1a1a2a',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    flexShrink: 0,
  },
  footerText: { color: '#555', fontSize: '10px', margin: 0 },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: '20px' },
  footerLink: { color: '#667eea', fontSize: '10px', textDecoration: 'none' },
  uptime: {
    color: '#28a745',
    fontSize: '11px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    justifyContent: 'center',
  },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
  },
  politiquePanel: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '15px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    padding: '15px',
  },
  politiqueTitle: { color: '#667eea', fontSize: '18px', marginBottom: '10px', textAlign: 'center' as const },
  politiqueContent: { color: '#aaa', fontSize: '12px', lineHeight: 1.6 },
  error: { color: '#dc3545', textAlign: 'center' as const, marginTop: '15px' },
};

export default Landing;
