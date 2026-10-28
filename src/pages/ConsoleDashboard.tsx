import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

export default function ConsoleDashboard({ token, onLogout }: { token: string, onLogout: () => void }) {
    const [clesSocial, setClesSocial] = useState<any[]>([]);
  const [clesIa, setClesIa] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalQuitter, setModalQuitter] = useState(false);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [section, setSection] = useState<'dashboard' | 'social-cles' | 'ia-cles' | 'docs' | 'social-api' | 'ia-api'>('dashboard');
  
  // Modales
  const [modalCreer, setModalCreer] = useState(false);
  const [nomCle, setNomCle] = useState('');
    const [modalCleAffichee, setModalCleAffichee] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const chargerStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/console/stats/`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch {}
  };

  const chargerCles = async () => {
    try {
      const [resSocial, resIa] = await Promise.all([
        axios.get(`${API_URL}/console/keys/?type=social`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/console/keys/?type=ia`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setClesSocial(resSocial.data.keys || []);
      setClesIa(resIa.data.keys || []);
    } catch {
      toast.error('Erreur de chargement des clés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { chargerCles(); chargerStats(); }, []);

  const creerCle = async () => {
    if (!nomCle.trim()) return;
    try {
      const typeCle = section === 'social-cles' ? 'social' : 'ia';
      const res = await axios.post(`${API_URL}/console/keys/creer/`, { nom: nomCle, type: typeCle }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setModalCreer(false);
        setNomCle('');
        setModalCleAffichee(res.data.cle);
        chargerCles();
      }
    } catch {
      toast.error('Erreur de création de la clé');
    }
  };

  const revoquerCle = async (id: number) => {
    if (!confirm('Revoquer cette cle ?')) return;
    try {
      await axios.delete(`${API_URL}/console/keys/${id}/supprimer/`, { headers: { Authorization: `Bearer ${token}` } });
      chargerCles();
    } catch {
      toast.error('Erreur de suppression de la clé');
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
          VOKYVO <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>API</span>
        </h1>
        <button onClick={() => setMenuOuvert(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* Overlay */}
      {menuOuvert && (
        <div onClick={() => setMenuOuvert(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }} />
      )}

      {/* Menu lateral (style Profil) */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px', background: '#0a0a0f', zIndex: 2000,
        transform: menuOuvert ? 'translateX(0)' : 'translateX(120%)',
        opacity: menuOuvert ? 1 : 0,
        pointerEvents: menuOuvert ? 'auto' : 'none',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '20px', borderLeft: '1px solid #2a2a3e', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>Menu</h2>
          <button onClick={() => setMenuOuvert(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <button onClick={() => { setSection('dashboard'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: section === 'dashboard' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </button>

        <p style={{ color: '#888', fontSize: '12px', margin: '15px 0 5px', textTransform: 'uppercase', fontWeight: 'bold' }}>API Social</p>
        <button onClick={() => { setSection('social-cles'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: section === 'social-cles' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Clés Social
        </button>
        <button onClick={() => { setSection('social-api'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: section === 'social-api' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Doc Social
        </button>

        <p style={{ color: '#888', fontSize: '12px', margin: '15px 0 5px', textTransform: 'uppercase', fontWeight: 'bold' }}>API IA</p>
        <button onClick={() => { setSection('ia-cles'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: section === 'ia-cles' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Clés IA
        </button>
        <button onClick={() => { setSection('ia-api'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: section === 'ia-api' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Doc IA
        </button>

        <p style={{ color: '#888', fontSize: '12px', margin: '15px 0 5px', textTransform: 'uppercase', fontWeight: 'bold' }}>Ressources</p>
        <button onClick={() => { setSection('docs'); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: section === 'docs' ? '#667eea' : '#ccc', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Documentation
        </button>

        <div style={{ flex: 1 }} />
        
        <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: '20px' }}>
          <button onClick={() => { setModalQuitter(true); setMenuOuvert(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', marginBottom: '8px', background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', textAlign: 'left', fontSize: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
        
        {section === 'dashboard' && (
          <>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Dashboard</h2>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>Vue d'ensemble de vos quotas et statistiques.</p>
            
            {stats && (
              <>
                {/* Resume */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px' }}>
                    <p style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Cles Social</p>
                    <p style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 }}>{clesSocial.length} <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }}>/ 5</span></p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px' }}>
                    <p style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Cles IA</p>
                    <p style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 }}>{clesIa.length} <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }}>/ 5</span></p>
                  </div>
                </div>

                {/* Carte API Social */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '25px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(102,126,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>API Social</h3>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>Posts (heure)</span>
                    <span style={{ color: '#667eea', fontSize: '14px', fontWeight: 700 }}>{Math.round((stats.social.requetes_heure / stats.social.limite_heure) * 100)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#1a1a2e', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ height: '100%', width: `${(stats.social.requetes_heure / stats.social.limite_heure) * 100}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '5px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>Posts (jour)</span>
                    <span style={{ color: '#667eea', fontSize: '14px', fontWeight: 700 }}>{Math.round((stats.social.requetes_jour / stats.social.limite_jour) * 100)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#1a1a2e', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ height: '100%', width: `${(stats.social.requetes_jour / stats.social.limite_jour) * 100}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '5px' }} />
                  </div>
                  
                  <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Total posts publies : <strong style={{ color: '#fff' }}>{stats.social.nb_posts}</strong></p>
                </div>

                {/* Carte API IA */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '25px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(118,75,162,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#764ba2" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/></svg>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>API IA</h3>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>Messages (heure)</span>
                    <span style={{ color: '#764ba2', fontSize: '14px', fontWeight: 700 }}>{Math.round((stats.ia.requetes_heure / stats.ia.limite_heure) * 100)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#1a1a2e', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ height: '100%', width: `${(stats.ia.requetes_heure / stats.ia.limite_heure) * 100}%`, background: 'linear-gradient(90deg, #764ba2, #667eea)', borderRadius: '5px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>Messages (jour)</span>
                    <span style={{ color: '#764ba2', fontSize: '14px', fontWeight: 700 }}>{Math.round((stats.ia.requetes_jour / stats.ia.limite_jour) * 100)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#1a1a2e', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(stats.ia.requetes_jour / stats.ia.limite_jour) * 100}%`, background: 'linear-gradient(90deg, #764ba2, #667eea)', borderRadius: '5px' }} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {(section === 'social-cles' || section === 'ia-cles') && (
          <>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>{section === 'social-cles' ? 'Clés API Social' : 'Clés API IA'}</h2>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>{section === 'social-cles' ? 'Gérez vos accès pour publier automatiquement.' : 'Gérez vos accès pour utiliser VOKYVO AI.'}</p>
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '40%', height: '16px', borderRadius: '4px', background: '#1a1a2e', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                    <div style={{ width: '80px', height: '32px', borderRadius: '8px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                ))}
              </>
            ) : (section === 'social-cles' ? clesSocial : clesIa).length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #2a2a3e', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>Aucune clé pour le moment.</p>
              </div>
            ) : (section === 'social-cles' ? clesSocial : clesIa).map((k) => (
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

        {section === 'social-api' && (
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

        {section === 'ia-api' && (
          <>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Documentation API IA</h2>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>Utilisez VOKYVO AI depuis vos propres applications.</p>
            <pre style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', fontSize: '14px', overflowX: 'auto', color: '#ccc', fontFamily: 'monospace' }}>
{`curl -X POST https://api.vokyvo.com/api/ia/chat/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer VOTRE_CLE_IA" \\
  -d '{"message": "Qui a decouvert l Amerique ?"}'`}
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
              placeholder="Ex: Mon site VOKYVO"
              value={nomCle}
              onChange={(e) => setNomCle(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '15px', outline: 'none' }}
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
