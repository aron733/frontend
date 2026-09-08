import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import CreerGroupe from './CreerGroupe';

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
  const [groupes, setGroupes] = useState<any[]>([]);
  const [groupeActif, setGroupeActif] = useState<any>(null);
  const [showCreerGroupe, setShowCreerGroupe] = useState(false);
  const [showMembres, setShowMembres] = useState(false);
  const [rechercheMembre, setRechercheMembre] = useState('');
  const [resultatsRecherche, setResultatsRecherche] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [showDemandes, setShowDemandes] = useState(false);
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
        const msgRecu = {
          type: 'message',
          message: data.message || '',
          from_user_id: data.from_user_id,
          from_username: data.from_username,
          fichier_url: data.fichier_url || null,
        };
        setMessages((prev) => [...prev, msgRecu]);
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
    if ((!nouveauMessage.trim() && !fichierSelectionne) || !selectedUser) return;

    const destUserId = selectedUser?.id || selectedUser?.user_id;
    
    // Envoi vers un groupe
    if (groupeActif && !selectedUser) {
      const formData = new FormData();
      if (nouveauMessage.trim()) {
        formData.append('texte', nouveauMessage);
      }
      if (fichierSelectionne) {
        formData.append('fichier', fichierSelectionne);
      }
      
      // Envoie via WebSocket au groupe
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'groupe',
          groupe_id: groupeActif.id,
          message: nouveauMessage,
        }));
      }
      
      setMessages((prev) => [...prev, {
        type: 'message',
        message: nouveauMessage,
        from_user_id: getMyId(),
        from_username: 'Moi',
      }]);
      setNouveauMessage('');
      setFichierSelectionne(null);
      return;
    }
    
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
      
      // Ajoute IMMÉDIATEMENT au state pour éviter le lag
      setMessages((prev) => [...prev, {
        type: 'message',
        message: nouveauMessage || (fichierSelectionne ? fichierSelectionne.name : ''),
        from_user_id: getMyId(),
        from_username: 'Moi',
        fichier_url: fichierSelectionne ? URL.createObjectURL(fichierSelectionne) : null,
      }]);
      setNouveauMessage('');
      setFichierSelectionne(null);

      let sendResponse: any = null;

      if (conv) {
        const formData = new FormData();
        if (nouveauMessage.trim()) {
          formData.append('texte', nouveauMessage);
        }
        if (fichierSelectionne) {
          formData.append('fichier', fichierSelectionne);
        }
        
        sendResponse = await axios.post(`${API_URL}/conversations/${conv.id}/envoyer/`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }
      
      // Ajoute au state local
      const cloudinaryURL = sendResponse?.data?.fichier_url || null;
      setMessages((prev) => [...prev, {
        type: 'message',
        message: nouveauMessage || (fichierSelectionne ? fichierSelectionne.name : ''),
        from_user_id: getMyId(),
        from_username: 'Moi',
        fichier_url: cloudinaryURL,
      }]);
      
      // Notification via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'message',
          dest_user_id: destUserId,
          message: nouveauMessage || (fichierSelectionne ? fichierSelectionne.name : ''),
          fichier_url: cloudinaryURL,
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

  if (showCreerGroupe) {
    return <CreerGroupe onFermer={() => setShowCreerGroupe(false)} onGroupeCree={() => {
      setShowCreerGroupe(false);
      window.location.reload();
    }} />;
  }

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
          <button onClick={() => { setShowCreerGroupe(true); setMenuOuvert(false); }} style={styles.groupeBtn}>
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
            <div key={groupe.id} style={styles.groupeItem} onClick={() => { setGroupeActif(groupe); setMenuOuvert(false); }}>
              <span style={styles.groupeIcon}>👥</span>
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

        {/* Zone de chat - GROUPE */}
        {groupeActif && !selectedUser && (
          <div style={styles.chatArea}>
            <div style={styles.chatHeader}>
              <div style={styles.groupeHeaderInfo}>
                <span style={styles.groupeIcon}>👥</span>
                <div>
                  <h3 style={styles.chatTitle}>{groupeActif.nom}</h3>
                  <span style={styles.groupeInfo}>{groupeActif.participants?.length || 0} membres</span>
                </div>
              </div>
              <button onClick={() => setShowMembres(!showMembres)} style={styles.membresBtn}>
                Membres
              </button>
            </div>

            {showMembres && (
              <div style={styles.membresPanel}>
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
                    }} style={styles.membreSearchBtn}>🔍</button>
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
                      <span style={styles.membreNom}>
                        {membre.first_name || ''} {membre.last_name || membre.username}
                      </span>
                      {estAdmin && <span style={styles.badgeAdmin}>ADMIN</span>}
                      {estModo && <span style={styles.badgeModo}>MODO</span>}
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
              {messages.map((msg, index) => (
                <div key={index} style={msg.from_user_id === getMyId() ? styles.messageMoi : styles.messageAutre}>
                  <span style={styles.messageUsername}>{msg.from_username}</span>
                  <span style={styles.messageText}>{msg.message}</span>
                  {msg.fichier_url && (
                    <img src={msg.fichier_url} style={styles.messageImage} alt="fichier" />
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

            <div style={styles.inputArea}>
              <button type="button" onClick={() => fichierInputRef.current?.click()} style={styles.uploadBtn}>📎</button>
              <input
                ref={fichierInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                style={{ display: 'none' }}
                onChange={(e) => setFichierSelectionne(e.target.files?.[0] || null)}
              />
              <input
                type="text"
                value={nouveauMessage}
                onChange={(e) => setNouveauMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && envoyerMessage()}
                placeholder={`Message dans ${groupeActif.nom}...`}
                style={styles.input}
              />
              <button onClick={envoyerMessage} style={styles.sendButton}>➤</button>
            </div>
          </div>
        )}

        {/* Zone de chat - PRIVÉ */}
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
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={msg.from_user_id === getMyId() ? styles.messageMoi : styles.messageAutre}
                  >
                    <span style={styles.messageText}>{msg.message}</span>
                {msg.fichier_url && msg.fichier_url.includes('/image/') && (
                  <img
                    src={msg.fichier_url}
                    style={styles.messageImage}
                    alt="fichier"
                    onClick={() => window.open(msg.fichier_url, '_blank')}
                  />
                )}
                {msg.fichier_url && msg.fichier_url.includes('/video/') && (
                  <video src={msg.fichier_url} style={styles.messageVideo} controls preload="metadata" />
                )}
                {msg.fichier_url && !msg.fichier_url.includes('/image/') && !msg.fichier_url.includes('/video/') && (
                  <a href={msg.fichier_url} target="_blank" style={styles.messageFichier}>📎 Télécharger le fichier</a>
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
  membresPanel: {
    background: '#111120',
    borderBottom: '1px solid #2a2a3e',
    padding: '15px',
    maxHeight: '300px',
    overflowY: 'auto' as const,
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
