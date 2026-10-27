import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import BadgeVerifie from '../BadgeVerifie';

interface DashboardProps {
  user: any;
  onNavigate: (page: 'vokyvo' | 'messages' | 'news' | 'profil' | 'social', convId?: string) => void;
  onPhotoClick: (url: string) => void;
}

export default function Dashboard({ user, onNavigate, onPhotoClick }: DashboardProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [nbPrecedentDashboard, setNbPrecedentDashboard] = useState(() => parseInt(localStorage.getItem('vokyvo_dashboard_count') || '3'));
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
        setNbPrecedentDashboard(Math.min(3, (res.data.conversations || []).length));
        localStorage.setItem('vokyvo_dashboard_count', String(Math.min(3, (res.data.conversations || []).length)));
      } catch (e) {}
      
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/groupes/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroupes((res.data.groupes || []).slice(0, 2));
        setChargement(false);
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
          <h1 style={styles.bonjour}>
            Bonjour {prenom} 👋
            {user?.badge_verifie && <BadgeVerifie size={20} />}
          </h1>
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
          <span style={styles.cardLabel}>Messages</span>
        </button>

        <button onClick={() => onNavigate('vokyvo')} style={styles.card}>
          <div style={{ ...styles.iconWrap, background: 'rgba(118,75,162,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
            </svg>
          </div>
          <span style={styles.cardLabel}>Vokyvo AI</span>
        </button>

        <button onClick={() => onNavigate('social')} style={styles.card}>
          <div style={{ ...styles.iconWrap, background: 'rgba(34,197,94,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span style={styles.cardLabel}>Social</span>
        </button>

        <button onClick={() => onNavigate('news')} style={styles.card}>
          <div style={{ ...styles.iconWrap, background: 'rgba(40,167,69,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <path d="M18 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
              <line x1="6" y1="8" x2="12" y2="8" />
              <line x1="6" y1="12" x2="12" y2="12" />
              <line x1="6" y1="16" x2="10" y2="16" />
            </svg>
          </div>
          <span style={styles.cardLabel}>Actus</span>
        </button>


      </div>

      {/* Dernières conversations */}
      <h2 style={styles.sectionTitle}>Derniers messages</h2>
      {chargement && conversations.length === 0 && groupes.length === 0 && (
        <>
          {Array.from({ length: nbPrecedentDashboard }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '50%', height: '14px', borderRadius: '4px', background: '#1a1a2e', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '30%', height: '12px', borderRadius: '4px', background: '#1a1a2e', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </>
      )}
      {conversations.length === 0 && groupes.length === 0 ? (
        <p style={styles.vide}>Aucune conversation récente.</p>
      ) : (
        <div style={styles.liste}>
          {conversations.map((c) => (
            <div key={`c-${c.id}`} style={styles.item} onClick={() => onNavigate('messages', `user_${c.autre_user.id}`)}>
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
            <div key={`g-${g.id}`} style={styles.item} onClick={() => onNavigate('messages', `groupe_${g.id}`)}>
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
