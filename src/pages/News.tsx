import { useState, useEffect } from 'react';

// On utilise une API RSS-to-JSON gratuite (pas besoin de backend)
const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

const SECTIONS = [
  { id: 'flash', nom: 'Flash', url: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'burkina', nom: 'Burkina', url: 'https://news.google.com/rss/search?q=Burkina+Faso+Ouagadougou+actualit%C3%A9s&hl=fr&gl=BF&ceid=BF:fr' },
  { id: 'aes', nom: 'AES', url: 'https://news.google.com/rss/search?q=AES+Sahel+Mali+Niger+Burkina&hl=fr&gl=BF&ceid=BF:fr' },
  { id: 'afrique', nom: 'Afrique', url: 'https://news.google.com/rss/search?q=Afrique+actualit%C3%A9s&hl=fr&gl=CI&ceid=CI:fr' },
  { id: 'sport', nom: 'Sport', url: 'https://news.google.com/rss/search?q=sport+football+basketball&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'crypto', nom: 'Crypto', url: 'https://news.google.com/rss/search?q=cryptomonnaie+bitcoin+ethereum&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'ia', nom: 'IA', url: 'https://news.google.com/rss/search?q=intelligence+artificielle+IA+GPT&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'economie', nom: 'Économie', url: 'https://news.google.com/rss/search?q=%C3%A9conomie+inflation+emploi&hl=fr&gl=FR&ceid=FR:fr' },
];

interface Article {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function News() {
  const [articles, setArticles] = useState<Record<string, Article[]>>({});
  const [sectionActive, setSectionActive] = useState('flash');
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);
  const [articleOuvert, setArticleOuvert] = useState<Article | null>(null);

  useEffect(() => {
    chargerToutesLesSections();
  }, []);

  const chargerToutesLesSections = async () => {
    try {
      const resultats: Record<string, Article[]> = {};
      
      for (const section of SECTIONS) {
        try {
          const response = await fetch(`${RSS_PROXY}${encodeURIComponent(section.url)}`);
          const data = await response.json();
          resultats[section.id] = data.items || [];
        } catch (err) {
          resultats[section.id] = [];
        }
      }
      
      setArticles(resultats);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const articlesFiltres = articles[sectionActive]?.filter(a =>
    a.title.toLowerCase().includes(recherche.toLowerCase())
  ) || [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>VOKYVO<span style={{ color: '#aaa' }}>NEWS</span></h1>
        <input
          type="text"
          placeholder="Rechercher..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={styles.searchBar}
        />
      </div>

      <div style={styles.nav}>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setSectionActive(section.id)}
            style={{
              ...styles.navItem,
              color: sectionActive === section.id ? '#667eea' : '#666',
              borderBottomColor: sectionActive === section.id ? '#667eea' : 'transparent',
            }}
          >
            {section.nom.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Chargement des news...</p>
        ) : (
          <>
            <p style={styles.count}>{articlesFiltres.length} articles</p>
            <div style={styles.newsList}>
              {articlesFiltres.map((article, index) => (
                <button
                  key={index}
                  onClick={() => setArticleOuvert(article)}
                  style={styles.newsItem}
                >
                  <span style={styles.newsTitle}>{article.title}</span>
                  <span style={styles.newsDate}>{new Date(article.pubDate).toLocaleDateString('fr-FR')}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {articleOuvert && (
        <div style={styles.overlay} onClick={() => setArticleOuvert(null)}>
          <div style={styles.articlePanel} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.articleTitle}>{articleOuvert.title}</h2>
            <p style={styles.articleText}>
              {articleOuvert.description?.replace(/<[^>]+>/g, '') || 'Pas de description disponible.'}
            </p>
            <a href={articleOuvert.link} target="_blank" style={styles.articleLink}>
              Lire l'article complet
            </a>
            <button onClick={() => setArticleOuvert(null)} style={styles.closeBtn}>
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    background: '#111120',
    borderBottom: '1px solid #1a1a2a',
  },
  logo: { color: '#667eea', fontSize: '20px', fontWeight: 900 as const, margin: 0 },
  searchBar: {
    padding: '8px 15px',
    borderRadius: '20px',
    border: '1px solid #1a1a2a',
    background: '#111120',
    color: '#d0d0d0',
    fontSize: '14px',
    outline: 'none',
    width: '150px',
  },
  nav: {
    display: 'flex',
    gap: '2px',
    overflowX: 'auto' as const,
    padding: '0 10px',
    background: '#111120',
    borderBottom: '1px solid #1a1a2a',
  },
  navItem: {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 700 as const,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    borderBottom: '3px solid transparent',
    background: 'transparent',
  },
  content: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px 15px',
  },
  loading: { color: '#667eea', textAlign: 'center' as const, padding: '40px' },
  count: { color: '#777', fontSize: '13px', marginBottom: '12px' },
  newsList: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  newsItem: {
    background: '#111120',
    border: '1px solid #1a1a2a',
    borderRadius: '10px',
    padding: '15px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  newsTitle: { color: '#d0d0d0', fontSize: '14px', lineHeight: 1.5 },
  newsDate: { color: '#555', fontSize: '11px' },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '20px',
  },
  articlePanel: {
    background: '#0a0a0f',
    border: '1px solid #1a1a2a',
    borderRadius: '15px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    padding: '25px',
  },
  articleTitle: { color: '#667eea', fontSize: '18px', marginBottom: '15px' },
  articleText: { color: '#d0d0d0', fontSize: '14px', lineHeight: 1.7 },
  articleLink: { color: '#667eea', textDecoration: 'none', display: 'block', marginTop: '10px' },
  closeBtn: {
    marginTop: '15px',
    padding: '10px 25px',
    borderRadius: '20px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
};

export default News;
