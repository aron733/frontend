import { useState, useRef } from 'react';
import axios from 'axios';
import Vokyvo from './Vokyvo';
import Visio from './Visio';
import Texto from './Texto';
import News from './News';
import { demanderPermissionNotifications, envoyerNotificationTest } from '../notifications';

import { API_URL, MEDIA_URL } from '../config';

function Profil({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [pageActive, setPageActive] = useState<'profil' | 'chat' | 'visio' | 'texto' | 'news'>('profil');
  const [userData, setUserData] = useState(user);
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.photo_profil || null);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem('access_token');

  const deconnexion = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    onLogout();
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photo = e.target.files?.[0];
    if (!photo) return;

    setUploading(true);

    // Aperçu immédiat
    const apercu = URL.createObjectURL(photo);
    setPhotoUrl(apercu);

    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const response = await axios.post(`${API_URL}/upload-photo/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload réussi :', response.data);
      
      // Met à jour l'URL avec la vraie URL du serveur
      const serveurUrl = response.data.photo_url;
      setPhotoUrl(serveurUrl);
      
      // Met à jour le user dans le localStorage
      const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
      userLocal.photo_profil = MEDIA_URL + serveurUrl;
      localStorage.setItem('user', JSON.stringify(userLocal));
      setUserData(userLocal);
      
      alert('Photo de profil mise à jour !');
    } catch (err: any) {
      console.error('Erreur upload :', err);
      alert('Erreur upload : ' + (err.response?.data?.erreur || err.message));
      setPhotoUrl(userData.photo_profil || null);
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const IconeProfil = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const IconeChat = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const IconeVideo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );

  const IconeTexto = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v12H5.17L4 17.17V4z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="12" y2="12" />
    </svg>
  );

  const IconeDeconnexion = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const IconeCamera = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>VOKYVO</h1>
        <button onClick={() => setMenuOuvert(!menuOuvert)} style={styles.hamburger}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {menuOuvert && (
        <div style={styles.menu}>
          <button onClick={() => { setPageActive('profil'); setMenuOuvert(false); }} style={styles.menuItem}>
            <IconeProfil /> Profil
          </button>
          <button onClick={() => { setPageActive('texto'); setMenuOuvert(false); }} style={styles.menuItem}>
            <IconeTexto /> Messages
          </button>
          <button onClick={() => { setPageActive('chat'); setMenuOuvert(false); }} style={styles.menuItem}>
            <IconeChat /> Chat VOKYVO
          </button>
          <button onClick={() => { setPageActive('visio'); setMenuOuvert(false); }} style={styles.menuItem}>
            <IconeVideo /> Appel vidéo
          <button onClick={() => { window.open("https://django-43v1.onrender.com/news/", "_blank"); setMenuOuvert(false); }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg> News
          </button>
          <button onClick={async () => { await demanderPermissionNotifications(); envoyerNotificationTest(); }} style={styles.menuItem}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' /><path d='M13.73 21a2 2 0 0 1-3.46 0' /></svg> Notifications
          </button>
          </button>
          <button onClick={deconnexion} style={{ ...styles.menuItem, color: '#dc3545' }}>
            <IconeDeconnexion /> Déconnexion
          </button>
        </div>
      )}

      <main style={styles.main}>
        {pageActive === 'profil' && (
          <div style={styles.profilCard}>
            <div style={styles.avatarContainer}>
              {photoUrl ? (
                <img src={photoUrl} className="avatar-photo" />
              ) : (
                <div style={styles.avatar}>{userData.prenom?.charAt(0) || userData.first_name?.charAt(0) || '?'}</div>
              )}
              <button onClick={() => photoInputRef.current?.click()} style={styles.cameraBtn} disabled={uploading}>
                <IconeCamera />
              </button>
              <input type="file" ref={photoInputRef} onChange={uploadPhoto} accept="image/*" style={{ display: 'none' }} />
            </div>
            
            {uploading && <p style={{ color: '#aaa' }}>Upload en cours...</p>}
            
            <h2 style={styles.nom}>{userData.prenom || userData.first_name} {userData.nom || userData.last_name}</h2>
            <p style={styles.pseudo}>@{userData.username}</p>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{userData.email || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Pays</span>
                <span style={styles.infoValue}>{userData.pays}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Âge</span>
                <span style={styles.infoValue}>{userData.age} ans</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Sexe</span>
                <span style={styles.infoValue}>{userData.sexe}</span>
              </div>
              {userData.numero && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Téléphone</span>
                  <span style={styles.infoValue}>{userData.numero}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {pageActive === 'texto' && <Texto />}
        {pageActive === 'chat' && <Vokyvo />}
        {pageActive === 'visio' && <Visio />}
        {pageActive === 'news' && <News />}
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', position: 'sticky' as const, top: 0, zIndex: 1000 },
  logo: { color: 'white', fontSize: '22px', margin: 0, fontWeight: 'bold', letterSpacing: '2px' },
  hamburger: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  menu: { position: 'absolute' as const, top: '75px', right: '20px', background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', borderRadius: '15px', padding: '10px', display: 'flex', flexDirection: 'column' as const, gap: '5px', zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' },
  menuItem: { padding: '15px 20px', background: 'transparent', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', textAlign: 'left' as const, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' },
  main: { padding: '20px', display: 'flex', justifyContent: 'center' },
  profilCard: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '25px', padding: '40px', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' as const },
  avatarContainer: { position: 'relative' as const, width: '100px', margin: '0 auto 20px' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold' },
  avatarImg: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' as const },
  cameraBtn: { position: 'absolute' as const, bottom: '0', right: '0', width: '35px', height: '35px', borderRadius: '50%', border: '2px solid white', background: '#667eea', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nom: { color: 'white', fontSize: '26px', margin: '0 0 5px' },
  pseudo: { color: '#aaa', margin: '0 0 30px' },
  infoGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' },
  infoLabel: { color: '#aaa', fontSize: '14px' },
  infoValue: { color: 'white', fontSize: '14px', fontWeight: 'bold' },
};

export default Profil;
