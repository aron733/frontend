import { useState } from 'react';

function Confidentialite() {
  const [onglet, setOnglet] = useState<'politique' | 'conditions'>('politique');

  return (
    <div style={styles.overlay}>
      <div style={styles.politiquePanel}>
        <div style={styles.tabs}>
          <button
            onClick={() => setOnglet('politique')}
            style={onglet === 'politique' ? styles.tabActive : styles.tab}
          >
            Confidentialité
          </button>
          <button
            onClick={() => setOnglet('conditions')}
            style={onglet === 'conditions' ? styles.tabActive : styles.tab}
          >
            Conditions
          </button>
        </div>

        {onglet === 'politique' ? (
          <>
            <h2 style={styles.politiqueTitle}>Politique de confidentialité</h2>
            <div style={styles.politiqueContent}>
              <h3>1. Collecte des données</h3>
              <p>VOKYVO collecte les données suivantes lors de l'inscription : nom, prénom, email, âge, sexe, numéro de téléphone, pays. Ces informations sont nécessaires pour créer votre compte et fournir nos services.</p>
              <h3>2. Utilisation des données</h3>
              <p>Vos données sont utilisées pour : la création de votre profil, la mise en relation avec d'autres utilisateurs, l'envoi de notifications, l'amélioration de nos services. Nous ne vendons JAMAIS vos données personnelles à des tiers.</p>
              <h3>3. Cookies</h3>
              <p>Nous utilisons des cookies essentiels au fonctionnement du service : cookies de session pour vous garder connecté, cookies de préférences pour vos paramètres. Aucun cookie publicitaire n'est utilisé.</p>
              <h3>4. Stockage des données</h3>
              <p>Vos données sont stockées de manière sécurisée sur des serveurs en Europe et aux États-Unis via nos partenaires certifiés (Render, Cloudinary). Les mots de passe sont chiffrés avec des algorithmes robustes.</p>
              <h3>5. Vos droits (RGPD)</h3>
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité, d'opposition. Pour exercer ces droits, contactez-nous à aronvokouma01@gmail.com.</p>
              <h3>6. Sécurité</h3>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données, accès restreint, surveillance continue, sauvegardes régulières.</p>
              <h3>7. Conservation</h3>
              <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment. Les données sont supprimées sous 30 jours après la demande.</p>
              <h3>8. Messagerie et conversations</h3>
              <p>Vos messages, conversations et échanges avec l'assistant IA sont stockés de manière sécurisée pour vous permettre d'y accéder à tout moment. Vous pouvez demander la suppression de vos conversations à tout moment.</p>
              <h3>9. Contact</h3>
              <p>Email : aronvokouma01@gmail.com</p>
              <div style={styles.contactButtons}>
                <a href="https://t.me/aladin_dev_bot" target="_blank" style={styles.telegramBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
                <a href="https://wa.me/22606965441" target="_blank" style={styles.whatsappBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={styles.politiqueTitle}>Conditions d'utilisation</h2>
            <div style={styles.politiqueContent}>
              <h3>1. Acceptation</h3>
              <p>En créant un compte VOKYVO, vous acceptez ces conditions d'utilisation.</p>
              <h3>2. Service</h3>
              <p>VOKYVO fournit une messagerie, visioconférence, assistant IA et actualités.</p>
              <h3>3. Comportement</h3>
              <p>Le harcèlement, les discours haineux et tout contenu illégal sont interdits.</p>
              <h3>4. Bannissement</h3>
              <p>VOKYVO se réserve le droit de bannir tout utilisateur ne respectant pas ces règles.</p>
              <h3>5. Contact</h3>
              <p>Telegram : @aladin_dev_bot · WhatsApp : +226 06 96 54 41</p>
            </div>
          </>
        )}

        <button onClick={() => window.location.reload()} style={styles.fermerBtn}>Fermer</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 3000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
  },
  politiquePanel: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '15px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    padding: '15px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '13px',
  },
  tabActive: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #667eea',
    background: 'rgba(102,126,234,0.15)',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold' as const,
  },
  politiqueTitle: {
    color: '#667eea',
    fontSize: '18px',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  politiqueContent: {
    color: '#aaa',
    fontSize: '12px',
    lineHeight: 1.6,
  },
  contactButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  telegramBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    borderRadius: '10px',
    background: '#0088cc',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
  },
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    borderRadius: '10px',
    background: '#25D366',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
  },
  fermerBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '15px',
  },
};

export default Confidentialite;
