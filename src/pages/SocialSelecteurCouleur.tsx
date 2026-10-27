const COULEURS = [
  { id: 'violet', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'bleu', css: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'vert', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'orange', css: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { id: 'rose', css: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
  { id: 'sombre', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
];

interface Props {
  selection: string;
  onSelect: (css: string) => void;
}

export default function SocialSelecteurCouleur({ selection, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {COULEURS.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.css)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: c.css,
            border: selection === c.css ? '3px solid #fff' : '2px solid transparent',
            cursor: 'pointer',
            boxShadow: selection === c.css ? '0 0 0 2px #667eea' : 'none',
            transition: 'all 0.2s'
          }}
        />
      ))}
    </div>
  );
}
