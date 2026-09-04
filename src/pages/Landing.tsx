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
  logo: { textAlign: 'center' as const, color: 'white', fontSize: '36px', marginBottom: '5px', fontWeight: 'bold', letterSpacing: '3px' },
  subtitle: { textAlign: 'center' as const, color: '#aaa', marginBottom: '30px' },
  switchContainer: { display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '5px' },
  switchButton: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', transition: 'all 0.3s' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  input: { padding: '13px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const },
  submitButton: { padding: '15px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  success: { color: '#28a745', textAlign: 'center' as const, marginTop: '15px' },
  error: { color: '#dc3545', textAlign: 'center' as const, marginTop: '15px' },
};

export default Landing;
