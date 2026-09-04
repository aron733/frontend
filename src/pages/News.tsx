import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'flash', nom: 'Flash', url: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'finance', nom: 'Finance', url: 'https://news.google.com/rss/search?q=finance+crypto+trading+bourse&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'dev', nom: 'Dev', url: 'https://news.google.com/rss/search?q=d%C3%A9veloppeur+programmation+IA+hacking&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'us', nom: 'US', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
  { id: 'guerre', nom: 'Guerre', url: 'https://news.google.com/rss/search?q=guerre+conflit+ukraine+israel&hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'afrique', nom: 'Afrique', url: 'https://news.google.com/rss/search?q=Afrique+actualit%C3%A9s&hl=fr&gl=CI&ceid=CI:fr' },
  { id: 'burkina', nom: 'Burkina', url: 'https://news.google.com/rss/search?q=Burkina+Faso+Ouagadougou&hl=fr&gl=BF&ceid=BF:fr' },
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

function News() {
  const [articles, setArticles] = useState<any[]>([]);
  const [sectionActive, setSectionActive] = useState('flash');
  const [loading, setLoading] = useState(false);
  const [recherche, setRecherche] = useState('');

  const chargerSection = async (sectionId: string) => {
    setLoading(true);
    setArticles([]);
    
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    try {
      // Utilise le backend Django comme proxy
      const response = await fetch(`https://django-43v1.onrender.com/api/rss-proxy/?url=${encodeURIComponent(section.url)}`);
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
    chargerSection(sectionActive);
  }, [sectionActive]);

  const articlesFiltres = articles.filter(a => 
    a.title?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header fixe */}
      <div style={styles.header}>
        <span style={styles.logo}>VOKYVO<span style={{ color: '#667eea' }}>NEWS</span></span>
        <input
          type="text"
          placeholder="Rechercher"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={styles.search}
        />
      </div>

      {/* Catégories scrollables */}
      <div style={styles.nav}>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setSectionActive(section.id)}
            style={{
              ...styles.navBtn,
              background: sectionActive === section.id ? '#667eea' : 'transparent',
              color: sectionActive === section.id ? 'white' : '#999',
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
                style={styles.item}
              >
                <span style={styles.itemTitle}>{article.title}</span>
                {article.pubDate && (
                  <span style={styles.itemDate}>
                    {new Date(article.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column' as const,
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
