import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

interface Props {
  onFermer: () => void;
  onPublie: () => void;
}

export default function SocialCreerPost({ onFermer, onPublie }: Props) {
  const [texte, setTexte] = useState('');
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const publier = async () => {
    if (!texte.trim() && !fichier) return;
    setEnvoi(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      if (texte.trim()) formData.append('texte', texte);
      if (fichier) {
        const isVideo = fichier.type.startsWith('video/');
        formData.append(isVideo ? 'video' : 'image', fichier);
      }
      await axios.post(`${API_URL}/social/posts/creer/`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Post publié !');
      onPublie();
      onFermer();
    } catch {
      toast.error('Erreur de publication');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onFermer}>
      <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '25px', maxWidth: '500px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>Créer un post</h3>
        <textarea
          placeholder="Quoi de neuf ?"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', fontSize: '15px', outline: 'none', resize: 'none', marginBottom: '15px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667eea', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {fichier ? fichier.name : 'Ajouter une image ou vidéo'}
          <input type="file" accept="image/*,video/*" onChange={(e) => setFichier(e.target.files?.[0] || null)} style={{ display: 'none' }} />
        </label>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onFermer} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: '1px solid #2a2a3e', color: '#aaa', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
          <button onClick={publier} disabled={envoi} style={{ padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: envoi ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: envoi ? 0.7 : 1 }}>{envoi ? 'Publication...' : 'Publier'}</button>
        </div>
      </div>
    </div>
  );
}
