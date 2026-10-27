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
        // On stocke le refresh token dans le localStorage de la console
        if (res.data.refresh_token) {
          localStorage.setItem('console_refresh', res.data.refresh_token);
        }
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
    <div style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '2px', margin: 0 }}>
          VOKYVO <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>API</span>
        </h1>
        <a href="https://vokyvo.com" style={{ color: '#888', fontSize: '14px', textDecoration: 'none' }}>Retour au site</a>
      </div>

      {/* Hero (Login) */}
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', maxWidth: '1100px', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Texte de gauche */}
          <div style={{ flex: 1, minWidth: '300px', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', fontSize: '48px', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
              Construisez avec <br />
              <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>l'API VOKYVO</span>
            </h2>
            <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '30px', lineHeight: 1.6 }}>
              Connectez vos bots, vos journaux ou vos outils. Publiez automatiquement sur le fil VOKYVO Social en quelques lignes de code.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Publication automatique illimitée
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Clés API sécurisées et révocables
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Documentation et exemples cURL
              </div>
            </div>
          </div>

          {/* Formulaire de droite */}
          <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', fontSize: '22px', marginBottom: '10px' }}>Se connecter avec VOKYVO</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '25px' }}>Utilisez votre compte VOKYVO pour accéder à la console.</p>
            
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e', background: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '15px', outline: 'none', fontSize: '15px' }}
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e', background: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '25px', outline: 'none', fontSize: '15px' }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 700, fontSize: '16px', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Connexion...
                  </div>
                ) : 'Se connecter avec VOKYVO'}
              </button>
              {erreur && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '15px', fontSize: '14px', background: 'rgba(220,53,69,0.1)', padding: '10px', borderRadius: '8px' }}>{erreur}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Section : Comment ça marche */}
      <div style={{ padding: '80px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '15px' }}>Comment ça marche</h2>
          <p style={{ color: '#888', fontSize: '18px', textAlign: 'center', marginBottom: '60px' }}>Trois étapes pour publier automatiquement.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>1</div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Créez une clé</h3>
              <p style={{ color: '#888', fontSize: '15px' }}>Connectez-vous et générez une clé API depuis votre console.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>2</div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Envoyez une requête</h3>
              <p style={{ color: '#888', fontSize: '15px' }}>Utilisez cURL, Python ou n'importe quel langage pour publier.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>3</div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>C'est publié</h3>
              <p style={{ color: '#888', fontSize: '15px' }}>Votre post apparaît instantanément sur le fil VOKYVO Social.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section : Exemple de code */}
      <div style={{ padding: '80px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '15px' }}>Simple comme une requête</h2>
          <p style={{ color: '#888', fontSize: '18px', textAlign: 'center', marginBottom: '40px' }}>Publiez un post en une seule requête HTTP.</p>
          
          <pre style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '30px', fontSize: '15px', overflowX: 'auto', color: '#ccc', fontFamily: 'monospace', lineHeight: 1.8 }}>
{`curl -X POST https://api.vokyvo.com/api/social/publier/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer VOTRE_CLE" \\
  -d '{"texte": "Mon post automatique !"}'`}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>© 2026 VOKYVO LABS — Ouagadougou, Burkina Faso</p>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', padding: '0 20px' }}>
          <a href="https://vokyvo.com/cgu" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>CGU</a>
          <a href="https://vokyvo.com/confidentialite" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Confidentialité</a>
          <a href="https://vokyvo.com/a-propos" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>À propos</a>
          <a href="https://vokyvo.com/blog" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Blog</a>
          <a href="https://vokyvo.com/help" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Aide</a>
          <a href="https://vokyvo.com/aron-vokouma" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Fondateur</a>
          <a href="https://status.vokyvo.com/status/vokyvo" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Status</a>
          <a href="mailto:support@vokyvo.com" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>Support</a>
        </div>
      </div>
    </div>
  );
}
