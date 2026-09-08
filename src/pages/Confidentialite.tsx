import { useState } from 'react';

function Confidentialite() {
  const [showPolitique, setShowPolitique] = useState(true);
  const [showConditions, setShowConditions] = useState(false);

  return (
    <div style={styles.container}>
      <button onClick={() => window.location.reload()} style={styles.backButton}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div style={styles.tabs}>
        <button
          onClick={() => { setShowPolitique(true); setShowConditions(false); }}
          style={showPolitique ? styles.tabActive : styles.tab}
        >
          Politique de confidentialité
        </button>
        <button
          onClick={() => { setShowPolitique(false); setShowConditions(true); }}
          style={showConditions ? styles.tabActive : styles.tab}
        >
          Conditions d'utilisation
        </button>
      </div>

      <div style={styles.content}>
        {showPolitique && (
          <>
            <h2 style={styles.title}>Politique de confidentialité</h2>
            <p style={styles.text}><strong>1. Collecte des données</strong><br/>VOKYVO collecte : nom, prénom, email, âge, sexe, numéro de téléphone, pays.</p>
            <p style={styles.text}><strong>2. Utilisation des données</strong><br/>Création de profil, mise en relation, notifications, amélioration des services. Nous ne vendons JAMAIS vos données.</p>
            <p style={styles.text}><strong>3. Cookies</strong><br/>Cookies essentiels uniquement (session, préférences). Aucun cookie publicitaire.</p>
            <p style={styles.text}><strong>4. Stockage</strong><br/>Serveurs sécurisés en Europe et aux États-Unis via Render et Cloudinary. Mots de passe chiffrés.</p>
            <p style={styles.text}><strong>5. Vos droits (RGPD)</strong><br/>Droit d'accès, de rectification, de suppression, de portabilité, d'opposition. Contact : aronvokouma01@gmail.com</p>
            <p style={styles.text}><strong>6. Sécurité</strong><br/>Chiffrement, accès restreint, surveillance continue, sauvegardes régulières.</p>
            <p style={styles.text}><strong>7. Conservation</strong><br/>Données conservées tant que le compte est actif. Suppression sous 30 jours après demande.</p>
            <p style={styles.text}><strong>8. Messagerie</strong><br/>Vos messages et conversations IA sont stockés de manière sécurisée. Suppression possible sur demande.</p>
            <p style={styles.text}><strong>9. Contact</strong><br/>Email : aronvokouma01@gmail.com</p>
            
            <div style={styles.contactButtons}>
              <a href="https://t.me/aladin_dev_bot" target="_blank" style={styles.telegramBtn}>📱 Telegram</a>
              <a href="https://wa.me/22606965441" target="_blank" style={styles.whatsappBtn}>💬 WhatsApp</a>
            </div>
          </>
        )}

        {showConditions && (
          <>
            <h2 style={styles.title}>Conditions d'utilisation</h2>
            <p style={styles.text}><strong>1. Acceptation</strong><br/>En créant un compte VOKYVO, vous acceptez ces conditions.</p>
            <p style={styles.text}><strong>2. Service</strong><br/>VOKYVO fournit : messagerie, visioconférence, assistant IA, actualités.</p>
            <p style={styles.text}><strong>3. Comportement</strong><br/>Harcèlement, discours haineux et contenu illégal sont interdits.</p>
            <p style={styles.text}><strong>4. Bannissement</strong><br/>VOKYVO se réserve le droit de bannir tout utilisateur ne respectant pas ces règles.</p>
            <p style={styles.text}><strong>5. Contact</strong><br/>Telegram : @aladin_dev_bot · WhatsApp : +226 06 96 54 41</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100vh',
    width: '100vw',
    background: '#0a0a0f',
    zIndex: 1000,
    overflowY: 'auto' as const,
    padding: '20px',
  },
  backButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    width: '38px',
    height: '38px',
    marginBottom: '20px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 15px',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '13px',
  },
  tabActive: {
    padding: '10px 15px',
    borderRadius: '10px',
    border: '1px solid #667eea',
    background: 'rgba(102,126,234,0.15)',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold' as const,
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    paddingBottom: '50px',
  },
  title: {
    color: '#667eea',
    fontSize: '20px',
    marginBottom: '20px',
  },
  text: {
    color: '#aaa',
    fontSize: '13px',
    lineHeight: 1.6,
    marginBottom: '15px',
  },
  contactButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  telegramBtn: {
    padding: '10px 15px',
    borderRadius: '10px',
    background: '#0088cc',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
  },
  whatsappBtn: {
    padding: '10px 15px',
    borderRadius: '10px',
    background: '#25D366',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
  },
};

export default Confidentialite;
