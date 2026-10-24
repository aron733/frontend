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
              }}
            >
              {/* Icône (remplace l'image) */}
              <div style={{ height: '120px', background: 'linear-gradient(135deg, #1a1a2e, #111120)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #2a2a3e', overflow: 'hidden' }}>
                {e.couverture ? (
                  <img src={e.couverture} alt={e.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                )}
              </div>

              <div style={{ padding: '16px' }}>
                <p style={{ color: '#667eea', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px' }}>
                  {e.type === 'sujet' ? 'Sujet' : e.type === 'annale' ? 'Annale' : 'Résumé'}
                  {e.examen ? ` · ${e.examen}` : ''}
                  {e.serie ? ` ${e.serie}` : ''}
                </p>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 600, lineHeight: 1.4, display: 'block', marginBottom: '6px' }}>{e.titre}</span>
                {e.matiere && (
                  <span style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '10px' }}>{e.matiere}</span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#555', fontSize: '12px' }}>{e.annee ? `Année ${e.annee}` : ''}</span>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); e.fichier_pdf && setPdfOuvert({ url: e.fichier_pdf, titre: e.titre }); }}
                    style={{
                      background: '#667eea',
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Ouvrir
                  </button>
                </div>
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
