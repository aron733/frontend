interface BadgeSpecial {
  nom: string;
  libelle: string;
  icone_svg: string;
  couleur_1: string;
  couleur_2: string;
}

interface BadgeDynamiqueProps {
  badge: BadgeSpecial | null | undefined;
  size?: number;
}

function BadgeDynamique({ badge, size = 18 }: BadgeDynamiqueProps) {
  if (!badge) return null;

  // Remplacer {C1} et {C2} par les couleurs
  const svg = badge.icone_svg
    .replace(/\{C1\}/g, badge.couleur_1)
    .replace(/\{C2\}/g, badge.couleur_2);

  return (
    <span
      title={badge.libelle}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        marginLeft: '6px',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default BadgeDynamique;
