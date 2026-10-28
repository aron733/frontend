import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function VideoFeed({ onFermer }: { onFermer: () => void }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/social/posts/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // On ne garde que les posts avec une video
        const avecVideo = (res.data.posts || []).filter((p: any) =>
          p.medias && p.medias.some((m: any) => m.type === 'video')
        );
        setVideos(avecVideo);
      } catch {}
      setChargement(false);
    };
    charger();
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 5000, overflowY: 'auto', scrollSnapType: 'y mandatory' }}>
      {/* Bouton fermer */}
      <button onClick={onFermer} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 5100, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '50%' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {chargement ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '50vh' }}>Chargement...</p>
      ) : videos.length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', marginTop: '50vh' }}>Aucune video pour le moment.</p>
      ) : (
        videos.map((p) => {
          const video = p.medias.find((m: any) => m.type === 'video');
          return (
            <div key={p.id} style={{ height: '100vh', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <video src={video.url} controls autoPlay loop playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', bottom: '30px', left: '20px', right: '20px' }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '5px' }}>{p.user?.username || p.page?.nom}</p>
                {p.texte && <p style={{ color: '#eee', fontSize: '14px' }}>{p.texte}</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
