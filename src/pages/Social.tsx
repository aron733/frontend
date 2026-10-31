import { useState, useEffect } from 'react';
import axios from 'axios';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Capacitor } from '@capacitor/core';
import { API_URL } from '../config';
import SocialSkeleton from './SocialSkeleton';
import SocialPost from './SocialPost';
import SocialCreerPost from './SocialCreerPost';
import SocialComments from './SocialComments';
import SocialCreerPage from './SocialCreerPage';
import SocialPageProfil from './SocialPageProfil';
import SocialHeaderFeed from './SocialHeaderFeed';
import VideoFeed from './VideoFeed';

const ConditionalPullToRefresh = ({ children, ...props }: any) => {
  return Capacitor.isNativePlatform() ? <PullToRefresh {...props}>{children}</PullToRefresh> : <>{children}</>;
};

export default function Social({ onRetour }: { onRetour?: () => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [postCible, setPostCible] = useState<string | null>(null);
  const [modalCreer, setModalCreer] = useState(false);
  const [modalComments, setModalComments] = useState<any>(null);
  const [showCreerPage, setShowCreerPage] = useState(false);
  const [pageActive, setPageActive] = useState<number | null>(null);
  const [showParametres, setShowParametres] = useState(false);
  const [showVideoFeed, setShowVideoFeed] = useState(false);

  useEffect(() => {
    if (postCible && posts.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`post-${postCible}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [postCible, posts]);

  const handleRefresh = async () => {
    await charger();
  };

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

  useEffect(() => { 
    charger(); 
    const match = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      setPostCible(match[1]); // code_court (string)
    } else {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      if (postId) setPostCible(postId);
    }
  }, []);

  const likerPost = async (id: number, typeReaction?: string | null) => {
    try {
      const token = localStorage.getItem('access_token');
      // Si pas de typeReaction (clic principal), on envoie null pour supprimer
      const reaction = typeReaction || null;
      await axios.post(`${API_URL}/social/posts/${id}/liker/`, { reaction }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      charger();
    } catch {}
  };

  if (pageActive !== null) {
    return <SocialPageProfil pageId={pageActive} onRetour={() => setPageActive(null)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', paddingBottom: '80px' }}>
      <style>{`
        @keyframes popHeart {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>

      {/* Header complet */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '12px 20px', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '1px' }}>VOKYVO</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          <button onClick={() => setShowVideoFeed(true)} title="VideoFeed" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" ry="3"/><path d="M10 8l6 4-6 4V8z"/></svg>
          </button>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button onClick={() => setShowParametres(true)} title="Paramètres" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>

      {/* Header Feed (Quoi de neuf + Statuts) */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <SocialHeaderFeed onOuvrirCreation={() => setModalCreer(true)} />
      </div>

      {/* Fil */}
      <ConditionalPullToRefresh onRefresh={handleRefresh} pullingContent={<></>}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 0 15px 0' }}>
        {chargement ? (
          <>
            {[1, 2, 3].map((i) => <SocialSkeleton key={i} />)}
          </>
        ) : posts.length === 0 ? (
          <p style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>Aucun post pour le moment.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} id={`post-${p.id}`}><SocialPost post={p} onLike={likerPost} onComment={(post) => setModalComments(post)} onClickPage={(id) => setPageActive(id)} /></div>
          ))
        )}
      </div>

      </ConditionalPullToRefresh>

      {/* Modales */}
      {modalCreer && <SocialCreerPost onFermer={() => setModalCreer(false)} onPublie={charger} />}
      {modalComments && <SocialComments post={modalComments} onFermer={() => setModalComments(null)} onNouveauCommentaire={charger} />}
      {showCreerPage && <SocialCreerPage onClose={() => setShowCreerPage(false)} onCreated={charger} />}

      {showVideoFeed && <VideoFeed onFermer={() => setShowVideoFeed(false)} />}

      {/* Ecran Parametres (plein ecran) */}
      {showParametres && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1a1a2e', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setShowParametres(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 }}>Paramètres</h1>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Mes Pages</h3>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>Gérez vos pages ou créez-en une nouvelle.</p>
              <button
                onClick={() => { setShowParametres(false); setShowCreerPage(true); }}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                + Créer une nouvelle Page
              </button>
            </div>

            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
              D'autres paramètres arrivent bientôt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
