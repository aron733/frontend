import { useState, useRef } from 'react';
import axios from 'axios';
import SocialFond from './SocialFond';
import SocialMedia from './SocialMedia';
import VideoFeed from './VideoFeed';


interface PostProps {
  post: any;
  onLike: (id: number, typeReaction?: string | null) => void;
  onComment: (post: any) => void;
}

export default function SocialPost({ post: p, onLike, onComment }: PostProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [feedVideoOuvert, setFeedVideoOuvert] = useState(false);
  const [reactionMenu, setReactionMenu] = useState(false);
  const [texteDeplie, setTexteDeplie] = useState(false);
  const [nbPartages, setNbPartages] = useState(p.nb_partages || 0);
  const longPressTimer = useRef<any>(null);

  const handleDoubleTap = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
    if (!p.like_par_moi) onLike(p.id);
  };

  return (
    <div style={{ background: '#0f0f14', borderRadius: '0', padding: '15px 0', marginBottom: '10px', borderBottom: '1px solid #1a1a2e' }}>
      {/* Header du post */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', padding: '0 15px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '20px', overflow: 'hidden', flexShrink: 0 }}>
          {p.page?.photo ? (
            <img src={p.page.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : p.user?.photo ? (
            <img src={p.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (p.page?.nom || p.user?.username || '?')[0].toUpperCase()
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {p.page?.nom || p.user?.username || 'Anonyme'}
            {p.page?.verifiee && <svg width="14" height="14" viewBox="0 0 24 24" fill="#667eea"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" strokeWidth="2" fill="none"/></svg>}
          </div>
          <div style={{ color: '#666', fontSize: '13px' }}>{new Date(p.date_creation).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Texte (avec fond si couleur_fond et texte court) */}
      {p.texte && (
        p.couleur_fond && !p.media_url && p.texte.length <= 150 ? (
          <SocialFond texte={p.texte} couleur={p.couleur_fond} />
        ) : (
          <div style={{ padding: '0 15px', marginBottom: '15px' }}>
            <p style={{ color: '#eee', fontSize: '16px', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', display: texteDeplie ? 'block' : '-webkit-box', WebkitLineClamp: texteDeplie ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.texte}</p>
            {p.texte.length > 150 && (
              <button onClick={() => setTexteDeplie(!texteDeplie)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 0, marginTop: '5px', fontSize: '14px', fontWeight: 600 }}>
                {texteDeplie ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )
      )}

      {/* Media (avec double-tap) */}
      {p.medias && p.medias.length > 0 && (
        <div
          style={{ marginBottom: '15px', position: 'relative', cursor: 'pointer' }}
          onDoubleClick={handleDoubleTap}
        >
          <SocialMedia medias={p.medias} onOuvrirFeed={() => setFeedVideoOuvert(true)} />
          {showHeart && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, animation: 'popHeart 0.8s ease-out forwards', pointerEvents: 'none' }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="#dc3545" stroke="#dc3545" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 15px 0', borderTop: '1px solid #1a1a2e', marginTop: '10px' }}>
        {/* Like */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Si le menu est ouvert, on le ferme
              if (reactionMenu) { setReactionMenu(false); return; }
              // Si on a deja une reaction, on la supprime (null). Sinon, on met un like.
              if (p.ma_reaction) {
                onLike(p.id, null);
              } else {
                onLike(p.id, 'like');
              }
            }}
            onMouseDown={() => { longPressTimer.current = setTimeout(() => setReactionMenu(true), 500); }}
            onMouseUp={() => { clearTimeout(longPressTimer.current); }}
            onMouseLeave={() => { clearTimeout(longPressTimer.current); setReactionMenu(false); }}
            onTouchStart={() => { longPressTimer.current = setTimeout(() => setReactionMenu(true), 500); }}
            onTouchEnd={() => { clearTimeout(longPressTimer.current); }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', color: p.ma_reaction ? '#dc3545' : '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, padding: '10px', borderRadius: '10px' }}
          >
            {p.ma_reaction ? (
              <>
                <span style={{ fontSize: '18px' }}>
                  {p.ma_reaction === 'love' && '❤️'}
                  {p.ma_reaction === 'haha' && '😂'}
                  {p.ma_reaction === 'wow' && '😮'}
                  {p.ma_reaction === 'sad' && '😢'}
                  {p.ma_reaction === 'angry' && '😡'}
                  {p.ma_reaction === 'like' && '👍'}
                </span>
                <span style={{ color: '#888', fontSize: '13px', fontWeight: 600 }}>{p.likes}</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                {p.likes > 0 ? <span style={{ color: '#888', fontSize: '13px', fontWeight: 600 }}>{p.likes}</span> : "J'aime"}
              </>
            )}
          </button>
          {reactionMenu && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', zIndex: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.6)', animation: 'popReaction 0.2s ease-out', width: '220px' }}>
              <style>{`
                @keyframes popReaction {
                  0% { transform: scale(0.9) translateY(10px); opacity: 0; }
                  100% { transform: scale(1) translateY(0); opacity: 1; }
                }
              `}</style>
              {[
                { emoji: '👍', label: 'J\'aime', type: 'like' },
                { emoji: '❤️', label: 'J\'adore', type: 'love' },
                { emoji: '😂', label: 'Haha', type: 'haha' },
                { emoji: '😮', label: 'Wouah', type: 'wow' },
                { emoji: '😢', label: 'Triste', type: 'sad' },
                { emoji: '😡', label: 'Colère', type: 'angry' },
              ].map((r) => (
                <button key={r.type} onClick={() => {
                  onLike(p.id, r.type);
                  setReactionMenu(false);
                }} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '28px' }}>{r.emoji}</span>
                  <span style={{ color: '#aaa', fontSize: '11px', fontWeight: 600 }}>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Commentaire */}
        <button onClick={() => onComment(p)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, padding: '10px', borderRadius: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          {p.nb_commentaires > 0 ? p.nb_commentaires : 'Commenter'}
        </button>

        {/* Partage */}
        <button onClick={async () => {
          const url = `https://vokyvo.com/p/${p.code_court}`;
          if (navigator.share) {
            try {
              await navigator.share({
                title: 'Post VOKYVO',
                text: p.texte || 'Regarde ce post sur VOKYVO',
                url: url
              });
            } catch (err) {
              console.log('Partage annulé');
            }
          } else {
            navigator.clipboard.writeText(url);
            alert('Lien copié dans le presse-papiers !');
          }
          try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post(`https://api.vokyvo.com/api/social/posts/${p.id}/partager/`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setNbPartages(res.data.nb_partages);
          } catch {}
        }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, padding: '10px', borderRadius: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          {nbPartages > 0 ? nbPartages : 'Partager'}
        </button>
      </div>
      {feedVideoOuvert && <VideoFeed onFermer={() => setFeedVideoOuvert(false)} />}
    </div>
  );
}
