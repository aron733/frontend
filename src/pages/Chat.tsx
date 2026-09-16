import { useState, useEffect, useRef } from 'react';
import { useChat } from '../ChatContext';
import axios from 'axios';
import { API_URL } from '../config';
import CreerGroupe from './CreerGroupe';
import BadgeVerifie from '../BadgeVerifie';


function Chat() {
  const { connecte, convActive: _convActive, setConvActive, messagesParConv, setMessagesConv, ajouterMessage, envoyer, presence, presenceTime } = useChat();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [fichierSelectionne, setFichierSelectionne] = useState<File | null>(null);
  const [apercuUrl, setApercuUrl] = useState<string | null>(null);
  const [groupes, setGroupes] = useState<any[]>([]);
  const [groupeActif, setGroupeActif] = useState<any>(null);
  const [showCreerGroupe, setShowCreerGroupe] = useState(false);
  const [showMembres, setShowMembres] = useState(false);
  const [rechercheMembre, setRechercheMembre] = useState('');
  const [resultatsRecherche, setResultatsRecherche] = useState<any[]>([]);
  const [demandes, _setDemandes] = useState<any[]>([]);
  const [showDemandes, setShowDemandes] = useState(false);
  const [showGestion, setShowGestion] = useState(false);
  const [renommer, setRenommer] = useState('');
  const [rechercheUser, setRechercheUser] = useState('');
  const [showRenommer, setShowRenommer] = useState(false);
  const fichierInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [dureeEnregistrement, setDureeEnregistrement] = useState(0);
  const [audioEnAttente, setAudioEnAttente] = useState<Blob | null>(null);
  const [apercuAudioUrl, setApercuAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesParConv, selectedUser, groupeActif]);
  const getToken = () => localStorage.getItem('access_token') || '';
  const [, setTick] = useState(0);
  // Force re-render toutes les 30s pour rafraîchir "il y a X min"
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);
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
          badge_verifie: c.autre_user.badge_verifie || false,
          photo: c.autre_user.photo || null,
          nb_non_lus: c.nb_non_lus || 0,
        }));
        
        // Récupère aussi tous les users
        const usersResponse = await axios.get(`${API_URL}/rechercher-users/?q=%20`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const allUsers = (usersResponse.data.users || []).map((u: any) => {
          // Stocke la présence depuis la DB
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
    
    // Charge les groupes
    const chargerGroupes = async () => {
      try {
        const response = await axios.get(`${API_URL}/groupes/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setGroupes(response.data.groupes || []);
      } catch (err) {
        console.error('Erreur chargement groupes');
      }
    };
    chargerGroupes();
  }, []);

  // Reset la conv active au démontage (pour que les notifs s'affichent)
  useEffect(() => {
    return () => setConvActive(null);
  }, []);


  const selectUser = async (user: any) => {
    setSelectedUser(user);
    
    // Charge l'historique depuis le backend principal
    try {
      const userId = user.id || user.user_id;
      const convId = `user_${userId}`;
      setConvActive(convId);
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
        
        setMessagesConv(convId, msgs);
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
  };

  // Refresh auto toutes les 1s de la conv active (anti-coupure WS)
  useEffect(() => {
    if (!selectedUser && !groupeActif) return;

    const interval = setInterval(async () => {
      try {
        if (groupeActif && !selectedUser) {
          const convId = `groupe_${groupeActif.id}`;
          const response = await axios.get(`${API_URL}/groupes/${groupeActif.id}/messages/`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          const msgs = (response.data.messages || []).map((m: any) => ({
            type: 'message',
            message: m.texte || '',
            from_user_id: m.expediteur_id,
            from_username: m.expediteur_username,
            fichier_url: m.fichier_url,
          }));
          setMessagesConv(convId, msgs);
        } else if (selectedUser) {
          const userId = selectedUser.id || selectedUser.user_id;
          const convId = `user_${userId}`;

          const convResponse = await axios.get(`${API_URL}/conversations/`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          const conversations = convResponse.data.conversations || [];
          const conv = conversations.find((c: any) => c.autre_user.id === userId);

          if (conv) {
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
            setMessagesConv(convId, msgs);
          }
        }
      } catch (err) {
        // Silencieux
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedUser, groupeActif]);

  const demarrerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        setAudioEnAttente(blob);
        setApercuAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setEnregistrement(true);
      setDureeEnregistrement(0);

      timerRef.current = setInterval(() => {
        setDureeEnregistrement((d) => d + 1);
      }, 1000);
    } catch (err) {
      alert('Micro non autorisé ou erreur');
      console.error(err);
    }
  };

  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enregistrement) {
      mediaRecorderRef.current.stop();
      setEnregistrement(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setDureeEnregistrement(0);
    }
  };

  const annulerAudio = () => {
    setAudioEnAttente(null);
    if (apercuAudioUrl) URL.revokeObjectURL(apercuAudioUrl);
    setApercuAudioUrl(null);
  };

  const envoyerAudioDepuisApercu = async () => {
    if (!audioEnAttente) return;
    const blob = audioEnAttente;
    setAudioEnAttente(null);
    if (apercuAudioUrl) URL.revokeObjectURL(apercuAudioUrl);
    setApercuAudioUrl(null);
    await envoyerAudio(blob);
  };

  const envoyerAudio = async (blob: Blob) => {
    if (!selectedUser && !groupeActif) return;
    const destUserId = selectedUser?.id || selectedUser?.user_id;

    // Ajout local immédiat
    const convIdLocal = groupeActif && !selectedUser
      ? `groupe_${groupeActif.id}`
      : `user_${destUserId}`;
    const blobUrl = URL.createObjectURL(blob);
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    ajouterMessage(convIdLocal, {
      type: 'message',
      message: '',
      from_user_id: getMyId(),
      from_username: userData.prenom || userData.first_name || userData.username || 'Moi',
      fichier_url: null,
      audio_url: blobUrl,
      lu: false,
    });

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'vocal.webm');

      // Cas groupe
      if (groupeActif && !selectedUser) {
        formData.append('groupe_id', String(groupeActif.id));
        await axios.post(`${API_URL}/groupes/envoyer-message/`, formData, {
          headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
        });
        envoyer({
          action: 'groupe',
          groupe_id: groupeActif.id,
          message: 'Message vocal',
          fichier_url: null,
        });
        setDureeEnregistrement(0);
        return;
      }

      // Cas privé
      const convResponse = await axios.get(`${API_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const conversations = convResponse.data.conversations || [];
      let conv = conversations.find((c: any) => c.autre_user.id === destUserId);

      if (!conv) {
        const createRes = await axios.post(`${API_URL}/conversations/creer/`, {
          user2_id: destUserId,
        }, { headers: { Authorization: `Bearer ${getToken()}` } });
        conv = { id: createRes.data.conversation_id };
      }

      await axios.post(`${API_URL}/conversations/${conv.id}/envoyer/`, formData, {
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
      });

      envoyer({
        action: 'message',
        dest_user_id: destUserId,
        message: 'Message vocal',
        fichier_url: null,
      });
    } catch (err) {
      console.error('Erreur envoi audio:', err);
      alert('Erreur envoi vocal');
    }
  };

  const envoyerMessage = async () => {
    if (!nouveauMessage.trim() && !fichierSelectionne) return;
    if (!groupeActif && !selectedUser) return;

    const destUserId = selectedUser?.id || selectedUser?.user_id;
    
    // Envoi vers un groupe
    if (groupeActif && !selectedUser) {
      // Sauvegarde en DB via l'API REST
      try {
        const formData = new FormData();
        if (nouveauMessage.trim()) {
          formData.append('texte', nouveauMessage);
        }
        if (fichierSelectionne) {
          formData.append('fichier', fichierSelectionne);
        }
        formData.append('groupe_id', String(groupeActif.id));
        
        const saveResponse = await axios.post(`${API_URL}/groupes/envoyer-message/`, formData, {
          headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
        });
        console.log('Message groupe sauvegardé:', saveResponse.data);
      } catch (err) {
        console.error('Erreur sauvegarde message groupe:', err);
      }

      // Notification via WebSocket au groupe (instantané)
        envoyer({
          action: 'groupe',
          groupe_id: groupeActif.id,
          message: nouveauMessage,
          fichier_url: fichierSelectionne ? URL.createObjectURL(fichierSelectionne) : null,
        });
      setNouveauMessage('');
      setFichierSelectionne(null);
      setApercuUrl(null);
      return;
    }
    
    // Capture AVANT reset (sinon perdu)
    const msgTexte = nouveauMessage || (fichierSelectionne ? fichierSelectionne.name : '');
    const fichierTemp = fichierSelectionne;

    // Ajoute IMMÉDIATEMENT au state (comme les groupes)
    ajouterMessage(`user_${destUserId}`, {
      type: 'message',
      message: msgTexte,
      from_user_id: getMyId(),
      from_username: (() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        return (u.prenom || u.first_name || u.username || 'Moi');
      })(),
      fichier_url: fichierTemp ? URL.createObjectURL(fichierTemp) : null,
    });

    // WS EN PREMIER (temps réel instantané)
    envoyer({
      action: 'message',
      dest_user_id: destUserId,
      message: msgTexte,
      fichier_url: null,
    });

    // Reset states
    setNouveauMessage('');
    setFichierSelectionne(null);

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
      
      // Ne PAS ajouter au state ici - l'API va renvoyer la réponse
      // avec le message sauvegardé (ID unique de la DB)

      if (conv) {
        const formData = new FormData();
        if (nouveauMessage.trim()) {
          formData.append('texte', nouveauMessage);
        }
        if (fichierSelectionne) {
          formData.append('fichier', fichierSelectionne);
        }
        
        const sendRes = await axios.post('' + API_URL + '/conversations/' + conv.id + '/envoyer/', formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        // Remplace le blob par la vraie URL Cloudinary
        if (sendRes.data.fichier_url) {
          const vraieUrl = sendRes.data.fichier_url;
          setMessagesConv(`user_${destUserId}`, (messagesParConv[`user_${destUserId}`] || []).map((m) =>
            m.fichier_url && m.fichier_url.startsWith("blob:")
              ? { ...m, fichier_url: vraieUrl }
              : m
          ));
        }
      }

      // Déjà ajouté au state - ne rien faire ici
    } catch (err: any) {
      console.error('Erreur envoi message:', err);
      alert('Erreur envoi : ' + (err.response?.data?.erreur || err.message || 'inconnu'));
    }
  };

  const usersFiltres = allUsers.filter((user) => {
    const nomComplet = `${user.first_name || ''} ${user.last_name || ''} ${user.username || ''}`.toLowerCase();
    return nomComplet.includes(rechercheUser.toLowerCase());
  });

  if (showCreerGroupe) {
    return <CreerGroupe onFermer={() => setShowCreerGroupe(false)} onGroupeCree={() => {
      setShowCreerGroupe(false);
      window.location.reload();
    }} />;
  }

  const chargerDemandes = async () => {
    if (!groupeActif) return;
    try {
      const response = await axios.get(`${API_URL}/groupes/${groupeActif.id}/demandes/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      _setDemandes(response.data.demandes || []);
      setShowDemandes(true);
    } catch (err) {
      _setDemandes([]);
      setShowDemandes(true);
    }
  };

  const renommerGroupe = async () => {
    if (!groupeActif || !renommer.trim()) return;
    try {
      await axios.post(`${API_URL}/groupes/renommer/`, {
        groupe_id: groupeActif.id,
        nom: renommer,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setShowRenommer(false);
      window.location.reload();
    } catch (err) {
      alert('Erreur renommage');
    }
  };

  const bannirMembre = async (userId: number) => {
    if (!groupeActif) return;
    try {
      await axios.post(`${API_URL}/groupes/bannir-membre/`, {
        groupe_id: groupeActif.id,
        user_id: userId,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      
      envoyer({
          action: 'membre_banni',
          groupe_id: groupeActif.id,
          user_id: userId,
        });
    } catch (err) {
    }
  };

  const nommerModerateur = async (userId: number) => {
    if (!groupeActif) return;
    try {
      await axios.post(`${API_URL}/groupes/nommer-moderateur/`, {
        groupe_id: groupeActif.id,
        user_id: userId,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      window.location.reload();
    } catch (err) {
      alert('Erreur nomination');
    }
  };

  const supprimerGroupe = async () => {
    if (!groupeActif) return;
    if (!window.confirm('Supprimer ce groupe ?')) return;
    try {
      await axios.post(`${API_URL}/groupes/supprimer/`, {
        groupe_id: groupeActif.id,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setGroupeActif(null);
      window.location.reload();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const validerDemande = async (demandeId: number, action: string) => {
    try {
      await axios.post(`${API_URL}/groupes/valider-demande/`, {
        demande_id: demandeId,
        action: action,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      window.location.reload();
    } catch (err) {
      console.error('Erreur validation demande');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => { localStorage.setItem('vokyvo_page', 'profil'); window.location.reload(); }} style={styles.backButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 style={styles.title}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Messages
        </h2>
        <span style={connecte ? styles.online : styles.offline}>
          {connecte ? '● Connecté' : '○ Déconnecté'}
        </span>
      </div>

      <div style={styles.body}>
        {/* Menu hamburger avec liste des utilisateurs */}
        {!selectedUser && !groupeActif && (
        <div style={{
          ...styles.userList,
          animation: 'slideIn 0.3s ease-out',
        }}>
          <button onClick={() => { setShowCreerGroupe(true); }} style={styles.groupeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Groupe
          </button>
          <input
            type="text"
            value={rechercheUser}
            onChange={(e) => setRechercheUser(e.target.value)}
            placeholder="Rechercher..."
            style={styles.searchInput}
          />
          {groupes.map((groupe) => (
            <div key={groupe.id} style={styles.groupeItem} onClick={async () => {
      setGroupeActif(groupe);
      setSelectedUser(null);
      setConvActive(`groupe_${groupe.id}`);
      
      // Charge l'historique du groupe depuis l'API
      try {
        const response = await axios.get(`${API_URL}/groupes/${groupe.id}/messages/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const msgs = (response.data.messages || []).map((m: any) => ({
          type: 'message',
          message: m.texte || '',
          from_user_id: m.expediteur_id,
          from_username: m.expediteur_username,
          fichier_url: m.fichier_url,
        }));
        const convId = `groupe_${groupe.id}`;
        setMessagesConv(convId, msgs);
      } catch (err) {
        console.error('Erreur chargement messages groupe');
      }
    }}>
              <span style={styles.groupeIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
              <div>
                <p style={styles.groupeNom}>{groupe.nom}</p>
                <p style={styles.groupeInfo}>{groupe.participants.length} membres</p>
              </div>
            </div>
          ))}
          <p style={styles.contactsTitle}>Contacts</p>
          {usersFiltres.map((user) => (
              <button
                key={user.id || user.user_id}
                onClick={() => { selectUser(user); setGroupeActif(null); }}
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
                {user.badge_verifie && <BadgeVerifie />}
                {user.nb_non_lus > 0 && (
                  <span style={styles.badgeNonLus}>{user.nb_non_lus}</span>
                )}
              </button>
          ))}
        </div>
        )}

        {/* Zone de chat - GROUPE */}
        {groupeActif && !selectedUser && (
          <div style={styles.chatArea}>
            <div style={styles.chatHeader}>
              <div style={styles.groupeHeaderInfo}>
                <span style={styles.groupeIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <div>
                  <h3 style={styles.chatTitle}>{groupeActif.nom}</h3>
                  <span style={styles.groupeInfo}>{groupeActif.participants?.length || 0} membres</span>
                </div>
              </div>
              <button onClick={() => setShowMembres(!showMembres)} style={styles.chevronBtn} title={showMembres ? 'Masquer les membres' : 'Voir les membres'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: showMembres ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button onClick={() => setShowGestion(!showGestion)} style={styles.gestionBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>

            {showGestion && groupeActif && (
              <div style={styles.gestionPanel}>
                <p style={styles.membresTitle}>Gestion du groupe</p>
                <div style={styles.membreItem}>
                  <span style={styles.membreNom}>{(() => { const u = JSON.parse(localStorage.getItem('user') || '{}'); return (u.prenom || u.first_name || '') + ' ' + (u.nom || u.last_name || ''); })()}</span>
                  <span style={styles.badgeAdmin}>ADMIN</span>
                </div>
                <p style={styles.sectionSousTitre}>Participants ({groupeActif.participants?.length || 0})</p>
                {(groupeActif.participants || []).map((membre: any) => {
                  const estAdmin = membre.username === groupeActif.createur;
                  const estModo = groupeActif.moderateurs?.some((m: any) => m.id === membre.id);
                  return (
                    <div key={membre.id} style={styles.membreItem}>
                      <span style={styles.membreNom}>{membre.first_name || ''} {membre.last_name || membre.username}</span>
                      {membre.username !== groupeActif.createur && <span style={styles.badgeMembre}>MEMBRE</span>}
                      {estAdmin ? <span style={styles.badgeAdmin}>ADMIN</span> : estModo ? <span style={styles.badgeModo}>MODO</span> : <span style={styles.badgeMembre}>MEMBRE</span>}
                    </div>
                  );
                })}
                <button onClick={() => setShowRenommer(!showRenommer)} style={styles.gestionItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Renommer
                </button>
                {showRenommer && (
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                    <input
                      type="text"
                      value={renommer}
                      onChange={(e) => setRenommer(e.target.value)}
                      placeholder="Nouveau nom"
                      style={styles.gestionInput}
                    />
                    <button onClick={renommerGroupe} style={styles.gestionValider}>OK</button>
                  </div>
                )}
                <button onClick={supprimerGroupe} style={styles.gestionItemDanger}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Supprimer le groupe
                </button>
              </div>
            )}

            {showMembres && (
              <div style={styles.membresPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <p style={styles.membresTitle}>Membres du groupe</p>
                  <button onClick={() => setShowMembres(false)} style={styles.panelCloseBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <p style={styles.membresTitle}>Membres du groupe</p>
                
                {/* Recherche pour ajouter */}
                {groupeActif.est_admin !== false && (
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={rechercheMembre}
                      onChange={(e) => setRechercheMembre(e.target.value)}
                      placeholder="Ajouter un membre..."
                      style={styles.membreSearchInput}
                    />
                    <button onClick={async () => {
                      try {
                        const response = await axios.get(`${API_URL}/rechercher-users/?q=${encodeURIComponent(rechercheMembre)}`, {
                          headers: { Authorization: `Bearer ${getToken()}` }
                        });
                        setResultatsRecherche(response.data.users || []);
                      } catch (err) {}
                    }} style={styles.membreSearchBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
                  </div>
                )}
                
                {/* Résultats de recherche */}
                {resultatsRecherche.length > 0 && (
                  <div style={styles.membreResultats}>
                    {resultatsRecherche.map((user) => (
                      <div key={user.id} style={styles.membreResultatItem} onClick={async () => {
                        try {
                          await axios.post(`${API_URL}/groupes/ajouter-membre/`, {
                            groupe_id: groupeActif.id,
                            user_id: user.id,
                          }, { headers: { Authorization: `Bearer ${getToken()}` } });
                          setResultatsRecherche([]);
                          setRechercheMembre('');
                          window.location.reload();
                        } catch (err) {}
                      }}>
                        <span>+ {user.first_name || ''} {user.last_name || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Liste des membres */}
                {(groupeActif.participants || []).map((membre: any) => {
                  const estAdmin = groupeActif.createur === membre.username;
                  const estModo = groupeActif.moderateurs?.some((m: any) => m.id === membre.id);
                  return (
                    <div key={membre.id} style={styles.membreItem}>
                      {membre.photo_profil ? (
                        <img src={membre.photo_profil} style={styles.membrePhoto} alt="" />
                      ) : (
                        <span style={styles.membreAvatar}>
                          {(membre.first_name || membre.username || '?')[0].toUpperCase()}
                        </span>
                      )}
                      <span style={styles.membreNom}>
                        {membre.first_name || ''} {membre.last_name || membre.username}
                      </span>
                      {estAdmin && <span style={styles.badgeAdmin}>ADMIN</span>}
                      {estModo && <span style={styles.badgeModo}>MODO</span>}
                      {!estAdmin && (
                        <button onClick={() => nommerModerateur(membre.id)} style={styles.modoBtn} title="Nommer modérateur">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f0ad4e" strokeWidth="2">
                            <path d="M12 15l-3 3 1-4-3-3h4l1-3 1 3h4l-3 3 1 4-3-3z" />
                          </svg>
                        </button>
                      )}
                      {!estAdmin && (
                        <button onClick={() => bannirMembre(membre.id)} style={styles.bannirBtn} title="Bannir">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
                
                <button onClick={chargerDemandes} style={styles.demandesBtn}>
                  📩 Demandes d'accès
                </button>
                <button onClick={() => setShowMembres(false)} style={styles.fermerMembres}>Fermer</button>
              </div>
            )}

            {showDemandes && (
              <div style={styles.demandesPanel}>
                <p style={styles.membresTitle}>Demandes d'accès</p>
                {demandes.length === 0 ? (
                  <p style={styles.demandesVides}>Aucune demande en attente</p>
                ) : (
                  demandes.map((demande) => (
                    <div key={demande.id} style={styles.demandeItem}>
                      <span style={styles.membreNom}>{demande.user}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => validerDemande(demande.id, 'accepter')} style={styles.accepterBtn}>✓</button>
                        <button onClick={() => validerDemande(demande.id, 'refuser')} style={styles.refuserBtn}>✕</button>
                      </div>
                    </div>
                  ))
                )}
                <button onClick={() => setShowDemandes(false)} style={styles.fermerMembres}>Fermer</button>
              </div>
            )}

            <div style={styles.messagesArea}>
              {(messagesParConv[`groupe_${groupeActif?.id}`] || []).map((msg, index) => (
                <div key={index} style={String(msg.from_user_id) === String(getMyId()) ? styles.messageMoi : styles.messageAutre}>
                  <span style={styles.messageUsername}>{msg.from_username}</span>
                  <span style={styles.messageText}>{msg.message}</span>
                  {msg.fichier_url && (
                    <img src={msg.fichier_url} style={styles.messageImage} alt="fichier" />
                  )}
                  {msg.audio_url && (
                    <audio
                      src={msg.audio_url ? msg.audio_url.replace('/video/upload/', '/video/upload/f_mp3/') : ''}
                      style={styles.messageAudio}
                      controls
                      controlsList="nodownload"
                    />
                  )}
                  {msg.fichier_url && /\.(mp4|webm|mov|avi)(\?|$)/i.test(msg.fichier_url) && (
                    <video src={msg.fichier_url?.replace('/video/upload/', '/video/upload/f_mp4/')} style={styles.messageVideo} controls preload="metadata" controlsList="nodownload" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {fichierSelectionne && (
              <div style={styles.fichierApercu}>
                {apercuUrl && <img src={apercuUrl} style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} alt="" />}
                <button onClick={() => { setFichierSelectionne(null); setApercuUrl(null); }} style={styles.fichierRetirer}>✕</button>
              </div>
            )}

              {audioEnAttente && apercuAudioUrl && (
                <div style={styles.audioApercu}>
                  <audio 
                    src={apercuAudioUrl} 
                    controls 
                    controlsList="nodownload" 
                    style={styles.audioApercuPlayer} 
                  />
                  <button 
                    onClick={annulerAudio} 
                    style={styles.audioAnnulerBtn}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            <div style={styles.inputArea}>
              <button type="button" onClick={() => fichierInputRef.current?.click()} style={styles.uploadBtn}>📎</button>
              <button
                type="button"
                onClick={enregistrement ? arreterEnregistrement : demarrerEnregistrement}
                style={enregistrement ? styles.micBtnActif : styles.micBtn}
              >
                {enregistrement ? (
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {dureeEnregistrement}s
                  </span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
              <input
                ref={fichierInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0] || null; setFichierSelectionne(f); if (f && f.type.startsWith("image/")) { const r = new FileReader(); r.onloadend = () => setApercuUrl(r.result as string); r.readAsDataURL(f); } else { setApercuUrl(null); } }}
              />
              <input
                type="text"
                value={nouveauMessage}
                onChange={(e) => setNouveauMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && envoyerMessage()}
                placeholder={`Message dans ${groupeActif.nom}...`}
                style={styles.input}
              />
              <button onClick={audioEnAttente ? envoyerAudioDepuisApercu : envoyerMessage} style={styles.sendButton}>➤</button>
            </div>
          </div>
        )}

        {/* Zone de chat - PRIVÉ */}
        {!groupeActif && (
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
                  {selectedUser.badge_verifie && <BadgeVerifie />}
                </h3>
                <span style={presence[selectedUser.id || selectedUser.user_id] === 'online' ? styles.userOnline : styles.userOffline}>
                  {presence[selectedUser.id || selectedUser.user_id] === 'online' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>

              {showDemandes && (
              <div style={styles.demandesPanel}>
                <p style={styles.membresTitle}>Demandes d'accès</p>
                {demandes.length === 0 ? (
                  <p style={styles.demandesVides}>Aucune demande en attente</p>
                ) : (
                  demandes.map((demande) => (
                    <div key={demande.id} style={styles.demandeItem}>
                      <span style={styles.membreNom}>{demande.user}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => validerDemande(demande.id, 'accepter')} style={styles.accepterBtn}>✓</button>
                        <button onClick={() => validerDemande(demande.id, 'refuser')} style={styles.refuserBtn}>✕</button>
                      </div>
                    </div>
                  ))
                )}
                <button onClick={() => setShowDemandes(false)} style={styles.fermerMembres}>Fermer</button>
              </div>
            )}

            <div style={styles.messagesArea}>
                {(messagesParConv[`user_${selectedUser?.id || selectedUser?.user_id}`] || []).map((msg, index) => (
                  <div
                    key={index}
                    style={msg.from_user_id === getMyId() ? styles.messageMoi : styles.messageAutre}
                  >
                    <span style={styles.messageText}>{msg.message}</span>
                {msg.fichier_url && /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(msg.fichier_url) && (
                  <img
                    src={msg.fichier_url}
                    style={styles.messageImage}
                    alt="fichier"
                    onClick={() => window.open(msg.fichier_url || '', '_blank')}
                  />
                )}
                {msg.fichier_url && /\.(mp4|webm|mov|avi)(\?|$)/i.test(msg.fichier_url) && (
                  <video src={msg.fichier_url?.replace('/video/upload/', '/video/upload/f_mp4/')} style={styles.messageVideo} controls preload="metadata" />
                )}
                {msg.fichier_url && !/\.(jpg|jpeg|png|gif|webp|bmp|mp4|webm|mov|avi)(\?|$)/i.test(msg.fichier_url) && (
                  <a href={msg.fichier_url} target="_blank" style={styles.messageFichier}>📎 Télécharger le fichier</a>
                )}
                {msg.audio_url && (
                  <audio 
                    src={msg.audio_url ? msg.audio_url.replace('/video/upload/', '/video/upload/f_mp3/') : ''} 
                    style={styles.messageAudio} 
                    controls 
                    controlsList="nodownload"
                  />
                )}
                {msg.from_user_id === getMyId() && (
                  <span style={styles.tick}>{msg.lu ? '✓✓' : '✓'}</span>
                )}
                  </div>
                ))}
              <div ref={messagesEndRef} />
              </div>

              {fichierSelectionne && (
                <div style={styles.fichierApercu}>
                  {apercuUrl && <img src={apercuUrl} style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} alt="" />}
                  <button onClick={() => { setFichierSelectionne(null); setApercuUrl(null); }} style={styles.fichierRetirer}>✕</button>
                </div>
              )}
              {audioEnAttente && apercuAudioUrl && (
                <div style={styles.audioApercu}>
                  <audio 
                    src={apercuAudioUrl} 
                    controls 
                    controlsList="nodownload" 
                    style={styles.audioApercuPlayer} 
                  />
                  <button 
                    onClick={annulerAudio} 
                    style={styles.audioAnnulerBtn}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
              <div style={styles.inputArea}>
                <button type="button" onClick={() => fichierInputRef.current?.click()} style={styles.uploadBtn}>
                  📎
                </button>
                <button
                  type="button"
                  onClick={enregistrement ? arreterEnregistrement : demarrerEnregistrement}
                  style={enregistrement ? styles.micBtnActif : styles.micBtn}
                >
                  {enregistrement ? (
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {dureeEnregistrement}s
                    </span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fichierInputRef}
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0] || null; setFichierSelectionne(f); if (f && f.type.startsWith("image/")) { const r = new FileReader(); r.onloadend = () => setApercuUrl(r.result as string); r.readAsDataURL(f); } else { setApercuUrl(null); } }}
                />
                <input
                  type="text"
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && envoyerMessage()}
                  placeholder="Écris un message..."
                  style={styles.input}
                />
                <button onClick={audioEnAttente ? envoyerAudioDepuisApercu : envoyerMessage} style={styles.sendButton}>➤</button>
              </div>
            </>
          ) : (
            <div style={styles.emptyChat}>
              <div style={styles.emptyIconWrap}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 style={styles.emptyTitle}>Bienvenue sur VOKYVO</h2>
              <p style={styles.emptyText}>Sélectionne une conversation ou un groupe pour commencer</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  '@keyframes slideIn': {
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  '@keyframes slideOut': {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(-100%)', opacity: 0 },
  },
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
  groupeBtn: {
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
    marginBottom: '10px',
    width: '100%',
  },
  groupeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.03)',
    marginBottom: '5px',
  },
  groupeIcon: { fontSize: '24px' },
  groupeHeaderInfo: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  gestionBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    width: '38px', height: '38px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionSousTitre: {
    color: '#667eea',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '10px 0 5px 0',
  },
  badgeMembre: {
    background: '#2a2a3e',
    color: '#aaa',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  gestionPanel: {
    background: '#111120',
    borderBottom: '1px solid #2a2a3e',
    padding: '10px',
  },
  gestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: 'rgba(102,126,234,0.1)',
    border: 'none',
    color: '#667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '5px',
  },
  gestionItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: 'rgba(220,53,69,0.1)',
    border: 'none',
    color: '#dc3545',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  gestionInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '12px',
  },
  gestionValider: {
    padding: '8px 15px',
    borderRadius: '8px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
  modoBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },
  bannirBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },
  chevronBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    width: '38px', height: '38px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  membresBtn: {
    background: 'rgba(102,126,234,0.15)',
    border: '1px solid #667eea',
    color: '#667eea',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },
  panelCloseBtn: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    padding: '5px',
  },
  membresPanel: {
    background: '#111120',
    borderBottom: '1px solid #2a2a3e',
    padding: '15px',
    maxHeight: '300px',
    overflowY: 'auto' as const,
    flexShrink: 0,
  },
  membresTitle: { color: '#667eea', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' },
  membreSearchInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '12px',
  },
  membreSearchBtn: {
    padding: '0 12px',
    borderRadius: '8px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    cursor: 'pointer',
  },
  membreResultats: {
    background: '#1a1a2e',
    borderRadius: '8px',
    marginBottom: '10px',
    maxHeight: '120px',
    overflowY: 'auto' as const,
  },
  membreResultatItem: {
    padding: '8px 12px',
    borderBottom: '1px solid #2a2a3e',
    cursor: 'pointer',
    color: '#aaa',
    fontSize: '12px',
  },
  membreItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    borderBottom: '1px solid #1a1a2a',
  },
  membreNom: { color: 'white', fontSize: '13px', flex: 1 },
  membrePhoto: { width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' as const },
  membreAvatar: {
    width: '35px', height: '35px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: 'bold',
    flexShrink: 0,
  },
  badgeAdmin: {
    background: '#667eea',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  badgeModo: {
    background: '#f0ad4e',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  demandesBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #f0ad4e',
    background: 'rgba(240,173,78,0.15)',
    color: '#f0ad4e',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '12px',
    fontWeight: 600,
  },
  demandesPanel: {
    background: '#111120',
    borderBottom: '1px solid #2a2a3e',
    padding: '15px',
    maxHeight: '250px',
    overflowY: 'auto' as const,
  },
  demandesVides: { color: '#666', fontSize: '12px', textAlign: 'center' as const, padding: '15px' },
  demandeItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #1a1a2a',
  },
  accepterBtn: {
    width: '30px', height: '30px',
    borderRadius: '50%',
    border: 'none',
    background: '#28a745',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  refuserBtn: {
    width: '30px', height: '30px',
    borderRadius: '50%',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  fermerMembres: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: '#2a2a3e',
    color: 'white',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '12px',
  },
  messageUsername: { color: '#aaa', fontSize: '11px', marginBottom: '3px', display: 'block' },
  groupeNom: { color: 'white', fontSize: '14px', fontWeight: 600, margin: 0 },
  groupeInfo: { color: '#888', fontSize: '11px', margin: 0 },
  contactsTitle: {
    color: '#667eea',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '15px 0 5px 0',
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
    background: '#111120',
    width: '100%',
    flex: 1,
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
  badgeNonLus: {
    marginLeft: 'auto',
    background: '#dc3545',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    padding: '3px 8px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center' as const,
  },
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
  emptyChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center' as const,
  },
  emptyIconWrap: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  emptyTitle: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 8px 0',
  },
  emptyText: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
    maxWidth: '280px',
  },
  messagesArea: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    gap: '10px',
  },
  messageMoi: {
    alignSelf: 'flex-end' as const,
    background: '#667eea',
    padding: '12px 18px',
    borderRadius: '15px 15px 0 15px',
    maxWidth: '85%',
    minWidth: '60px',
  },
  messageAutre: {
    alignSelf: 'flex-start' as const,
    background: '#1a1a2e',
    padding: '12px 18px',
    borderRadius: '15px 15px 15px 0',
    maxWidth: '85%',
    minWidth: '60px',
  },
  messageText: { color: 'white', fontSize: '14px' },
  tick: { color: '#4fc3f7', fontSize: '10px', marginLeft: '5px' },
  messageImage: {
    maxWidth: '100%',
    maxHeight: '350px',
    borderRadius: '12px',
    marginTop: '5px',
    cursor: 'zoom-in',
    objectFit: 'contain' as const,
    transition: 'transform 0.2s',
  },
  messageVideo: {
    maxWidth: '100%',
    maxHeight: '350px',
    borderRadius: '12px',
    marginTop: '5px',
    cursor: 'pointer',
  },
  messageAudio: { maxWidth: '100%', marginTop: '5px' },
  messageFichier: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '13px',
    marginTop: '5px',
    display: 'block',
  },
  empty: { color: '#666', textAlign: 'center' as const, marginTop: '50px' },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    borderTop: '1px solid #1a1a2a',
    background: '#111120',
    flexShrink: 0,
    width: '100%',
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
  micBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: '#667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  micBtnActif: {
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
    fontSize: '12px',
    fontWeight: 'bold' as const,
    flexShrink: 0,
    animation: 'pulse 1s infinite',
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
    background: '#111120',
    borderRadius: '10px',
    color: 'white',
    fontSize: '12px',
    position: 'fixed' as const,
    bottom: '80px',
    left: '15px',
    right: '15px',
    zIndex: 99,
    border: '1px solid #2a2a3e',
  },
  audioApercu: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    background: '#111120',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    marginBottom: '8px',
  },
  audioApercuPlayer: {
    flex: 1,
    height: '40px',
  },
  audioAnnulerBtn: {
    width: '40px',
    height: '40px',
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
  fichierRetirer: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Chat;
