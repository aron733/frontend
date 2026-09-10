import { useState, useEffect } from 'react';
import axios from 'axios';
import { loginOneSignal } from '../onesignal';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
  const [loading, setLoading] = useState(false);
  const [indicatif, setIndicatif] = useState('+226');
  const [cookiesAcceptes, setCookiesAcceptes] = useState(localStorage.getItem('cookies_acceptes') === 'true');
  const [showPolitique, setShowPolitique] = useState(false);
  const estDansAPK = navigator.userAgent.includes('wv') || navigator.userAgent.includes('Capacitor');
  const [showConditions, setShowConditions] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('show_politique') === 'true') {
      setShowPolitique(true);
      localStorage.removeItem('show_politique');
    }
  }, []);
  const [approuveLecture, setApprouveLecture] = useState(false);

  const indicatifs = [
    { code: '+226', pays: 'Burkina Faso', drapeau: '🇧🇫' },
    { code: '+223', pays: 'Mali', drapeau: '🇲🇱' },
    { code: '+227', pays: 'Niger', drapeau: '🇳🇪' },
    { code: '+225', pays: "Côte d'Ivoire", drapeau: '🇨🇮' },
    { code: '+221', pays: 'Sénégal', drapeau: '🇸🇳' },
    { code: '+229', pays: 'Bénin', drapeau: '🇧🇯' },
    { code: '+228', pays: 'Togo', drapeau: '🇹🇬' },
    { code: '+33', pays: 'France', drapeau: '🇫🇷' },
    { code: '+1', pays: 'USA/Canada', drapeau: '🇺🇸' },
    { code: '+44', pays: 'Royaume-Uni', drapeau: '🇬🇧' },
  ];

  const changerIndicatif = (code: string, pays: string) => {
    setIndicatif(code);
    
    setForm(prev => ({ ...prev, pays }));
  };

  const formaterNumero = (valeur: string) => {
    const chiffres = valeur.replace(/\D/g, '').slice(0, 8);
    return chiffres.replace(/(\d{2})(?=\d)/g, '$1 ');
  };

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
      setErreur(err.response?.data?.raison || err.response?.data?.erreur || 'Erreur inscription');
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
      loginOneSignal(response.data.id || response.data.user_id);
      localStorage.setItem('user', JSON.stringify(response.data));
      onLogin(response.data);
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

        <button 
          onClick={() => window.location.href = 'https://django-43v1.onrender.com/oauth/google/'}
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
                placeholder="XX XX XX XX" 
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: formaterNumero(e.target.value) })}
                required 
                style={styles.input}
                maxLength={11}
              />
            </div>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />

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
              <p>Telegram : @aladin_dev_bot · WhatsApp : +226 06 96 54 41</p>
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
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité, d'opposition. Pour exercer ces droits, contactez-nous à aronvokouma01@gmail.com.</p>
              
              <h3>6. Sécurité</h3>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données, accès restreint, surveillance continue, sauvegardes régulières.</p>
              
              <h3>7. Conservation</h3>
              <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment. Les données sont supprimées sous 30 jours après la demande.</p>
              
              <h3>8. Contact</h3>
              <p>Pour toute question concernant vos données : aronvokouma01@gmail.com</p>
              <div style={styles.contactButtons}>
                <a href="https://t.me/aladin_dev_bot" target="_blank" style={styles.telegramBtn}>
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
        <a href="https://github.com/aron733/frontend/releases/download/v2.0.0/app-release.apk" target="_blank" style={styles.apkBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger l'APK
        </a>
        )}
        <p style={styles.footerText}>© 2026 VOKYVO - Tous droits réservés</p>
        <div style={styles.footerLinks}>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowPolitique(true); }} style={styles.footerLink}>Confidentialité</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowConditions(true); }} style={styles.footerLink}>Conditions</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowPolitique(true); }} style={styles.footerLink}>RGPD</a>
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
  input: { padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const },
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
