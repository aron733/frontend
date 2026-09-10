import { useEffect, useState } from 'react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://django-43v1.onrender.com/api';
const VERSION_APK = '3.0.0';

type VersionInfo = {
  ok: boolean;
  force?: boolean;
  version_derniere?: string;
  lien_telechargement?: string;
  notes_version?: string;
};

export default function ForceUpdateModal() {
  const [info, setInfo] = useState<VersionInfo | null>(null);
  const [ferme, setFerme] = useState(false);

  useEffect(() => {
    const verifier = async () => {
      try {
        const r = await fetch(`${API_URL}/version/check/?v=${VERSION_APK}`);
        const data = await r.json();
        if (data.ok === false) {
          setInfo(data);
        }
      } catch (e) {
        console.warn('Version check échoué', e);
      }
    };
    verifier();
  }, []);

  if (!info || info.ok) return null;
  if (ferme && !info.force) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        <h2 style={styles.titre}>
          {info.force ? 'Mise à jour obligatoire' : 'Mise à jour disponible'}
        </h2>

        <p style={styles.sousTitre}>
          Nouvelle version <strong style={{ color: '#667eea' }}>{info.version_derniere}</strong> disponible.
          {info.force
            ? ' Vous devez mettre à jour pour continuer à utiliser VOKYVO.'
            : ' Mettez à jour pour profiter des dernières améliorations.'}
        </p>

        {info.notes_version && (
          <div style={styles.notes}>
            <p style={styles.notesTitre}>Nouveautés :</p>
            <p style={styles.notesTexte}>{info.notes_version}</p>
          </div>
        )}

        <a
          href={info.lien_telechargement}
          target="_blank"
          rel="noreferrer"
          style={styles.boutonPrincipal}
        >
          Télécharger la mise à jour
        </a>

        {!info.force && (
          <button onClick={() => setFerme(true)} style={styles.boutonSecondaire}>
            Plus tard
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 999999,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#111120',
    borderRadius: '20px',
    padding: '30px 25px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const,
    border: '1px solid #2a2a3e',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  titre: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold' as const,
    margin: '0 0 12px 0',
  },
  sousTitre: {
    color: '#aaa',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  notes: {
    background: 'rgba(102,126,234,0.08)',
    borderRadius: '12px',
    padding: '12px 15px',
    marginBottom: '20px',
    textAlign: 'left' as const,
  },
  notesTitre: {
    color: '#667eea',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    margin: '0 0 5px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  notesTexte: {
    color: '#ccc',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
  },
  boutonPrincipal: {
    display: 'block',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    marginBottom: '10px',
    cursor: 'pointer',
  },
  boutonSecondaire: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '14px',
    padding: '10px',
    cursor: 'pointer',
    width: '100%',
  },
};
