import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function Social({ onRetour }: { onRetour?: () => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/social/posts/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(res.data.posts || []);
      } catch {}
      setChargement(false);
    };
    charger();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '15px 20px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Social</h1>
      </div>

      {/* Fil */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
        {chargement ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>Chargement...</p>
        ) : posts.length === 0 ? (
          <p style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>Aucun post pour le moment.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} style={{ background: '#111120', border: '1px solid #1a1a2e', borderRadius: '16px', padding: '20px', marginBottom: '15px' }}>
              {/* Header du post */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '18px', overflow: 'hidden' }}>
                  {p.page?.photo ? (
                    <img src={p.page.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : p.user?.photo ? (
                    <img src={p.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (p.page?.nom || p.user?.username || '?')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{p.page?.nom || p.user?.username || 'Anonyme'}</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>{new Date(p.date_creation).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Texte */}
              {p.texte && (
                <p style={{ color: '#eee', fontSize: '15px', lineHeight: 1.5, marginBottom: '15px', whiteSpace: 'pre-wrap' }}>{p.texte}</p>
              )}

              {/* Media */}
              {p.media_url && (
                <div style={{ marginBottom: '15px', borderRadius: '12px', overflow: 'hidden' }}>
                  {p.type_media === 'video' ? (
                    <video src={p.media_url} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                  ) : (
                    <img src={p.media_url} alt="" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                  )}
                </div>
              )}

              {/* Actions (Like) */}
              <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #1a1a2e', paddingTop: '15px' }}>
                <button style={{ background: 'transparent', border: 'none', color: p.like_par_moi ? '#dc3545' : '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={p.like_par_moi ? '#dc3545' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {p.likes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
