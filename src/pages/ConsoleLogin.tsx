import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function ConsoleLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/connexion/`, { email, password });
      if (res.data.access_token) {
        onLogin(res.data.access_token);
      } else {
        setErreur('Email ou mot de passe incorrect.');
      }
    } catch {
      setErreur('Erreur de connexion. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '2px', margin: 0 }}>
          VOKYVO <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DEV</span>
        </h1>
        <a href="https://vokyvo.com" style={{ color: '#888', fontSize: '14px', textDecoration: 'none' }}>Retour au site</a>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, marginBottom: '10px', textAlign: 'center' }}>Console VOKYVO</h2>
        <p style={{ color: '#888', fontSize: '16px', marginBottom: '40px', textAlign: 'center' }}>Connectez-vous pour gérer vos clés API.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e', background: 'rgba(255,255,255,0.05)', color: '#fff', marginBottom: '15px', outline: 'none', fontSize: '16px' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e', background: 'rgba(255,255,255,0.05)', color: '#fff', marginBottom: '25px', outline: 'none', fontSize: '16px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 700, fontSize: '16px', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            ) : 'Se connecter'}
          </button>
          {erreur && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>{erreur}</p>}
        </form>
      </div>

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>© 2026 VOKYVO LABS — Ouagadougou, Burkina Faso</p>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <a href="https://vokyvo.com/cgu" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>CGU</a>
          <a href="https://vokyvo.com/confidentialite" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Confidentialité</a>
          <a href="https://vokyvo.com/help" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Aide</a>
        </div>
      </div>
    </div>
  );
}
