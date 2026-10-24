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
  const [pageInput, setPageInput] = useState('1');

  const allerPage = (p: number) => {
    if (nbPages && p >= 1 && p <= nbPages) {
      setPage(p);
      setPageInput(String(p));
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.9)', zIndex: 10 }}>
        <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre}</p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Télécharger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
          <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* PDF */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNbPages(numPages);
            setPageInput('1');
          }}
          loading={<p style={{ color: '#888' }}>Chargement...</p>}
          error={<p style={{ color: '#dc3545' }}>Impossible de charger le PDF.</p>}
        >
          <Page
            pageNumber={page}
            width={Math.min(window.innerWidth, 900)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* Flèches latérales */}
      <button
        onClick={() => allerPage(page - 1)}
        disabled={page <= 1}
        style={{
          position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
          width: '36px', height: '36px', borderRadius: '50%',
          background: page <= 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
          border: 'none', color: 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <button
        onClick={() => allerPage(page + 1)}
        disabled={page >= (nbPages || 1)}
        style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          width: '36px', height: '36px', borderRadius: '50%',
          background: page >= (nbPages || 1) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
          border: 'none', color: 'white', cursor: page >= (nbPages || 1) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Compteur de page modifiable (bas) */}
      {nbPages && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 20 }}>
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => allerPage(parseInt(pageInput) || 1)}
            onKeyDown={(e) => { if (e.key === 'Enter') allerPage(parseInt(pageInput) || 1); }}
            style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, textAlign: 'center', outline: 'none' }}
            min="1"
            max={nbPages}
          />
          <span style={{ color: '#888', fontSize: '14px' }}>/ {nbPages}</span>
        </div>
      )}
    </div>
  );
}
