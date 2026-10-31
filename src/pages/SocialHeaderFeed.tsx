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
        
        // Charger le profil pour la photo
        const resProfil = await axios.get(`${API_URL}/user/profil/statut/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resProfil.data?.photo_profil) {
          setPhotoProfil(resProfil.data.photo_profil);
        }

        // Charger les statuts (si l'endpoint existe)
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
    <div style={{ background: '#000', paddingBottom: '15px', borderBottom: '1px solid #1a1a2e' }}>
      
      {/* Barre "Quoi de neuf ?" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a2e', overflow: 'hidden', flexShrink: 0 }}>
          {photoProfil ? (
            <img src={photoProfil} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', fontWeight: 700 }}>M</div>
          )}
        </div>
        
        <div 
          onClick={onOuvrirCreation}
          style={{ flex: 1, background: '#1a1a2e', borderRadius: '20px', padding: '12px 16px', color: '#888', fontSize: '15px', cursor: 'pointer' }}
        >
          Quoi de neuf ?
        </div>
        
        <button 
          onClick={onOuvrirCreation}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
      </div>

      {/* Barre de Statuts (Scroll horizontal) */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0 20px', scrollbarWidth: 'none' }}>
        {/* Bouton "Créer un statut" */}
        <div 
          onClick={onOuvrirStatuts || onOuvrirCreation}
          style={{ width: '100px', height: '160px', borderRadius: '12px', background: '#111120', border: '1px solid #2a2a3e', position: 'relative', flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>Créer un statut</span>
          </div>
        </div>

        {/* Liste des statuts existants */}
        {statuts.map((s, i) => (
          <div 
            key={i}
            style={{ width: '100px', height: '160px', borderRadius: '12px', background: '#111120', border: '2px solid #667eea', position: 'relative', flexShrink: 0, overflow: 'hidden' }}
          >
            <img src={s.photo || s.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', right: '5px' }}>
              <p style={{ color: '#fff', fontSize: '11px', margin: 0, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 3px #000' }}>{s.user?.username || 'User'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
