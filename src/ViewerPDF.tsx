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

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
        <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre}</p>
        <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '15px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* PDF */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 40px', position: 'relative' }}>
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNbPages(numPages)}
          loading={<p style={{ color: '#888' }}>Chargement...</p>}
          error={<p style={{ color: '#dc3545' }}>Impossible de charger le PDF.</p>}
        >
          <Page
            pageNumber={page}
            width={Math.min(window.innerWidth - 80, 800)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* Flèches latérales (overlay) */}
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page <= 1}
        style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          width: '40px', height: '40px', borderRadius: '50%',
          background: page <= 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
          border: 'none', color: 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <button
        onClick={() => setPage(p => Math.min(nbPages || 1, p + 1))}
        disabled={page >= (nbPages || 1)}
        style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          width: '40px', height: '40px', borderRadius: '50%',
          background: page >= (nbPages || 1) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
          border: 'none', color: 'white', cursor: page >= (nbPages || 1) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Compteur de page (bas) */}
      {nbPages && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '6px 16px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: 600, zIndex: 20 }}>
          {page} / {nbPages}
        </div>
      )}
    </div>
  );
}
