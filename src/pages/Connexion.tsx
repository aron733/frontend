import { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

function Connexion() {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [resultat, setResultat] = useState<any>(null);
  const [erreur, setErreur] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultat(null);
    setErreur('');

    try {
      const response = await axios.post(`${API_URL}/connexion/`, form);
      setResultat(response.data);
      // Stocke le token
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('Connecté !', response.data);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || err.response?.data?.raison || 'Erreur de connexion');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 Connexion</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Pseudo"
            value={form.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          
          <button type="submit" style={styles.button}>
            Se connecter
          </button>
        </form>

        {erreur && (
          <div style={styles.errorCard}>
            <p style={styles.errorText}>🚫 {erreur}</p>
          </div>
        )}

        {resultat && (
          <div style={styles.successCard}>
            <h2 style={styles.successTitle}>✅ Connecté !</h2>
            <p><strong>Username :</strong> {resultat.username}</p>
            <p><strong>Pays :</strong> {resultat.pays}</p>
            <p><strong>Âge :</strong> {resultat.age}</p>
            <p><strong>Sexe :</strong> {resultat.sexe}</p>
            <p><strong>Banni :</strong> {resultat.est_banni ? 'Oui' : 'Non'}</p>
            <p style={styles.tokenPreview}>
              <strong>Token :</strong> {resultat.access_token?.substring(0, 50)}...
            </p>
          </div>
        )}
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  input: {
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  errorCard: {
    background: '#f8d7da',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '20px',
    border: '1px solid #f5c6cb',
  },
  errorText: {
    color: '#721c24',
    margin: 0,
    textAlign: 'center' as const,
  },
  successCard: {
    background: '#d4edda',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '20px',
    border: '1px solid #c3e6cb',
  },
  successTitle: {
    color: '#155724',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  tokenPreview: {
    wordBreak: 'break-all' as const,
    fontSize: '12px',
    color: '#666',
  },
};

export default Connexion;
