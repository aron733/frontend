import { useState, useEffect } from 'react';
import axios from 'axios';
// import { loginOneSignal } from '../onesignal';
import pkg from '../../package.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const VERSION = pkg.version;

function Landing({ onLogin }: { onLogin: (data: any) => void }) {
  const [mode, setMode] = useState<'inscription' | 'connexion'>('connexion');
  const [form, setForm] = useState({
    email: '',
    password: '',
    prenom: '',
    nom: '',
    age: '',
    sexe: 'M',
    numero: '',
    pays: 'Burkina Faso'
  });
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [ecranSucces, setEcranSucces] = useState<{type: 'inscription' | 'connexion', prenom?: string, userData?: any} | null>(null);
  const [otpRequis, setOtpRequis] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [tempsRestant, setTempsRestant] = useState(300);
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [modeForgot, setModeForgot] = useState<null | 'email' | 'otp' | 'nouveau_mdp' | 'succes'>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNouveauMdp, setForgotNouveauMdp] = useState('');
  const [forgotConfirmMdp, setForgotConfirmMdp] = useState('');
  const [loading, setLoading] = useState(false);
  const [indicatif, setIndicatif] = useState('+226');
  const [cookiesAcceptes, setCookiesAcceptes] = useState(localStorage.getItem('cookies_acceptes') === 'true');
  const [showPolitique, setShowPolitique] = useState(false);
  const estDansAPK = navigator.userAgent.includes('wv') || navigator.userAgent.includes('Capacitor');
  const [showConditions, setShowConditions] = useState(false);
  const [banRaison, setBanRaison] = useState<string | null>(() => {
    const r = localStorage.getItem('ban_raison');
    if (r) {
      localStorage.removeItem('ban_raison');
      return r;
    }
    return null;
  });
  const [banType, setBanType] = useState<string | null>(() => {
    const t = localStorage.getItem('ban_type');
    if (t) {
      localStorage.removeItem('ban_type');
      return t;
    }
    return null;
  });

  useEffect(() => {
    if (localStorage.getItem('show_politique') === 'true') {
      setShowPolitique(true);
      localStorage.removeItem('show_politique');
    }
  }, []);
  const [approuveLecture, setApprouveLecture] = useState(false);

  const indicatifs = [
    // Afrique de l'Ouest
    { code: '+226', pays: 'Burkina Faso', drapeau: '🇧🇫' },
    { code: '+223', pays: 'Mali', drapeau: '🇲🇱' },
    { code: '+227', pays: 'Niger', drapeau: '🇳🇪' },
    { code: '+225', pays: "Côte d'Ivoire", drapeau: '🇨🇮' },
    { code: '+221', pays: 'Sénégal', drapeau: '🇸🇳' },
    { code: '+229', pays: 'Bénin', drapeau: '🇧🇯' },
    { code: '+228', pays: 'Togo', drapeau: '🇹🇬' },
    { code: '+224', pays: 'Guinée', drapeau: '🇬🇳' },
    { code: '+245', pays: 'Guinée-Bissau', drapeau: '🇬🇼' },
    { code: '+220', pays: 'Gambie', drapeau: '🇬🇲' },
    { code: '+222', pays: 'Mauritanie', drapeau: '🇲🇷' },
    { code: '+231', pays: 'Liberia', drapeau: '🇱🇷' },
    { code: '+232', pays: 'Sierra Leone', drapeau: '🇸🇱' },
    { code: '+233', pays: 'Ghana', drapeau: '🇬🇭' },
    { code: '+234', pays: 'Nigeria', drapeau: '🇳🇬' },
    { code: '+235', pays: 'Tchad', drapeau: '🇹🇩' },
    { code: '+236', pays: 'Centrafrique', drapeau: '🇨🇫' },
    { code: '+237', pays: 'Cameroun', drapeau: '🇨🇲' },
    { code: '+240', pays: 'Guinée équatoriale', drapeau: '🇬🇶' },
    { code: '+241', pays: 'Gabon', drapeau: '🇬🇦' },
    { code: '+242', pays: 'Congo', drapeau: '🇨🇬' },
    { code: '+243', pays: 'RD Congo', drapeau: '🇨🇩' },
    { code: '+244', pays: 'Angola', drapeau: '🇦🇴' },
    // Afrique du Nord
    { code: '+212', pays: 'Maroc', drapeau: '🇲🇦' },
    { code: '+213', pays: 'Algérie', drapeau: '🇩🇿' },
    { code: '+216', pays: 'Tunisie', drapeau: '🇹🇳' },
    { code: '+218', pays: 'Libye', drapeau: '🇱🇾' },
    { code: '+20', pays: 'Égypte', drapeau: '🇪🇬' },
    { code: '+249', pays: 'Soudan', drapeau: '🇸🇩' },
    { code: '+211', pays: 'Soudan du Sud', drapeau: '🇸🇸' },
    { code: '+251', pays: 'Éthiopie', drapeau: '🇪🇹' },
    { code: '+252', pays: 'Somalie', drapeau: '🇸🇴' },
    { code: '+253', pays: 'Djibouti', drapeau: '🇩🇯' },
    { code: '+254', pays: 'Kenya', drapeau: '🇰🇪' },
    { code: '+255', pays: 'Tanzanie', drapeau: '🇹🇿' },
    { code: '+256', pays: 'Ouganda', drapeau: '🇺🇬' },
    { code: '+250', pays: 'Rwanda', drapeau: '🇷🇼' },
    { code: '+257', pays: 'Burundi', drapeau: '🇧🇮' },
    { code: '+258', pays: 'Mozambique', drapeau: '🇲🇿' },
    { code: '+260', pays: 'Zambie', drapeau: '🇿🇲' },
    { code: '+261', pays: 'Madagascar', drapeau: '🇲🇬' },
    { code: '+263', pays: 'Zimbabwe', drapeau: '🇿🇼' },
    { code: '+264', pays: 'Namibie', drapeau: '🇳🇦' },
    { code: '+265', pays: 'Malawi', drapeau: '🇲🇼' },
    { code: '+266', pays: 'Lesotho', drapeau: '🇱🇸' },
    { code: '+267', pays: 'Botswana', drapeau: '🇧🇼' },
    { code: '+268', pays: 'Eswatini', drapeau: '🇸🇿' },
    { code: '+27', pays: 'Afrique du Sud', drapeau: '🇿🇦' },
    // Europe
    { code: '+33', pays: 'France', drapeau: '🇫🇷' },
    { code: '+32', pays: 'Belgique', drapeau: '🇧🇪' },
    { code: '+41', pays: 'Suisse', drapeau: '🇨🇭' },
    { code: '+49', pays: 'Allemagne', drapeau: '🇩🇪' },
    { code: '+39', pays: 'Italie', drapeau: '🇮🇹' },
    { code: '+34', pays: 'Espagne', drapeau: '🇪🇸' },
    { code: '+351', pays: 'Portugal', drapeau: '🇵🇹' },
    { code: '+44', pays: 'Royaume-Uni', drapeau: '🇬🇧' },
    { code: '+31', pays: 'Pays-Bas', drapeau: '🇳🇱' },
    { code: '+48', pays: 'Pologne', drapeau: '🇵🇱' },
    { code: '+7', pays: 'Russie', drapeau: '🇷🇺' },
    // Amériques
    { code: '+1', pays: 'USA', drapeau: '🇺🇸' },
    { code: '+1', pays: 'Canada', drapeau: '🇨🇦' },
    { code: '+52', pays: 'Mexique', drapeau: '🇲🇽' },
    { code: '+55', pays: 'Brésil', drapeau: '🇧🇷' },
    { code: '+54', pays: 'Argentine', drapeau: '🇦🇷' },
    { code: '+56', pays: 'Chili', drapeau: '🇨🇱' },
    { code: '+57', pays: 'Colombie', drapeau: '🇨🇴' },
    // Asie & Moyen-Orient
    { code: '+86', pays: 'Chine', drapeau: '🇨🇳' },
    { code: '+91', pays: 'Inde', drapeau: '🇮🇳' },
    { code: '+81', pays: 'Japon', drapeau: '🇯🇵' },
    { code: '+82', pays: 'Corée du Sud', drapeau: '🇰🇷' },
    { code: '+971', pays: 'Émirats arabes unis', drapeau: '🇦🇪' },
    { code: '+966', pays: 'Arabie saoudite', drapeau: '🇸🇦' },
    { code: '+90', pays: 'Turquie', drapeau: '🇹🇷' },
    // Océanie
    { code: '+61', pays: 'Australie', drapeau: '🇦🇺' },
    { code: '+64', pays: 'Nouvelle-Zélande', drapeau: '🇳🇿' },
  ];

  const changerIndicatif = (code: string, pays: string) => {
    setIndicatif(code);
    
    setForm(prev => ({ ...prev, pays }));
  };

  const longueurParIndicatif = (code: string): number => {
    const longueurs: Record<string, number> = {
      '+226': 8, '+223': 8, '+227': 8, '+225': 10, '+221': 9,
      '+229': 8, '+228': 8, '+224': 9, '+245': 9, '+220': 7,
      '+222': 8, '+231': 8, '+232': 8, '+233': 9, '+234': 10,
      '+235': 8, '+236': 8, '+237': 9, '+240': 9, '+241': 8,
      '+242': 9, '+243': 9, '+244': 9,
      '+212': 9, '+213': 9, '+216': 8, '+218': 9, '+20': 10,
      '+249': 9, '+211': 9, '+251': 9, '+252': 8, '+253': 8,
      '+254': 9, '+255': 9, '+256': 9, '+250': 9, '+257': 8,
      '+258': 9, '+260': 9, '+261': 9, '+263': 9, '+264': 9,
      '+265': 9, '+266': 8, '+267': 8, '+268': 8, '+27': 9,
      '+33': 9, '+32': 9, '+41': 9, '+49': 11, '+39': 10,
      '+34': 9, '+351': 9, '+44': 10, '+31': 9, '+48': 9, '+7': 10,
      '+1': 10, '+52': 10, '+55': 11, '+54': 10, '+56': 9, '+57': 10,
      '+86': 11, '+91': 10, '+81': 10, '+82': 10,
      '+971': 9, '+966': 9, '+90': 10,
      '+61': 9, '+64': 9,
    };
    return longueurs[code] || 15;
  };

  const formaterNumero = (valeur: string, code: string) => {
    const max = longueurParIndicatif(code);
    const chiffres = valeur.replace(/\D/g, '').slice(0, max);
    return chiffres.replace(/(\d{2})(?=\d)/g, '$1 ');
  };

  const genererPlaceholder = (code: string): string => {
    const max = longueurParIndicatif(code);
    const blocs: string[] = [];
    let reste = max;
    while (reste > 0) {
      blocs.push('XX');
      reste -= 2;
    }
    return blocs.join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInscription = async () => {
    setLoading(true);
    setErreur('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/inscription/`, form);
      setOtpEmail(res.data.email || form.email);
      setOtpRequis(true);
      setForm({ ...form, password: '' });
    } catch (err: any) {
      setErreur(err.response?.data?.raison || err.response?.data?.erreur || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  };

  // Compte a rebours OTP (5 min) - base sur localStorage pour survivre au demontage
  useEffect(() => {
    if (!otpRequis) return;

    // Lit la deadline existante ou en cree une nouvelle (5 min)
    let deadline = parseInt(localStorage.getItem('otp_deadline') || '0', 10);
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + 300 * 1000;
      localStorage.setItem('otp_deadline', String(deadline));
    }

    const updateTemps = () => {
      const restant = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTempsRestant(restant);
      return restant;
    };

    updateTemps();
    const interval = setInterval(() => {
      const r = updateTemps();
      if (r <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpRequis]);

  const handleRenvoyerOtp = async () => {
    setRenvoiEnCours(true);
    setErreur('');
    try {
      await axios.post(`${API_URL}/envoyer-otp/`, { email: otpEmail });
      setOtpCode('');
      const nouvelleDeadline = Date.now() + 300 * 1000;
      localStorage.setItem('otp_deadline', String(nouvelleDeadline));
      setTempsRestant(300);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur renvoi');
    } finally {
      setRenvoiEnCours(false);
    }
  };

  const handleValiderOtp = async () => {
    setLoading(true);
    setErreur('');
    try {
      const response = await axios.post(`${API_URL}/verifier-otp/`, {
        email: otpEmail,
        code: otpCode,
      });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setOtpRequis(false);
      setEcranSucces({ type: 'connexion', prenom: response.data.prenom, userData: response.data });
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Code invalide');
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
      // void loginOneSignal(response.data.user_id);
      localStorage.setItem('user', JSON.stringify(response.data));
      setEcranSucces({ type: 'connexion', prenom: response.data.prenom || response.data.username, userData: response.data });
    } catch (err: any) {
      setErreur(err.response?.data?.raison || err.response?.data?.erreur || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const accepterCookies = () => {
    localStorage.setItem('cookies_acceptes', 'true');
    setCookiesAcceptes(true);
  };

  const handleMotDePasseOublie = async () => {
    setLoading(true); setErreur(''); setMessage('');
    try {
      await axios.post(`${API_URL}/mot-de-passe-oublie/`, { email: forgotEmail });
      setModeForgot('otp');
      setMessage('Code envoye par email');
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur');
    } finally { setLoading(false); }
  };

  const handleVerifierCodeReset = async () => {
    setLoading(true); setErreur('');
    try {
      await axios.post(`${API_URL}/verifier-code-reset/`, {
        email: forgotEmail, code: forgotCode,
      });
      setModeForgot('nouveau_mdp');
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Code invalide ou expiré');
    } finally { setLoading(false); }
  };

  const handleReinitialiserMdp = async () => {
    setLoading(true); setErreur(''); setMessage('');
    try {
      await axios.post(`${API_URL}/reinitialiser-mdp/`, {
        email: forgotEmail, code: forgotCode, nouveau_mdp: forgotNouveauMdp,
      });
      setModeForgot('succes');
      setMessage('');
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Code invalide ou mot de passe trop faible');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'connexion') {
      await handleConnexion();
    } else {
      await handleInscription();
    }
  };

  // ===== MOT DE PASSE OUBLIE =====
  if (modeForgot === 'email') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>VOKYVO</h1>
          <p style={styles.subtitle}>Mot de passe oublié</p>
          <div style={styles.successBox}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#forgotGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
              <defs>
                <linearGradient id="forgotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 style={styles.successTitle}>Réinitialisation</h2>
            <p style={styles.successText}>
              Saisis ton email pour recevoir un code de vérification.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="ton@email.com"
              style={styles.input}
              autoFocus
            />
            {erreur && <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '10px' }}>{erreur}</p>}
            <button
              onClick={handleMotDePasseOublie}
              disabled={loading || !forgotEmail}
              style={{ ...styles.successBtn, opacity: loading || !forgotEmail ? 0.5 : 1, marginTop: '15px' }}
            >
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
            <button
              onClick={() => { setModeForgot(null); setErreur(''); }}
              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', marginTop: '15px', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modeForgot === 'otp') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>VOKYVO</h1>
          <p style={styles.subtitle}>Vérification</p>
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Vérification</h2>
            <p style={styles.successText}>
              Saisis le code envoyé à <strong>{forgotEmail}</strong>
            </p>
            <input
              type="text"
              value={forgotCode}
              onChange={(e) => setForgotCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              style={{ width: '100%', padding: '15px', fontSize: '24px', letterSpacing: '8px', textAlign: 'center', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '12px', color: 'white', marginTop: '15px', marginBottom: '15px', fontFamily: 'monospace' }}
              autoFocus
            />
            {erreur && <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '10px' }}>{erreur}</p>}
            <button
              onClick={handleVerifierCodeReset}
              disabled={loading || forgotCode.length !== 6}
              style={{ ...styles.successBtn, opacity: loading || forgotCode.length !== 6 ? 0.5 : 1 }}
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
            <button
              onClick={() => { setModeForgot(null); setForgotCode(''); setErreur(''); }}
              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', marginTop: '15px', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modeForgot === 'nouveau_mdp') {
    const mdpMatch = forgotNouveauMdp === forgotConfirmMdp && forgotNouveauMdp.length >= 6;
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>VOKYVO</h1>
          <p style={styles.subtitle}>Nouveau mot de passe</p>
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Nouveau mot de passe</h2>
            <p style={styles.successText}>
              Choisis un mot de passe sécurisé (min. 6 caractères).
            </p>
            <input
              type="password"
              value={forgotNouveauMdp}
              onChange={(e) => setForgotNouveauMdp(e.target.value)}
              placeholder="Nouveau mot de passe"
              style={{ width: '100%', padding: '14px 16px', fontSize: '15px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '12px', color: 'white', marginTop: '15px', marginBottom: '10px' }}
              autoFocus
            />
            <input
              type="password"
              value={forgotConfirmMdp}
              onChange={(e) => setForgotConfirmMdp(e.target.value)}
              placeholder="Confirme le mot de passe"
              style={{ width: '100%', padding: '14px 16px', fontSize: '15px', background: '#0a0a0f', border: forgotConfirmMdp && forgotNouveauMdp !== forgotConfirmMdp ? '1px solid #dc3545' : '1px solid #2a2a3e', borderRadius: '12px', color: 'white', marginBottom: '10px' }}
            />
            {forgotConfirmMdp && forgotNouveauMdp !== forgotConfirmMdp && (
              <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '10px' }}>Les mots de passe ne correspondent pas</p>
            )}
            {erreur && <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '10px' }}>{erreur}</p>}
            <button
              onClick={handleReinitialiserMdp}
              disabled={loading || !mdpMatch}
              style={{ ...styles.successBtn, opacity: loading || !mdpMatch ? 0.5 : 1 }}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
            <button
              onClick={() => { setModeForgot('otp'); setErreur(''); setForgotNouveauMdp(''); setForgotConfirmMdp(''); }}
              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', marginTop: '15px', cursor: 'pointer' }}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modeForgot === 'succes') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>VOKYVO</h1>
          <p style={styles.subtitle}>Mot de passe réinitialisé</p>
          <div style={styles.successBox}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#succesGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
              <defs>
                <linearGradient id="succesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
            <h2 style={styles.successTitle}>Mot de passe modifié</h2>
            <p style={styles.successText}>
              Ton mot de passe a été réinitialisé avec succès.
            </p>
            <button
              onClick={() => {
                setModeForgot(null);
                setMode('connexion');
                setForgotEmail(''); setForgotCode(''); setForgotNouveauMdp('');
              }}
              style={styles.successBtn}
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ecran OTP (apres inscription)
  if (otpRequis) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>VOKYVO</h1>
          <p style={styles.subtitle}>Verification email</p>

          <div style={styles.successBox}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#otpGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
              <defs>
                <linearGradient id="otpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <polyline points="3 7 12 13 21 7" />
            </svg>

            <h2 style={styles.successTitle}>Code envoyé</h2>
            <p style={styles.successText}>
              Saisis le code à 6 chiffres envoyé à <strong>{otpEmail}</strong>
            </p>

            <p style={{ color: tempsRestant > 0 ? '#888' : '#dc3545', fontSize: '14px', marginTop: '5px', marginBottom: '10px' }}>
              {tempsRestant > 0
                ? `Code valide encore ${Math.floor(tempsRestant / 60)}:${String(tempsRestant % 60).padStart(2, '0')}`
                : 'Code expiré'}
            </p>

            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '24px',
                letterSpacing: '8px',
                textAlign: 'center',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '12px',
                color: 'white',
                marginTop: '15px',
                marginBottom: '15px',
                fontFamily: 'monospace',
              }}
              autoFocus
            />

            {erreur && <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '10px' }}>{erreur}</p>}

            <button
              onClick={handleValiderOtp}
              disabled={loading || otpCode.length !== 6}
              style={{
                ...styles.successBtn,
                opacity: loading || otpCode.length !== 6 ? 0.5 : 1,
                cursor: loading || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Verification...' : 'Valider'}
            </button>

            {tempsRestant === 0 && (
              <button
                onClick={handleRenvoyerOtp}
                disabled={renvoiEnCours}
                style={{
                  background: 'transparent',
                  border: '1px solid #667eea',
                  color: '#667eea',
                  fontSize: '14px',
                  marginTop: '15px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: renvoiEnCours ? 'wait' : 'pointer',
                  width: '100%',
                  fontWeight: 600,
                }}
              >
                {renvoiEnCours ? 'Envoi...' : 'Renvoyer le code'}
              </button>
            )}

            <button
              onClick={() => { setOtpRequis(false); setOtpCode(''); setErreur(''); localStorage.removeItem('otp_deadline'); }}
              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', marginTop: '15px', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ecran de succes (inscription ou connexion)
  if (ecranSucces) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>VOKYVO</h1>
          <p style={styles.subtitle}>Ta plateforme tout-en-un</p>

          <div style={styles.successBox}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#successGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
              <defs>
                <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>

            {ecranSucces.type === 'inscription' ? (
              <>
                <h2 style={styles.successTitle}>Compte créé !</h2>
                <p style={styles.successText}>
                  Bienvenue {ecranSucces.prenom || ''} sur VOKYVO.
                </p>
                <button
                  onClick={() => {
                    setEcranSucces(null);
                    setMode('connexion');
                  }}
                  style={styles.successBtn}
                >
                  Se connecter
                </button>
              </>
            ) : (
              <>
                <h2 style={styles.successTitle}>Connexion réussie !</h2>
                <p style={styles.successText}>
                  Bienvenue {ecranSucces.prenom || ''} sur VOKYVO.
                </p>
                <button
                  onClick={() => onLogin(ecranSucces.userData)}
                  style={styles.successBtn}
                >
                  Voir mon profil
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Overlay de ban (prioritaire)
  // Overlay MAINTENANCE (bleu)
  if (banRaison && banType === 'global_banned') {
    return (
      <div style={styles.banOverlay}>
        <div style={{ ...styles.banCard, boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)' }}>
          <div style={styles.banIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h2 style={{ ...styles.banTitle, color: '#667eea' }}>Maintenance en cours</h2>
          <p style={styles.banText}>
            VOKYVO est temporairement en maintenance. Merci de revenir dans quelques minutes.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ ...styles.banBtn, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Compris
          </button>
        </div>
      </div>
    );
  }

  // Overlay BAN (rouge)
  if (banRaison) {
    return (
      <div style={styles.banOverlay}>
        <div style={styles.banCard}>
          <div style={styles.banIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h2 style={styles.banTitle}>Compte banni</h2>
          <p style={styles.banText}>
            Ton compte a été banni de VOKYVO.
          </p>
          <div style={styles.banRaisonBox}>
            <p style={styles.banRaisonLabel}>Raison :</p>
            <p style={styles.banRaisonText}>{banRaison}</p>
          </div>
          <p style={styles.banContact}>
            Pour contester, contacte le support :{' '}
            <a href="mailto:support@vokyvo.com" style={{ color: '#dc3545', textDecoration: 'underline' }}>
              support@vokyvo.com
            </a>
          </p>
          <button
            onClick={() => { setBanRaison(null); setBanType(null); }}
            style={styles.banBtn}
          >
            Compris
          </button>
        </div>
      </div>
    );
  }

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

        <button 
          onClick={() => window.location.href = 'https://api.vokyvo.com/oauth/google/'}
          style={styles.googleBtn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Se connecter avec Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#2a2a3e' }} />
          <span style={{ color: '#666', fontSize: '12px' }}>ou</span>
          <div style={{ flex: 1, height: '1px', background: '#2a2a3e' }} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'inscription' ? (
            <>
              <input type="text" name="nom" placeholder="Nom" onChange={handleChange} required style={styles.input} />
              <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} required style={styles.input} />
              <input type="number" name="age" placeholder="Âge" onChange={handleChange} required style={styles.input} />
              <select name="sexe" onChange={handleChange} required style={styles.input}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="A">Autre</option>
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={indicatif} 
                onChange={(e) => {
                  const paysTrouve = indicatifs.find(i => i.code === e.target.value);
                  changerIndicatif(e.target.value, paysTrouve?.pays || '');
                }}
                style={{ ...styles.input, width: '110px', flexShrink: 0 }}
              >
                {indicatifs.map((ind) => (
                  <option key={ind.code} value={ind.code}>{ind.drapeau} {ind.code}</option>
                ))}
              </select>
              <input 
                type="text" 
                name="numero" 
                placeholder={genererPlaceholder(indicatif)} 
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: formaterNumero(e.target.value, indicatif) })}
                required 
                style={styles.input}
              />
            </div>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />

              <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required style={styles.input} />
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}/>
                    </svg>
                    Inscription...
                  </span>
                ) : "S'inscrire"}
              </button>
            </>
          ) : (
            <>
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.input} />
              <input type="password" name="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required style={styles.input} />
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}/>
                    </svg>
                    Connexion...
                  </span>
                ) : 'Se connecter'}
              </button>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setModeForgot('email'); setForgotEmail(form.email); setErreur(''); setMessage(''); }}
                style={{ color: '#667eea', fontSize: '13px', textAlign: 'center', marginTop: '12px', textDecoration: 'none', display: 'block' }}
              >
                Mot de passe oublié ?
              </a>
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
            <a href="/confidentialite.html" style={styles.cookieLink}>Politique de confidentialité</a>
            {' · '}
            <a href="/cgu.html" style={styles.cookieLink}>Conditions d'utilisation</a>
          </p>
          <div style={{ marginTop: '10px' }}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={approuveLecture}
                onChange={(e) => setApprouveLecture(e.target.checked)}
                style={styles.checkbox}
              />
              J'ai lu et j'approuve la politique et les conditions
            </label>
            <button
              onClick={accepterCookies}
              style={approuveLecture ? styles.cookieBtn : styles.cookieBtnDisabled}
              disabled={!approuveLecture}
            >
              Accepter
            </button>
          </div>
        </div>
      )}

      {/* Modal Conditions d'utilisation */}
      {showConditions && (
        <div style={styles.overlay} onClick={() => setShowConditions(false)}>
          <div style={styles.politiquePanel} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.politiqueTitle}>Conditions d'utilisation</h2>
            <div style={styles.politiqueContent}>
              <h3>1. Acceptation</h3>
              <p>En créant un compte VOKYVO, vous acceptez ces conditions d'utilisation.</p>
              <h3>2. Service</h3>
              <p>VOKYVO fournit une messagerie, visioconférence, assistant IA et actualités.</p>
              <h3>3. Comportement</h3>
              <p>Le harcèlement, les discours haineux et tout contenu illégal sont interdits.</p>
              <h3>4. Bannissement</h3>
              <p>VOKYVO se réserve le droit de bannir tout utilisateur ne respectant pas ces règles.</p>
              <h3>5. Contact</h3>
              <p>Telegram : @vokyvo_bot · WhatsApp : +226 06 96 54 41</p>
            </div>
            <button onClick={() => setShowConditions(false)} style={styles.cookieBtn}>Fermer</button>
          </div>
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
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité, d'opposition. Pour exercer ces droits, contactez-nous à <a href="mailto:support@vokyvo.com" style={{ color: '#667eea', textDecoration: 'underline' }}>support@vokyvo.com</a>.</p>
              
              <h3>6. Sécurité</h3>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données, accès restreint, surveillance continue, sauvegardes régulières.</p>
              
              <h3>7. Conservation</h3>
              <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment. Les données sont supprimées sous 30 jours après la demande.</p>
              
              <h3>8. Contact</h3>
              <p>Pour toute question concernant vos données : <a href="mailto:support@vokyvo.com" style={{ color: '#667eea', textDecoration: 'underline' }}>support@vokyvo.com</a></p>
              <div style={styles.contactButtons}>
                <a href="https://t.me/vokyvo_bot" target="_blank" style={styles.telegramBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </a>
                <a href="https://wa.me/22606965441" target="_blank" style={styles.whatsappBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a href="https://www.facebook.com/profile.php?id=61594855372644" target="_blank" style={{...styles.whatsappBtn, background: '#1877F2'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                <a href="https://x.com/vokyvo" target="_blank" style={{...styles.whatsappBtn, background: '#000'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </a>
              </div>
              
              <h3>9. Modifications</h3>
              <p>Cette politique peut être mise à jour. Les modifications seront publiées sur cette page. Dernière mise à jour : 5 septembre 2026.</p>
            </div>
            <button onClick={() => setShowPolitique(false)} style={styles.cookieBtn}>Fermer</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        {!estDansAPK && (
        <a href={`https://github.com/aron733/frontend/releases/download/v${VERSION}/vokyvo.apk`} target="_blank" style={{ ...styles.apkBtn, animation: 'apkPulse 2s ease-in-out infinite' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'apkBell 3s ease-in-out infinite', transformOrigin: 'top center' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger l'APK
        </a>
        )}
        <p style={styles.footerText}>© 2026 VOKYVO - Tous droits réservés</p>
        <div style={styles.footerLinks}>
          <a href="/a-propos.html" style={styles.footerLink}>À propos</a>
          <a href="/confidentialite.html" style={styles.footerLink}>Confidentialité</a>
          <a href="/cgu.html" style={styles.footerLink}>Conditions</a>
          <a href="/confidentialite.html" style={styles.footerLink}>RGPD</a>
        </div>
        <a href="https://stats.uptimerobot.com/0DXeqdPiLO" target="_blank" style={styles.uptime}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#28a745">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Status
        </a>
        <a href="mailto:support@vokyvo.com" style={styles.supportLink}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          support@vokyvo.com
        </a>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '14px' }}>
          <a href="https://t.me/vokyvo_app" target="_blank" aria-label="Telegram" style={{ color: '#555', transition: 'color 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          <a href="https://wa.me/22606965441" target="_blank" aria-label="WhatsApp" style={{ color: '#555', transition: 'color 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61594855372644" target="_blank" aria-label="Facebook" style={{ color: '#555', transition: 'color 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="https://x.com/vokyvo" target="_blank" aria-label="X" style={{ color: '#555', transition: 'color 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: '100dvh',
    overflow: 'auto',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '40px 15px',
    gap: '15px',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    textAlign: 'center' as const,
    marginTop: '80px',
  },
  successTitle: {
    fontSize: '26px',
    fontWeight: 'bold' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 10px 0',
  },
  successText: {
    fontSize: '15px',
    color: '#aaa',
    margin: '0 0 30px 0',
    lineHeight: '1.5',
  },
  successBtn: {
    padding: '14px 30px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    width: '100%',
    maxWidth: '280px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
  },
  banOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: '#0a0a0f',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  banCard: {
    background: '#111120',
    borderRadius: '20px',
    padding: '30px 25px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const,
    border: '1px solid #2a2a3e',
    boxShadow: '0 20px 60px rgba(220, 53, 69, 0.3)',
  },
  banIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  banTitle: {
    color: '#dc3545',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: '0 0 10px 0',
  },
  banText: {
    color: '#ccc',
    fontSize: '15px',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  banRaisonBox: {
    background: 'rgba(220, 53, 69, 0.1)',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
  },
  banRaisonLabel: {
    color: '#dc3545',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 5px 0',
  },
  banRaisonText: {
    color: 'white',
    fontSize: '15px',
    margin: 0,
    fontWeight: 'bold' as const,
  },
  banContact: {
    color: '#888',
    fontSize: '13px',
    margin: '0 0 25px 0',
    lineHeight: '1.4',
  },
  banBtn: {
    padding: '14px 30px',
    borderRadius: '12px',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    width: '100%',
    maxWidth: '200px',
  },
  card: {
    padding: '25px 20px',
    maxWidth: '400px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  logo: {
    textAlign: 'center' as const,
    fontSize: '56px',
    marginBottom: '8px',
    fontWeight: 900 as const,
    letterSpacing: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
    animation: 'gradientShift 3s ease-in-out infinite',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#aaa',
    fontSize: '15px',
    letterSpacing: '1px',
    marginBottom: '35px',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #2a2a3e',
    background: 'white',
    color: '#333',
    fontSize: '14px',
    fontWeight: 600 as const,
    cursor: 'pointer',
    marginBottom: '5px',
  },
  switchContainer: { display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '5px' },
  switchButton: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', transition: 'all 0.3s' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    width: '100%',
  },
  submitButton: { padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#aaa',
    fontSize: '12px',
    margin: '10px 0',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#667eea',
  },
  cookieBtnDisabled: {
    padding: '8px 15px',
    borderRadius: '10px',
    border: 'none',
    background: '#333',
    color: '#666',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'not-allowed',
    whiteSpace: 'nowrap' as const,
    opacity: 0.6,
  },
  contactButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  telegramBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    borderRadius: '10px',
    background: '#0088cc',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'opacity 0.2s',
  },
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    borderRadius: '10px',
    background: '#25D366',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'opacity 0.2s',
  },
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
  seoSection: {
    maxWidth: '700px',
    margin: '40px auto 20px',
    padding: '0 20px',
    textAlign: 'left' as const,
  },
  seoTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '14px',
    textAlign: 'center' as const,
  },
  seoSubtitle: {
    color: '#667eea',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '18px',
    marginBottom: '6px',
  },
  seoText: {
    color: '#888',
    fontSize: '12px',
    lineHeight: 1.7,
    margin: '0 0 8px 0',
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
  apkBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 25px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    marginBottom: '15px',
    width: '100%',
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
    transition: 'all 0.3s',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: '20px' },
  footerLink: { color: '#667eea', fontSize: '10px', textDecoration: 'none' },
  supportLink: {
    color: '#667eea',
    fontSize: '11px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    justifyContent: 'center',
    marginTop: '5px',
  },
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
  error: { color: '#dc3545', textAlign: 'center' as const, marginTop: '15px', fontSize: '14px', fontWeight: 600 as const, background: 'rgba(220,53,69,0.15)', padding: '12px', borderRadius: '10px', border: '1px solid #dc3545' },
};

export default Landing;
