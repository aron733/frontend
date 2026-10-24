import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import BoutonRetour from '../BoutonRetour';
import Documents from './Documents';

const SECTIONS = [
  { id: 'flash', nom: 'Flash', url: 'https://www.francetvinfo.fr/titres.rss' },
  { id: 'finance', nom: 'Finance', url: 'https://www.lemonde.fr/economie/rss_full.xml' },
  { id: 'dev', nom: 'Dev', url: 'https://www.lemonde.fr/pixels/rss_full.xml' },
  { id: 'us', nom: 'US', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
  { id: 'guerre', nom: 'Guerre', url: 'https://news.google.com/rss/search?q=guerre+conflit+ukraine+israel&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'afrique', nom: 'Afrique', url: 'https://www.francetvinfo.fr/monde/afrique.rss' },
  { id: 'burkina', nom: 'Burkina', url: 'burkina-fusion' },
  { id: 'aes', nom: 'AES', url: 'https://news.google.com/rss/search?q=AES+Sahel+Mali+Niger+Burkina&hl=fr&gl=BF&ceid=BF:fr' },
  { id: 'education', nom: 'Éducation', url: 'https://news.google.com/rss/search?q=%C3%A9ducation+%C3%A9cole+universit%C3%A9&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'sport', nom: 'Sport', url: 'https://news.google.com/rss/search?q=sport+football+basketball&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'culture', nom: 'Culture', url: 'https://news.google.com/rss/search?q=culture+musique+cin%C3%A9ma&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'meteo', nom: 'Météo', url: 'https://news.google.com/rss/search?q=m%C3%A9t%C3%A9o+climat&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'religion', nom: 'Religion', url: 'https://news.google.com/rss/search?q=religion+islam+christianisme&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'politique', nom: 'Politique', url: 'https://news.google.com/rss/search?q=politique+gouvernement+%C3%A9lections&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'economie', nom: 'Économie', url: 'https://news.google.com/rss/search?q=%C3%A9conomie+inflation+emploi&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'crypto', nom: 'Crypto', url: 'https://news.google.com/rss/search?q=crypto+bitcoin+ethereum&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'ia', nom: 'IA', url: 'https://news.google.com/rss/search?q=intelligence+artificielle+GPT&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'sante', nom: 'Santé', url: 'https://news.google.com/rss/search?q=sant%C3%A9+m%C3%A9decine+h%C3%B4pital&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'science', nom: 'Science', url: 'https://news.google.com/rss/search?q=science+espace+NASA&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'automobile', nom: 'Auto', url: 'https://news.google.com/rss/search?q=automobile+voiture+tesla&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'jeux', nom: 'Jeux', url: 'https://news.google.com/rss/search?q=jeux+vid%C3%A9o+gaming&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'cinema', nom: 'Cinéma', url: 'https://news.google.com/rss/search?q=cin%C3%A9ma+film+netflix&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'musique', nom: 'Musique', url: 'https://news.google.com/rss/search?q=musique+chanson+concert&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'food', nom: 'Food', url: 'https://news.google.com/rss/search?q=cuisine+recette+restaurant&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'voyage', nom: 'Voyage', url: 'https://news.google.com/rss/search?q=voyage+tourisme+avion&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'business', nom: 'Business', url: 'https://news.google.com/rss/search?q=business+startup+entreprise&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'immobilier', nom: 'Immo', url: 'https://news.google.com/rss/search?q=immobilier+logement+maison&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'energie', nom: 'Énergie', url: 'https://news.google.com/rss/search?q=%C3%A9nergie+%C3%A9lectricit%C3%A9+p%C3%A9trole&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'agriculture', nom: 'Agriculture', url: 'https://news.google.com/rss/search?q=agriculture+%C3%A9levage+culture&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'telecom', nom: 'Télécom', url: 'https://news.google.com/rss/search?q=t%C3%A9l%C3%A9com+internet+5G&hl=fr&gl=FR&ceid=FR:fr' },
];

function News({ onRetour }: { onRetour?: () => void }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [sectionActive, setSectionActive] = useState(() => localStorage.getItem('vokyvo_news_section') || 'flash');
  const [articlePartage, setArticlePartage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [vueActive, setVueActive] = useState<'actus' | 'annales'>(() => {
    return (localStorage.getItem('vokyvo_news_vue') as 'actus' | 'annales') || 'actus';

  return (localStorage.getItem('vokyvo_news_vue') as 'actus' | 'annales') || 'actus';
  });

  const chargerSection = async (sectionId: string) => {
    setLoading(true);
    setArticles([]);
    
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    try {
      // Utilise le backend Django comme proxy
      const token = localStorage.getItem('access_token') || '';
      const response = await fetch(`https://api.vokyvo.com/api/rss-proxy/?url=${encodeURIComponent(section.url)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        setArticles([]);
        return;
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Erreur chargement', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('vokyvo_news_section', sectionActive);
    chargerSection(sectionActive);
  }, [sectionActive]);

  const articlesFiltres = articles.filter(a => 
    a.title?.toLowerCase().includes(recherche.toLowerCase())
  );

  const shareUrl = articlePartage ? (() => {
    try {
      const url = new URL(articlePartage.link);
      return `https://vokyvo.com/share?url=${encodeURIComponent(url.origin + url.pathname)}`;
    } catch {
      return `https://vokyvo.com/share?url=${encodeURIComponent(articlePartage.link)}`;
    }
  })() : '';

  return (
    <div style={styles.container}>
      {/* Header fixe */}
      <div style={styles.header}>
        <BoutonRetour onClick={() => { if (onRetour) { onRetour(); } else { localStorage.setItem('vokyvo_page', 'profil'); window.location.reload(); } }} />
        <span style={styles.logo}>VOKYVO<span style={{ color: '#667eea' }}>NEWS</span></span>
        <button onClick={() => setShowSearch(!showSearch)} style={styles.searchIconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Sous-onglets Actus / Documents (style segmenté propre) */}
      <div style={{ 
        display: 'flex', 
        background: '#111120', 
        margin: '0 15px 15px', 
        borderRadius: '12px', 
        padding: '4px',
        border: '1px solid #2a2a3e'
      }}>
        <button
          onClick={() => { setVueActive('actus'); localStorage.setItem('vokyvo_news_vue', 'actus'); }}
          style={{
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            padding: '8px', 
            borderRadius: '8px', 
            border: 'none',
            background: vueActive === 'actus' ? '#667eea' : 'transparent',
            color: vueActive === 'actus' ? 'white' : '#666',
            fontSize: '13px', 
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M18 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
            <line x1="6" y1="8" x2="12" y2="8" />
            <line x1="6" y1="12" x2="12" y2="12" />
            <line x1="6" y1="16" x2="10" y2="16" />
          </svg>
          Actualités
        </button>
        <button
          onClick={() => { setVueActive('annales'); localStorage.setItem('vokyvo_news_vue', 'annales'); }}
          style={{
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            padding: '8px', 
            borderRadius: '8px', 
            border: 'none',
            background: vueActive === 'annales' ? '#667eea' : 'transparent',
            color: vueActive === 'annales' ? 'white' : '#666',
            fontSize: '13px', 
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Documents
        </button>
      </div>

      {vueActive === 'annales' ? (
        <Documents />
      ) : (
      <>
      {/* Barre de recherche (si ouverte) */}
      {showSearch && (
        <div style={{ padding: '10px 15px', background: '#0a0a0f' }}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#1a1a2e', color: 'white', fontSize: '14px', outline: 'none' }}
            autoFocus
          />
        </div>
      )}

      {/* Onglets horizontaux scrollables */}
      <div style={styles.tabsContainer}>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setSectionActive(section.id)}
            style={{
              ...styles.tab,
              background: sectionActive === section.id ? '#667eea' : 'transparent',
              color: sectionActive === section.id ? 'white' : '#888',
            }}
          >
            {section.nom}
          </button>
        ))}
      </div>



      {/* Articles */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Chargement...</p>
          </div>
        ) : articlesFiltres.length === 0 ? (
          <p style={styles.empty}>Aucun article. Essaie une autre catégorie.</p>
        ) : (
          <div style={styles.list}>
            {articlesFiltres.map((article, index) => (
              <a
                key={index}
                href={article.link}
                target="_blank"
                onClick={async (e) => {
                  e.preventDefault();
                  if (Capacitor.isNativePlatform()) {
                    const { Browser } = await import('@capacitor/browser');
                    await Browser.open({ url: article.link });
                  } else {
                    window.open(article.link, '_blank');
                  }
                }}
                style={styles.card}
              >
                {article.image && (
                  <img src={article.image} style={styles.cardImage} alt="" loading="lazy" />
                )}
                <div style={styles.cardContent}>
                  <span style={styles.cardTitle}>{article.title}</span>
                  <div style={styles.cardFooter}>
                    {article.pubDate && (
                      <span style={styles.cardDate}>
                        {new Date(article.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setArticlePartage(article);
                      }}
                      style={styles.shareBtn}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Menu de partage */}
      {articlePartage && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setArticlePartage(null)}
        >
          <div
            style={{ background: '#1a1a2e', width: '100%', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ color: 'white', fontWeight: 600, marginBottom: '15px', textAlign: 'center' }}>Partager</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>
                <span style={{ color: '#aaa', fontSize: '12px' }}>WhatsApp</span>
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0088cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></div>
                <span style={{ color: '#aaa', fontSize: '12px' }}>Telegram</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>
                <span style={{ color: '#aaa', fontSize: '12px' }}>X</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span style={{ color: '#aaa', fontSize: '12px' }}>Facebook</span>
              </a>
              <a href="https://vokyvo.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/vokyvo-logo.png" style={{ width: '30px', height: '30px', objectFit: 'contain' }} alt="VOKYVO" /></div>
                <span style={{ color: '#aaa', fontSize: '12px' }}>VOKYVO</span>
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(articlePartage.link); setArticlePartage(null); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </div>
                <span style={{ color: '#aaa', fontSize: '12px' }}>Copier</span>
              </button>
            </div>
            <button onClick={() => setArticlePartage(null)} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600 }}>Annuler</button>
          </div>
        </div>
      )}
      </>
      )}
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
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 1000,
  },
  backButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '38px',
    height: '38px',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    background: '#111120',
    borderBottom: '1px solid #1a1a2a',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  logo: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 900 as const,
    whiteSpace: 'nowrap' as const,
  },
  search: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '13px',
    outline: 'none',
    maxWidth: '200px',
    marginLeft: 'auto',
  },
  nav: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto' as const,
    padding: '10px 15px',
    background: '#111120',
    borderBottom: '1px solid #1a1a2a',
    scrollbarWidth: 'none' as const,
    flexShrink: 0,
  },
  sectionActive: {
    color: 'white',
    fontSize: '15px',
    fontWeight: 700 as const,
    letterSpacing: '1px',
  },
  hamburgerBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    width: '35px',
    height: '35px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  categoriesMenu: {
    position: 'absolute' as const,
    top: '105px',
    left: '15px',
    right: '15px',
    background: '#111120',
    border: '1px solid #2a2a3e',
    borderRadius: '15px',
    padding: '10px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '5px',
    zIndex: 100,
    maxHeight: '60vh',
    overflowY: 'auto' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  categorieBtn: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600 as const,
    whiteSpace: 'nowrap' as const,
    textAlign: 'center' as const,
  },
  navBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #2a2a3e',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600 as const,
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto' as const,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    gap: '15px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #1a1a2e',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#667eea',
    fontSize: '14px',
  },
  empty: {
    color: '#666',
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '14px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  item: {
    background: '#111120',
    border: '1px solid #1a1a2a',
    borderRadius: '12px',
    padding: '15px',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    transition: 'border-color 0.2s',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto' as const,
    padding: '10px 15px',
    borderBottom: '1px solid #2a2a3e',
    scrollbarWidth: 'none' as const,
  },
  tab: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid #2a2a3e',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  searchIconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#15152a',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '12px',
    textDecoration: 'none',
    border: '1px solid #2a2a3e',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover' as const,
    display: 'block',
  },
  cardContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  cardTitle: {
    color: 'white',
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    color: '#888',
    fontSize: '12px',
  },
  shareBtn: {
    background: 'rgba(102,126,234,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  itemTitle: {
    color: '#e0e0e0',
    fontSize: '14px',
    lineHeight: 1.5,
    fontWeight: 500 as const,
  },
  itemDate: {
    color: '#555',
    fontSize: '11px',
  },
};

export default News;
