import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

interface SocialCreerPageProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function SocialCreerPage({ onClose, onCreated }: SocialCreerPageProps) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [apercuPhoto, setApercuPhoto] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const choisirPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Photo trop lourde (max 5 Mo)');
      return;
    }
    setPhoto(f);
    setApercuPhoto(URL.createObjectURL(f));
  };

  const creer = async () => {
    if (!nom.trim()) {
      toast.error('Le nom de la Page est requis');
      return;
    }
    if (enCours) return;
    setEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('nom', nom.trim());
      formData.append('description', description.trim());
      if (photo) formData.append('photo', photo);

      const res = await axios.post(
        `${API_URL}/social/pages/creer/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        toast.success('Page créée');
        onClose();
        onCreated?.();
      } else {
        toast.error('Réponse inattendue du serveur');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.erreur || 'Erreur lors de la création';
      toast.error(msg);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1a1a2e', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
        <button onClick={onClose} disabled={enCours} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: enCours ? 'not-allowed' : 'pointer', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0, flex: 1 }}>Créer une Page</h1>
        <button
          onClick={creer}
          disabled={enCours || !nom.trim()}
          style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: enCours || !nom.trim() ? 'not-allowed' : 'pointer', opacity: enCours || !nom.trim() ? 0.7 : 1 }}
        >
          {enCours ? 'Création...' : 'Créer'}
        </button>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Photo de profil */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <label style={{ cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1a1a2e', border: '2px solid #2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {apercuPhoto ? (
                <img src={apercuPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              )}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #000' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <input type="file" accept="image/*" onChange={choisirPhoto} style={{ display: 'none' }} />
          </label>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '12px' }}>Ajouter une photo de profil</p>
        </div>

        {/* Nom */}
        <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>Nom de la Page *</label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: VOKYVO LABS"
          maxLength={80}
          style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '20px', outline: 'none', fontSize: '15px' }}
        />

        {/* Description */}
        <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Quelques mots sur cette Page…"
          maxLength={280}
          rows={4}
          style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '15px' }}
        />
        <p style={{ color: '#555', fontSize: '12px', marginTop: '6px', textAlign: 'right' }}>{description.length}/280</p>

        <p style={{ color: '#666', fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>
          Tu peux créer jusqu'à 3 Pages.
        </p>
      </div>
    </div>
  );
}
