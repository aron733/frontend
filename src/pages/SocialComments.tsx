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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onFermer}>
      <div style={{ background: '#111120', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #2a2a3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>Commentaires</h3>
          <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 20px' }}>
          {chargement ? <p style={{ color: '#888' }}>Chargement...</p> : comments.length === 0 ? (
            <p style={{ color: '#555', fontStyle: 'italic', textAlign: 'center' }}>Aucun commentaire.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                  {(c.user?.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{c.user?.username}</div>
                  <p style={{ color: '#ccc', fontSize: '14px', margin: '2px 0 0 0' }}>{c.texte}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '15px 20px', borderTop: '1px solid #2a2a3e', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Écrire un commentaire..."
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') envoyer(); }}
            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', outline: 'none' }}
          />
          <button onClick={envoyer} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', padding: '0 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}
