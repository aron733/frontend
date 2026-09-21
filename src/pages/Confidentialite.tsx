import { useState } from 'react';

interface ConfidentialiteProps {
  onRetour?: () => void;
}

function Confidentialite({ onRetour }: ConfidentialiteProps) {
  const [onglet, setOnglet] = useState<'politique' | 'conditions'>('politique');

  const fermer = () => {
    if (onRetour) onRetour();
    else {
      localStorage.setItem('vokyvo_page', 'profil');
      window.location.reload();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={fermer} style={styles.backButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 style={styles.title}>Confidentialité</h2>
      </div>

      <div style={styles.body}>
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
            <h2 style={styles.sectionTitle}>Politique de confidentialité</h2>
            <div style={styles.content}>
              <h3 style={styles.h3}>1. Collecte des données</h3>
              <p style={styles.p}>VOKYVO collecte les données suivantes lors de l'inscription : nom, prénom, email, âge, sexe, numéro de téléphone, pays. Ces informations sont nécessaires pour créer votre compte et fournir nos services.</p>
              <h3 style={styles.h3}>2. Utilisation des données</h3>
              <p style={styles.p}>Vos données sont utilisées pour : la création de votre profil, la mise en relation avec d'autres utilisateurs, l'envoi de notifications, l'amélioration de nos services. Nous ne vendons JAMAIS vos données personnelles à des tiers.</p>
              <h3 style={styles.h3}>3. Cookies</h3>
              <p style={styles.p}>Nous utilisons des cookies essentiels au fonctionnement du service : cookies de session pour vous garder connecté, cookies de préférences pour vos paramètres. Aucun cookie publicitaire n'est utilisé.</p>
              <h3 style={styles.h3}>4. Stockage des données</h3>
              <p style={styles.p}>Vos données sont stockées de manière sécurisée sur des serveurs en Europe et aux États-Unis via nos partenaires certifiés (Render, Cloudinary). Les mots de passe sont chiffrés avec des algorithmes robustes.</p>
              <h3 style={styles.h3}>5. Vos droits (RGPD)</h3>
              <p style={styles.p}>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité, d'opposition. Pour exercer ces droits, contactez-nous à support@vokyvo.com.</p>
              <h3 style={styles.h3}>6. Sécurité</h3>
              <p style={styles.p}>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des données, accès restreint, surveillance continue, sauvegardes régulières.</p>
              <h3 style={styles.h3}>7. Conservation</h3>
              <p style={styles.p}>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment. Les données sont supprimées sous 30 jours après la demande.</p>
              <h3 style={styles.h3}>8. Messagerie et conversations</h3>
              <p style={styles.p}>Vos messages, conversations et échanges avec l'assistant IA sont stockés de manière sécurisée pour vous permettre d'y accéder à tout moment. Vous pouvez demander la suppression de vos conversations à tout moment.</p>
              <h3 style={styles.h3}>9. Contact</h3>
              <p style={styles.p}>Email : support@vokyvo.com</p>
              <div style={styles.contactButtons}>
                <a href="https://t.me/vokyvo_bot" target="_blank" style={styles.telegramBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                  Telegram
                </a>
                <a href="https://wa.me/22606965441" target="_blank" style={styles.whatsappBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.95-6.17c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.45-.61-.46-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.63 1.11 2.81.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={styles.sectionTitle}>Conditions d'utilisation</h2>
            <div style={styles.content}>
              <h3 style={styles.h3}>1. Acceptation</h3>
              <p style={styles.p}>En créant un compte VOKYVO, vous acceptez ces conditions d'utilisation.</p>
              <h3 style={styles.h3}>2. Service</h3>
              <p style={styles.p}>VOKYVO fournit une messagerie, visioconférence, assistant IA et actualités.</p>
              <h3 style={styles.h3}>3. Comportement</h3>
              <p style={styles.p}>Le harcèlement, les discours haineux et tout contenu illégal sont interdits.</p>
              <h3 style={styles.h3}>4. Bannissement</h3>
              <p style={styles.p}>VOKYVO se réserve le droit de bannir tout utilisateur ne respectant pas ces règles.</p>
              <h3 style={styles.h3}>5. Contact</h3>
              <p style={styles.p}>Telegram : @vokyvo_bot · WhatsApp : +226 06 96 54 41</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' as const, background: '#0a0a0f', zIndex: 1000 },
  header: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: 'rgba(17,17,32,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  backButton: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px' },
  title: { color: 'white', margin: 0, fontSize: '17px', fontWeight: 600 },
  body: { flex: 1, overflowY: 'auto' as const, padding: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #2a2a3e', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' },
  tabActive: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #667eea', background: 'rgba(102,126,234,0.15)', color: '#667eea', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' as const, transition: 'all 0.2s' },
  sectionTitle: { color: 'white', fontSize: '20px', marginBottom: '20px', textAlign: 'center' as const },
  content: { color: '#ccc', fontSize: '14px', lineHeight: 1.7 },
  h3: { color: '#667eea', fontSize: '15px', fontWeight: 600, marginTop: '20px', marginBottom: '8px' },
  p: { margin: '0 0 10px 0', fontSize: '14px', lineHeight: 1.7 },
  contactButtons: { display: 'flex', gap: '10px', marginTop: '20px' },
  telegramBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', background: '#0088cc', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 },
  whatsappBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', background: '#25D366', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 },
};

export default Confidentialite;
