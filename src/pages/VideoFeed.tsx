import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function VideoFeed({ onFermer }: { onFermer: () => void }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [showHeart, setShowHeart] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    const charger = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/social/posts/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const avecVideo = (res.data.posts || []).filter((p: any) =>
          p.medias && p.medias.some((m: any) => m.type === 'video')
        );
        setVideos(avecVideo);
      } catch {}
      setChargement(false);
    };
    charger();
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 5000, overflowY: 'auto', scrollSnapType: 'y mandatory' }}>
      <style>{`
        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes popHeart {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 5100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>Reels</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>

      {chargement ? (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', height: '80vh', borderRadius: '12px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '20px' }} />
          <div style={{ width: '40%', height: '16px', borderRadius: '4px', background: '#1a1a2e', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '80%', height: '14px', borderRadius: '4px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      ) : videos.length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', marginTop: '50vh' }}>Aucune video pour le moment.</p>
      ) : (
        videos.map((p) => {
          const video = p.medias.find((m: any) => m.type === 'video');
          return (
            <div key={p.id} style={{ height: '100vh', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={(el) => { videoRefs.current[p.id] = el; }}
                src={video.url}
                autoPlay
                loop
                playsInline
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  // Compter la vue apres 3 secondes de lecture
                  if (v.currentTime >= 3 && !(v as any)._vueComptee) {
                    (v as any)._vueComptee = true;
                    const token = localStorage.getItem('access_token');
                    axios.post(`https://api.vokyvo.com/api/social/posts/${p.id}/vu/`, {}, {
                      headers: { Authorization: `Bearer ${token}` }
                    }).catch(() => {});
                  }
                }}
                onClick={() => {
                  const v = videoRefs.current[p.id];
                  if (v) v.paused ? v.play() : v.pause();
                }}
                onDoubleClick={() => {
                  setShowHeart(p.id);
                  setTimeout(() => setShowHeart(null), 800);
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {/* Coeur geant (double-tap) */}
              {showHeart === p.id && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, animation: 'popHeart 0.8s ease-out forwards', pointerEvents: 'none' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="#dc3545" stroke="#dc3545" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
              )}

              {/* Boutons a droite */}
              <div style={{ position: 'absolute', right: '15px', bottom: '150px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '15px 10px', borderRadius: '30px', backdropFilter: 'blur(10px)' }}>
                <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.likes}</span>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.nb_vues || 0}</span>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.nb_commentaires}</span>
                </button>
                <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.nb_partages}</span>
                </button>
              </div>

              {/* Infos en bas */}
              <div style={{ position: 'absolute', bottom: '20px', left: '15px', right: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
                    {p.user?.photo || p.page?.photo ? (
                      <img src={p.user?.photo || p.page?.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (p.user?.username || p.page?.nom || '?')[0].toUpperCase()
                    )}
                  </div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{p.user?.username || p.page?.nom}</span>
                </div>
                {p.texte && <p style={{ color: '#fff', fontSize: '14px', margin: 0 }}>{p.texte}</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
