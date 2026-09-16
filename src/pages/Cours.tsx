import { useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface CoursProps {
  onRetour?: () => void;
}

function nettoyerPourTTS(texte: string): string {
  return texte
    .replace(/VOKYVO LABS/gi, 'VOKIVO Labs')
    .replace(/VOKYVO/gi, 'VOKIVO')
    // Tableaux markdown
    .replace(/\|[^\n]*\|/g, '')
    .replace(/^[-:| ]+$/gm, '')
    // Titres
    .replace(/^#{1,6}\s*/gm, '')
    // Gras/italique
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/`/g, '')
    // Liens
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Parenthèses -> pauses
    .replace(/\(([^)]+)\)/g, ', $1,')
    // Listes
    .replace(/^\s*[-•]\s*/gm, '')
    .replace(/^\s*\d+\.\s*/gm, '')
    // Sauts de ligne
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/,\s*,/g, ',')
    .trim();
}


function Cours({ onRetour }: CoursProps) {
  const [imageSelectionnee, setImageSelectionnee] = useState<File | null>(null);
  const [apercuUrl, setApercuUrl] = useState<string | null>(null);
  const [texteExtrait, setTexteExtrait] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatIdIA, setChatIdIA] = useState<number | null>(null);
  const [historique, setHistorique] = useState<{role: 'user' | 'ia', texte: string}[]>([]);
  const [iaRepond, setIaRepond] = useState(false);
  const [enLecture, setEnLecture] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const getToken = () => localStorage.getItem('access_token') || '';

  const selectionnerImage = (f: File) => {
    setImageSelectionnee(f);
    setTexteExtrait(null);
    const reader = new FileReader();
    reader.onloadend = () => setApercuUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const extraireTexte = async () => {
    if (!imageSelectionnee) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageSelectionnee);
      formData.append('message', 'Extrait TOUT le texte visible sur cette image. Retourne uniquement le texte, sans commentaire.');

      const response = await axios.post(`${API_URL}/vokyvo/chat/`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const texte = response.data.reponse || response.data.message || '';
      setTexteExtrait(texte);
    } catch (err) {
      console.error('Erreur extraction:', err);
      alert('Erreur lors de l\'extraction du texte');
    } finally {
      setLoading(false);
    }
  };

  const lireTexte = () => {
    if (!texteExtrait) return;
    if (enLecture) {
      window.speechSynthesis.cancel();
      setEnLecture(false);
      return;
    }

    // Vérifier que speechSynthesis est dispo
    if (!('speechSynthesis' in window)) {
      alert('La lecture audio n\'est pas disponible sur ce navigateur');
      return;
    }

    const lancer = () => {
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(nettoyerPourTTS(texteExtrait));
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Chercher une voix française
      const voixFr = voices.find(v => v.lang.startsWith('fr'));
      if (voixFr) utterance.voice = voixFr;

      utterance.onend = () => setEnLecture(false);
      utterance.onerror = (e) => {
        console.error('Erreur TTS:', e);
        setEnLecture(false);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setEnLecture(true);
    };

    // Si les voix ne sont pas encore chargées
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        lancer();
      };
      setTimeout(lancer, 500);
    } else {
      lancer();
    }
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setEnLecture(false);
    setImageSelectionnee(null);
    setApercuUrl(null);
    setTexteExtrait(null);
    setChatIdIA(null);
    setHistorique([]);
  };

  const poserQuestion = async () => {
    if (!question.trim() || !texteExtrait) return;
    const q = question.trim();
    setQuestion('');
    setHistorique(prev => [...prev, { role: 'user', texte: q }]);
    setIaRepond(true);

    try {
      const contexte = `Voici le cours de l'élève :\n\n${texteExtrait}\n\nQuestion de l'élève : ${q}\n\nRéponds en TEXTE SIMPLE et NATUREL, comme si tu parlais à voix haute. Pas de markdown, pas de tableaux, pas d'astérisques, pas de dièses, pas de tirets, pas de listes. Fais des phrases courtes et claires. Base-toi uniquement sur ce cours.`;

      const response = await axios.post(`${API_URL}/vokyvo/chat/`, {
        message: contexte,
        chat_id: chatIdIA,
      }, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const reponse = response.data.reponse || response.data.message || 'Pas de réponse';
      setHistorique(prev => [...prev, { role: 'ia', texte: reponse }]);
      if (response.data.chat_id && !chatIdIA) {
        setChatIdIA(response.data.chat_id);
      }
      // Lecture auto de la réponse IA
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(nettoyerPourTTS(reponse));
          utterance.lang = 'fr-FR';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          const voices = window.speechSynthesis.getVoices();
          const voixFr = voices.find(v => v.lang.startsWith('fr'));
          if (voixFr) utterance.voice = voixFr;
          utterance.onend = () => setEnLecture(false);
          utterance.onerror = () => setEnLecture(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
          setEnLecture(true);
        }
      } catch (e) {}
    } catch (err) {
      console.error('Erreur IA:', err);
      setHistorique(prev => [...prev, { role: 'ia', texte: 'Erreur, réessaie.' }]);
    } finally {
      setIaRepond(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } onRetour?.(); }}
          style={styles.backButton}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 style={styles.title}>Cours</h2>
      </div>

      <div style={styles.body}>
        {!imageSelectionnee && (
          <div style={styles.accueil}>
            <div style={styles.iconWrap}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3 style={styles.accueilTitle}>Étudie plus intelligemment</h3>
            <p style={styles.accueilText}>Prends une photo de ton cours et je te le lis à voix haute</p>
            <button
              onClick={() => imageInputRef.current?.click()}
              style={styles.btnPrimaire}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Prendre une photo
            </button>
          </div>
        )}

        {imageSelectionnee && (
          <div style={styles.zonePhoto}>
            {apercuUrl && (
              <img src={apercuUrl} style={styles.apercuImage} alt="Aperçu cours" />
            )}

            {!texteExtrait && !loading && (
              <div style={styles.actionsPhoto}>
                <button onClick={extraireTexte} style={styles.btnPrimaire}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Extraire le texte
                </button>
                <button onClick={reset} style={styles.btnSecondaire}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Annuler
                </button>
              </div>
            )}

            {loading && (
              <div style={styles.loadingZone}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Analyse du cours en cours...</p>
              </div>
            )}

            {texteExtrait && (
              <div style={styles.texteZone}>
                <div style={styles.texteHeader}>
                  <p style={styles.texteTitle}>Texte extrait</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={lireTexte} style={enLecture ? styles.btnLectureActif : styles.btnLecture}>
                      {enLecture ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16"/>
                          <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      )}
                      {enLecture ? 'Pause' : 'Écouter'}
                    </button>
                    <button onClick={reset} style={styles.btnSecondaire}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={styles.texteContenu}>
                  <p style={styles.texteTexte}>{texteExtrait}</p>
                </div>
              </div>
            )}

                {historique.length > 0 && (
                  <div style={styles.chatZone}>
                    {historique.map((m, i) => (
                      <div key={i} style={m.role === 'user' ? styles.msgUser : styles.msgIA}>
                        <span style={styles.msgText}>{m.texte}</span>
                      </div>
                    ))}
                    {iaRepond && (
                      <div style={styles.msgIA}>
                        <span style={styles.msgText}>...</span>
                      </div>
                    )}
                  </div>
                )}

                <div style={styles.inputZone}>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && poserQuestion()}
                    placeholder="Pose une question sur ton cours..."
                    style={styles.inputChat}
                  />
                  <button
                    onClick={poserQuestion}
                    disabled={iaRepond}
                    style={styles.sendBtn}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                  {enLecture && (
                    <button
                      onClick={() => { window.speechSynthesis.cancel(); setEnLecture(false); }}
                      style={styles.stopBtn}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) selectionnerImage(f);
        }}
      />
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
    width: '38px',
    height: '38px',
  },
  title: {
    color: 'white',
    margin: 0,
    fontSize: '17px',
    fontWeight: 600,
  },
  body: {
    flex: 1,
    overflow: 'auto' as const,
    padding: '20px',
  },
  accueil: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: '40px 20px',
    minHeight: '80%',
  },
  iconWrap: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  accueilTitle: {
    color: 'white',
    fontSize: '22px',
    fontWeight: 600,
    margin: '0 0 12px 0',
  },
  accueilText: {
    color: '#888',
    fontSize: '15px',
    margin: '0 0 32px 0',
    maxWidth: '300px',
    lineHeight: 1.5,
  },
  btnPrimaire: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSecondaire: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    borderRadius: '12px',
    border: '1px solid #2a2a3e',
    background: 'transparent',
    color: '#aaa',
    fontSize: '15px',
    cursor: 'pointer',
  },
  zonePhoto: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  apercuImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain' as const,
    borderRadius: '12px',
    background: '#111120',
  },
  actionsPhoto: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  loadingZone: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px 20px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(102,126,234,0.2)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    color: '#888',
    fontSize: '15px',
    margin: 0,
  },
  texteZone: {
    background: '#111120',
    borderRadius: '12px',
    border: '1px solid #2a2a3e',
    padding: '16px',
  },
  texteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  texteTitle: {
    color: '#667eea',
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  btnLecture: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnLectureActif: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  texteContenu: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  texteTexte: {
    color: 'white',
    fontSize: '15px',
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
  },
  chatZone: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    padding: '16px 0',
  },
  msgUser: {
    alignSelf: 'flex-end' as const,
    background: '#667eea',
    padding: '10px 14px',
    borderRadius: '15px 15px 0 15px',
    maxWidth: '85%',
  },
  msgIA: {
    alignSelf: 'flex-start' as const,
    background: '#1a1a2e',
    padding: '10px 14px',
    borderRadius: '15px 15px 15px 0',
    maxWidth: '85%',
  },
  msgText: {
    color: 'white',
    fontSize: '14px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
  },
  inputZone: {
    display: 'flex',
    gap: '10px',
    paddingTop: '12px',
  },
  inputChat: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '20px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: '#667eea',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stopBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
export default Cours;
