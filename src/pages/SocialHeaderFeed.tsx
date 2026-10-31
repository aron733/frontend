import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface SocialHeaderFeedProps {
  onOuvrirCreation: () => void;
  onOuvrirStatuts?: () => void;
}

export default function SocialHeaderFeed({ onOuvrirCreation, onOuvrirStatuts }: SocialHeaderFeedProps) {
  const [photoProfil, setPhotoProfil] = useState<string | null>(null);
  const [statuts, setStatuts] = useState<any[]>([]);

  useEffect(() => {
    const chargerInfos = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const resProfil = await axios.get(`${API_URL}/user/profil/statut/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resProfil.data?.photo_profil) {
          setPhotoProfil(resProfil.data.photo_profil);
        }

        try {
          const resStatuts = await axios.get(`${API_URL}/statuts/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStatuts(resStatuts.data?.statuts || []);
        } catch {}
      } catch {}
    };
    chargerInfos();
  }, []);

  return (
    <div style={{ background: '#000', paddingBottom: '10px', borderBottom: '1px solid #1a1a2e' }}>

      {/* Barre "Quoi de neuf ?" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a2e', overflow: 'hidden', flexShrink: 0 }}>
          {photoProfil ? (
            <img src={photoProfil} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', fontWeight: 700 }}>V</div>
          )}
        </div>

        <div
          onClick={onOuvrirCreation}
          style={{ flex: 1, background: '#1a1a2e', borderRadius: '20px', padding: '10px 16px', color: '#888', fontSize: '15px', cursor: 'pointer' }}
        >
          Quoi de neuf ?
        </div>

        <button
          onClick={onOuvrirCreation}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </button>
      </div>

      {/* Ligne de Statuts (Cercles) */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 20px', scrollbarWidth: 'none' }}>
        {/* Bouton "Créer un statut" */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '80px' }}>
          <div
            onClick={onOuvrirStatuts || onOuvrirCreation}
            style={{ width: '75px', height: '75px', borderRadius: '50%', background: '#111120', border: '2px dashed #667eea', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>
          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>Créer</span>
        </div>

        {/* Liste des statuts existants */}
        {statuts.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '80px' }}>
            <div style={{ width: '75px', height: '75px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', cursor: 'pointer' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #000', overflow: 'hidden', background: '#1a1a2e' }}>
                <img src={s.photo || s.media_url || s.user?.photo_profil} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: 500, marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{s.user?.username || 'User'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
