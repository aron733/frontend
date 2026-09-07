import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const WS_URL = 'wss://daphne-5mxe.onrender.com/ws/chat/';

function Chat() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [presence, setPresence] = useState<Record<number, string>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const token = localStorage.getItem('access_token') || '';
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = parseInt(userData.user_id || '0');

  useEffect(() => {
    // Charger la liste des utilisateurs
    const chargerUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/rechercher-users/?q=%20`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users || []);
      } catch (err) {
        console.error('Erreur chargement users');
      }
    };
    chargerUsers();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

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
      }
    };

    ws.onclose = () => setConnecte(false);
    wsRef.current = ws;

    return () => ws.close();
  }, []);

  const selectUser = async (user: any) => {
    setSelectedUser(user);
    setMessages([]);
    
    // Charge l'historique depuis le backend principal
    try {
      const userId = user.id || user.user_id;
      const convResponse = await axios.get(`${API_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const conversations = convResponse.data.conversations || [];
      const conv = conversations.find((c: any) => 
        c.autre_user.id === userId
      );
      
      if (conv) {
        const msgResponse = await axios.get(`${API_URL}/conversations/${conv.id}/messages/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const msgs = (msgResponse.data.messages || []).map((m: any) => ({
          type: 'message',
          message: m.contenu || m.message || m.texte || '',
          from_user_id: m.expediteur || m.expediteur_id || 0,
          from_username: m.expediteur_username || '',
        }));
        
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
  };

  const envoyerMessage = () => {
    if (!nouveauMessage.trim() || !wsRef.current || !selectedUser) return;

    const destUserId = selectedUser.id || selectedUser.user_id;
    
    wsRef.current.send(JSON.stringify({
      action: 'message',
      dest_user_id: destUserId,
      message: nouveauMessage,
    }));

    setMessages((prev) => [...prev, {
      type: 'message',
      message: nouveauMessage,
      from_user_id: myId,
      from_username: 'Moi',
    }]);

    setNouveauMessage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💬 Messages</h2>
        <span style={connecte ? styles.online : styles.offline}>
          {connecte ? '● Connecté' : '○ Déconnecté'}
        </span>
      </div>

      <div style={styles.body}>
        {/* Liste des utilisateurs */}
        <div style={styles.userList}>
          {users.map((user) => {
            const isOnline = presence[user.id || user.user_id] === 'online';
            return (
              <button
                key={user.id || user.user_id}
                onClick={() => selectUser(user)}
                style={{
                  ...styles.userItem,
                  background: selectedUser?.id === user.id || selectedUser?.user_id === user.user_id ? '#2a2a3e' : 'transparent',
                }}
              >
                <span style={isOnline ? styles.userOnline : styles.userOffline}>●</span>
                {user.first_name || user.prenom || ''} {user.last_name || user.nom || ''}
              </button>
            );
          })}
        </div>

        {/* Zone de chat */}
        <div style={styles.chatArea}>
          {selectedUser ? (
            <>
              <div style={styles.chatHeader}>
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
                    style={msg.from_user_id === myId ? styles.messageMoi : styles.messageAutre}
                  >
                    <span style={styles.messageText}>{msg.message}</span>
                  </div>
                ))}
              </div>

              <div style={styles.inputArea}>
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
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#0a0a0f',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    background: '#111120',
    borderBottom: '1px solid #1a1a2a',
  },
  title: { color: 'white', margin: 0, fontSize: '18px' },
  online: { color: '#28a745', fontSize: '12px' },
  offline: { color: '#dc3545', fontSize: '12px' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  userList: {
    width: '40%',
    minWidth: '150px',
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
  userOffline: { color: '#666', fontSize: '10px' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' as const },
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
    padding: '20px',
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
  empty: { color: '#666', textAlign: 'center' as const, marginTop: '50px' },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    borderTop: '1px solid #1a1a2a',
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
  sendButton: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default Chat;
