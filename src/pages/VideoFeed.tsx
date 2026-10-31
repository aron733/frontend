import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import SocialComments from './SocialComments';

export default function VideoFeed({ onFermer, onOuvrirPage }: { onFermer: () => void; onOuvrirPage?: (pageId: number) => void }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [suivis, setSuivis] = useState<{[key: number]: boolean}>({});
  const [modalComments, setModalComments] = useState<any>(null);
  const [reactionMenu, setReactionMenu] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<any>(null);
  const [showHeart, setShowHeart] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // La video est visible a 50% -> on la joue
            video.play().catch(() => {});
          } else {
            // La video n'est plus visible -> on la met en pause
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // Se declenche quand 50% de la video est visible
    );

    // Observer toutes les videos apres qu'elles soient rendues
    const timer = setTimeout(() => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) observer.observe(video);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [videos]); // Se relance si la liste des videos change

  useEffect(() => {
    charger();
  }, []);


    const toggleSuivre = async (pageId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`https://api.vokyvo.com/api/social/pages/${pageId}/suivre/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSuivis(prev => ({ ...prev, [pageId]: res.data.suivi }));
    } catch {}
  };

  const likerPost = async (id: number, typeReaction: string = 'like') => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/social/posts/${id}/liker/`, { reaction: typeReaction }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recharger les videos pour mettre a jour le compteur
      const res = await axios.get(`${API_URL}/social/posts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const avecVideo = (res.data.posts || []).filter((p: any) =>
        p.medias && p.medias.some((m: any) => m.type === 'video')
      );
      setVideos(avecVideo);
    } catch {}
  };

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

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 5000, overflowY: 'auto', scrollSnapType: 'y mandatory', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          .video-action-btn svg {
            filter: drop-shadow(0px 1px 3px rgba(0,0,0,0.8));
          }
          .video-action-btn span {
            text-shadow: 0px 1px 3px rgba(0,0,0,0.8);
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
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>Vidéos</h1>
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
            <div key={p.id} style={{ height: '100vh', width: '100vw', flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always', position: 'relative', background: '#000' }}>
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
                  likerPost(p.id, 'love');
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Coeur geant (double-tap) */}
              {showHeart === p.id && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, animation: 'popHeart 0.8s ease-out forwards', pointerEvents: 'none' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="#dc3545" stroke="#dc3545" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
              )}

              {/* Infos de la video (nom, texte, follow) en bas */}
              <div style={{ position: 'absolute', bottom: '30px', left: '20px', right: '80px', zIndex: 10, color: '#fff', pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {/* Photo de profil (Page OU User, pas les deux) */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                    {p.page ? (
                      p.page.photo ? (
                        <img src={p.page.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', background: '#1a1a2e', color: '#667eea' }}>
                          {(p.page.nom || '?').charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : p.user?.photo ? (
                      <img src={p.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                        {(p.user?.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <p style={{ fontWeight: 700, fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.page && onOuvrirPage) onOuvrirPage(p.page.id);
                        }}
                        style={{ cursor: p.page ? 'pointer' : 'default' }}
                      >
                        {p.page ? p.page.nom : (p.user?.username || 'Anonyme')}
                      </span>
                      {(p.page?.verifiee || p.user?.verifiee) && <span style={{ color: '#667eea', fontSize: '12px' }}>✓</span>}
                    </p>

                  </div>
                  {p.page && !p.page.est_proprietaire && (
                    <button
                      onClick={() => toggleSuivre(p.page.id)}
                      style={{ background: (suivis[p.page.id] ?? p.page.je_suis) ? 'rgba(255,255,255,0.2)' : '#fff', border: '1px solid ' + ((suivis[p.page.id] ?? p.page.je_suis) ? '#fff' : 'transparent'), color: (suivis[p.page.id] ?? p.page.je_suis) ? '#fff' : '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {(suivis[p.page.id] ?? p.page.je_suis) ? 'Suivi' : 'Suivre'}
                    </button>
                  )}
                </div>
                {p.texte && (
                  <p style={{ fontSize: '14px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.texte}
                  </p>
                )}
              </div>

              {/* Boutons a droite */}
              <div style={{ position: 'absolute', right: '15px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', zIndex: 20 }}>
                <div style={{ position: 'relative' }}>
                  <button
                    className="video-action-btn"
                    onClick={() => likerPost(p.id)}
                    onMouseDown={() => { const t = setTimeout(() => setReactionMenu(p.id), 500); setLongPressTimer(t); }}
                    onMouseUp={() => { if (longPressTimer) clearTimeout(longPressTimer); }}
                    onMouseLeave={() => { if (longPressTimer) clearTimeout(longPressTimer); setReactionMenu(null); }}
                    onTouchStart={() => { const t = setTimeout(() => setReactionMenu(p.id), 500); setLongPressTimer(t); }}
                    onTouchEnd={() => { if (longPressTimer) clearTimeout(longPressTimer); }}
                    style={{ background: 'transparent', border: 'none', color: p.ma_reaction ? '#dc3545' : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                  >
                    {p.ma_reaction ? (
                      <span style={{ fontSize: '30px' }}>
                        {p.ma_reaction === 'love' && '❤️'}
                        {p.ma_reaction === 'haha' && '😂'}
                        {p.ma_reaction === 'wow' && '😮'}
                        {p.ma_reaction === 'sad' && '😢'}
                        {p.ma_reaction === 'angry' && '😡'}
                        {p.ma_reaction === 'like' && '👍'}
                      </span>
                    ) : (
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    )}
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.likes}</span>
                  </button>
                  {reactionMenu === p.id && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '8px 12px', display: 'flex', gap: '10px', marginBottom: '10px', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                      {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => {
                        const typeMap: any = { '👍': 'like', '❤️': 'love', '😂': 'haha', '😮': 'wow', '😢': 'sad', '😡': 'angry' };
                        return (
                          <button key={emoji} onClick={() => { likerPost(p.id, typeMap[emoji]); setReactionMenu(null); }} style={{ background: 'transparent', border: 'none', fontSize: '26px', cursor: 'pointer', padding: '4px' }}>{emoji}</button>
                        );
                      })}
                    </div>
                  )}
                </div>


                <button className="video-action-btn" onClick={() => setModalComments(p)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.nb_commentaires}</span>
                </button>
                <button className="video-action-btn" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.nb_partages}</span>
                </button>
              </div>


            </div>
          );
        })
      )}
      {modalComments && <SocialComments post={modalComments} onFermer={() => setModalComments(null)} onNouveauCommentaire={() => {}} />}
    </div>
  );
}
