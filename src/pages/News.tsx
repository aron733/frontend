import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'flash', nom: 'Flash', url: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'finance', nom: 'Finance', url: 'https://news.google.com/rss/search?q=finance+crypto+trading+bourse&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'tech', nom: 'Tech', url: 'https://hn.algolia.com/api/v1/search?tags=front_page' },
  { id: 'dev', nom: 'Dev', url: 'https://news.google.com/rss/search?q=d%C3%A9veloppeur+programmation+cybers%C3%A9curit%C3%A9+IA+hacking&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'us', nom: 'US', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
  { id: 'guerre', nom: 'Guerre', url: 'https://news.google.com/rss/search?q=guerre+conflit+ukraine+israel+palestine&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'afrique', nom: 'Afrique', url: 'https://news.google.com/rss/search?q=Afrique+actualit%C3%A9s+%C3%A9conomie+politique&hl=fr&gl=CI&ceid=CI:fr' },
  { id: 'burkina', nom: 'Burkina', url: 'https://news.google.com/rss/search?q=Burkina+Faso+Ouagadougou+actualit%C3%A9s&hl=fr&gl=BF&ceid=BF:fr' },
  { id: 'aes', nom: 'AES', url: 'https://news.google.com/rss/search?q=AES+Sahel+Mali+Niger+Burkina+Conf%C3%A9d%C3%A9ration&hl=fr&gl=BF&ceid=BF:fr' },
  { id: 'education', nom: 'Éducation', url: 'https://news.google.com/rss/search?q=%C3%A9ducation+%C3%A9cole+universit%C3%A9+formation&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'sport', nom: 'Sport', url: 'https://news.google.com/rss/search?q=sport+football+basketball+athl%C3%A9tisme+tennis&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'culture', nom: 'Culture', url: 'https://news.google.com/rss/search?q=culture+musique+cin%C3%A9ma+art+spectacle&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'meteo', nom: 'Météo', url: 'https://news.google.com/rss/search?q=m%C3%A9t%C3%A9o+climat+catastrophe+naturelle&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'religion', nom: 'Religion', url: 'https://news.google.com/rss/search?q=religion+spiritualit%C3%A9+islam+christianisme&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'politique', nom: 'Politique', url: 'https://news.google.com/rss/search?q=politique+gouvernement+%C3%A9lections&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'economie', nom: 'Économie', url: 'https://news.google.com/rss/search?q=%C3%A9conomie+inflation+emploi+ch%C3%B4mage+croissance&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'crypto', nom: 'Crypto', url: 'https://news.google.com/rss/search?q=cryptomonnaie+bitcoin+ethereum+blockchain+nft&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'ia', nom: 'IA', url: 'https://news.google.com/rss/search?q=intelligence+artificielle+IA+machine+learning+GPT&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'sante', nom: 'Santé', url: 'https://news.google.com/rss/search?q=sant%C3%A9+m%C3%A9decine+h%C3%B4pital+maladie+vaccin&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'science', nom: 'Science', url: 'https://news.google.com/rss/search?q=science+recherche+d%C3%A9couverte+espace+NASA&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'automobile', nom: 'Auto', url: 'https://news.google.com/rss/search?q=automobile+voiture+%C3%A9lectrique+tesla+moto&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'jeux', nom: 'Jeux', url: 'https://news.google.com/rss/search?q=jeux+vid%C3%A9o+gaming+playstation+xbox+nintendo&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'cinema', nom: 'Cinéma', url: 'https://news.google.com/rss/search?q=cin%C3%A9ma+film+acteur+actrice+hollywood+netflix&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'musique', nom: 'Musique', url: 'https://news.google.com/rss/search?q=musique+chanson+album+concert+artiste&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'food', nom: 'Food', url: 'https://news.google.com/rss/search?q=cuisine+recette+restaurant+gastronomie+food&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'voyage', nom: 'Voyage', url: 'https://news.google.com/rss/search?q=voyage+tourisme+avion+h%C3%B4tel+destination&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'business', nom: 'Business', url: 'https://news.google.com/rss/search?q=business+startup+entrepreneur+entreprise+investissement&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'immobilier', nom: 'Immo', url: 'https://news.google.com/rss/search?q=immobilier+logement+maison+appartement+construction&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'energie', nom: 'Énergie', url: 'https://news.google.com/rss/search?q=%C3%A9nergie+%C3%A9lectricit%C3%A9+p%C3%A9trole+renouvelable+nucl%C3%A9aire&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'agriculture', nom: 'Agriculture', url: 'https://news.google.com/rss/search?q=agriculture+%C3%A9levage+culture+r%C3%A9colte+fermier&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'telecom', nom: 'Télécom', url: 'https://news.google.com/rss/search?q=t%C3%A9l%C3%A9com+internet+5G+fibre+smartphone&hl=fr&gl=FR&ceid=FR:fr' },
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
          if (section.id === 'tech') {
            // Hacker News a un format différent
            const response = await fetch(section.url);
            const data = await response.json();
            resultats[section.id] = (data.hits || []).map((h: any) => ({
              title: h.title || h.story_title || 'Sans titre',
              link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
              pubDate: h.created_at,
              description: h.story_text || '',
            }));
          } else {
            const rssUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(section.url)}`;
            const response = await fetch(rssUrl);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');
            const items = xml.querySelectorAll('item');
            resultats[section.id] = Array.from(items).slice(0, 20).map((item) => ({
              title: item.querySelector('title')?.textContent || 'Sans titre',
              link: item.querySelector('link')?.textContent || '',
              pubDate: item.querySelector('pubDate')?.textContent || '',
              description: item.querySelector('description')?.textContent || '',
            }));
          }
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

  const cleanDescription = (desc: string) => {
    return desc.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim();
  };

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
                  {article.pubDate && (
                    <span style={styles.newsDate}>
                      {new Date(article.pubDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
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
              {cleanDescription(articleOuvert.description) || 'Pas de description disponible.'}
            </p>
            {articleOuvert.link && (
              <a href={articleOuvert.link} target="_blank" style={styles.articleLink}>
                Lire l'article complet
              </a>
            )}
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
