import { useState } from 'react';
import axios from 'axios';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { API_URL } from '../config';

function Visio() {
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [url, setUrl] = useState('');
  const [erreur, setErreur] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [username, setUsername] = useState('');
  const [participants, setParticipants] = useState(1);
  const [codeCree, setCodeCree] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const creerRoom = async () => {
    setErreur('');
    const accessToken = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!accessToken) {
      setErreur('Tu dois être connecté');
      return;
    }

    setUserPhoto(userData.photo_profil || null);
    setUsername(userData.prenom || userData.username || 'User');

    try {
      const response = await axios.post(
        `${API_URL}/visio/creer-room/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setCodeCree(response.data.code);
      setCode(response.data.code);
      setParticipants(response.data.participants);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur création room');
    }
  };

  const rejoindreRoom = async () => {
    setErreur('');
    const accessToken = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!accessToken) {
      setErreur('Tu dois être connecté');
      return;
    }
    
    if (!code.trim()) {
      setErreur('Entre un code');
      return;
    }

    setUserPhoto(userData.photo_profil || null);
    setUsername(userData.prenom || userData.username || 'User');

    try {
      const response = await axios.post(
        `${API_URL}/visio/rejoindre/`,
        { code: code.trim() },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setToken(response.data.token);
      setUrl(response.data.url);
      setParticipants(response.data.participants);
      setConnecte(true);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur');
    }
  };

  const copierCode = () => {
    if (codeCree) {
      navigator.clipboard.writeText(codeCree);
      alert('Code copié !');
    }
  };

  const quitterRoom = () => {
    setConnecte(false);
    setToken('');
    setUrl('');
  };

  if (connecte && token && url) {
    return (
      <LiveKitRoom
        token={token}
        serverUrl={url}
        video={true}
        audio={true}
        onDisconnected={quitterRoom}
        data-lk-theme="dark"
        style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}
      >
        <div style={styles.roomContainer}>
          <div style={styles.roomHeader}>
            <div style={styles.roomInfo}>
              <span style={styles.roomDot}>🔴</span>
              <span style={styles.roomName}>{code}</span>
              <span style={styles.roomBadge}>LIVE</span>
            </div>
            <div style={styles.participantInfo}>
              {userPhoto ? (
                <img src={userPhoto} className="avatar-conv" style={{ width: '35px', height: '35px' }} alt="" />
              ) : (
                <span style={styles.participantAvatar}>👤</span>
              )}
              <span style={styles.participantName}>{username}</span>
            </div>
          </div>

          <div style={styles.videoGrid}>
            <GridLayout>
              <ParticipantTile />
            </GridLayout>
          </div>

          <RoomAudioRenderer />

          <div style={styles.controlBar}>
            
          </div>

          <button onClick={quitterRoom} style={styles.quitButton}>
            ❌ Quitter
          </button>
        </div>
      </LiveKitRoom>
    );
  }

  return (
    <div style={styles.landingContainer}>
      <div style={styles.landingCard}>
        <div style={styles.landingIcon}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>
        <h1 style={styles.landingTitle}>Visio</h1>
        <p style={styles.landingSubtitle}>Crée ou rejoins une visio avec un code</p>
        
        {codeCree && (
          <div style={styles.codeDisplay}>
            <p style={styles.codeLabel}>CODE DE LA VISIO :</p>
            <p style={styles.codeValue}>{codeCree}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={copierCode} style={styles.copierBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copier
              </button>
              <button onClick={rejoindreRoom} style={styles.rejoindreBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                Rejoindre
              </button>
            </div>
            <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
              Valable 15 min · {participants}/5 participants
            </p>
          </div>
        )}
        
        {!codeCree && (
          <>
            <button onClick={creerRoom} style={styles.landingButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Créer une visio
            </button>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input
                type="text"
                placeholder="Entrer un code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ ...styles.landingInput, flex: 1, marginBottom: 0 }}
              />
              <button onClick={rejoindreRoom} style={styles.rejoindreBtn}>
                Rejoindre
              </button>
            </div>
          </>
        )}

        {erreur && <p style={styles.landingError}>{erreur}</p>}
      </div>
    </div>
  );
}

const styles = {
  roomContainer: {
    position: 'relative' as const,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#0a0a0f',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    zIndex: 100,
  },
  roomInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  roomDot: {
    fontSize: '14px',
  },
  roomName: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  roomBadge: {
    background: '#dc3545',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  participantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  participantAvatar: {
    fontSize: '20px',
  },
  participantName: {
    color: 'white',
    fontSize: '14px',
  },
  videoGrid: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#0a0a0f',
  },
  controlBar: {
    padding: '15px',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'center',
  },
  quitButton: {
    position: 'absolute' as const,
    bottom: '100px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 100,
  },
  landingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '20px',
  },
  landingCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    padding: '50px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center' as const,
  },
  landingIcon: {
    fontSize: '60px',
    marginBottom: '20px',
  },
  landingTitle: {
    color: 'white',
    fontSize: '32px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  landingSubtitle: {
    color: '#aaa',
    fontSize: '16px',
    marginBottom: '30px',
  },
  landingInput: {
    width: '100%',
    padding: '15px 20px',
    borderRadius: '15px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '20px',
    boxSizing: 'border-box' as const,
  },
  landingButton: {
    width: '100%',
    padding: '15px',
    borderRadius: '15px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  codeDisplay: {
    background: 'rgba(102,126,234,0.15)',
    border: '1px solid #667eea',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  codeLabel: { color: '#aaa', fontSize: '11px', textTransform: 'uppercase' as const, margin: 0 },
  codeValue: { color: '#667eea', fontSize: '24px', fontWeight: 900 as const, letterSpacing: '2px', margin: '10px 0' },
  copierBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  rejoindreBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#28a745',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  landingError: {
    color: '#dc3545',
    textAlign: 'center' as const,
    marginTop: '15px',
  },
};

export default Visio;
