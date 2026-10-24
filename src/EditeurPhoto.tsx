import { ImageEditorWrapper } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

interface Props {
  imageUrl: string;
  onSauvegarder: (blob: Blob) => void;
  onAnnuler: () => void;
}

export default function EditeurPhoto({ imageUrl, onSauvegarder, onAnnuler }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#ffffff', zIndex: 4000, display: 'flex', flexDirection: 'column' }}>
      <ImageEditorWrapper
        imageUrl={imageUrl}
        onSave={(blob) => onSauvegarder(blob)}
        onCancel={onAnnuler}
      />
    </div>
  );
}
