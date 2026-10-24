import { useState, useRef } from 'react';
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
  const touchStartX = useRef<number | null>(null);

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
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0f', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#111120', borderBottom: '1px solid #2a2a3e', zIndex: 10 }}>
        <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre}</p>
        <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* PDF */}
      <div
        style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '10px 0' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) {
            if (diff > 0) allerPage(page + 1);
            else allerPage(page - 1);
          }
          touchStartX.current = null;
        }}
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNbPages(numPages)}
          loading={<p style={{ color: '#888' }}>Chargement...</p>}
          error={<p style={{ color: '#dc3545' }}>Impossible de charger le PDF.</p>}
        >
          <Page
            pageNumber={page}
            width={Math.min(window.innerWidth - 20, 900)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* Barre d'actions en bas (propre) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: '#111120', borderTop: '1px solid #2a2a3e', zIndex: 10 }}>
        <button
          onClick={() => allerPage(page - 1)}
          disabled={page <= 1}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: page <= 1 ? '#1a1a2e' : '#667eea',
            border: 'none', color: 'white',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: page <= 1 ? 0.5 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            value={page}
            onChange={(e) => allerPage(parseInt(e.target.value) || 1)}
            style={{ width: '50px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 600, textAlign: 'center', padding: '6px', outline: 'none' }}
            min="1"
            max={nbPages || 1}
          />
          <span style={{ color: '#666', fontSize: '13px' }}>/ {nbPages || '?'}</span>
        </div>
        <button
          onClick={() => allerPage(page + 1)}
          disabled={page >= (nbPages || 1)}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: page >= (nbPages || 1) ? '#1a1a2e' : '#667eea',
            border: 'none', color: 'white',
            cursor: page >= (nbPages || 1) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: page >= (nbPages || 1) ? 0.5 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button onClick={telecharger} style={{ background: '#667eea', border: 'none', color: 'white', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger
        </button>
      </div>
    </div>
  );
}
