import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Props {
  url: string;
  titre: string;
  onFermer: () => void;
}

export default function ViewerPDF({ url, titre, onFermer }: Props) {
  const [nbPages, setNbPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [largeur, setLargeur] = useState(window.innerWidth);

  // Adapter la largeur au redimensionnement
  window.onresize = () => setLargeur(window.innerWidth);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0f', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #2a2a3e' }}>
        <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre}</p>
        <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '15px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* PDF */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '10px' }}>
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNbPages(numPages)}
          loading={<p style={{ color: '#888' }}>Chargement du PDF...</p>}
          error={<p style={{ color: '#dc3545' }}>Impossible de charger le PDF.</p>}
        >
          <Page
            pageNumber={page}
            width={Math.min(largeur - 20, 800)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* Footer (navigation) */}
      {nbPages && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '15px', borderTop: '1px solid #2a2a3e' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ padding: '10px 20px', background: page <= 1 ? '#1a1a2e' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            ← Précédent
          </button>
          <span style={{ color: '#aaa', fontSize: '14px' }}>
            Page {page} / {nbPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(nbPages, p + 1))}
            disabled={page >= nbPages}
            style={{ padding: '10px 20px', background: page >= nbPages ? '#1a1a2e' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: page >= nbPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
