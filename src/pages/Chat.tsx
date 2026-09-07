import { useState, useEffect, useRef } from 'react';

const WS_URL = 'wss://daphne-5mxe.onrender.com/ws/chat/';

function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [username, setUsername] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Récupère le username
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUsername(userData.prenom || userData.username || 'User');

    // Connexion WebSocket
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✅ WebSocket connecté');
      setConnecte(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      console.log('❌ WebSocket déconnecté');
      setConnecte(false);
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const envoyerMessage = () => {
    if (!nouveauMessage.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      message: nouveauMessage,
      username: username,
    }));

    setNouveauMessage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💬 Chat Temps Réel</h2>
        <span style={connecte ? styles.online : styles.offline}>
          {connecte ? '● Connecté' : '○ Déconnecté'}
        </span>
      </div>

      <div style={styles.messagesArea}>
        {messages.length === 0 ? (
          <p style={styles.empty}>Aucun message. Commence la conversation !</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={msg.username === username ? styles.messageMoi : styles.messageAutre}>
              <span style={styles.messageUsername}>{msg.username}</span>
              <span style={styles.messageText}>{msg.message}</span>
            </div>
          ))
        )}
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
        <button onClick={envoyerMessage} style={styles.sendButton}>
          ➤
        </button>
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
  title: {
    color: 'white',
    margin: 0,
    fontSize: '18px',
  },
  online: {
    color: '#28a745',
    fontSize: '12px',
  },
  offline: {
    color: '#dc3545',
    fontSize: '12px',
  },
  messagesArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  empty: {
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '50px',
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
  messageUsername: {
    display: 'block' as const,
    fontSize: '11px',
    color: '#aaa',
    marginBottom: '5px',
  },
  messageText: {
    color: 'white',
    fontSize: '14px',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    background: '#111120',
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
