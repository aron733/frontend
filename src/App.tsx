import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Profil from './pages/Profil';
import { ecouterNotifications, afficherMessagesManques } from './notifications';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
