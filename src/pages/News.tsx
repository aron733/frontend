import { useState, useEffect } from 'react';
import axios from 'axios';

const NEWS_URL = 'https://django-43v1.onrender.com';

interface Article {
  titre: string;
  lien: string;
  desc: string;
}

function News() {
  const [sections, setSections] = useState<string[]>([]);
  const [news, setNews] = useState<Record<string, Article[]>>({});
  const [sectionActive, setSectionActive] = useState('');
  const [recherche, setRecherche] = useState('');
  const [articleOuvert, setArticleOuvert] = useState<Article | null>(null);
  const [contenuArticle, setContenuArticle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerNews();
  }, []);

  const chargerNews = async () => {
    try {
      await axios.get(`${NEWS_URL}/news/`);
      // Parse le HTML pour extraire les sections (simplifié)
      // On va appeler une API dédiée à la place
      const apiResponse = await axios.get(`${NEWS_URL}/news/api/sections/`);
      setSections(apiResponse.data.sections);
      setNews(apiResponse.data.news);
      setSectionActive(apiResponse.data.sections[0]);
    } catch (err) {
      console.error('Erreur chargement news');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirArticle = async (article: Article) => {
    setArticleOuvert(article);
    setContenuArticle('Chargement...');
    try {
      const response = await axios.get(`${NEWS_URL}/news/article/`, {
        params: {
          titre: article.titre,
          lien: article.lien,
          desc: article.desc
        }
      });
      setContenuArticle(response.data.contenu);
    } catch (err) {
      setContenuArticle('Impossible de charger cet article.');
    }
  };

  const articlesFiltres = (sectionArticles: Article[]) => {
    if (!recherche) return sectionArticles;
    return sectionArticles.filter(a => 
      a.titre.toLowerCase().includes(recherche.toLowerCase())
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
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

      {/* Navigation sections */}
      <div style={styles.nav}>
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setSectionActive(section)}
            style={{
              ...styles.navItem,
              color: sectionActive === section ? '#667eea' : '#666',
              borderBottomColor: sectionActive === section ? '#667eea' : 'transparent',
            }}
          >
            {section.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Chargement...</p>
        ) : (
          <>
            <p style={styles.count}>{news[sectionActive]?.length || 0} articles</p>
            <div style={styles.newsList}>
              {articlesFiltres(news[sectionActive] || []).map((article, index) => (
                <button
                  key={index}
                  onClick={() => ouvrirArticle(article)}
                  style={styles.newsItem}
                >
                  <span style={styles.newsTitle}>{article.titre}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Overlay article */}
      {articleOuvert && (
        <div style={styles.overlay} onClick={() => setArticleOuvert(null)}>
          <div style={styles.articlePanel} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.articleTitle}>{articleOuvert.titre}</h2>
            <p style={styles.articleText}>{contenuArticle}</p>
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
  logo: { color: '#667eea', fontSize: '20px', fontWeight: 900, margin: 0 },
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
    scrollbarWidth: 'none' as const,
  },
  navItem: {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    borderBottom: '3px solid transparent',
    background: 'transparent',
    textTransform: 'uppercase' as const,
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
    transition: 'border-color 0.3s',
  },
  newsTitle: { color: '#d0d0d0', fontSize: '14px', lineHeight: 1.5 },
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
  closeBtn: {
    marginTop: '15px',
    padding: '10px 25px',
    borderRadius: '20px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default News;
