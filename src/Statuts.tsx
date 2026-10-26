import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from './config';

interface StatutItem {
  id: number;
  media_url: string;
  legende: string | null;
  date_creation: string;
  vu: boolean;
  likes: number;
  like_par_moi: boolean;
  nb_vues: number;
  vues_par: { id: number; nom: string; photo: string | null }[];
}

interface GroupeStatuts {
  user_id: number;
  user_nom: string;
  user_photo: string | null;
  est_moi: boolean;
  non_vu: boolean;
  apercu: string;
  nb_statuts: number;
  statuts: StatutItem[];
}

export default function Statuts() {
  const [groupes, setGroupes] = useState<GroupeStatuts[]>([]);
  const [chargement, setChargement] = useState(true);
  const [nbPrecedent, setNbPrecedent] = useState(() => parseInt(localStorage.getItem('vokyvo_statuts_count') || '3'));
  const [groupeOuvert, setGroupeOuvert] = useState<GroupeStatuts | null>(null);
  const [indexStatut, setIndexStatut] = useState(0);
  const [voirVues, setVoirVues] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dureeVideo, setDureeVideo] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  const chargerStatuts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      setChargement(true);
      const res = await axios.get(`${API_URL}/statuts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupes(res.data.groupes || []);
      const n = (res.data.groupes || []).length;
      setNbPrecedent(n);
      localStorage.setItem('vokyvo_statuts_count', String(n));
        setChargement(false);
    } catch {
      toast.error('Erreur chargement des statuts');
        setChargement(false);
    } finally {
    }
  };

  useEffect(() => {
    chargerStatuts();
  }, []);

  const ouvrirGroupe = async (g: GroupeStatuts) => {
    setGroupeOuvert(g);
    setIndexStatut(0);
    setVoirVues(false);
    // Marque le premier statut comme vu
    if (!g.est_moi) marquerVu(g, 0);
  };

  const marquerVu = async (g: GroupeStatuts, index: number) => {
    const s = g.statuts[index];
    if (!s || s.vu || g.est_moi) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/statuts/${s.id}/interagir/`, { action: 'vu' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupes(prev => prev.map(x => x.user_id === g.user_id ? {
        ...x,
        non_vu: false,
        statuts: x.statuts.map(y => y.id === s.id ? { ...y, vu: true } : y)
      } : x));
      setGroupeOuvert(prev => prev && prev.user_id === g.user_id ? {
        ...prev,
        statuts: prev.statuts.map(y => y.id === s.id ? { ...y, vu: true } : y)
      } : prev);
    } catch {}
  };

  const handleDoubleTap = async () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
    // Si pas encore liké, on like
    const s = groupeOuvert?.statuts[indexStatut];
    if (s && !s.like_par_moi) {
      await likerStatut();
    }
  };

  const likerStatut = async () => {
    if (!groupeOuvert) return;
    const s = groupeOuvert.statuts[indexStatut];
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`${API_URL}/statuts/${s.id}/interagir/`, { action: 'like' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nouveauLike = res.data.like;
      const nouveauCount = res.data.likes;
      setGroupeOuvert(prev => prev ? {
        ...prev,
        statuts: prev.statuts.map(y => y.id === s.id ? { ...y, like_par_moi: nouveauLike, likes: nouveauCount } : y)
      } : prev);
      // Recharge les statuts pour avoir l'etat exact depuis l'API
      chargerStatuts();
    } catch {
      toast.error('Erreur lors du like');
    }
  };

  const suivant = () => {
    if (!groupeOuvert) return;
    if (indexStatut < groupeOuvert.statuts.length - 1) {
      const next = indexStatut + 1;
      setIndexStatut(next);
      marquerVu(groupeOuvert, next);
    } else {
      // Fin du groupe : passe au groupe suivant (ou ferme)
      const idx = groupes.findIndex(g => g.user_id === groupeOuvert.user_id);
      if (idx !== -1 && idx < groupes.length - 1) {
        const nextGroupe = groupes[idx + 1];
        ouvrirGroupe(nextGroupe);
      } else {
        setGroupeOuvert(null);
      }
    }
  };

  const precedent = () => {
    if (indexStatut > 0) {
      setIndexStatut(indexStatut - 1);
    }
  };

  const creerStatut = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadEnCours(true);
      try {
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        const isVideo = file.type.startsWith('video/');
        formData.append(isVideo ? 'video' : 'image', file);
        await axios.post(`${API_URL}/statuts/creer/`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Statut publié !');
        await chargerStatuts();
      } catch {
        toast.error('Erreur publication statut');
      } finally {
        setUploadEnCours(false);
      }
    };
    input.click();
  };

  useEffect(() => {
    if (!groupeOuvert) return;
    const s = groupeOuvert.statuts[indexStatut];
    if (!s) return;
    if (isPaused) return;

    const isVideo = s.media_url.match(/\.(mp4|mov|webm|avi)(\?|$)/i);
    const duree = isVideo && dureeVideo > 0 ? dureeVideo * 1000 : 5000;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          if (indexStatut < groupeOuvert.statuts.length - 1) {
            setIndexStatut(indexStatut + 1);
            setProgress(0);
          } else {
            setGroupeOuvert(null);
            setProgress(0);
          }
          return 0;
        }
        return prev + (100 / (duree / 100));
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [groupeOuvert, indexStatut, isPaused]);

  useEffect(() => {
    setProgress(0);
  }, [indexStatut]);


  const s = groupeOuvert ? groupeOuvert.statuts[indexStatut] : null;

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes popHeart {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Barre horizontale des statuts */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 15px', borderBottom: '1px solid #2a2a3e', scrollbarWidth: 'none' }}>
        {/* Bouton "Mon statut" */}
        <div onClick={creerStatut} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed #667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', fontSize: '24px' }}>
            {uploadEnCours ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid #667eea', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            ) : '+'}
          </div>
          <span style={{ color: '#aaa', fontSize: '11px' }}>Mon statut</span>
        </div>

        {/* Faux cercles pendant le chargement */}
        {chargement && groupes.length === 0 && (
          <>
            {Array.from({ length: nbPrecedent }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '40px', height: '10px', borderRadius: '4px', background: '#1a1a2e' }} />
              </div>
            ))}
          </>
        )}
        {/* Bulles par personne */}
        {groupes.map((g) => (
          <div
            key={g.user_id}
            onClick={() => ouvrirGroupe(g)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              padding: '3px',
              background: g.non_vu ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#2a2a3e',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#0a0a0f' }}>
                <img src={g.apercu} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <span style={{ color: '#aaa', fontSize: '11px', maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {g.est_moi ? 'Moi' : g.user_nom.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Modal plein écran */}
      {groupeOuvert && s && (
        <div 
          style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 4000, display: 'flex', flexDirection: 'column' }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
        >
          {/* Tirets de progression */}
          <div style={{ display: 'flex', gap: '4px', padding: '10px 15px 0' }}>
            {groupeOuvert.statuts.map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: '#2a2a3e', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: i < indexStatut ? '100%' : i === indexStatut ? `${progress}%` : '0%', background: '#667eea', transition: 'width 0.1s linear' }} />
              </div>
            ))}
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {groupeOuvert.user_photo && (
                <img src={groupeOuvert.user_photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0 }}>{groupeOuvert.user_nom}</p>
                <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{new Date(s.date_creation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <button onClick={() => setGroupeOuvert(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Image + zones de clic (precedent/suivant) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} onDoubleClick={handleDoubleTap}>
            <div onClick={precedent} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', cursor: indexStatut > 0 ? 'pointer' : 'default', zIndex: 5 }} />
            {s.media_url.match(/\.(mp4|mov|webm|avi)(\?|$)/i) ? (
              <video 
                ref={videoRef}
                src={s.media_url} 
                autoPlay 
                playsInline 
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      setIsPaused(false);
                    } else {
                      videoRef.current.pause();
                      setIsPaused(true);
                    }
                  }
                }}
                onLoadedMetadata={(e) => setDureeVideo(e.currentTarget.duration)}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', cursor: 'pointer' }} 
              />
            ) : (
              <img src={s.media_url} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
            )}
            {showHeart && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, animation: 'popHeart 0.8s ease-out forwards', pointerEvents: 'none' }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="#dc3545" stroke="#dc3545" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
            )}
            <div onClick={suivant} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', cursor: 'pointer', zIndex: 5 }} />
          </div>

          {s.legende && (
            <p style={{ color: 'white', fontSize: '14px', textAlign: 'center', padding: '0 20px 10px', margin: 0 }}>{s.legende}</p>
          )}

          {/* Actions (like + vues) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '15px 20px 30px' }}>
            {groupeOuvert.est_moi && (
              <button onClick={() => setVoirVues(!voirVues)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '14px', fontWeight: 600 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {s.nb_vues} vue{s.nb_vues > 1 ? 's' : ''}
              </button>
            )}
            <button onClick={likerStatut} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: s.like_par_moi ? '#dc3545' : '#888', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={s.like_par_moi ? '#dc3545' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {s.likes}
            </button>
          </div>

          {/* Liste des vues (si c'est mon statut) */}
          {groupeOuvert.est_moi && voirVues && (
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 20px 30px' }}>
              <p style={{ color: '#888', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>Vu par</p>
              {s.vues_par.length === 0 ? (
                <p style={{ color: '#555', fontSize: '13px', textAlign: 'center' }}>Personne pour l'instant</p>
              ) : (
                s.vues_par.map((v) => (
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
