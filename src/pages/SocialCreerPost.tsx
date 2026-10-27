import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import SocialSelecteurCouleur from './SocialSelecteurCouleur';
import SocialFond from './SocialFond';

interface Props {
  onFermer: () => void;
  onPublie: () => void;
}

export default function SocialCreerPost({ onFermer, onPublie }: Props) {
  const [texte, setTexte] = useState('');
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [visibilite, setVisibilite] = useState<'public' | 'contacts'>('public');
  const [couleurFond, setCouleurFond] = useState('');

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
      formData.append('visibilite', visibilite);
      if (!fichier && couleurFond) formData.append('couleur_fond', couleurFond);
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onFermer}>
      <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '20px', padding: '25px', maxWidth: '550px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>Créer un post</h3>
          <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '5px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Textarea */}
        {!fichier && couleurFond && texte && (
          <SocialFond texte={texte} couleur={couleurFond} />
        )}
        {!fichier && (
          <SocialSelecteurCouleur selection={couleurFond} onSelect={setCouleurFond} />
        )}
        <textarea
          placeholder="Quoi de neuf ?"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          style={{ width: '100%', minHeight: '150px', padding: '15px', borderRadius: '12px', border: '1px solid #2a2a3e', background: couleurFond && !fichier ? couleurFond : '#0a0a0f', color: '#fff', fontSize: '16px', outline: 'none', resize: 'none', marginBottom: '15px', lineHeight: 1.5, textAlign: couleurFond && !fichier ? 'center' : 'left', fontWeight: couleurFond && !fichier ? 700 : 400 }}
        />

        {/* Media preview */}
        {fichier && (
          <div style={{ marginBottom: '15px', position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#0a0a0f' }}>
            {fichier.type.startsWith('video/') ? (
              <video src={URL.createObjectURL(fichier)} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            ) : (
              <img src={URL.createObjectURL(fichier)} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            )}
            <button onClick={() => setFichier(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px', borderRadius: '50%' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Visibilité */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setVisibilite('public')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: visibilite === 'public' ? '2px solid #667eea' : '1px solid #2a2a3e', background: visibilite === 'public' ? 'rgba(102,126,234,0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            🌍 Public
          </button>
          <button onClick={() => setVisibilite('contacts')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: visibilite === 'contacts' ? '2px solid #667eea' : '1px solid #2a2a3e', background: visibilite === 'contacts' ? 'rgba(102,126,234,0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            👥 Contacts
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667eea', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '8px 12px', borderRadius: '8px', background: 'rgba(102,126,234,0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Média
            <input type="file" accept="image/*,video/*" onChange={(e) => setFichier(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
          
          <button onClick={publier} disabled={envoi || (!texte.trim() && !fichier)} style={{ padding: '12px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: (envoi || (!texte.trim() && !fichier)) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '15px', opacity: (envoi || (!texte.trim() && !fichier)) ? 0.5 : 1 }}>
            {envoi ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  );
}
