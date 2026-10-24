import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import ViewerPDF from '../ViewerPDF';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface Epreuve {
  id: number;
  titre: string;
  type: string;
  examen: string | null;
  matiere: string | null;
  serie: string | null;
  annee: number | null;
  description: string | null;
  fichier_pdf: string | null;
  corrige_pdf: string | null;
  contenu_texte: string | null;
  page_debut: number;
  couverture: string | null;
}

export default function Documents() {
  const [epreuves, setEpreuves] = useState<Epreuve[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtreType, setFiltreType] = useState<'tous' | 'sujet' | 'annale' | 'resume'>('tous');
  const [pdfOuvert, setPdfOuvert] = useState<{ url: string; titre: string } | null>(null);
  const [chargementCarte, setChargementCarte] = useState<number | null>(null);
  const [imageLightbox, setImageLightbox] = useState<string | null>(null);

  const [recherche, setRecherche] = useState('');
  const [filtreExamen, setFiltreExamen] = useState<string>('');
  const [filtreAnnee, setFiltreAnnee] = useState<string>('');

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await axios.get(`${API_URL}/epreuves/`);
        setEpreuves(res.data.epreuves || []);
      } catch {
        toast.error('Erreur chargement documents');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const filtrees = epreuves.filter((e) => {
    if (filtreType !== 'tous' && e.type !== filtreType) return false;
    if (filtreExamen && e.examen !== filtreExamen) return false;
    if (filtreAnnee && e.annee !== parseInt(filtreAnnee)) return false;
    if (recherche.trim() !== '') {
      const q = recherche.toLowerCase();
      const texte = `${e.titre} ${e.matiere || ''} ${e.examen || ''} ${e.serie || ''} ${e.annee || ''}`.toLowerCase();
      return texte.includes(q);
    }
    return true;
  });

  if (chargement) {
    return <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Chargement...</p>;
  }

  return (
    <div style={{ padding: '0 16px 40px' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Barre de recherche */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une annale..."
          style={{
            width: '100%',
            padding: '12px 15px',
            borderRadius: '10px',
            border: '1px solid #2a2a3e',
            background: '#1a1a2e',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
        {[
          { id: 'tous', label: 'Tout' },
          { id: 'sujet', label: 'Sujets' },
          { id: 'annale', label: 'Annales' },
          { id: 'resume', label: 'Résumés' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltreType(f.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: filtreType === f.id ? '#667eea' : '#1a1a2e',
              color: filtreType === f.id ? 'white' : '#888',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtres avancés (examen + année) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <select
          value={filtreExamen}
          onChange={(e) => setFiltreExamen(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', background: '#1a1a2e', color: 'white', border: '1px solid #2a2a3e', fontSize: '13px' }}
        >
          <option value="">Tous examens</option>
          <option value="BAC">BAC</option>
          <option value="BEPC">BEPC</option>
        </select>
        <select
          value={filtreAnnee}
          onChange={(e) => setFiltreAnnee(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', background: '#1a1a2e', color: 'white', border: '1px solid #2a2a3e', fontSize: '13px' }}
        >
          <option value="">Toutes années</option>
          {[...new Set(epreuves.map(e => e.annee).filter((a): a is number => a !== null))].sort((a, b) => b - a).map(annee => (
            <option key={annee} value={annee}>{annee}</option>
          ))}
        </select>
      </div>

      {/* Liste (scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
      {filtrees.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
          Aucun contenu disponible pour l'instant.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtrees.map((e) => (
            <div
              key={e.id}
              onClick={() => {
                if (e.fichier_pdf) {
                  setChargementCarte(e.id);
                  setTimeout(() => {
                    setPdfOuvert({ url: e.fichier_pdf!, titre: e.titre });
                  }, 50);
                }
              }}
              style={{
                background: '#111120',
                border: '1px solid #2a2a3e',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: e.fichier_pdf ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'stretch',
                position: 'relative',
              }}
            >
              {chargementCarte === e.id && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '14px' }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid rgba(102,126,234,0.3)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>Chargement...</p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}

              {/* Image de couverture (à gauche) */}
              <div
                onClick={(ev) => { ev.stopPropagation(); if (e.couverture) setImageLightbox(e.couverture); }}
                style={{ width: '120px', minHeight: '160px', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: '1px solid #2a2a3e', cursor: e.couverture ? 'zoom-in' : 'default' }}
              >
                {e.couverture ? (
                  <img src={e.couverture} alt={e.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <img src="https://api.vokyvo.com/media/couvertures/icon_512_alpha.png" alt="VOKYVO" style={{ width: '60%', height: '60%', objectFit: 'contain', opacity: 0.5 }} />
                )}
              </div>

              {/* Infos (à droite) */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#667eea', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>
                    {e.type === 'sujet' ? 'Sujet' : e.type === 'annale' ? 'Annale' : 'Résumé'}
                    {e.examen ? ` · ${e.examen}` : ''}
                    {e.serie ? ` ${e.serie}` : ''}
                  </p>
                  <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: '0 0 4px', lineHeight: 1.3 }}>{e.titre}</p>
                  {e.matiere && (
                    <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>{e.matiere}</p>
                  )}
                  {e.annee && (
                    <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>Année {e.annee}</p>
                  )}
                </div>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (e.fichier_pdf) {
                      setChargementCarte(e.id);
                      setTimeout(() => {
                        setPdfOuvert({ url: e.fichier_pdf!, titre: e.titre });
                      }, 50);
                    }
                  }}
                  style={{
                    alignSelf: 'flex-start',
                    background: '#667eea',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  Ouvrir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pdfOuvert && (
        <ViewerPDF url={pdfOuvert.url} titre={pdfOuvert.titre} onFermer={() => { setPdfOuvert(null); setChargementCarte(null); }} />
      )}

      {imageLightbox && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setImageLightbox(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <TransformWrapper>
            <TransformComponent>
              <img src={imageLightbox} alt="Couverture" style={{ maxWidth: '100vw', maxHeight: '100vh' }} />
            </TransformComponent>
          </TransformWrapper>
        </div>
      )}
      </div>
    </div>
  );
}
