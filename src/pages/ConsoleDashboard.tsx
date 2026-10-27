import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function ConsoleDashboard({ token, onLogout }: { token: string, onLogout: () => void }) {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalQuitter, setModalQuitter] = useState(false);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [section, setSection] = useState<'social' | 'cles' | 'docs'>('cles');
  
  // Modales
  const [modalCreer, setModalCreer] = useState(false);
  const [nomCle, setNomCle] = useState('');
  const [modalCleAffichee, setModalCleAffichee] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const chargerCles = async () => {
    try {
      const res = await axios.get(`${API_URL}/console/keys/`, { headers: { Authorization: `Bearer ${token}` } });
      setKeys(res.data.keys || []);
    } catch {
      alert('Erreur de chargement des cles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { chargerCles(); }, []);

  const creerCle = async () => {
    if (!nomCle.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/console/keys/creer/`, { nom: nomCle }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setModalCreer(false);
        setNomCle('');
        setModalCleAffichee(res.data.cle);
        chargerCles();
      }
    } catch {
      alert('Erreur de creation');
    }
  };

  const revoquerCle = async (id: number) => {
    if (!confirm('Revoquer cette cle ?')) return;
    try {
      await axios.delete(`${API_URL}/console/keys/${id}/supprimer/`, { headers: { Authorization: `Bearer ${token}` } });
      chargerCles();
    } catch {
      alert('Erreur de suppression');
    }
  };

  const confirmerEtQuitter = () => {
    setDeconnexionEnCours(true);
    setTimeout(() => { onLogout(); }, 3000);
  };

  const copierCle = () => {
    if (modalCleAffichee) {
      navigator.clipboard.writeText(modalCleAffichee);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '2px', margin: 0 }}>
          VOKYVO <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DEV</span>
        </h1>
        <button onClick={() => setMenuOuvert(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* Menu lateral */}
      {menuOuvert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setMenuOuvert(false)}>
          <div style={{ width: '280px', background: '#0a0a0f', height: '100%', padding: '20px', borderLeft: '1px solid #2a2a3e' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>Menu</h2>
              <button onClick={() => setMenuOuvert(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <p style={{ color: '#555', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>API</p>
            <button onClick={() => { setSection('cles'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: section === 'cles' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Mes clés
            </button>
            <button onClick={() => { setSection('social'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: section === 'social' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              API Social
            </button>

            <p style={{ color: '#555', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '30px', marginBottom: '10px' }}>Ressources</p>
            <button onClick={() => { setSection('docs'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: section === 'docs' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Documentation
            </button>

            <div style={{ marginTop: '40px', borderTop: '1px solid #2a2a3e', paddingTop: '20px' }}>
              <button onClick={() => { setModalQuitter(true); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
        
        {section === 'cles' && (
          <>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Mes clés API</h2>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>Gérez vos accès pour publier automatiquement.</p>
            {loading ? <p style={{ color: '#888' }}>Chargement...</p> : keys.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3e', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>Aucune clé pour le moment.</p>
              </div>
            ) : keys.map((k) => (
              <div key={k.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{k.nom}</div>
                  <div style={{ color: '#667eea', fontFamily: 'monospace', fontSize: '14px' }}>{k.cle}</div>
                </div>
                <button onClick={() => revoquerCle(k.id)} style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', color: '#dc3545', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Révoquer</button>
              </div>
            ))}
            <button onClick={() => setModalCreer(true)} style={{ marginTop: '20px', padding: '14px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>+ Créer une nouvelle clé</button>
          </>
        )}

        {section === 'social' && (
          <>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>API Social</h2>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>Publiez des posts automatiquement sur le fil VOKYVO.</p>
            <pre style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', fontSize: '14px', overflowX: 'auto', color: '#ccc', fontFamily: 'monospace' }}>
{`curl -X POST https://api.vokyvo.com/api/social/publier/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer VOTRE_CLE" \\
  -d '{"texte": "Mon post automatique !"}'`}
            </pre>
          </>
        )}

        {section === 'docs' && (
          <>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Documentation</h2>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>La documentation complète de l'API VOKYVO.</p>
            <p style={{ color: '#aaa' }}>Bientôt disponible.</p>
          </>
        )}
      </div>

      {/* Modale de création */}
      {modalCreer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setModalCreer(false)}>
          <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '30px', maxWidth: '400px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Nouvelle clé API</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Donnez un nom à cette clé pour la reconnaître plus tard.</p>
            <input
              type="text"
              placeholder="Ex: Bot Telegram"
              value={nomCle}
              onChange={(e) => setNomCle(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '20px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalCreer(false)} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: '1px solid #2a2a3e', color: '#aaa', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
              <button onClick={creerCle} style={{ padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'affichage de la clé */}
      {modalCleAffichee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Clé créée !</h3>
            <p style={{ color: '#dc3545', fontSize: '14px', marginBottom: '20px', fontWeight: 600 }}>Copiez-la maintenant, elle ne sera plus affichée en entier.</p>
            <div style={{ background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '10px', padding: '15px', fontFamily: 'monospace', color: '#667eea', fontSize: '14px', wordBreak: 'break-all', marginBottom: '20px' }}>
              {modalCleAffichee}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={copierCle} style={{ padding: '12px 24px', borderRadius: '10px', background: copie ? '#28a745' : '#667eea', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                {copie ? 'Copié !' : 'Copier'}
              </button>
              <button onClick={() => { setModalCleAffichee(null); setCopie(false); }} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: '1px solid #2a2a3e', color: '#aaa', cursor: 'pointer', fontWeight: 600 }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de deconnexion */}
      {modalQuitter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setModalQuitter(false)}>
          <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Se déconnecter ?</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '25px' }}>Tu devras te reconnecter pour accéder à tes clés API.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setModalQuitter(false)} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: '1px solid #2a2a3e', color: '#aaa', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
              <button onClick={confirmerEtQuitter} disabled={deconnexionEnCours} style={{ padding: '12px 24px', borderRadius: '10px', background: '#dc3545', border: 'none', color: '#fff', cursor: deconnexionEnCours ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: deconnexionEnCours ? 0.7 : 1 }}>
                {deconnexionEnCours ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Déconnexion...
                  </div>
                ) : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>© 2026 VOKYVO LABS — Ouagadougou, Burkina Faso</p>
      </div>
    </div>
  );
}
