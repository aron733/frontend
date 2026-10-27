import { useState } from 'react';

const REACTIONS = ['❤️', '🔥', '😂', '👏'];

interface PostProps {
  post: any;
  onLike: (id: number) => void;
  onComment: (post: any) => void;
}

export default function SocialPost({ post: p, onLike, onComment }: PostProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [reactionMenu, setReactionMenu] = useState(false);

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

      {/* Texte */}
      {p.texte && (
        <p style={{ color: '#eee', fontSize: '16px', lineHeight: 1.5, marginBottom: '15px', whiteSpace: 'pre-wrap', padding: '0 15px' }}>{p.texte}</p>
      )}

      {/* Media (avec double-tap) */}
      {p.media_url && (
        <div
          style={{ marginBottom: '15px', borderRadius: '0', overflow: 'hidden', background: '#000', position: 'relative', cursor: 'pointer' }}
          onDoubleClick={handleDoubleTap}
        >
          {p.type_media === 'video' ? (
            <video src={p.media_url} controls style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
          ) : (
            <img src={p.media_url} alt="" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
          )}
          {showHeart && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, animation: 'popHeart 0.8s ease-out forwards', pointerEvents: 'none' }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="#dc3545" stroke="#dc3545" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '5px', padding: '5px 15px 0' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => onLike(p.id)}
            onMouseEnter={() => setReactionMenu(true)}
            onMouseLeave={() => setReactionMenu(false)}
            onTouchStart={() => { (window as any)._longPress = setTimeout(() => setReactionMenu(true), 500); }}
            onTouchEnd={() => { clearTimeout((window as any)._longPress); }}
            style={{ background: 'transparent', border: 'none', color: p.like_par_moi ? '#dc3545' : '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={p.like_par_moi ? '#dc3545' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {p.likes}
          </button>
          {reactionMenu && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, background: '#111120', border: '1px solid #2a2a3e', borderRadius: '20px', padding: '5px 10px', display: 'flex', gap: '8px', marginBottom: '5px', zIndex: 20 }}>
              {REACTIONS.map((r) => (
                <button key={r} onClick={() => onLike(p.id)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>{r}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onComment(p)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {p.nb_commentaires || 0}
        </button>
        <button onClick={() => {
          const url = `https://vokyvo.com/share?url=${encodeURIComponent(window.location.origin + '/social')}`;
          if (navigator.share) navigator.share({ title: 'Post VOKYVO', url });
          else { navigator.clipboard.writeText(url); alert('Lien copié !'); }
        }} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
    </div>
  );
}
