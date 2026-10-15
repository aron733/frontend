// import axios from 'axios';  // Test : désactive refresh badge
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import Landing from './pages/Landing';
import Profil from './pages/Profil';
// import ModalCompleterProfil from './ModalCompleterProfil';  // Désactivé - remplacé par modal Modifier profil
import NotFound from './pages/NotFound';
import BandeauOffline from './BandeauOffline';
import { ecouterNotifications, afficherMessagesManques } from './notifications';
import { API_URL, getUserSecurise } from './config';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Le bandeau offline est géré par <BandeauOffline />

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0a0a0f' });
  }, []);

  // Ecoute les deep links (App Links Android)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = CapacitorApp.addListener('appUrlOpen', async (event: any) => {
      try {
        const url = new URL(event.url);
        const token = url.searchParams.get('access_token');
        const userId = url.searchParams.get('user_id');
        const refreshToken = url.searchParams.get('refresh_token');
        const email = url.searchParams.get('email');
        const prenom = url.searchParams.get('prenom');
        const nom = url.searchParams.get('nom');
        const photo = url.searchParams.get('photo');

        // Gestion erreurs OAuth (maintenance / banni)
        const oauthError = url.searchParams.get('error');
        const oauthRaison = url.searchParams.get('raison') || '';
        if (oauthError) {
          // Stocke dans localStorage pour que Landing l'affiche
          if (oauthError === 'maintenance') {
            localStorage.setItem('ban_raison', oauthRaison || 'Maintenance en cours');
            localStorage.setItem('ban_type', 'global_banned');
          } else if (oauthError === 'banned') {
            localStorage.setItem('ban_raison', oauthRaison || 'Compte banni');
            localStorage.setItem('ban_type', 'user_banned');
          }
          // Force reload pour que Landing affiche le modal
          window.location.href = '/';
          return;
        }

        if (token && userId) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken || '');
          localStorage.setItem('user', JSON.stringify({
            user_id: userId, email, prenom, nom, photo_profil: photo,
          }));
          try {
            const { default: ax } = await import('axios');
            const API = API_URL;
            const rep = await ax.get(`${API}/verifier-acces/`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (rep.data) {
              const stored = getUserSecurise() || {};
              if (rep.data.badge_verifie !== undefined) stored.badge_verifie = rep.data.badge_verifie;
              if (rep.data.photo_profil) stored.photo_profil = rep.data.photo_profil;
              if (rep.data.est_banni !== undefined) stored.est_banni = rep.data.est_banni;
              if (rep.data.pays) stored.pays = rep.data.pays;
              if (rep.data.age) stored.age = rep.data.age;
              if (rep.data.sexe) stored.sexe = rep.data.sexe;
              if (rep.data.numero) stored.numero = rep.data.numero;
              if (rep.data.prenom) stored.prenom = rep.data.prenom;
              if (rep.data.nom) stored.nom = rep.data.nom;
              localStorage.setItem('user', JSON.stringify(stored));
              setShowSuccess(true);
            }
          } catch (e) { console.warn('appUrlOpen verifier-acces', e); }
        }
      } catch (e) {
        console.warn('appUrlOpen error', e);
      }
    });
    return () => { listener.then((l: any) => l.remove()); };
  }, []);

  useEffect(() => {
    // Gère le callback Google OAuth
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const userId = params.get('user_id');
    const email = params.get('email');
    const prenom = params.get('prenom');
    const nom = params.get('nom');
    const photo = params.get('photo');
    
    if (accessToken && userId) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken || '');
      localStorage.setItem('user', JSON.stringify({
        user_id: userId,
        email: email,
        prenom: prenom,
        nom: nom,
        photo_profil: photo,
      }));
      
      // Nettoie l'URL
      window.history.replaceState({}, document.title, '/');
      
      // Redémarre avec le user
      // Recharge les infos completes du user (badge, photo uploadee, etc.)
      (async () => {
        try {
          const { default: ax } = await import('axios');
          const API = API_URL;
          const rep = await ax.get(`${API}/verifier-acces/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (rep.data) {
            const stored = getUserSecurise() || {};
            if (rep.data.badge_verifie !== undefined) stored.badge_verifie = rep.data.badge_verifie;
            if (rep.data.photo_profil) stored.photo_profil = rep.data.photo_profil;
            if (rep.data.est_banni !== undefined) stored.est_banni = rep.data.est_banni;
            if (rep.data.pays) stored.pays = rep.data.pays;
            if (rep.data.age) stored.age = rep.data.age;
            if (rep.data.sexe) stored.sexe = rep.data.sexe;
            if (rep.data.numero) stored.numero = rep.data.numero;
            localStorage.setItem('user', JSON.stringify(stored));
            setShowSuccess(true);
          }
        } catch (e) {}
      })();
    }
  }, []);

  // Détection 404 : URL inconnue
  useEffect(() => {
    const path = window.location.pathname;
    const routesValides = [
      '/', '/a-propos', '/blog', '/cgu', '/confidentialite',
      '/aron-vokouma', '/desabonnement', '/supprimer-compte',
      '/oauth-callback', '/oauth/google/callback'
    ];
    // Le path est valide s'il est dans la liste OU s'il commence par /blog/
    const estValide = routesValides.includes(path) || path.startsWith('/blog/');
    if (!estValide) {
      setNotFound(true);
    }
  }, []);

  useEffect(() => {
    const userData = getUserSecurise();
    const token = localStorage.getItem('access_token');

    if (userData && token) {
      setUser(userData);
    }

    // Écoute les mises à jour du user (via WS badge_update)
    const handleUserUpdated = (e: any) => {
      setUser(e.detail);
    };
    window.addEventListener('user-updated', handleUserUpdated);

    // Écoute les notifications
    ecouterNotifications();

    // Affiche les messages manqués
    setTimeout(() => {
      afficherMessagesManques();
    }, 1000);

    setLoading(false);

    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
    }

    return () => {
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []);

//   const rafraichirUser = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
//       if (!token) return;
//       const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.vokyvo.com/api';
//       const r = await axios.get(`${API_URL}/verifier-acces/`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (r.data && r.data.user_id) {
//         const current = JSON.parse(localStorage.getItem('user') || '{}');
//         const updated = {
//           ...current,
//           badge_verifie: r.data.badge_verifie,
//           est_banni: r.data.est_banni,
//           est_actif: r.data.est_actif,
//         };
//         localStorage.setItem('user', JSON.stringify(updated));
//         setUser(updated);
//       }
//     } catch (err) {
//       // silencieux
//     }
//   };

  const handleLogin = (data: any) => {
    setUser(data);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        
      </div>
    );
  }

  // Ecran succes apres OAuth Google
  if (showSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#succesGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="succesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
          <h2 style={styles.successTitle}>Connexion réussie !</h2>
          <p style={styles.successText}>
            Bienvenue {(user && (user.prenom || user.first_name)) || ''} sur VOKYVO.
          </p>
          <button
            onClick={async () => {
              try {
                const { default: ax } = await import('axios');
                const API = API_URL;
                const token = localStorage.getItem('access_token');
                const rep = await ax.get(`${API}/verifier-acces/`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (rep.data) {
                  const stored = getUserSecurise() || {};
                  Object.assign(stored, {
                    badge_verifie: rep.data.badge_verifie,
                    photo_profil: rep.data.photo_profil || stored.photo_profil,
                    est_banni: rep.data.est_banni,
                    pays: rep.data.pays,
                    age: rep.data.age,
                    sexe: rep.data.sexe || stored.sexe,
                    numero: rep.data.numero,
                    prenom: rep.data.prenom || stored.prenom,
                    nom: rep.data.nom || stored.nom,
                  });
                  localStorage.setItem('user', JSON.stringify(stored));
                  setUser(stored);
                }
              } catch (e) {}
              setShowSuccess(false);
            }}
            style={styles.successBtn}
          >
            Voir mon profil
          </button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <NotFound />;
  }

  return (
    <>
      <BandeauOffline />
      {user ? (
        <>
          <Profil user={user} onLogout={handleLogout} />
          {/* <ModalCompleterProfil /> */}
        </>
      ) : (
        <Landing onLogin={handleLogin} />
      )}
    </>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  loadingText: {
    color: 'white',
    fontSize: '20px',
  },
  successContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#0a0a0f',
    padding: '20px',
  },
  successCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '30px 20px',
    maxWidth: '400px',
    width: '100%',
  },
  successTitle: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '15px',
  },
  successText: {
    color: '#888',
    fontSize: '15px',
    lineHeight: 1.6,
    marginBottom: '30px',
  },
  successBtn: {
    padding: '14px 30px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
};

export default App;
