import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

interface SocialPageProfilProps {
  pageId: number;
  onRetour: () => void;
}

export default function SocialPageProfil({ pageId, onRetour }: SocialPageProfilProps) {
  const [page, setPage] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [suiviEnCours, setSuiviEnCours] = useState(false);
  const [modalModifier, setModalModifier] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editEnCours, setEditEnCours] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const charger = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/social/pages/${pageId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPage(res.data.page);
      setPosts(res.data.posts || []);
    } catch {
      toast.error('Erreur de chargement de la Page');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, [pageId]);

  const toggleSuivre = async () => {
    if (!page || suiviEnCours) return;
    setSuiviEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(
        `${API_URL}/social/pages/${pageId}/suivre/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPage({
        ...page,
        je_suis: res.data.suivi,
        nb_abonnes: page.nb_abonnes + (res.data.suivi ? 1 : -1),
      });
    } catch {
      toast.error('Erreur');
    } finally {
      setSuiviEnCours(false);
    }
  };

  const ouvrirModifier = () => {
    if (!page) return;
    setEditNom(page.nom || '');
    setEditDescription(page.description || '');
    setEditPhoto(null);
    setModalModifier(true);
  };

  const sauvegarder = async () => {
    if (!page || editEnCours) return;
    if (!editNom.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    setEditEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('nom', editNom.trim());
      formData.append('description', editDescription.trim());
      if (editPhoto) formData.append('photo', editPhoto);

      const res = await axios.post(
        `${API_URL}/social/pages/${pageId}/modifier/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        setPage({ ...page, ...res.data.page });
        setModalModifier(false);
        toast.success('Page mise a jour');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.erreur || 'Erreur lors de la mise a jour';
      toast.error(msg);
    } finally {
      setEditEnCours(false);
    }
  };

  if (chargement) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Chargement…
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', gap: '16px' }}>
        <p>Page introuvable.</p>
        <button onClick={onRetour} style={{ padding: '10px 20px', borderRadius: '10px', background: '#667eea', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Retour</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: '80px' }}>
      {/* Header sticky */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '12px 20px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{page.nom}</h1>
      </div>

      {/* Bannière / avatar */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div
            onClick={() => { if (page.photo) setPhotoUrl(page.photo); }}
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1a1a2e', border: '2px solid #2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: page.photo ? 'pointer' : 'default' }}
          >
            {page.photo ? (
              <img src={page.photo} alt={page.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', color: '#667eea', fontWeight: 900 }}>{page.nom.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', fontSize: '20px', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {page.nom}
              {page.verifiee && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#667eea"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              )}
            </h2>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{page.nb_abonnes} abonné{page.nb_abonnes > 1 ? 's' : ''} · {posts.length} post{posts.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {page.description && (
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>{page.description}</p>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {page.est_proprietaire ? (
            <>
              <button disabled style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', color: '#667eea', fontWeight: 600, fontSize: '14px', cursor: 'default' }}>
                Votre Page
              </button>
              <button onClick={ouvrirModifier} style={{ padding: '12px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid #2a2a3e', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Modifier
              </button>
            </>
          ) : (
            <button
              onClick={toggleSuivre}
              disabled={suiviEnCours}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', background: page.je_suis ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: page.je_suis ? '1px solid #2a2a3e' : 'none', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: suiviEnCours ? 'not-allowed' : 'pointer', opacity: suiviEnCours ? 0.7 : 1 }}
            >
              {page.je_suis ? 'Ne plus suivre' : 'Suivre'}
            </button>
          )}
        </div>
      </div>

      {/* Lightbox photo PP */}
      {photoUrl && (
        <div onClick={() => setPhotoUrl(null)} style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <img src={photoUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          <button onClick={(e) => { e.stopPropagation(); setPhotoUrl(null); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Modale modification Page */}
      {modalModifier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { if (!editEnCours) setModalModifier(false); }}>
          <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>Modifier la Page</h3>

            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>Nom *</label>
            <input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} maxLength={80} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '16px', outline: 'none' }} />

            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={280} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#fff', marginBottom: '16px', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />

            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Photo de profil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1a1a2e', border: '2px solid #2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {editPhoto ? (
                  <img src={URL.createObjectURL(editPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : page.photo ? (
                  <img src={page.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '24px', color: '#667eea', fontWeight: 900 }}>{page.nom.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #2a2a3e', color: '#fff', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Changer la photo
                <input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalModifier(false)} disabled={editEnCours} style={{ padding: '12px 22px', borderRadius: '10px', background: 'transparent', border: '1px solid #2a2a3e', color: '#aaa', cursor: editEnCours ? 'not-allowed' : 'pointer', fontWeight: 600 }}>Annuler</button>
              <button onClick={sauvegarder} disabled={editEnCours || !editNom.trim()} style={{ padding: '12px 22px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', cursor: editEnCours || !editNom.trim() ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: editEnCours || !editNom.trim() ? 0.7 : 1 }}>
                {editEnCours ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox plein écran */}
      {lightboxIndex !== null && posts[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          {posts[lightboxIndex].medias?.[0]?.type === 'video' ? (
            <video src={posts[lightboxIndex].medias[0].url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
          ) : posts[lightboxIndex].medias?.[0]?.url ? (
            <img src={posts[lightboxIndex].medias[0].url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
          ) : (
            <div style={{ background: posts[lightboxIndex].couleur_fond || '#1a1a2e', padding: '40px', borderRadius: '12px', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <p style={{ color: '#fff', fontSize: '18px', textAlign: 'center', margin: 0, whiteSpace: 'pre-wrap' }}>{posts[lightboxIndex].texte}</p>
            </div>
          )}
          {/* Fleches navigation */}
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>‹</button>
          )}
          {lightboxIndex < posts.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>›</button>
          )}
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
      )}

      {/* Posts de la Page - Grille 3 colonnes */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2px' }}>
        {posts.length === 0 ? (
          <p style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>Aucun post pour le moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {posts.map((p, index) => {
              const premierMedia = p.medias?.[0];
              return (
                <div key={p.id} onClick={() => setLightboxIndex(index)} style={{ aspectRatio: '1', background: '#111120', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                  {premierMedia ? (
                    premierMedia.type === 'video' ? (
                      <>
                        {premierMedia.miniature ? (
                          <img src={premierMedia.miniature} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff" opacity="0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{p.nb_vues || 0}</span>
                        </div>
                      </>
                    ) : (
                      <img src={premierMedia.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: p.couleur_fond || '#1a1a2e' }}>
                      <p style={{ color: '#fff', fontSize: '12px', textAlign: 'center', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{p.texte}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
