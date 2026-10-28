import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface Media {
  url: string;
  type: string;
}

interface Props {
  medias: Media[];
}

export default function SocialMedia({ medias }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!medias || medias.length === 0) return null;

  // Si c'est une seule video, on l'affiche directement
  if (medias.length === 1 && medias[0].type === 'video') {
    return (
      <div style={{ marginBottom: '15px', borderRadius: '0', overflow: 'hidden', background: '#000' }}>
        <video src={medias[0].url} controls style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
      </div>
    );
  }

  const images = medias.filter(m => m.type !== 'video');
  const n = images.length;
  const max = 4;

  const handleClick = (url: string) => {
    const idx = images.findIndex(img => img.url === url);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  // Layout selon N (exactement le code du Chat)
  let gridStyle: any = {
    display: 'grid',
    gap: '4px',
    marginBottom: '15px',
    maxWidth: '100%',
    width: '100%',
    borderRadius: '0',
    overflow: 'hidden',
  };

  if (n === 1) {
    gridStyle.gridTemplateColumns = '1fr';
    gridStyle.gridTemplateRows = '400px';
  } else if (n === 2) {
    gridStyle.gridTemplateColumns = '1fr 1fr';
    gridStyle.gridTemplateRows = '400px';
  } else if (n === 3) {
    gridStyle.gridTemplateColumns = '2fr 1fr';
    gridStyle.gridTemplateRows = '198px 198px'; // 198 + 4 (gap) + 198 = 400
  } else {
    gridStyle.gridTemplateColumns = '1fr 1fr';
    gridStyle.gridTemplateRows = '198px 198px';
  }

  return (
    <>
      <div style={gridStyle}>
        {images.slice(0, max).map((p, i) => {
          const cellStyle: any = {
            position: 'relative',
            borderRadius: '0',
            overflow: 'hidden',
            background: '#000',
          };

          // Layout spécial pour N=3 : 1 grande à gauche, 2 empilées à droite
          if (n === 3) {
            if (i === 0) {
              cellStyle.gridRow = 'span 2';
            }
          }

          return (
            <div key={i} style={cellStyle}>
              <img
                src={p.url}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                alt=""
                onClick={() => handleClick(p.url)}
              />
              {i === 3 && n > max && (
                <div
                  onClick={(e) => { e.stopPropagation(); handleClick(p.url); }}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}
                >+{n - max}</div>
              )}
            </div>
          );
        })}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images.map(p => ({ src: p.url }))}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
        styles={{ container: { backgroundColor: '#000' }, button: {} }}
        carousel={{ finite: true }}
        animation={{ fade: 250 }}
      />
    </>
  );
}
