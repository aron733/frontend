import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface DashboardProps {
  user: any;
  onNavigate: (page: 'vokyvo' | 'messages' | 'news' | 'profil') => void;
  onPhotoClick: (url: string) => void;
}

export default function Dashboard({ user, onNavigate, onPhotoClick }: DashboardProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [groupes, setGroupes] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setPhotoUrl(u.photo_profil || null);
    }

    // Charge les conversations récentes
    const charger = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/conversations/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations((res.data.conversations || []).slice(0, 3));
      } catch (e) {}
      
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/groupes/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroupes((res.data.groupes || []).slice(0, 2));
      } catch (e) {}
    };
    charger();
  }, []);

  const prenom = user?.prenom || user?.first_name || user?.username || 'Utilisateur';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.bonjour}>Bonjour {prenom} 👋</h1>
          <p style={styles.sousTitre}>Que veux-tu faire aujourd'hui ?</p>
        </div>
        <div 
          style={styles.avatar} 
          onClick={() => { if (photoUrl) onPhotoClick(photoUrl); }}
        >
          {photoUrl ? (
            <img src={photoUrl} style={styles.avatarImg} alt="" />
          ) : (
            <span style={styles.avatarTexte}>{prenom.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Grille de raccourcis */}
      <div style={styles.grid}>
        <button onClick={() => onNavigate('messages')} style={styles.card}>
          <div style={{ ...styles.iconWrap, background: 'rgba(102,126,234,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span style={styles.cardLabel}>Chat</span>
        </button>

        <button onClick={() => onNavigate('vokyvo')} style={styles.card}>
          <div style={{ ...styles.iconWrap, background: 'rgba(118,75,162,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>
          <span style={styles.cardLabel}>Vokyvo AI</span>
        </button>

        <button onClick={() => onNavigate('news')} style={styles.card}>
          <div style={{ ...styles.iconWrap, background: 'rgba(40,167,69,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
            </svg>
          </div>
          <span style={styles.cardLabel}>News</span>
        </button>


      </div>

      {/* Dernières conversations */}
      <h2 style={styles.sectionTitle}>Derniers messages</h2>
      {conversations.length === 0 && groupes.length === 0 ? (
        <p style={styles.vide}>Aucune conversation récente.</p>
      ) : (
        <div style={styles.liste}>
          {conversations.map((c) => (
            <div key={`c-${c.id}`} style={styles.item} onClick={() => onNavigate('messages')}>
              <div 
                style={styles.itemAvatar}
                onClick={(e) => { e.stopPropagation(); if (c.autre_user?.photo) onPhotoClick(c.autre_user.photo); }}
              >
                {c.autre_user?.photo ? (
                  <img src={c.autre_user.photo} style={styles.itemAvatarImg} alt="" />
                ) : (
                  <span style={styles.itemAvatarTexte}>{(c.autre_user?.first_name || '?').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={styles.itemNom}>{c.autre_user?.first_name || c.autre_user?.username}</p>
                <p style={styles.itemTexte}>{c.dernier_message || 'Nouvelle conversation'}</p>
              </div>
            </div>
          ))}
          {groupes.map((g) => (
            <div key={`g-${g.id}`} style={styles.item} onClick={() => onNavigate('messages')}>
              <div 
                style={styles.itemAvatar}
                onClick={(e) => { e.stopPropagation(); if (g.photo_profil) onPhotoClick(g.photo_profil); }}
              >
                {g.photo_profil ? (
                  <img src={g.photo_profil} style={styles.itemAvatarImg} alt="" />
                ) : (
                  <span style={styles.itemAvatarTexte}>{g.nom.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={styles.itemNom}>{g.nom}</p>
                <p style={styles.itemTexte}>{g.participants?.length || 0} membres</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    paddingBottom: '80px',
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    marginTop: '10px',
  },
  bonjour: {
    color: 'white',
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
  },
  sousTitre: {
    color: '#888',
    fontSize: '14px',
    margin: '5px 0 0 0',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarTexte: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '30px',
  },
  card: {
    background: '#111120',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  iconWrap: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
  },
  sectionTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '15px',
  },
  vide: {
    color: '#888',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '20px',
  },
  liste: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#111120',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
  },
  itemAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemAvatarTexte: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  itemNom: {
    color: 'white',
    fontSize: '15px',
    fontWeight: 600,
    margin: 0,
  },
  itemTexte: {
    color: '#888',
    fontSize: '13px',
    margin: '2px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
