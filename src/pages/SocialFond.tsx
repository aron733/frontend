interface Props {
  texte: string;
  couleur: string;
}

export default function SocialFond({ texte, couleur }: Props) {
  return (
    <div style={{ 
      background: couleur, 
      borderRadius: '12px', 
      padding: '40px 20px', 
      minHeight: '200px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginBottom: '15px'
    }}>
      <p style={{ 
        color: '#fff', 
        fontSize: '24px', 
        fontWeight: 700, 
        textAlign: 'center', 
        lineHeight: 1.4,
        margin: 0,
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {texte}
      </p>
    </div>
  );
}
