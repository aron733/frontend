import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Profil from './pages/Profil';
import { ecouterNotifications, afficherMessagesManques } from './notifications';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
