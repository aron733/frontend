import { useEffect } from 'react';
import { openEditorModal } from '@rageshpikalmunde/rp-image-editor';

interface Props {
  imageUrl: string;
  onSauvegarder: (blob: Blob) => void;
  onAnnuler: () => void;
}

export default function EditeurPhoto({ imageUrl, onSauvegarder, onAnnuler }: Props) {
  useEffect(() => {
    let annule = false;

    const ouvrir = async () => {
      try {
        // Convertir l'URL blob en File
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });

        const resultat = await openEditorModal({
          image: file,
          config: {
            language: 'fr',
            exportFormat: 'jpeg',
            exportQuality: 0.92,
            showToolbar: true,
          },
        });

        if (annule) return;

        if (resultat && resultat.file) {
          onSauvegarder(resultat.file);
        } else {
          onAnnuler();
        }
      } catch (e) {
        console.error('Erreur editeur:', e);
        onAnnuler();
      }
    };

    ouvrir();
    return () => { annule = true; };
  }, [imageUrl]);

  return null; // Le modal est géré par la lib
}
