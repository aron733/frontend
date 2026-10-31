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
  const [mesPages, setMesPages] = useState<any[]>([]);

  useEffect(() => {
    const chargerMesPages = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/social/pages/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mesPagesFiltrees = (res.data.pages || []).filter((p: any) => p.est_proprietaire);
        setMesPages(mesPagesFiltrees);
      } catch {}
    };
    chargerMesPages();
  }, []);

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
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (mesPages.length === 1) setPageActive(mesPages[0].id);
              else if (mesPages.length === 0) setShowCreerPage(true);
            }}
            title="Mes Pages"
            style={{ background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', color: '#667eea', cursor: 'pointer', padding: '8px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}
          >
            {mesPages.length === 0 ? 'Créer une Page' : mesPages.length === 1 ? mesPages[0].nom : `${mesPages.length} Pages`}
          </button>
          <button onClick={() => setShowCreerPage(true)} title="Créer une Page" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
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
    </div>
  );
}
