import { useEffect, useState } from 'react';
import { SceneWelcome, SceneChat, SceneGroupes, SceneIA, SceneVisio, SceneNews, SceneFichiers, SceneAction } from './Scenes';

const SCENES = [
  { id: 'welcome',  text: 'Bienvenue sur VOKYVO' },
  { id: 'chat',     text: 'Discute en temps réel avec tes proches' },
  { id: 'groupes',  text: 'Crée des groupes et invite tes amis' },
  { id: 'ia',       text: 'Discute avec l\'IA VOKYVO' },
  { id: 'visio',    text: 'Passe en appel vidéo HD' },
  { id: 'news',     text: 'Suis l\'actualité en 31 sections' },
  { id: 'fichiers', text: 'Partage photos, vidéos et documents' },
  { id: 'action',   text: 'Sélectionne une conversation pour commencer' },
];

const SCENE_DURATION = 2500;

const SCENE_COMPONENTS: Record<string, () => any> = {
  welcome: SceneWelcome,
  chat: SceneChat,
  groupes: SceneGroupes,
  ia: SceneIA,
  visio: SceneVisio,
  news: SceneNews,
  fichiers: SceneFichiers,
  action: SceneAction,
};

export default function EmptyChat() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScene((s) => (s + 1) % SCENES.length);
    }, SCENE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const current = SCENES[scene];

  return (
    <div style={styles.wrap}>
      <div style={styles.svgWrap}>
        <svg viewBox="0 0 200 200" width="200" height="200">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          {(() => {
            const Component = SCENE_COMPONENTS[current.id];
            return Component ? <Component /> : null;
          })()}
        </svg>
      </div>
      <p key={current.id} style={styles.text}>{current.text}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  svgWrap: {
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  text: {
    color: '#ccc',
    fontSize: '15px',
    margin: 0,
    maxWidth: '320px',
    animation: 'fadeSlide 0.6s ease-out',
  },
};
