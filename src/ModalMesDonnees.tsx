import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from './config';

interface Props {
  onFermer: () => void;
}

interface Stats {
  nb_messages: number;
  nb_conversations: number;
  anciennete: number;
  unite: string;
  date_inscription: string;
}

interface ActiviteJour {
  jour: string;
  total: number;
}

export default function ModalMesDonnees({ onFermer }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activite, setActivite] = useState<ActiviteJour[]>([]);
  const [chargement, setChargement] = useState(true);
  const [exportEnCours, setExportEnCours] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        const [resStats, resActivite] = await Promise.all([
          axios.get(`${API_URL}/user/stats/`, { headers }),
          axios.get(`${API_URL}/user/stats/activite/`, { headers }),
        ]);
        setStats(resStats.data);
        setActivite(resActivite.data.activite || []);
      } catch {
        toast.error('Erreur chargement des données');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const telecharger = async () => {
    setExportEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/user/export/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = JSON.stringify(res.data, null, 2);
      const nomFichier = `vokyvo-donnees-${new Date().toISOString().slice(0, 10)}.json`;

      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        await Filesystem.writeFile({
          path: nomFichier,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        const uri = await Filesystem.getUri({ directory: Directory.Cache, path: nomFichier });
        await Share.share({ title: 'Mes données VOKYVO', url: uri.uri, dialogTitle: 'Enregistrer ou partager' });
      } else {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success('Données téléchargées !');
    } catch {
      toast.error('Erreur export');
    } finally {
      setExportEnCours(false);
    }
  };

  // SVG barres 30 jours
  const maxTotal = Math.max(...activite.map(a => a.total), 1);
  const largeurBarre = 100 / Math.max(activite.length, 1);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0f', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', margin: 0 }}>Mes données</h2>
        <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {chargement ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Chargement...</p>
      ) : (
        <div style={{ padding: '0 20px 40px' }}>
          {/* Cartes stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <Carte label="Messages" valeur={stats?.nb_messages ?? 0} />
            <Carte label="Conversations" valeur={stats?.nb_conversations ?? 0} />
            <Carte label="Ancienneté" valeur={`${stats?.anciennete ?? 0} ${stats?.unite ?? ''}`} />
            <Carte label="Inscription" valeur={stats?.date_inscription ?? '—'} petit />
          </div>

          {/* Graphique */}
          <p style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>Activité (30 derniers jours)</p>
          <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '120px' }}>
              {activite.map((a, i) => {
                const h = (a.total / maxTotal) * 36;
                return (
                  <rect
                    key={i}
                    x={i * largeurBarre + largeurBarre * 0.15}
                    y={38 - h}
                    width={largeurBarre * 0.7}
                    height={h}
                    fill="#667eea"
                  />
                );
              })}
              <line x1="0" y1="38" x2="100" y2="38" stroke="#2a2a3e" strokeWidth="0.5" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#666', fontSize: '10px' }}>{activite[0]?.jour?.slice(5) ?? ''}</span>
              <span style={{ color: '#666', fontSize: '10px' }}>{activite[activite.length - 1]?.jour?.slice(5) ?? ''}</span>
            </div>
          </div>

          {/* Export */}
          <button
            onClick={telecharger}
            disabled={exportEnCours}
            style={{
              width: '100%',
              padding: '14px',
              background: exportEnCours ? '#3a3a4e' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: exportEnCours ? 'wait' : 'pointer',
              marginBottom: '12px',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exportEnCours ? 'Export en cours...' : 'Télécharger mes données (JSON)'}
            </span>
          </button>

          <p style={{ color: '#666', fontSize: '11px', textAlign: 'center', lineHeight: 1.5 }}>
            Portabilité RGPD (art. 20). Le fichier contient ton profil, tes conversations et tes groupes.
            Les médias sont référencés par URL.
          </p>

          <button
            onClick={onFermer}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#888',
              border: '1px solid #2a2a3e',
              borderRadius: '12px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '12px',
            }}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}

function Carte({ label, valeur, petit }: { label: string; valeur: string | number; petit?: boolean }) {
  return (
    <div style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '14px' }}>
      <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{label}</p>
      <p style={{ color: 'white', fontSize: petit ? '13px' : '22px', fontWeight: 700, margin: '4px 0 0' }}>{valeur}</p>
    </div>
  );
}
