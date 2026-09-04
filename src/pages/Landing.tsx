import { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

function Landing({ onLogin }: { onLogin: (data: any) => void }) {
  const [mode, setMode] = useState<'inscription' | 'connexion' | 'otp'>('connexion');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    prenom: '',
    nom: '',
    age: '',
    sexe: 'M',
    numero: '',
    pays: '',
    code_otp: ''
  });
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeDev, setCodeDev] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const envoyerOTP = async () => {
    if (!form.email) {
      setErreur('Email requis');
      return;
    }
    setLoading(true);
    setErreur('');
    try {
      const response = await axios.post(`${API_URL}/envoyer-otp/`, { email: form.email });
      setMessage('Code OTP envoyé à ton email !');
      if (response.data.code_dev) {
        setCodeDev(response.data.code_dev);
      }
      setMode('otp');
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur envoi OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifierOTP = async () => {
    if (!form.code_otp) {
      setErreur('Entre le code reçu');
      return;
    }
    setLoading(true);
    setErreur('');
    try {
      await axios.post(`${API_URL}/verifier-otp/`, {
        email: form.email,
        code: form.code_otp
      });
      
      // OTP valide, on crée le compte
      await axios.post(`${API_URL}/inscription/`, form);
      setMessage('Compte créé ! Connecte-toi maintenant.');
      setMode('connexion');
      setForm({ ...form, password: '' });
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
      localStorage.setItem('user', JSON.stringify(response.data));
      onLogin(response.data);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || err.response?.data?.raison || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'connexion') {
      await handleConnexion();
    } else if (mode === 'inscription') {
      await envoyerOTP();
    } else if (mode === 'otp') {
      await verifierOTP();
    }
  };

  // Icônes SVG
  const IconeEmail = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );


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
          {mode === 'inscription' && (
            <>
              <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} style={styles.input} />
              <input type="text" name="nom" placeholder="Nom" onChange={handleChange} style={styles.input} />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
              <input type="text" name="username" placeholder="Pseudo" onChange={handleChange} required style={styles.input} />
              <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required style={styles.input} />
              <input type="number" name="age" placeholder="Âge" onChange={handleChange} style={styles.input} />
              <select name="sexe" onChange={handleChange} style={styles.input}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="A">Autre</option>
              </select>
              <input type="text" name="numero" placeholder="Téléphone" onChange={handleChange} style={styles.input} />
              <input type="text" name="pays" placeholder="Pays" onChange={handleChange} style={styles.input} />
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? '...' : 'Recevoir le code OTP'}
              </button>
            </>
          )}

          {mode === 'otp' && (
            <>
              <div style={styles.otpInfo}>
                <IconeEmail />
                <p style={styles.otpText}>Code envoyé à {form.email}</p>
              </div>
              <input
                type="text"
                name="code_otp"
                placeholder="Entrez le code à 6 chiffres"
                value={form.code_otp}
                onChange={handleChange}
                maxLength={6}
                required
                style={{ ...styles.input, textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
              />
              {codeDev && (
                <p style={styles.codeDev}>Code dev : {codeDev}</p>
              )}
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? '...' : 'Vérifier le code'}
              </button>
            </>
          )}

          {mode === 'connexion' && (
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
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    textAlign: 'center' as const,
    color: 'white',
    fontSize: '36px',
    marginBottom: '5px',
    fontWeight: 'bold',
    letterSpacing: '3px',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#aaa',
    marginBottom: '30px',
  },
  switchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '15px',
    padding: '5px',
  },
  switchButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    padding: '13px 15px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  submitButton: {
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  success: {
    color: '#28a745',
    textAlign: 'center' as const,
    marginTop: '15px',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center' as const,
    marginTop: '15px',
  },
  otpInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#aaa',
    justifyContent: 'center',
  },
  otpText: {
    margin: 0,
    fontSize: '14px',
  },
  codeDev: {
    color: '#ffc107',
    textAlign: 'center' as const,
    fontSize: '13px',
    margin: 0,
  },
};

export default Landing;
