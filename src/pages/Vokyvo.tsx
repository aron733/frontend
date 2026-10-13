import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { API_URL } from '../config';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import LoaderIA from '../LoaderIA';
import CodeBlock from '../CodeBlock';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const MESSAGES_ACCUEIL = [
  { emoji: '🌟', texte: 'VOKYVO est toujours là pour toi' },
  { emoji: '🎓', texte: 'Que veux-tu apprendre aujourd\'hui ?' },
  { emoji: '💡', texte: 'Pose-moi une question, je suis prêt' },
  { emoji: '✨', texte: 'De quoi veux-tu parler ?' },
  { emoji: '🤝', texte: 'Salut, je suis là pour t\'aider' },
  { emoji: '🚀', texte: 'Prêt à explorer ?' },
  { emoji: '📌', texte: 'Par quoi on commence ?' },
  { emoji: '🔥', texte: 'De retour ? Content de te revoir' },
];

function nettoyerPourTTS(texte: string): string {
  return texte
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/^[-•]\s/gm, '')
    .replace(/>\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, '. ')
    .trim();
}

function Vokyvo({ onRetour }: { onRetour?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [loaderIndex, setLoaderIndex] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [modeExpert, setModeExpert] = useState(false);
  const [lectureEnCours, setLectureEnCours] = useState<number | null>(null);
  const [accueilIndex, setAccueilIndex] = useState(() => Math.floor(Math.random() * MESSAGES_ACCUEIL.length));
  const [chatsIA, setChatsIA] = useState<any[]>([]);
  const [chatIdActif, setChatIdActif] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const prenom = userData.prenom || userData.first_name || userData.username || 'User';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const chargerChats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}/vokyvo/chats/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatsIA(response.data.chats || []);
      } catch (err) {
        console.error('Erreur chargement chats IA');
      }
    };
    chargerChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, imagePreview]);

  const choisirImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setImageFile(fichier);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(fichier);
  };

  const retirerImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const lireConversation = () => {
    if (!('speechSynthesis' in window)) {
      alert("La lecture audio n'est pas disponible sur ce navigateur");
      return;
    }

    // Si déjà en lecture globale → arrêter
    if (lectureEnCours === -1) {
      window.speechSynthesis.cancel();
      setLectureEnCours(null);
      return;
    }

    // Récupère toutes les réponses IA
    const reponsesIA = messages.filter(m => m.role === 'assistant' && m.content);
    if (reponsesIA.length === 0) {
      alert('Aucune réponse à lire pour le moment');
      return;
    }

    // Concatène toutes les réponses IA
    const texteComplet = reponsesIA.map(m => nettoyerPourTTS(m.content)).join('. ');

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texteComplet);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voixFr = voices.find(v => v.lang.startsWith('fr'));
    if (voixFr) utterance.voice = voixFr;

    utterance.onend = () => setLectureEnCours(null);
    utterance.onerror = () => setLectureEnCours(null);

    window.speechSynthesis.speak(utterance);
    setLectureEnCours(-1);
  };

  const lireMessage = (index: number, texte: string) => {
    if (!('speechSynthesis' in window)) {
      alert("La lecture audio n'est pas disponible sur ce navigateur");
      return;
    }

    // Si on clique sur le message en cours → arrêter
    if (lectureEnCours === index) {
      window.speechSynthesis.cancel();
      setLectureEnCours(null);
      return;
    }

    // Sinon → arrêter l'actuel, puis lire le nouveau
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(nettoyerPourTTS(texte));
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voixFr = voices.find(v => v.lang.startsWith('fr'));
    if (voixFr) utterance.voice = voixFr;

    utterance.onend = () => setLectureEnCours(null);
    utterance.onerror = () => setLectureEnCours(null);

    window.speechSynthesis.speak(utterance);
    setLectureEnCours(index);
  };

  const envoyerMessage = async () => {
    if ((!input.trim() && !imageFile) || loading) return;

    const userMessage = input.trim() || 'Analyse cette image';
    setInput('');
    setLoading(true);
    setErreur('');
    setLoaderIndex(prev => prev + 1);

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
      if (chatIdActif) formData.append('chat_id', String(chatIdActif));
      formData.append('mode', modeExpert ? 'expert_maths' : 'normal');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const t0 = Date.now();
      const response = await axios.post(`${API_URL}/vokyvo/chat/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Attendre min 2.5s pour laisser voir le loader
      const elapsed = Date.now() - t0;
      const wait = Math.max(0, 2500 - elapsed);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));

      if (response.data.chat_id) setChatIdActif(response.data.chat_id);
      const reponse = response.data.reponse || '';
      if (!reponse.trim()) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Je n'ai pas bien compris. Peux-tu reformuler ta question ?" }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: reponse }]);
      }
    } catch (err: any) {
      const status = err.response?.status;
      let msg = "Une erreur s'est produite. Réessaie dans un instant.";
      if (status === 429) {
        msg = "Trop de demandes. Patiente quelques secondes avant de réessayer.";
      } else if (status === 500 || status === 502 || status === 503 || status === 504) {
        msg = "L'IA est momentanément indisponible. Réessaie dans quelques instants.";
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = "La réponse prend trop de temps. Réessaie.";
      } else if (!err.response) {
        msg = "Problème de connexion. Vérifie ton réseau et réessaie.";
      }
      // Ajoute le message d'erreur comme bulle de conversation (mieux UX)
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
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

  const nouvelleConversation = () => {
    setChatIdActif(null);
    setMessages([]);
    setAccueilIndex(Math.floor(Math.random() * MESSAGES_ACCUEIL.length));
    setMenuOuvert(false);
  };

  const chargerMessagesChat = async (chatId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/vokyvo/chats/${chatId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const msgs = (response.data.messages || []).map((m: any) => ({
        role: m.role,
        content: m.contenu,
      }));

      setMessages(msgs);
      setChatIdActif(chatId);
      setMenuOuvert(false);
    } catch (err) {
      console.error('Erreur chargement messages chat');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatCard}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => onRetour ? onRetour() : (localStorage.setItem('vokyvo_page', 'profil'), window.location.reload())} style={styles.backButton}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>VOKYVO</h1>
          </div>
          <button
            onClick={lireConversation}
            style={lectureEnCours === -1 ? { ...styles.headerBtn, ...styles.headerBtnActif } : styles.headerBtn}
            title={lectureEnCours === -1 ? 'Arrêter la lecture' : 'Relire toutes les réponses'}
          >
            {lectureEnCours === -1 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
          <button
            onClick={nouvelleConversation}
            style={styles.headerBtn}
            title="Nouvelle conversation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              <line x1="12" y1="9" x2="12" y2="15" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
          </button>
          <button onClick={() => setMenuOuvert(!menuOuvert)} style={styles.hamburgerRight}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Overlay */}
        {menuOuvert && (
          <div onClick={() => setMenuOuvert(false)} style={styles.overlayMenu} />
        )}

        {/* Sidebar historique */}
        <div style={{
          ...styles.menuSidebar,
          transform: menuOuvert ? 'translateX(0)' : 'translateX(120%)',
          opacity: menuOuvert ? 1 : 0,
          pointerEvents: menuOuvert ? 'auto' : 'none',
        }}>
            <button onClick={nouvelleConversation} style={styles.newChatButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nouvelle conversation
            </button>
            <p style={styles.historyTitle}>Historique</p>
            {chatsIA.length === 0 ? (
              <p style={styles.historyEmpty}>Aucune conversation</p>
            ) : (
              chatsIA.map((chat) => (
                <div key={chat.id} style={styles.historyItem} onClick={() => chargerMessagesChat(chat.id)}>
                  <p style={styles.historyChatTitle}>{chat.titre}</p>
                  <p style={styles.historyPreview}>{chat.apercu}</p>
                </div>
              ))
            )}
        </div>

        {/* Messages */}
        <div className="messages-area-nosel" style={styles.messagesArea}>
          {messages.length === 0 && (
            <div style={styles.accueilVide}>
              <div style={styles.accueilLogo}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="8" width="16" height="12" rx="2" />
                  <circle cx="9" cy="14" r="1.5" fill="#667eea" />
                  <circle cx="15" cy="14" r="1.5" fill="#667eea" />
                  <line x1="12" y1="4" x2="12" y2="8" />
                  <circle cx="12" cy="3" r="1" fill="#667eea" />
                </svg>
              </div>
              <p style={styles.accueilTexte}>
                {MESSAGES_ACCUEIL[accueilIndex].emoji} {MESSAGES_ACCUEIL[accueilIndex].texte}
              </p>
            </div>
          )}
          {messages.map((msg, index) => {
            const estUser = msg.role === 'user';
            return (
              <div key={index} style={{ ...styles.messageRow, justifyContent: estUser ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%' }}>
                  {msg.image && <img src={msg.image} className="image-message" alt="upload" />}
                  {msg.content && (
                    <div className={`message-bubble-select ${estUser ? '' : 'markdown-content'}`} style={{ ...styles.messageBubble, background: estUser ? '#667eea' : '#2a2a3e', color: estUser ? 'white' : '#eee' }}>
                      {estUser ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code({ node, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !className;
                              if (isInline) {
                                return <code className={className} {...props}>{children}</code>;
                              }
                              const codeStr = String(children).replace(/\n$/, '');
                              return (
                                <CodeBlock
                                  code={codeStr}
                                  language={match ? match[1] : ''}
                                />
                              );
                            },
                            a({ href, children }: any) {
                              return (
                                <a
                                  href={href}
                                  onClick={async (e: any) => {
                                    e.preventDefault();
                                    if (!href) return;
                                    // Liens mailto / tel : laisse le navigateur gérer
                                    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                                      window.location.href = href;
                                      return;
                                    }
                                    // Liens https : Custom Tab sur APK, nouvel onglet sur web
                                    if (Capacitor.isNativePlatform()) {
                                      await Browser.open({ url: href });
                                    } else {
                                      window.open(href, '_blank');
                                    }
                                  }}
                                  style={{ color: '#667eea', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  )}
                  {!estUser && msg.content && (
                    <div style={styles.bubbleActions}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                        }}
                        style={styles.copyBubbleBtn}
                        title="Copier la réponse"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copier
                      </button>
                      <button
                        onClick={() => lireMessage(index, msg.content)}
                        style={lectureEnCours === index ? { ...styles.ttsBubbleBtn, ...styles.ttsBubbleBtnActif } : styles.ttsBubbleBtn}
                        title={lectureEnCours === index ? 'Arrêter la lecture' : 'Écouter'}
                      >
                        {lectureEnCours === index ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                            Arrêter
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            </svg>
                            Écouter
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {loading && <LoaderIA index={loaderIndex} />}
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
          <button
            onClick={() => setModeExpert(!modeExpert)}
            style={modeExpert ? { ...styles.modeToggle, ...styles.modeToggleActif } : styles.modeToggle}
            title="Mode éducatif"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </button>
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
    flexDirection: 'column' as const,
    background: '#0a0a0f',
    zIndex: 1000,
    overflow: 'hidden',
  },
  chatCard: {
    background: '#0a0a0f',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
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
    flexShrink: 0,
  },
  menuSidebar: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: '75%',
    maxWidth: '320px',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '20px 15px',
    paddingTop: '80px',
    zIndex: 1001,
    boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
    overflowY: 'auto' as const,
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  overlayMenu: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 10, 15, 0.4)',
    zIndex: 1000,
  },
  headerBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  headerBtnActif: {
    border: '1px solid #667eea',
    background: 'rgba(102,126,234,0.15)',
    color: '#667eea',
  },
  hamburgerRight: {
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
  newChatButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #667eea',
    background: 'rgba(102,126,234,0.15)',
    color: '#667eea',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '15px',
    width: '100%',
  },
  historyTitle: {
    color: '#667eea',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  historyEmpty: {
    color: '#666',
    fontSize: '13px',
    textAlign: 'center' as const,
    padding: '20px',
  },
  historyItem: {
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.03)',
    marginBottom: '8px',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  historyChatTitle: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 5px 0',
  },
  historyPreview: {
    color: '#888',
    fontSize: '12px',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
    background: '#0a0a0f',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
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
    fontSize: '17px',
    margin: 0,
    fontWeight: 600,
    letterSpacing: '0.3px',
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
  accueilVide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
    gap: '20px',
  },
  accueilLogo: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accueilTexte: {
    color: '#ccc',
    fontSize: '17px',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.5,
    maxWidth: '300px',
  },
  messagesArea: {
    flex: 1,
    padding: '20px 20px 80px 20px',
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
  bubbleActions: {
    display: 'flex',
    gap: '6px',
    marginTop: '6px',
    alignItems: 'center',
  },
  ttsBubbleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '6px',
    marginLeft: '6px',
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  ttsBubbleBtnActif: {
    border: '1px solid #667eea',
    color: '#667eea',
    background: 'rgba(102,126,234,0.1)',
  },
  copyBubbleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '6px',
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
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
  error: {
    color: '#dc3545',
    textAlign: 'center' as const,
    padding: '10px',
    margin: 0,
    fontSize: '13px',
  },
  imagePreviewContainer: {
    position: 'fixed' as const,
    bottom: '90px',
    left: 0,
    right: 0,
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 99,
    maxWidth: '500px',
    margin: '0 auto',
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
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderTop: '1px solid #1a1a2a',
    background: '#111120',
    zIndex: 100,
    maxWidth: '500px',
    margin: '0 auto',
    minHeight: '70px',
  },
  modeToggle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.1)',
    color: '#aaa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  modeToggleActif: {
    background: 'rgba(102,126,234,0.2)',
    color: '#667eea',
    boxShadow: '0 0 0 1.5px #667eea',
  },
  imageBtn: {
    width: '50px',
    height: '50px',
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
    padding: '15px 18px',
    borderRadius: '25px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    resize: 'none' as const,
    minHeight: '25px',
  },
  sendButton: {
    width: '50px',
    height: '50px',
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
