import { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

function Inscription() {
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
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErreur('');

    try {
      const response = await axios.post(`${API_URL}/inscription/`, form);
      setMessage('Compte créé avec succès !');
      console.log(response.data);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📝 Inscription</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={form.prenom}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={form.nom}
            onChange={handleChange}
            style={styles.input}
          />
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
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
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
          <input
            type="number"
            name="age"
            placeholder="Âge"
            value={form.age}
            onChange={handleChange}
            style={styles.input}
          />
          <select
            name="sexe"
            value={form.sexe}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
            <option value="A">Autre</option>
          </select>
          <input
            type="text"
            name="numero"
            placeholder="Numéro de téléphone"
            value={form.numero}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="pays"
            placeholder="Pays"
            value={form.pays}
            onChange={handleChange}
            style={styles.input}
          />
          
          <button type="submit" style={styles.button}>
            S'inscrire
          </button>
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
    transition: 'border-color 0.3s',
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
    transition: 'background 0.3s',
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
};

export default Inscription;
