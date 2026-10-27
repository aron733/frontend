import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

interface Props {
  post: any;
  onFermer: () => void;
  onNouveauCommentaire: () => void;
}

export default function SocialComments({ post, onFermer, onNouveauCommentaire }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [nouveau, setNouveau] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/social/posts/${post.id}/commentaires/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data.commentaires || []);
    } catch {}
    setChargement(false);
  };

  useEffect(() => { charger(); }, [post.id]);

  const envoyer = async () => {
    if (!nouveau.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/social/posts/${post.id}/commenter/`, { texte: nouveau }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNouveau('');
      charger();
      onNouveauCommentaire();
    } catch {
      toast.error("Erreur d'envoi");
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onFermer}>
      <div style={{ background: '#111120', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', width: '100%', maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #2a2a3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 }}>Commentaires</h3>
            <p style={{ color: '#888', fontSize: '13px', margin: '2px 0 0 0' }}>{comments.length} commentaire(s)</p>
          </div>
          <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '5px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {chargement ? <p style={{ color: '#888', textAlign: 'center' }}>Chargement...</p> : comments.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a3e" strokeWidth="2" style={{ marginBottom: '10px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p style={{ color: '#555', fontStyle: 'italic' }}>Aucun commentaire pour le moment.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                  {c.user?.photo ? <img src={c.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.user?.username || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{c.user?.username}</span>
                    <span style={{ color: '#555', fontSize: '12px' }}>{new Date(c.date_creation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ color: '#ccc', fontSize: '15px', margin: '4px 0 0 0', lineHeight: 1.4 }}>{c.texte}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '15px 20px', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))', borderTop: '1px solid #2a2a3e', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Écrire un commentaire..."
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') envoyer(); }}
            style={{ flex: 1, padding: '14px', borderRadius: '24px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', outline: 'none', fontSize: '15px' }}
          />
          <button onClick={envoyer} disabled={!nouveau.trim()} style={{ background: nouveau.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#1a1a2e', border: 'none', color: nouveau.trim() ? '#fff' : '#555', width: '48px', height: '48px', borderRadius: '50%', cursor: nouveau.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
