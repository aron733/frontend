import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from './config';

interface Statut {
  id: number;
  user_id: number;
  user_nom: string;
  user_photo: string | null;
  media_url: string;
  legende: string | null;
  date_creation: string;
  vu: boolean;
  likes: number;
  like_par_moi: boolean;
  est_moi: boolean;
  nb_vues: number;
  vues_par: { id: number; nom: string; photo: string | null }[];
}

export default function Statuts() {
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [chargement, setChargement] = useState(true);
  const [statutOuvert, setStatutOuvert] = useState<Statut | null>(null);
  const [voirVues, setVoirVues] = useState(false);

  const chargerStatuts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/statuts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatuts(res.data.statuts || []);
    } catch {
      toast.error('Erreur chargement des statuts');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerStatuts();
  }, []);

  const voirStatut = async (s: Statut) => {
    setStatutOuvert(s);
    if (!s.vu && !s.est_moi) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(`${API_URL}/statuts/${s.id}/interagir/`, { action: 'vu' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatuts(prev => prev.map(x => x.id === s.id ? { ...x, vu: true } : x));
        setStatutOuvert(prev => prev && prev.id === s.id ? { ...prev, vu: true } : prev);
      } catch {
        toast.error('Erreur lors du marquage comme vu');
      }
    }
  };

  const likerStatut = async (s: Statut) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`${API_URL}/statuts/${s.id}/interagir/`, { action: 'like' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nouveauLike = res.data.like;
      const nouveauCount = nouveauLike ? s.likes + 1 : s.likes - 1;

      // Met à jour la liste
      setStatuts(prev => prev.map(x => x.id === s.id ? {
        ...x,
        like_par_moi: nouveauLike,
        likes: nouveauCount
      } : x));

      // Met à jour la modale ouverte
      setStatutOuvert(prev => prev && prev.id === s.id ? {
        ...prev,
        like_par_moi: nouveauLike,
        likes: nouveauCount
      } : prev);
    } catch {
      toast.error('Erreur lors du like');
    }
  };

  if (chargement) return null;


  return (
    <>
      {/* Barre horizontale de statuts */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 15px', borderBottom: '1px solid #2a2a3e', scrollbarWidth: 'none' }}>
        {/* Bouton "Mon statut" (le +) */}
        <div
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              try {
                const token = localStorage.getItem('access_token');
                const formData = new FormData();
                formData.append('image', file);
                await axios.post(`${API_URL}/statuts/creer/`, formData, {
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Statut publié !');
                await chargerStatuts();
              } catch {
                toast.error('Erreur publication statut');
              }
            };
            input.click();
          }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed #667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', fontSize: '24px' }}>
            +
          </div>
          <span style={{ color: '#aaa', fontSize: '11px' }}>Mon statut</span>
        </div>

        {statuts.map((s) => (
          <div
            key={s.id}
            onClick={() => voirStatut(s)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              padding: '3px',
              background: s.vu ? '#2a2a3e' : 'linear-gradient(135deg, #667eea, #764ba2)',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#0a0a0f' }}>
                {s.user_photo ? (
                  <img src={s.user_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', fontWeight: 700, fontSize: '20px' }}>
                    {s.user_nom.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span style={{ color: '#aaa', fontSize: '11px', maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.est_moi ? 'Moi' : s.user_nom.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Modal plein écran du statut */}
      {statutOuvert && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 4000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {statutOuvert.user_photo && (
                <img src={statutOuvert.user_photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0 }}>{statutOuvert.user_nom}</p>
                <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{new Date(statutOuvert.date_creation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <button onClick={() => setStatutOuvert(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
            <img src={statutOuvert.media_url} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
          </div>

          {statutOuvert.legende && (
            <p style={{ color: 'white', fontSize: '14px', textAlign: 'center', padding: '15px 20px', margin: 0 }}>{statutOuvert.legende}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '15px 20px 30px' }}>
            {statutOuvert.est_moi && (
              <button onClick={() => setVoirVues(!voirVues)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '14px', fontWeight: 600 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {statutOuvert.nb_vues} vue{statutOuvert.nb_vues > 1 ? 's' : ''}
              </button>
            )}
            <button onClick={() => likerStatut(statutOuvert)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: statutOuvert.like_par_moi ? '#dc3545' : '#888', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={statutOuvert.like_par_moi ? '#dc3545' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {statutOuvert.likes}
            </button>
          </div>

          {/* Liste des personnes qui ont vu (uniquement pour mes statuts) */}
          {statutOuvert.est_moi && voirVues && (
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 20px 30px' }}>
              <p style={{ color: '#888', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>Vu par</p>
              {statutOuvert.vues_par.length === 0 ? (
                <p style={{ color: '#555', fontSize: '13px', textAlign: 'center' }}>Personne pour l'instant</p>
              ) : (
                statutOuvert.vues_par.map((v) => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                    {v.photo ? (
                      <img src={v.photo} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
                        {v.nom.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ color: 'white', fontSize: '13px' }}>{v.nom}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
