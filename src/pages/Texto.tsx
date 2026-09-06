import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { API_URL } from '../config';

interface UserRecherche {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  numero: string;
  pays: string;
}

interface Conversation {
  id: number;
  autre_user: {
    id: number;
    username: string;
    prenom: string;
    nom: string;
    photo: string | null;
  };
  dernier_message: string;
  date_modification: string;
  nb_non_lus?: number;
}

interface Message {
  id: number;
  expediteur: number;
  texte?: string;
  fichier_url?: string;
  nom_fichier?: string;
  audio_url?: string;
  audio_local?: string;
  duree?: number;
  date_envoi: string;
  apercu?: string;
  lu?: boolean;
  date_lu?: string;
  fichier_type?: string;
  est_video?: boolean;
  est_supprime?: boolean;
  messageRepondu?: string | null;
  est_audio?: boolean;
  type?: string;
  statut_appel?: string;
  duree_appel?: number;
  est_sortant?: boolean;
}

function Texto() {
  const [vue, setVue] = useState<'liste' | 'recherche' | 'conversation'>('liste');
  const [recherche, setRecherche] = useState('');
  const [resultats, setResultats] = useState<UserRecherche[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationActive, setConversationActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [appelVideo, setAppelVideo] = useState(false);
  const [livekitToken, setLivekitToken] = useState('');
  const [livekitUrl, setLivekitUrl] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [statutAutreUser, setStatutAutreUser] = useState<'en_ligne' | 'hors_ligne'>('hors_ligne');
  const [menuFichier, setMenuFichier] = useState(false);
  const [menuSignalement, setMenuSignalement] = useState(false);
  const [motifSignalement, setMotifSignalement] = useState('');
  const [audioEnCours, setAudioEnCours] = useState<number | null>(null);
  const [appelId, setAppelId] = useState<number | null>(null);
  const [tempsTexte, setTempsTexte] = useState<string | null>(null);
  const [messageSelectionne, setMessageSelectionne] = useState<number | null>(null);
  const [messageReponse, setMessageReponse] = useState<Message | null>(null);
  const [messagesSupprimes, setMessagesSupprimes] = useState<number[]>([]);
  const [dureeEnregistrement, setDureeEnregistrement] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const token = localStorage.getItem('access_token');
  const userDataLocal = JSON.parse(localStorage.getItem('user') || '{}');
const userId = parseInt(userDataLocal.user_id || userDataLocal.id || '0');
  const userPhoto = JSON.parse(localStorage.getItem('user') || '{}').photo_profil || null;

  useEffect(() => {
    chargerConversations();
    
    // Marque le user en ligne
    axios.post(`${API_URL}/presence/en-ligne/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    
    // Marque hors ligne quand on quitte la page
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `${API_URL}/presence/hors-ligne/`,
        JSON.stringify({ token })
      );
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      axios.post(`${API_URL}/presence/hors-ligne/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chargerConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations);
    } catch (err) {
      console.error('Erreur chargement conversations');
    }
  };

  const rechercherUsers = async () => {
    if (!recherche.trim()) return;
    try {
      const response = await axios.get(`${API_URL}/rechercher-users/?q=${recherche}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResultats(response.data.users);
      setVue('recherche');
    } catch (err: any) {
      alert('Erreur de recherche');
    }
  };

  const ouvrirConversation = async (conv: Conversation) => {
    setConversationActive(conv);
    setVue('conversation');
    verifierStatut(conv.autre_user.id);
    
    // Marque les messages comme lus
    try {
      await axios.post(
        `${API_URL}/conversations/${conv.id}/marquer-lus/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log('Erreur marquage lu');
    }
    
    try {
      const response = await axios.get(`${API_URL}/conversations/${conv.id}/messages/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msgs = response.data.messages.map((m: any) => ({
        ...m,
        apercu: m.fichier_url && m.fichier_url.startsWith('http') && m.fichier_url.includes('/image/upload/') ? m.fichier_url : undefined,
        est_video: m.fichier_url && m.fichier_url.startsWith('http') && (m.fichier_url.includes('/video/upload/') || m.nom_fichier?.match(/\.(mp4|webm|mov|avi)$/i)) ? true : false,
        fichier_url: m.fichier_url && m.fichier_url.startsWith('http') ? m.fichier_url : undefined,
        audio_url: m.audio_url && m.audio_url.startsWith('http') ? m.audio_url : undefined,
        est_audio: m.audio_url && m.audio_url.startsWith('http') ? true : false,
      }));
      setMessages(msgs);
    } catch (err) {
      console.error('Erreur chargement messages');
    }
  };

  const creerNouvelleConversation = async (user: UserRecherche) => {
    try {
      await axios.post(
        `${API_URL}/conversations/creer/`,
        { user2_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVue('liste');
      chargerConversations();
    } catch (err) {
      alert('Erreur création conversation');
    }
  };

  const supprimerMessage = async (msgId: number) => {
    // Si l'ID est un timestamp (local), on supprime juste localement
    if (msgId > 1000000000000) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, est_supprime: true } : m));
      setMessagesSupprimes([...messagesSupprimes, msgId]);
      setMessageSelectionne(null);
      return;
    }
    try {
      const tokenFrais = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/messages/${msgId}/supprimer/`,
        {},
        { headers: { Authorization: `Bearer ${tokenFrais}` } }
      );
      setMessages(messages.map(m => m.id === msgId ? { ...m, est_supprime: true } : m));
      setMessagesSupprimes([...messagesSupprimes, msgId]);
      setMessageSelectionne(null);
    } catch (err) {
      // Fallback local
      setMessages(messages.map(m => m.id === msgId ? { ...m, est_supprime: true } : m));
      setMessagesSupprimes([...messagesSupprimes, msgId]);
      setMessageSelectionne(null);
    }
  };

  const envoyerMessage = async () => {
    if (!nouveauMessage.trim() || !conversationActive) return;
    const texte = nouveauMessage;
    setNouveauMessage('');
    setMessageReponse(null);
    const messageTemp: Message = { id: Date.now(), expediteur: userId, texte, date_envoi: new Date().toISOString(), messageRepondu: messageReponse?.texte || null };
    setMessages([...messages, messageTemp]);
    try {
      await axios.post(
        `${API_URL}/conversations/${conversationActive.id}/envoyer/`,
        { texte },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert('Erreur envoi message : ' + ((err as any).response?.data?.erreur || (err as any).message));
    }
  };

  const envoyerFichier = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier || !conversationActive) return;
    
    const apercuLocal = URL.createObjectURL(fichier);
    const estImage = fichier.type.startsWith('image/');
    const estVideo = fichier.type.startsWith('video/');
    
    const messageTemp: Message = {
      id: Date.now(),
      expediteur: userId,
      fichier_url: apercuLocal,
      nom_fichier: fichier.name,
      date_envoi: new Date().toISOString(),
      apercu: estImage ? apercuLocal : estVideo ? 'video_local' : undefined,
      fichier_type: estImage ? 'image' : estVideo ? 'video' : 'fichier',
    };
    setMessages([...messages, messageTemp]);
    
    const formData = new FormData();
    formData.append('fichier', fichier);
    
    try {
      await axios.post(
        `${API_URL}/conversations/${conversationActive.id}/envoyer/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
    } catch (err) {
      alert('Erreur upload fichier');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Enregistrement vocal
  const demarrerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        const duree = dureeEnregistrement;
        
        const messageTemp: Message = {
          id: Date.now(),
          expediteur: userId,
          audio_local: audioUrl,
          duree,
          date_envoi: new Date().toISOString(),
        };
        setMessages(prev => [...prev, messageTemp]);
        setDureeEnregistrement(0);
        
        stream.getTracks().forEach(track => track.stop());
        
        // Upload l'audio
        if (conversationActive) {
          const formData = new FormData();
          formData.append('audio', blob, 'note-vocale.webm');
          axios.post(
            `${API_URL}/conversations/${conversationActive.id}/envoyer/`,
            formData,
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
          ).catch(() => console.log('Audio envoyé localement'));
        }
      };

      mediaRecorder.start();
      setEnregistrement(true);
      
      timerRef.current = setInterval(() => {
        setDureeEnregistrement(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      alert('Impossible d\'accéder au micro');
    }
  };

  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enregistrement) {
      mediaRecorderRef.current.stop();
      setEnregistrement(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const verifierStatut = async (userId: number) => {
    try {
      const response = await axios.get(`${API_URL}/presence/statut/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatutAutreUser(response.data.en_ligne ? 'en_ligne' : 'hors_ligne');
      setTempsTexte(response.data.temps_texte || null);
    } catch (err) {
      setStatutAutreUser('hors_ligne');
    }
  };

  const lancerAppel = async () => {
    if (!conversationActive) return;
    const roomName = `p2p-${Math.min(conversationActive.autre_user.id, userId)}-${Math.max(conversationActive.autre_user.id, userId)}`;
    try {
      // Crée l'appel dans la base
      const appelRes = await axios.post(
        `${API_URL}/appels/creer/`,
        { user2_id: conversationActive.autre_user.id, room_name: roomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppelId(appelRes.data.appel_id);
      
      const res = await axios.post(`${API_URL}/livekit/token/`, { room_name: roomName }, { headers: { Authorization: `Bearer ${token}` } });
      setLivekitToken(res.data.token);
      setLivekitUrl(res.data.url);
      setAppelVideo(true);
    } catch (err) {
      alert('Erreur appel');
    }
  };

  const signalerUser = async () => {
    if (!conversationActive) return;
    
    try {
      await axios.post(
        `${API_URL}/signaler/`,
        {
          user_id: conversationActive.autre_user.id,
          motif: motifSignalement || 'non_specifie'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Signalement envoyé');
      setMenuSignalement(false);
      setMotifSignalement('');
    } catch (err: any) {
      alert(err.response?.data?.erreur || 'Erreur signalement');
    }
  };

  const terminerAppel = async (statut = 'termine') => {
    if (appelId) {
      try {
        await axios.post(
          `${API_URL}/appels/terminer/`,
          { appel_id: appelId, statut },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.log('Erreur terminaison appel');
      }
    }
    setAppelVideo(false);
    setLivekitToken('');
    setLivekitUrl('');
    setAppelId(null);
  };

  const Ic = ({ children, size = 20 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{children}</svg>
  );
  const IconePlus = () => <Ic><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Ic>;
  const IconeFichier = () => <Ic size={18}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></Ic>;
  const IconeRecherche = () => <Ic size={18}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Ic>;
  const IconeRetour = () => <Ic><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Ic>;
  const IconeEnvoyer = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>;
  const IconeVideo = () => <Ic><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></Ic>;
  const IconeMicro = () => <Ic><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></Ic>;
  const IconeStop = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;

  if (appelVideo && livekitToken && livekitUrl) {
    return (
      <LiveKitRoom token={livekitToken} serverUrl={livekitUrl} video={true} audio={true} onDisconnected={() => console.log('Déconnecté')} data-lk-theme="dark" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000', margin: 0, padding: 0 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
          {/* Vidéo plein écran */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
            <VideoConference />
          </div>
          
          <RoomAudioRenderer />

          {/* Bouton raccrocher */}
          <button onClick={() => terminerAppel('termine')} style={{
            position: 'absolute',
            bottom: '80px',
            right: '25px',
            width: '65px',
            height: '65px',
            borderRadius: '50%',
            border: '3px solid white',
            background: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 5px 25px rgba(220,53,69,0.7)',
            zIndex: 9999
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              <line x1="4" y1="4" x2="20" y2="20"/>
            </svg>
          </button>
          

          

        </div>
      </LiveKitRoom>
    );
  }

  if (vue === 'conversation' && conversationActive) {
    const photoAutre = conversationActive.autre_user.photo ? conversationActive.autre_user.photo : null;
    return (
      <div style={styles.convContainer}>
        <div style={styles.convHeader}>
          <button onClick={() => { setVue('liste'); chargerConversations(); }} style={styles.retourBtn}><IconeRetour /></button>
          {photoAutre ? <img src={photoAutre} className="avatar-conv" alt="avatar" /> : <div style={styles.convAvatar}>{conversationActive.autre_user.prenom?.charAt(0) || '?'}</div>}
          <div style={styles.convInfo}>
            <p style={styles.convNom}>{conversationActive.autre_user.prenom} {conversationActive.autre_user.nom}</p>
            <p style={{ ...styles.convStatus, color: statutAutreUser === 'en_ligne' ? '#28a745' : '#666' }}>{statutAutreUser === 'en_ligne' ? 'En ligne' : tempsTexte || 'Hors ligne'}</p>
          </div>
          <button onClick={lancerAppel} style={styles.appelBtn}><IconeVideo /></button>
          <button onClick={() => setMenuSignalement(!menuSignalement)} style={styles.signalementBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
        </div>
        
        {menuSignalement && (
          <div style={styles.menuSignalement}>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 10px', fontWeight: 'bold' }}>
              Signaler {conversationActive.autre_user.prenom || conversationActive.autre_user.username}
            </p>
            <p style={{ color: '#666', fontSize: '11px', margin: '0 0 10px' }}>
              Choisis un motif et un message
            </p>
            
            <select 
              value={motifSignalement} 
              onChange={(e) => setMotifSignalement(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #2a3942',
                background: '#1a2a33',
                color: '#d0d0d0',
                fontSize: '13px',
                marginBottom: '10px',
                width: '100%'
              }}
            >
              <option value="">Choisir un motif...</option>
              <option value="harcelement">Harcèlement</option>
              <option value="spam">Spam</option>
              <option value="contenu_inapproprie">Contenu inapproprié</option>
              <option value="usurpation">Usurpation d'identité</option>
              <option value="autre">Autre</option>
            </select>
            
            {/* Derniers messages pour choisir */}
            <p style={{ color: '#666', fontSize: '11px', margin: '0 0 5px' }}>Derniers messages :</p>
            <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
              {messages.filter(m => m.texte && m.expediteur === conversationActive.autre_user.id).slice(-5).map((m, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMotifSignalement(motifSignalement || 'autre');
                    signalerUser();
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #2a3942',
                    borderRadius: '8px',
                    color: '#d0d0d0',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '5px'
                  }}
                >
                  {m.texte?.substring(0, 50)}
                </button>
              ))}
            </div>
            
            <button 
              onClick={signalerUser} 
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc3545',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Envoyer le signalement
            </button>
          </div>
        )}

        <div style={styles.messagesArea}>
          {messages.length === 0 && <p style={styles.aucunMsg}>Commence la conversation...</p>}
          {messages.map((msg) => {
            const estMoi = msg.expediteur === userId;
            const estSupprime = msg.est_supprime === true;
            
            // Affiche les appels comme messages système
            if (msg.type === 'appel') {
              const statut = msg.statut_appel;
              const duree = msg.duree_appel || msg.duree || 0;
              const minutes = Math.floor(duree / 60);
              const secondes = duree % 60;
              const dureeTexte = duree > 0 ? `${minutes}:${secondes.toString().padStart(2, '0')}` : '';
              
              const estManque = statut === 'manque';
              const estRefuse = statut === 'refuse';
              const couleur = estManque ? '#dc3545' : estRefuse ? '#dc3545' : '#28a745';
              const texte = msg.est_sortant 
                ? (estManque ? 'Appel vidéo manqué' : estRefuse ? 'Appel refusé' : `Appel sortant · ${dureeTexte}`)
                : (estManque ? 'Appel vidéo manqué' : estRefuse ? 'Appel refusé' : `Appel entrant · ${dureeTexte}`);
              
              const IconeAppel = () => (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth="2" style={{ flexShrink: 0 }}>
                  {msg.est_sortant ? (
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  ) : (
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" transform="rotate(180 12 12)" />
                  )}
                </svg>
              );
              
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.est_sortant ? 'flex-end' : 'flex-start', padding: '5px 10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: estManque || estRefuse ? 'rgba(220,53,69,0.15)' : 'rgba(40,167,69,0.15)',
                    border: `1px solid ${couleur}`,
                    borderRadius: '25px',
                    padding: '10px 18px',
                    maxWidth: '85%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <IconeAppel />
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{texte}</span>
                    {msg.date_envoi && (
                      <span style={{ color: '#999', fontSize: '11px', marginLeft: 'auto' }}>
                        {new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            }
            const heure = msg.date_envoi ? new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <div key={msg.id} style={{ ...styles.msgRow, justifyContent: estMoi ? 'flex-end' : 'flex-start' }} onContextMenu={(e) => { e.preventDefault(); setMessageSelectionne(msg.id); }}>
                {!estMoi && (photoAutre ? <img src={photoAutre} className="avatar-mini" style={{ marginRight: '8px' }} alt="" /> : null)}
                <div style={{ maxWidth: '78%' }}>
                  {estSupprime ? (
                    <div style={{ ...styles.msgBubble, background: 'rgba(255,255,255,0.03)', border: '1px dashed #555', color: '#999', fontStyle: 'italic', fontSize: '14px', padding: '10px 15px' }}>
                      Message supprimé
                    </div>
                  ) : null}
                  {msg.texte && (
                    <div style={{
                      ...styles.msgBubble,
                      background: estMoi ? '#3b82f6' : '#22c55e',
                      color: estMoi ? '#e9edef' : '#e9edef',
                      borderBottomRightRadius: estMoi ? '6px' : '18px',
                      borderBottomLeftRadius: estMoi ? '18px' : '6px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: '6px',
                    }}>
                      <span>
                        {msg.messageRepondu && (
                          <span style={{ display: 'block', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', fontSize: '12px', color: '#fff', borderLeft: '3px solid #fff', fontWeight: 500 }}>
                            {msg.messageRepondu.substring(0, 60)}
                          </span>
                        )}
                        {msg.texte}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: estMoi ? '#bfdbfe' : '#bbf7d0', whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0 }}>
                        <span>{heure}</span>
                        {estMoi && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', color: msg.lu ? '#60a5fa' : '#9ca3af' }}>
                            {msg.lu && msg.date_lu ? `Vu à ${new Date(msg.date_lu).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                        {msg.lu ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'block' }}>
                                <path d="M1 13l4 4L15 7" />
                                <path d="M9 13l4 4L23 7" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'block' }}>
                                <path d="M1 13l4 4L15 7" />
                              </svg>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {msg.apercu && msg.apercu !== 'video' && msg.apercu !== 'video_local' && msg.fichier_type !== 'video' && (
                    <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', maxWidth: '85%', marginLeft: estMoi ? 'auto' : '0', marginRight: estMoi ? '0' : 'auto' }} onClick={() => window.open(msg.apercu, '_blank')}>
                      <img 
                        src={msg.apercu} 
                        style={{ 
                          maxWidth: '85%', 
                          maxHeight: '350px', 
                          width: 'auto', 
                          height: 'auto', 
                          borderRadius: '15px', 
                          objectFit: 'contain', 
                          objectPosition: 'center',
                          display: 'block', 
                          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1a2a33',
                          marginLeft: estMoi ? 'auto' : '0',
                          marginRight: estMoi ? '0' : 'auto'
                        }} 
                        alt="aperçu" 
                      />
                      <span style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '10px', color: 'white', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '10px' }}>{heure}</span>
                    </div>
                  )}
                  {msg.est_video && (
                    <video 
                      src={msg.fichier_url} 
                      controls 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        width: 'auto', 
                        borderRadius: '15px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }} 
                    />
                  )}
                  {msg.fichier_url && !msg.apercu && !msg.est_video && (
                    <a href={msg.fichier_url} download style={{ ...styles.fichierLink, background: estMoi ? '#3b82f6' : '#22c55e', color: '#e9edef' }}>
                      <IconeFichier /> {msg.nom_fichier || 'Fichier'}
                    </a>
                  )}
                  {(msg.audio_url || msg.audio_local || msg.est_audio) && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: estMoi ? '#3b82f6' : '#22c55e', 
                      borderRadius: '20px', 
                      padding: '6px 10px',
                      maxWidth: '230px',
                      marginLeft: estMoi ? 'auto' : '0',
                      marginRight: estMoi ? '0' : 'auto'
                    }}>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        const audio = e.currentTarget.parentElement?.querySelector('audio') as HTMLAudioElement;
                        if (audio) {
                          if (audio.paused) {
                            audio.play();
                            setAudioEnCours(msg.id);
                          } else {
                            audio.pause();
                            setAudioEnCours(null);
                          }
                        }
                      }} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
                        {audioEnCours === msg.id ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="6" width="12" height="12" rx="2"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      <div style={{ flex: 1, height: '20px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {[4, 7, 10, 6, 9, 5, 8, 11, 7, 9, 6, 10, 8, 5, 7, 9, 6, 8, 10, 7, 5, 8, 6, 9].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ 
                              width: '3px', 
                              height: `${h}px`, 
                              background: audioEnCours === msg.id ? '#fff' : 'rgba(255,255,255,0.6)', 
                              borderRadius: '2px',
                              animation: audioEnCours === msg.id ? `wave 0.5s ease-in-out ${i * 0.04}s infinite` : 'none',
                              transition: 'all 0.3s'
                            }} 
                          />
                        ))}
                      </div>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                        {msg.duree || 0}s
                      </span>
                      <audio 
                        src={msg.audio_local || msg.audio_url} 
                        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} 
                        onPlay={() => setAudioEnCours(msg.id)}
                        onPause={() => setAudioEnCours(null)}
                        onEnded={() => setAudioEnCours(null)}
                      />
                    </div>
                  )}
                </div>
                {estMoi && userPhoto && <img src={userPhoto} className="avatar-mini" style={{ marginLeft: '8px' }} alt="" />}
              </div>
            );
          })}
          {messageSelectionne && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMessageSelectionne(null)}>
  <div style={{ background: '#1a2a33', border: '1px solid #2a3942', borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '220px' }} onClick={(e) => e.stopPropagation()}>
    <button onClick={() => { const msg = messages.find(m => m.id === messageSelectionne); if (msg) { console.log('Reponse :', msg.texte); setMessageReponse(msg); setMessageSelectionne(null); alert('Reponse : ' + (msg.texte || 'Photo')); } }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 20px', background: 'transparent', border: 'none', color: '#667eea', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '12px', textAlign: 'left' }}>
      Répondre
    </button>
    <button onClick={() => supprimerMessage(messageSelectionne)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 20px', background: 'transparent', border: 'none', color: '#dc3545', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '12px', textAlign: 'left' }}>
      Supprimer
    </button>
    <button onClick={() => setMessageSelectionne(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 20px', background: 'transparent', border: 'none', color: '#aaa', fontSize: '15px', cursor: 'pointer', borderRadius: '12px', textAlign: 'left' }}>
      Annuler
    </button>
  </div>
</div>
)}
<div ref={messagesEndRef} />
        </div>

        <div style={styles.saisieArea}>
          {messageReponse && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(102,126,234,0.15)', borderLeft: '3px solid #667eea', borderRadius: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#667eea', fontSize: '11px', fontWeight: 'bold', margin: 0 }}>Répondre à</p>
              <p style={{ color: '#aaa', fontSize: '13px', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {messageReponse.texte || 'Photo'}
              </p>
            </div>
            <button onClick={() => setMessageReponse(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '5px', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          )}
        </div>

        <div style={styles.saisieArea}>
          <input type="file" ref={fileInputRef} onChange={envoyerFichier} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip" style={{ display: 'none' }} />
          <button onClick={() => setMenuFichier(!menuFichier)} style={styles.fichierBtn}><IconeFichier /></button>
          
          {menuFichier && (
            <div style={styles.menuFichier}>
              <button onClick={() => { fileInputRef.current?.click(); setMenuFichier(false); }} style={styles.menuFichierItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Photo
              </button>
              <button onClick={() => { fileInputRef.current?.click(); setMenuFichier(false); }} style={styles.menuFichierItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                Vidéo
              </button>
              <button onClick={() => { fileInputRef.current?.click(); setMenuFichier(false); }} style={styles.menuFichierItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                Musique
              </button>
              <button onClick={() => { fileInputRef.current?.click(); setMenuFichier(false); }} style={styles.menuFichierItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                Document
              </button>
            </div>
          )}
          {enregistrement ? (
            <button onClick={arreterEnregistrement} style={styles.stopBtn}>
              <IconeStop /> {dureeEnregistrement}s
            </button>
          ) : (
            <button onClick={demarrerEnregistrement} style={styles.microBtn}><IconeMicro /></button>
          )}
          <input type="text" placeholder="Écris ton message..." value={nouveauMessage} onChange={(e) => setNouveauMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && envoyerMessage()} style={styles.saisieInput} />
          <button onClick={envoyerMessage} style={styles.envoyerBtn}><IconeEnvoyer /></button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerListe}>
        <h2 style={styles.titre}>Messages</h2>
        <button onClick={() => setVue('recherche')} style={styles.nouveauBtn}><IconePlus /> Nouveau</button>
      </div>

      {vue === 'recherche' ? (
        <>
          <div style={styles.searchBar}>
            <IconeRecherche />
            <input type="text" placeholder="Rechercher par nom, email ou numéro..." value={recherche} onChange={(e) => setRecherche(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && rechercherUsers()} style={styles.searchInput} autoFocus />
          </div>
          <button onClick={() => setVue('liste')} style={styles.retourListe}>Retour</button>
          <div style={styles.resultatsListe}>
            {resultats.map((user) => (
              <button key={user.id} onClick={() => creerNouvelleConversation(user)} style={styles.resultatItem}>
                <div style={styles.resultatAvatar}>{user.first_name?.charAt(0) || '?'}</div>
                <div style={styles.resultatInfo}>
                  <p style={styles.resultatNom}>{user.first_name} {user.last_name}</p>
                  <p style={styles.resultatDetail}>{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={styles.conversationsListe}>
          {conversations.length === 0 && <p style={styles.aucunResultat}>Aucune conversation. Clique sur "Nouveau" pour commencer.</p>}
          {conversations.map((conv) => {
            const photo = conv.autre_user.photo ? conv.autre_user.photo : null;
            return (
              <button key={conv.id} onClick={() => ouvrirConversation(conv)} style={styles.convItem}>
                {photo ? <img src={photo} className="avatar-conv" alt="" /> : <div style={styles.convAvatar}>{conv.autre_user.prenom?.charAt(0) || '?'}</div>}
                <div style={styles.convInfo}>
                  <p style={styles.convNom}>{conv.autre_user.prenom} {conv.autre_user.nom}</p>
                  <p style={styles.convDernier}>{conv.dernier_message || 'Nouvelle conversation'}</p>
                </div>
                {conv.nb_non_lus && conv.nb_non_lus > 0 && (
                  <span style={styles.badgeNonLu}>{conv.nb_non_lus}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '0', maxWidth: '100%', width: '100%', display: 'flex', flexDirection: 'column' as const, background: 'transparent',  },
  headerListe: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#111b21', flexShrink: 0, borderBottom: '1px solid #222d34', height: '55px',  },
  titre: { color: 'white', fontSize: '24px', margin: 0 },
  nouveauBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: '#667eea', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', background: '#111b21', borderRadius: '25px', padding: '10px 15px', margin: '10px', border: '1px solid #222d34', color: '#aaa' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '15px', outline: 'none' },
  retourListe: { background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', marginBottom: '10px' },
  resultatsListe: { display: 'flex', flexDirection: 'column' as const, gap: '5px', flex: 1, overflowY: 'auto' as const, padding: '5px' },
  resultatItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textAlign: 'left' as const },
  resultatAvatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' },
  resultatInfo: { flex: 1 },
  resultatNom: { color: 'white', margin: 0, fontSize: '16px', fontWeight: 'bold' },
  resultatDetail: { color: '#aaa', margin: '5px 0 0', fontSize: '13px' },
  conversationsListe: { display: 'flex', flexDirection: 'column' as const, gap: '0', flex: 1, overflowY: 'auto' as const, padding: '0' },
  convItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', background: 'transparent', border: 'none', borderBottom: '1px solid #1a2a33', cursor: 'pointer', textAlign: 'left' as const, width: '100%', flexShrink: 0 },
  convAvatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', flexShrink: 0 },
  convInfo: { flex: 1, minWidth: 0 },
  convNom: { color: 'white', margin: 0, fontSize: '16px', fontWeight: 'bold' },
  badgeNonLu: { background: '#22c55e', color: 'white', fontSize: '12px', fontWeight: 'bold', minWidth: '24px', height: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0 },
  convDernier: { color: '#aaa', margin: '5px 0 0', fontSize: '13px', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  convStatus: { color: '#28a745', margin: 0, fontSize: '12px' },
  aucunResultat: { color: '#aaa', textAlign: 'center' as const, marginTop: '30px' },
  convContainer: { width: '100%', display: 'flex', flexDirection: 'column' as const, background: 'transparent',  },
  convHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: 'linear-gradient(180deg, #1a2a33 0%, #111b21 100%)', borderBottom: '1px solid #2a3942', flexShrink: 0, minHeight: '65px', position: 'sticky' as const, top: '55px', zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' },
  retourBtn: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' },
  signalementBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid rgba(255,193,7,0.3)',
    background: 'rgba(255,193,7,0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuSignalement: {
    position: 'absolute' as const,
    top: '60px',
    right: '10px',
    background: '#1a2a33',
    border: '1px solid #2a3942',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    zIndex: 100,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    minWidth: '180px',
  },
  menuSignalementItem: {
    padding: '10px',
    background: 'transparent',
    border: 'none',
    color: '#d0d0d0',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    borderRadius: '8px',
  },
  appelBtn: { width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(40,167,69,0.4)', flexShrink: 0 },
  messagesArea: { flex: 1, padding: '15px 8px', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: '8px', background: 'linear-gradient(180deg, #0a1218 0%, #0b141a 100%)', WebkitOverflowScrolling: 'touch' as any, overscrollBehavior: 'contain', scrollBehavior: 'smooth' as any, scrollbarWidth: 'thin' as any, minHeight: '300px', maxHeight: 'calc(100vh - 200px)' },
  aucunMsg: { color: '#aaa', textAlign: 'center' as const, marginTop: '50px' },
  msgRow: { display: 'flex', alignItems: 'flex-end', width: '100%', flexShrink: 0, padding: '0 5px' },
  msgBubble: { maxWidth: '85%', padding: '10px 14px', borderRadius: '18px', fontSize: '16px', color: 'white', lineHeight: 1.4, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' },
  audioBubble: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '18px' },
  audioDuree: { color: 'white', fontSize: '11px' },
  fichierLink: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#1e293b', color: '#93c5fd', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' },
  saisieArea: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: '#111b21', borderTop: '1px solid #222d34', flexShrink: 0, height: '55px',  },
  menuFichier: {
    position: 'absolute' as const,
    bottom: '65px',
    left: '10px',
    background: '#1a2a33',
    border: '1px solid #2a3942',
    borderRadius: '15px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    zIndex: 100,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    minWidth: '150px',
  },
  menuFichierItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    color: '#d0d0d0',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '10px',
    textAlign: 'left' as const,
  },
  fichierBtn: { width: '38px', height: '38px', minWidth: '38px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  microBtn: { width: '38px', height: '38px', minWidth: '38px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stopBtn: { height: '40px', padding: '0 12px', borderRadius: '20px', border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
  saisieInput: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: '1px solid #3a4a55', background: '#1e2a30', color: 'white', fontSize: '15px', outline: 'none', minWidth: 0, transition: 'all 0.3s', '::placeholder': { color: '#667' } } as any,
  envoyerBtn: { width: '42px', height: '42px', minWidth: '42px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(102,126,234,0.4)' },
  raccrocher: { position: 'absolute' as const, bottom: '100px', right: '20px', width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
};

export default Texto;
