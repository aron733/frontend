import { useState } from 'react';
import axios from 'axios';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { API_URL } from '../config';

function Visio() {
  const [roomName, setRoomName] = useState('ma-salle');
  const [token, setToken] = useState('');
  const [url, setUrl] = useState('');
  const [erreur, setErreur] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [username, setUsername] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const rejoindreRoom = async () => {
    setErreur('');
    const accessToken = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!accessToken) {
      setErreur('Tu dois être connecté');
      return;
    }

    setUserPhoto(userData.photo_profil || null);

    try {
      const response = await axios.post(
        `${API_URL}/livekit/token/`,
        { room_name: roomName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setToken(response.data.token);
      setUrl(response.data.url);
      setUsername(response.data.username);
      setConnecte(true);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur LiveKit');
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
              <span style={styles.roomName}>{roomName}</span>
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
            <VideoConference />
          </div>

          <RoomAudioRenderer />

          <div style={styles.controlBar}>
            <ControlBar />
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
        <div style={styles.landingIcon}>🎥</div>
        <h1 style={styles.landingTitle}>Visioconférence</h1>
        <p style={styles.landingSubtitle}>Rejoins une room et discute en vidéo</p>
        
        <input
          type="text"
          placeholder="Nom de la room"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={styles.landingInput}
        />
        
        <button onClick={rejoindreRoom} style={styles.landingButton}>
          🚀 Rejoindre la room
        </button>

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
  landingError: {
    color: '#dc3545',
    textAlign: 'center' as const,
    marginTop: '15px',
  },
};

export default Visio;
