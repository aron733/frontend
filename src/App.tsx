import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Profil from './pages/Profil';
import { ecouterNotifications, afficherMessagesManques } from './notifications';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    // Écoute les notifications d'appel entrant
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION') {
          const body = event.data.body || '';
          if (body.includes('Appel entrant')) {
            // Affiche un popup d'appel entrant
            const popup = document.createElement('div');
            popup.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.9);
              z-index: 99999;
              display: flex;
              flexDirection: column;
              alignItems: center;
              justifyContent: center;
              gap: 20px;
              padding: 20px;
            `;
            popup.innerHTML = `
              <div style="width: 80px; height: 80px; border-radius: 50%; background: #667eea; display: flex; align-items: center; justify-content: center; animation: pulse 1.5s infinite;">
                <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                </svg>
              </div>
              <p style="color: white; font-size: 22px; font-weight: bold; margin: 0;">${event.data.title}</p>
              <p style="color: #aaa; font-size: 16px; margin: 0;">Appel vidéo entrant...</p>
              <div style="display: flex; gap: 20px; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.remove()" style="width: 60px; height: 60px; border-radius: 50%; border: none; background: #dc3545; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(220,53,69,0.5);">
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    <line x1="4" y1="4" x2="20" y2="20"/>
                  </svg>
                </button>
                <button onclick="this.parentElement.parentElement.remove(); alert('Appel video accepte !');" style="width: 60px; height: 60px; border-radius: 50%; border: none; background: #28a745; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(40,167,69,0.5);">
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </button>
              </div>
              <style>
                @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
              </style>
            `;
            document.body.appendChild(popup);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    // Écoute les notifications d'appel
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION') {
          const body = event.data.body || '';
          if (body.includes('Appel entrant')) {
            // Affiche un popup d'appel entrant
            const popup = document.createElement('div');
            popup.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #1a1a2e;
              color: white;
              padding: 30px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.8);
              z-index: 99999;
              text-align: center;
              border: 2px solid #28a745;
            `;
            popup.innerHTML = `
              <p style="font-size: 40px; margin: 0 0 15px;">📞</p>
              <p style="font-size: 20px; font-weight: bold; margin: 0 0 5px; color: white;">${event.data.title}</p>
              <p style="font-size: 14px; margin: 0 0 20px; color: #aaa;">Appel vidéo entrant...</p>
              <button onclick="this.parentElement.remove()" style="padding: 12px 25px; border-radius: 25px; border: none; background: #28a745; color: white; font-weight: bold; font-size: 16px; cursor: pointer;">Accepter</button>
              <button onclick="this.parentElement.remove()" style="padding: 12px 25px; border-radius: 25px; border: none; background: #dc3545; color: white; font-weight: bold; font-size: 16px; cursor: pointer; margin-left: 10px;">Refuser</button>
            `;
            document.body.appendChild(popup);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
    }
    
    // Écoute les notifications
    ecouterNotifications();
    
    // Affiche les messages manqués
    setTimeout(() => {
      afficherMessagesManques();
    }, 1000);
    
    setLoading(false);
  }, []);

  const handleLogin = (data: any) => {
    setUser(data);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingText}>Chargement...</p>
      </div>
    );
  }

  return user ? (
    <Profil user={user} onLogout={handleLogout} />
  ) : (
    <Landing onLogin={handleLogin} />
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
};

export default App;
