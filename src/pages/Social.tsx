import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import SocialPost from './SocialPost';
import SocialCreerPost from './SocialCreerPost';
import SocialComments from './SocialComments';

export default function Social({ onRetour }: { onRetour?: () => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modalCreer, setModalCreer] = useState(false);
  const [modalComments, setModalComments] = useState<any>(null);

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

  useEffect(() => { charger(); }, []);

  const likerPost = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/social/posts/${id}/liker/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      charger();
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000000', paddingBottom: '80px' }}>
      <style>{`
        @keyframes popHeart {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>

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
            <SocialPost key={p.id} post={p} onLike={likerPost} onComment={(post) => setModalComments(post)} />
          ))
        )}
      </div>

      {/* Bouton flottant creer post */}
      <button onClick={() => setModalCreer(true)} style={{ position: 'fixed', bottom: '90px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(102,126,234,0.4)', zIndex: 100 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Modales */}
      {modalCreer && <SocialCreerPost onFermer={() => setModalCreer(false)} onPublie={charger} />}
      {modalComments && <SocialComments post={modalComments} onFermer={() => setModalComments(null)} onNouveauCommentaire={charger} />}
    </div>
  );
}
