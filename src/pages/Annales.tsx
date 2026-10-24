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

export default function Annales() {
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
        toast.error('Erreur chargement annales');
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
          placeholder="Rechercher (ex: SVT 2020, Maths, BAC D...)"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #2a2a3e',
            background: '#111120',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
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
                borderRadius: '12px',
                padding: '16px',
                cursor: e.fichier_pdf ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
              }}
            >
              <p style={{ color: '#667eea', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px' }}>
                {e.type === 'sujet' ? 'Sujet' : e.type === 'annale' ? 'Annale' : 'Résumé'}
                {e.examen ? ` · ${e.examen}` : ''}
                {e.serie ? ` ${e.serie}` : ''}
                {e.annee ? ` · ${e.annee}` : ''}
              </p>
              <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 8px' }}>{e.titre}</p>
              {e.matiere && (
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 12px' }}>{e.matiere}</p>
              )}
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {e.fichier_pdf && (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); setPdfOuvert({ url: e.fichier_pdf!, titre: e.titre }); }}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '8px',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    {e.type === 'sujet' ? 'Sujet' : e.type === 'annale' ? 'Annale' : 'Résumé'}
                  </button>
                )}
                {e.corrige_pdf && (
                  <a
                    href={e.corrige_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px',
                      background: '#28a745',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Corrigé
                  </a>
                )}
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
