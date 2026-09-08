import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const WS_URL = 'wss://daphne-5mxe.onrender.com/ws/chat/';

function Chat() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [presence, setPresence] = useState<Record<number, string>>({});
  const [presenceTime, setPresenceTime] = useState<Record<number, string>>({});
  const [, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [rechercheUser, setRechercheUser] = useState('');
  const [fichierSelectionne, setFichierSelectionne] = useState<File | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fichierInputRef = useRef<HTMLInputElement | null>(null);
  const getToken = () => localStorage.getItem('access_token') || '';
  const tempsEcoule = (timestamp: string) => {
    if (!timestamp) return 'Hors ligne';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (diff < 1) return "Il y a moins d'une minute";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) {
      const heures = Math.floor(diff / 60);
      return `Il y a ${heures}h`;
    }
    const jours = Math.floor(diff / 1440);
    return `Il y a ${jours}j`;
  };

  const getMyId = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return parseInt(userData.user_id || userData.id || '0');
  };

  useEffect(() => {
    // Charger la liste des utilisateurs
    const chargerUsers = async () => {
      try {
        // Récupère les conversations pour avoir les photos
        const convResponse = await axios.get(`${API_URL}/conversations/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const convUsers = (convResponse.data.conversations || []).map((c: any) => ({
          id: c.autre_user.id,
          username: c.autre_user.username || '',
          first_name: c.autre_user.prenom || '',
          last_name: c.autre_user.nom || '',
          photo: c.autre_user.photo || null,
        }));
        
        // Récupère aussi tous les users
        const usersResponse = await axios.get(`${API_URL}/rechercher-users/?q=%20`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const allUsers = (usersResponse.data.users || []).map((u: any) => {
          // Stocke la présence depuis la DB
          if (u.est_en_ligne !== undefined) {
            setPresence((prev) => ({ ...prev, [u.id]: u.est_en_ligne ? 'online' : 'offline' }));
            if (u.derniere_activite) {
              setPresenceTime((prev) => ({ ...prev, [u.id]: u.derniere_activite }));
            }
          }
          const convUser = convUsers.find((cu: any) => cu.id === u.id);
          return {
            ...u,
            photo_profil: (convUser && convUser.photo) || u.photo_profil || u.photo || null,
            first_name: u.first_name || u.prenom || '',
            last_name: u.last_name || u.nom || '',
          };
        });
        
        // Fusionne : users des conversations en premier, puis le reste
        const mergedUsers = [...convUsers, ...allUsers.filter((u: any) => 
          !convUsers.find((cu: any) => cu.id === u.id)
        )];
        
        setUsers(mergedUsers);
        setAllUsers(mergedUsers);
      } catch (err) {
        console.error('Erreur chargement users');
      }
    };
    chargerUsers();
  }, []);

  useEffect(() => {
    // Marque en ligne au chargement
    axios.post(`${API_URL}/presence/en-ligne/`, {}, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).catch(() => {});
    
    const ws = new WebSocket(`${WS_URL}?token=${getToken()}`);

    ws.onopen = () => {
      console.log('✅ WebSocket connecté');
      setConnecte(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data]);
      }
      
      if (data.type === 'presence') {
        setPresence((prev) => ({
          ...prev,
          [data.user_id]: data.status,
        }));
        setPresenceTime((prev) => ({
          ...prev,
          [data.user_id]: data.timestamp || new Date().toISOString(),
        }));
      }
    };

    ws.onclose = () => setConnecte(false);
    wsRef.current = ws;

    return () => {
      ws.close();
      // Marque hors ligne
      axios.post(`${API_URL}/presence/hors-ligne/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      }).catch(() => {});
    };
  }, []);

  const selectUser = async (user: any) => {
    setSelectedUser(user);
    setMessages([]);
    
    // Charge l'historique depuis le backend principal
    try {
      const userId = user.id || user.user_id;
      const convResponse = await axios.get(`${API_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const conversations = convResponse.data.conversations || [];
      const conv = conversations.find((c: any) => 
        c.autre_user.id === userId
      );
      
      if (conv) {
        // Marque les messages comme lus
        await axios.post(`${API_URL}/conversations/${conv.id}/marquer-lus/`, {}, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }).catch(() => {});
        
        const msgResponse = await axios.get(`${API_URL}/conversations/${conv.id}/messages/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const msgs = (msgResponse.data.messages || []).map((m: any) => ({
          type: 'message',
          message: m.texte || m.contenu || m.message || '',
          from_user_id: m.expediteur || m.expediteur_id || 0,
          from_username: m.expediteur_username || '',
          lu: m.lu || false,
          fichier_url: m.fichier_url ? (m.fichier_url.startsWith('http') ? m.fichier_url : `https://django-43v1.onrender.com${m.fichier_url}`) : null,
          audio_url: m.audio_url ? (m.audio_url.startsWith('http') ? m.audio_url : `https://django-43v1.onrender.com${m.audio_url}`) : null,
        }));
        
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
  };

  const envoyerMessage = async () => {
    if (!nouveauMessage.trim() || !selectedUser) return;

    const destUserId = selectedUser.id || selectedUser.user_id;
    
    // Envoie via l'API REST du backend principal (sauvegarde en PostgreSQL)
    try {
      const convResponse = await axios.get(`${API_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const conversations = convResponse.data.conversations || [];
      let conv = conversations.find((c: any) => c.autre_user.id === destUserId);
      
      if (!conv) {
        // Créer la conversation
        const createRes = await axios.post(`${API_URL}/conversations/creer/`, {
          user2_id: destUserId,
        }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        conv = { id: createRes.data.conversation_id };
      }
      
      if (conv) {
        const formData = new FormData();
        if (nouveauMessage.trim()) {
          formData.append('texte', nouveauMessage);
        }
        if (fichierSelectionne) {
          formData.append('fichier', fichierSelectionne);
        }
        
        await axios.post(`${API_URL}/conversations/${conv.id}/envoyer/`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }
      
      // Ajoute au state local
      setMessages((prev) => [...prev, {
        type: 'message',
        message: nouveauMessage,
        from_user_id: getMyId(),
        from_username: 'Moi',
      }]);
      
      // Notification via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'message',
          dest_user_id: destUserId,
          message: nouveauMessage,
        }));
      }
      
      setNouveauMessage('');
      setFichierSelectionne(null);
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  };

  const usersFiltres = allUsers.filter((user) => {
    const nomComplet = `${user.first_name || ''} ${user.last_name || ''} ${user.username || ''}`.toLowerCase();
    return nomComplet.includes(rechercheUser.toLowerCase());
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => window.location.reload()} style={styles.backButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button onClick={() => setMenuOuvert(!menuOuvert)} style={styles.hamburger}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 style={styles.title}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <path d="M4 4h16v12H5.17L4 17.17V4z" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="12" y2="12" />
          </svg>
          Messages
        </h2>
        <span style={connecte ? styles.online : styles.offline}>
          {connecte ? '● Connecté' : '○ Déconnecté'}
        </span>
      </div>

      <div style={styles.body}>
        {/* Menu hamburger avec liste des utilisateurs */}
        {menuOuvert && (
        <div style={styles.userList}>
          <input
            type="text"
            value={rechercheUser}
            onChange={(e) => setRechercheUser(e.target.value)}
            placeholder="Rechercher..."
            style={styles.searchInput}
          />
          {usersFiltres.map((user) => (
              <button
                key={user.id || user.user_id}
                onClick={() => { selectUser(user); setMenuOuvert(false); }}
                style={{
                  ...styles.userItem,
                  background: selectedUser?.id === user.id || selectedUser?.user_id === user.user_id ? '#2a2a3e' : 'transparent',
                }}
              >
                {user.photo_profil || user.photo ? (
                  <img src={user.photo_profil || user.photo} style={styles.userPhoto} alt="" />
                ) : (
                  <span style={styles.userAvatar}>{((user.first_name || user.prenom || user.username || '?')[0] || '?').toUpperCase()}</span>
                )}
                <span style={presence[user.id || user.user_id] === 'online' ? styles.userOnline : styles.userOffline}>● {presence[user.id || user.user_id] === 'online' ? 'En ligne' : tempsEcoule(presenceTime[user.id || user.user_id] || '')}</span>
                {user.first_name || user.prenom || ''} {user.last_name || user.nom || ''}
              </button>
          ))}
        </div>
        )}

        {/* Zone de chat */}
        <div style={styles.chatArea}>
          {selectedUser ? (
            <>
              <div style={styles.chatHeader}>
                {selectedUser.photo_profil || selectedUser.photo ? (
                  <img src={selectedUser.photo_profil || selectedUser.photo} style={styles.chatPhoto} alt="" />
                ) : (
                  <span style={styles.chatAvatar}>👤</span>
                )}
                <h3 style={styles.chatTitle}>
                  {selectedUser.first_name || selectedUser.prenom || ''} {selectedUser.last_name || selectedUser.nom || ''}
                </h3>
                <span style={presence[selectedUser.id || selectedUser.user_id] === 'online' ? styles.userOnline : styles.userOffline}>
                  {presence[selectedUser.id || selectedUser.user_id] === 'online' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>

              <div style={styles.messagesArea}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={msg.from_user_id === getMyId() ? styles.messageMoi : styles.messageAutre}
                  >
                    <span style={styles.messageText}>{msg.message}</span>
                {msg.fichier_url && (
                  <img src={msg.fichier_url} style={styles.messageImage} alt="fichier" />
                )}
                {msg.audio_url && (
                  <audio src={msg.audio_url} style={styles.messageAudio} controls />
                )}
                {msg.from_user_id === getMyId() && (
                  <span style={styles.tick}>{msg.lu ? '✓✓' : '✓'}</span>
                )}
                  </div>
                ))}
              </div>

              {fichierSelectionne && (
                <div style={styles.fichierApercu}>
                  <span>📎 {fichierSelectionne.name}</span>
                  <button onClick={() => setFichierSelectionne(null)} style={styles.fichierRetirer}>✕</button>
                </div>
              )}
              {fichierSelectionne && (
                <div style={styles.fichierApercu}>
                  <span>📎 {fichierSelectionne.name}</span>
                  <button onClick={() => setFichierSelectionne(null)} style={styles.fichierRetirer}>✕</button>
                </div>
              )}
              <div style={styles.inputArea}>
                <button type="button" onClick={() => fichierInputRef.current?.click()} style={styles.uploadBtn}>
                  📎
                </button>
                <input
                  ref={fichierInputRef}
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => setFichierSelectionne(e.target.files?.[0] || null)}
                />
                <input
                  type="text"
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && envoyerMessage()}
                  placeholder="Écris un message..."
                  style={styles.input}
                />
                <button onClick={envoyerMessage} style={styles.sendButton}>➤</button>
              </div>
            </>
          ) : (
            <p style={styles.empty}>Sélectionne un utilisateur pour commencer</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '100vw',
    background: '#0a0a0f',
    zIndex: 1000,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    background: 'rgba(17,17,32,0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 200,
  },
  title: { color: 'white', margin: 0, fontSize: '17px', flex: 1, fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center' },
  backButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '38px',
    height: '38px',
  },
  hamburger: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '38px',
    height: '38px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px',
    borderRadius: '20px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '10px',
  },
  online: { color: '#28a745', fontSize: '12px' },
  offline: { color: '#dc3545', fontSize: '12px' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  userList: {
    position: 'absolute' as const,
    top: '60px',
    left: 0,
    width: '80%',
    maxWidth: '300px',
    zIndex: 50,
    borderRight: '1px solid #1a1a2a',
    overflowY: 'auto' as const,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  userItem: {
    padding: '12px 15px',
    borderRadius: '10px',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userOnline: { color: '#28a745', fontSize: '10px' },
  userPhoto: { width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' as const },
  userAvatar: { fontSize: '16px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#667eea', borderRadius: '50%', color: 'white', fontWeight: 'bold' },
  chatPhoto: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' as const },
  chatAvatar: { fontSize: '25px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userOffline: { color: '#666', fontSize: '10px' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' as const, width: '100%' },
  chatHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #1a1a2a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: { color: 'white', margin: 0, fontSize: '16px' },
  messagesArea: {
    flex: 1,
    padding: '20px 20px 80px 20px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  messageMoi: {
    alignSelf: 'flex-end' as const,
    background: '#667eea',
    padding: '10px 15px',
    borderRadius: '15px 15px 0 15px',
    maxWidth: '70%',
  },
  messageAutre: {
    alignSelf: 'flex-start' as const,
    background: '#1a1a2e',
    padding: '10px 15px',
    borderRadius: '15px 15px 15px 0',
    maxWidth: '70%',
  },
  messageText: { color: 'white', fontSize: '14px' },
  tick: { color: '#4fc3f7', fontSize: '10px', marginLeft: '5px' },
  messageImage: { maxWidth: '100%', maxHeight: '250px', borderRadius: '10px', marginTop: '5px' },
  messageAudio: { maxWidth: '100%', marginTop: '5px' },
  empty: { color: '#666', textAlign: 'center' as const, marginTop: '50px' },
  inputArea: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    gap: '10px',
    padding: '15px',
    borderTop: '1px solid #1a1a2a',
    background: '#111120',
    zIndex: 100,
    maxWidth: '500px',
    margin: '0 auto',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '20px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  uploadBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: '#aaa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  sendButton: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  fichierApercu: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    background: 'rgba(102,126,234,0.15)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '12px',
    marginBottom: '5px',
  },
  fichierRetirer: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Chat;
