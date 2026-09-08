import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

function Vokyvo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Salut ! Je suis VOKYVO LABS, ton assistant IA. Pose-moi une question ou envoie une photo à analyser.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userPhoto = userData.photo_profil || null;
  const prenom = userData.prenom || userData.first_name || userData.username || 'User';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, imagePreview]);

  const choisirImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    
    setImageFile(fichier);
    const apercu = URL.createObjectURL(fichier);
    setImagePreview(apercu);
  };

  const retirerImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const envoyerMessage = async () => {
    if ((!input.trim() && !imageFile) || loading) return;

    const userMessage = input.trim() || 'Analyse cette image';
    setInput('');
    setLoading(true);
    setErreur('');

    // Ajoute le message avec aperçu
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      image: imagePreview || undefined
    }]);
    
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setErreur('Tu dois être connecté');
      setLoading(false);
      return;
    }

    try {
      
      const formData = new FormData();
      formData.append('message', userMessage);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(`${API_URL}/vokyvo/chat/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reponse }]);
    } catch (err: any) {
      setErreur('Erreur : ' + (err.response?.data?.erreur || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  };

  const IconeEnvoyer = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );

  const IconeImage = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );

  const IconeRetirer = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <div style={styles.chatCard}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => window.location.reload()} style={styles.backButton}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div style={styles.avatarVokyvo}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>VOKYVO</h1>
            <p style={styles.subtitle}>Assistant IA • VOKYVO LABS</p>
          </div>
          <div style={styles.statusDot}></div>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.map((msg, index) => {
            const estUser = msg.role === 'user';
            return (
              <div key={index} style={{ ...styles.messageRow, justifyContent: estUser ? 'flex-end' : 'flex-start' }}>
                {!estUser && (
                  <div style={styles.avatarVokyvoMsg}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                    </svg>
                  </div>
                )}
                <div style={{ maxWidth: '75%' }}>
                  {msg.image && <img src={msg.image} className="image-message" alt="upload" />}
                  {msg.content && (
                    <div style={{ ...styles.messageBubble, background: estUser ? '#667eea' : '#2a2a3e', color: estUser ? 'white' : '#eee' }}>
                      {msg.content}
                    </div>
                  )}
                </div>
                {estUser && userPhoto && (
                  <img src={userPhoto} className="avatar-conv" style={{ width: '30px', height: '30px' }} alt="" />
                )}
              </div>
            );
          })}
          
          {loading && (
            <div style={styles.typingRow}>
              <span style={styles.typingDot}>●</span>
              <span style={styles.typingDot}>●</span>
              <span style={styles.typingDot}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Aperçu image */}
        {imagePreview && (
          <div style={styles.imagePreviewContainer}>
            <img src={imagePreview} className="image-message" alt="aperçu" />
            <button onClick={retirerImage} style={styles.retirerBtn}>
              <IconeRetirer />
            </button>
          </div>
        )}

        {erreur && <p style={styles.error}>{erreur}</p>}

        {/* Input */}
        <div style={styles.inputArea}>
          <input type="file" ref={fileInputRef} onChange={choisirImage} accept="image/*" style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} style={styles.imageBtn}>
            <IconeImage />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={imagePreview ? 'Ajoute une question sur cette image...' : `Écris ton message ${prenom}...`}
            style={styles.input}
            rows={2}
            disabled={loading}
          />
          <button onClick={envoyerMessage} style={styles.sendButton} disabled={loading || (!input.trim() && !imageFile)}>
            <IconeEnvoyer />
          </button>
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
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '10px 10px 0 10px',
    zIndex: 1000,
    background: '#0a0a0f',
  },
  chatCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '25px',
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
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
    flexShrink: 0,
  },
  header: { borderRadius: '25px 25px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    background: 'rgba(0,0,0,0.4)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  avatarVokyvo: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarVokyvoMsg: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: '20px',
    margin: 0,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#aaa',
    fontSize: '11px',
    margin: 0,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#28a745',
    boxShadow: '0 0 8px #28a745',
    flexShrink: 0,
  },
  messagesArea: {
    paddingBottom: '80px',
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  messageBubble: {
    maxWidth: '100%',
    padding: '12px 15px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word' as const,
    marginTop: '5px',
  },
  typingRow: {
    display: 'flex',
    gap: '5px',
    padding: '12px 16px',
    background: '#2a2a3e',
    borderRadius: '16px',
    alignSelf: 'flex-start',
  },
  typingDot: {
    color: '#aaa',
    fontSize: '10px',
    animation: 'pulse 1.5s infinite',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center' as const,
    padding: '10px',
    margin: 0,
    fontSize: '13px',
  },
  imagePreviewContainer: {
    position: 'relative' as const,
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  retirerBtn: {
    position: 'absolute' as const,
    top: '15px',
    right: '25px',
    width: '25px',
    height: '25px',
    borderRadius: '50%',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputArea: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    padding: '8px',
    borderTop: '1px solid #1a1a2a',
    background: '#111120',
    zIndex: 100,
    maxWidth: '500px',
    margin: '0 auto',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  imageBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.1)',
    color: '#aaa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    resize: 'none' as const,
  },
  sendButton: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export default Vokyvo;
