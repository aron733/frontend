import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
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

  const allerPage = (p: number) => {
    if (nbPages && p >= 1 && p <= nbPages) setPage(p);
  };

  const telecharger = async () => {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.9)', zIndex: 10 }}>
        <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre}</p>
        <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* PDF */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNbPages(numPages)}
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

      {/* Barre d'actions en bas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 24px 20px', background: 'rgba(0,0,0,0.9)', zIndex: 10, paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <button onClick={() => allerPage(page - 1)} disabled={page <= 1} style={{ background: 'transparent', border: 'none', color: page <= 1 ? '#444' : '#667eea', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
          ← Précédent
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Page</span>
          <input
            type="number"
            value={page}
            onChange={(e) => allerPage(parseInt(e.target.value) || 1)}
            style={{ width: '45px', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '6px', color: 'white', fontSize: '14px', fontWeight: 600, textAlign: 'center', padding: '4px', outline: 'none' }}
            min="1"
            max={nbPages || 1}
          />
          <span style={{ color: '#888', fontSize: '14px' }}>/ {nbPages || '?'}</span>
        </div>
        <button onClick={() => allerPage(page + 1)} disabled={page >= (nbPages || 1)} style={{ background: 'transparent', border: 'none', color: page >= (nbPages || 1) ? '#444' : '#667eea', fontWeight: 600, cursor: page >= (nbPages || 1) ? 'not-allowed' : 'pointer' }}>
          Suivant →
        </button>
        <button onClick={telecharger} style={{ background: 'transparent', border: 'none', color: '#667eea', cursor: 'pointer' }} title="Télécharger">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
