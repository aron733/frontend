import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import SocialPost from './SocialPost';

interface SocialPageProfilProps {
  pageId: number;
  onRetour: () => void;
}

export default function SocialPageProfil({ pageId, onRetour }: SocialPageProfilProps) {
  const [page, setPage] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [suiviEnCours, setSuiviEnCours] = useState(false);

  const charger = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/social/pages/${pageId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPage(res.data.page);
      setPosts(res.data.posts || []);
    } catch {
      toast.error('Erreur de chargement de la Page');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, [pageId]);

  const toggleSuivre = async () => {
    if (!page || suiviEnCours) return;
    setSuiviEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(
        `${API_URL}/social/pages/${pageId}/suivre/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPage({
        ...page,
        je_suis: res.data.suivi,
        nb_abonnes: page.nb_abonnes + (res.data.suivi ? 1 : -1),
      });
    } catch {
      toast.error('Erreur');
    } finally {
      setSuiviEnCours(false);
    }
  };

  if (chargement) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Chargement…
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', gap: '16px' }}>
        <p>Page introuvable.</p>
        <button onClick={onRetour} style={{ padding: '10px 20px', borderRadius: '10px', background: '#667eea', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Retour</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: '80px' }}>
      {/* Header sticky */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '12px 20px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{page.nom}</h1>
      </div>

      {/* Bannière / avatar */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1a1a2e', border: '2px solid #2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {page.photo ? (
              <img src={page.photo} alt={page.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', color: '#667eea', fontWeight: 900 }}>{page.nom.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', fontSize: '20px', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {page.nom}
              {page.verifiee && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#667eea"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              )}
            </h2>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{page.nb_abonnes} abonné{page.nb_abonnes > 1 ? 's' : ''} · {posts.length} post{posts.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {page.description && (
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>{page.description}</p>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {page.est_proprietaire ? (
            <button disabled style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', color: '#667eea', fontWeight: 600, fontSize: '14px', cursor: 'default' }}>
              Votre Page
            </button>
          ) : (
            <button
              onClick={toggleSuivre}
              disabled={suiviEnCours}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', background: page.je_suis ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: page.je_suis ? '1px solid #2a2a3e' : 'none', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: suiviEnCours ? 'not-allowed' : 'pointer', opacity: suiviEnCours ? 0.7 : 1 }}
            >
              {page.je_suis ? 'Ne plus suivre' : 'Suivre'}
            </button>
          )}
        </div>
      </div>

      {/* Posts de la Page */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {posts.length === 0 ? (
          <p style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>Aucun post pour le moment.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id}><SocialPost post={p} onLike={() => {}} onComment={() => {}} /></div>
          ))
        )}
      </div>
    </div>
  );
}
