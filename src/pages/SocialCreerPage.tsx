import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'https://api.vokyvo.com/api';

interface SocialCreerPageProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function SocialCreerPage({ onClose, onCreated }: SocialCreerPageProps) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [enCours, setEnCours] = useState(false);

  const creer = async () => {
    if (!nom.trim()) {
      toast.error('Le nom de la Page est requis');
      return;
    }
    if (enCours) return;
    setEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(
        `${API_URL}/social/pages/creer/`,
        { nom: nom.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={() => { if (!enCours) onClose(); }}
    >
      <div
        style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '6px' }}>Créer une Page</h3>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
          Une Page représente une entreprise, un journal, un artiste ou une communauté. Tu peux en créer jusqu'à 3.
        </p>

        <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>Nom de la Page *</label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: VOKYVO LABS"
          maxLength={80}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '16px', outline: 'none' }}
        />

        <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>Description (optionnelle)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Quelques mots sur cette Page…"
          maxLength={280}
          rows={3}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '20px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={enCours}
            style={{ padding: '12px 22px', borderRadius: '10px', background: 'transparent', border: '1px solid #2a2a3e', color: '#aaa', cursor: enCours ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            Annuler
          </button>
          <button
            onClick={creer}
            disabled={enCours || !nom.trim()}
            style={{ padding: '12px 22px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: enCours || !nom.trim() ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: enCours || !nom.trim() ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {enCours && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2 a10 10 0 0 1 10 10" />
              </svg>
            )}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
