import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

type Message = any;

interface ChatLightboxProps {
  // Galerie (yet-another-react-lightbox)
  lightboxOpen: boolean;
  lightboxIndex: number;
  onCloseGalerie: () => void;
  messages: Message[];
  // Photo unique (modale custom)
  photoLightbox: string | null;
  onClosePhoto: () => void;
}

export default function ChatLightbox({
  lightboxOpen,
  lightboxIndex,
  onCloseGalerie,
  messages,
  photoLightbox,
  onClosePhoto,
}: ChatLightboxProps) {
  const slides = messages
    .flatMap((m: any) =>
      m.pieces_jointes && m.pieces_jointes.length > 0
        ? m.pieces_jointes
        : m.fichier_url
        ? [{ url: m.fichier_url, type: 'image' }]
        : []
    )
    .filter((p: any) => p.type !== 'video')
    .map((p: any) => ({ src: p.url }));

  return (
    <>
      <Lightbox
        open={lightboxOpen}
        close={onCloseGalerie}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
        styles={{ container: { backgroundColor: '#000' }, button: {} }}
        carousel={{ finite: true }}
        animation={{ fade: 250 }}
      />

      {photoLightbox && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 3000, overflow: 'hidden' }}>
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit={true}
            doubleClick={{ mode: 'toggle' }}
            wheel={{ step: 0.1 }}
          >
            <TransformComponent
              wrapperStyle={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img
                src={photoLightbox}
                style={{ maxWidth: '100vw', maxHeight: '100vh', objectFit: 'contain' as const }}
                alt="photo plein écran"
              />
            </TransformComponent>
          </TransformWrapper>
          <button
            onClick={onClosePhoto}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', zIndex: 3001 }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
