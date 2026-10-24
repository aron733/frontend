import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import ViewerPDF from '../ViewerPDF';

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
  const [recherche, setRecherche] = useState('');

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

      {/* Liste */}
      {filtrees.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
          Aucun contenu disponible pour l'instant.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtrees.map((e) => (
            <div
              key={e.id}
              onClick={() => e.fichier_pdf && setPdfOuvert({ url: e.fichier_pdf, titre: e.titre })}
              style={{
                background: '#111120',
                border: '1px solid #2a2a3e',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: e.fichier_pdf ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              {/* Image de couverture (à gauche) */}
              <div style={{ width: '100px', minHeight: '140px', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: '1px solid #2a2a3e' }}>
                {e.couverture ? (
                  <img src={e.couverture} alt={e.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                )}
              </div>

              {/* Infos (à droite) */}
              <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                  onClick={(ev) => { ev.stopPropagation(); e.fichier_pdf && setPdfOuvert({ url: e.fichier_pdf, titre: e.titre }); }}
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
        <ViewerPDF url={pdfOuvert.url} titre={pdfOuvert.titre} onFermer={() => setPdfOuvert(null)} />
      )}
    </div>
  );
}
