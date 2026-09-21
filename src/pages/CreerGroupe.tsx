import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function CreerGroupe({ onFermer, onGroupeCree }: { onFermer: () => void; onGroupeCree: () => void }) {
  const [nomGroupe, setNomGroupe] = useState('');
  const [recherche, setRecherche] = useState('');
  const [resultats, setResultats] = useState<any[]>([]);
  const [membresSelectionnes, setMembresSelectionnes] = useState<any[]>([]);
  const [erreur, setErreur] = useState('');
  const [success, setSuccess] = useState('');

  const getToken = () => localStorage.getItem('access_token') || '';

  const rechercherUsers = async () => {
    if (!recherche.trim()) return;
    setErreur('');
    try {
      const response = await axios.get(`${API_URL}/rechercher-users/?q=${encodeURIComponent(recherche)}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setResultats(response.data.users || []);
    } catch (err) {
      setErreur('Erreur de recherche');
    }
  };

  const ajouterMembre = (user: any) => {
    if (!membresSelectionnes.find((m) => m.id === user.id)) {
      setMembresSelectionnes([...membresSelectionnes, user]);
    }
    setResultats([]);
    setRecherche('');
  };

  const retirerMembre = (userId: number) => {
    setMembresSelectionnes(membresSelectionnes.filter((m) => m.id !== userId));
  };

  const creerGroupe = async () => {
    setErreur('');
    setSuccess('');

    if (!nomGroupe.trim()) {
      setErreur('Nom du groupe requis');
      return;
    }

    if (membresSelectionnes.length === 0) {
      setErreur('Ajoute au moins un membre');
      return;
    }

    try {
      const participantsIds = membresSelectionnes.map((m) => m.id);
      await axios.post(`${API_URL}/groupes/creer/`, {
        nom: nomGroupe,
        participants_ids: participantsIds,
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setSuccess('Groupe créé avec succès !');
      setNomGroupe('');
      setMembresSelectionnes([]);
      setTimeout(() => {
        onGroupeCree();
        onFermer();
      }, 1000);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur création groupe');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onFermer} style={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 style={styles.title}>Nouveau groupe</h2>
        </div>

        {/* Nom du groupe */}
        <label style={styles.label}>Nom du groupe</label>
        <input
          type="text"
          value={nomGroupe}
          onChange={(e) => setNomGroupe(e.target.value)}
          placeholder="Ex: Les amis du quartier"
          style={styles.input}
        />

        {/* Membres sélectionnés */}
        {membresSelectionnes.length > 0 && (
          <div style={styles.membresSelectionnes}>
            <p style={styles.sectionTitle}>Membres ({membresSelectionnes.length})</p>
            <div style={styles.membresGrid}>
              {membresSelectionnes.map((membre) => (
                <div key={membre.id} style={styles.membreChip}>
                  {membre.photo_profil ? (
                    <img src={membre.photo_profil} style={styles.membreChipPhoto} alt="" />
                  ) : (
                    <span style={styles.membreChipAvatar}>
                      {((membre.first_name || membre.prenom || membre.username || '?')[0] || '?').toUpperCase()}
                    </span>
                  )}
                  <span style={styles.membreChipNom}>
                    {membre.first_name || membre.prenom || membre.username}
                  </span>
                  <button onClick={() => retirerMembre(membre.id)} style={styles.membreChipRetirer}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recherche */}
        <label style={styles.label}>Ajouter des membres</label>
        <div style={styles.rechercheArea}>
          <div style={styles.searchRow}>
            <div style={styles.searchWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && rechercherUsers()}
                placeholder="Nom, email ou numéro..."
                style={{ ...styles.input, paddingLeft: '42px', marginBottom: 0 }}
              />
            </div>
            <button onClick={rechercherUsers} style={styles.searchBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {resultats.length > 0 && (
            <div style={styles.resultats}>
              {resultats.map((user) => (
                <div key={user.id} style={styles.resultatItem} onClick={() => ajouterMembre(user)}>
                  {user.photo_profil ? (
                    <img src={user.photo_profil} style={styles.resultatPhoto} alt="" />
                  ) : (
                    <span style={styles.resultatAvatar}>
                      {((user.first_name || user.prenom || user.username || '?')[0] || '?').toUpperCase()}
                    </span>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={styles.resultatNom}>
                      {user.first_name || user.prenom || ''} {user.last_name || user.nom || user.username}
                    </p>
                    <p style={styles.resultatInfo}>@{user.username}</p>
                  </div>
                  <span style={styles.ajouterBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin */}
        <div style={styles.adminInfo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Tu seras <strong style={{ color: '#667eea' }}>administrateur</strong> du groupe</span>
        </div>

        {erreur && <p style={styles.erreur}>{erreur}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button onClick={creerGroupe} style={styles.creerBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Créer le groupe
        </button>
      </div>
    </div>
  );
}

const styles = {
  '@keyframes slideUpFromBottom': {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
  },
  overlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: '#0a0a0f',
    zIndex: 5000,
    display: 'flex',
    flexDirection: 'column' as const,
    animation: 'slideUpFromBottom 0.3s ease-out',
    overflowY: 'auto' as const,
  },
  panel: {
    background: '#0a0a0f',
    padding: '20px',
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  backButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    width: '38px', height: '38px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: { color: 'white', margin: 0, fontSize: '18px', fontWeight: 600 },
  label: {
    display: 'block',
    color: '#667eea',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '8px',
    marginTop: '5px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '15px',
    boxSizing: 'border-box' as const,
  },
  membresSelectionnes: { marginBottom: '20px' },
  sectionTitle: { color: '#667eea', fontSize: '12px', fontWeight: 'bold' as const, marginBottom: '8px', marginTop: 0, textTransform: 'uppercase' as const, letterSpacing: '1px' },
  membresGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  membreChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px 5px 5px',
    background: 'rgba(102,126,234,0.15)',
    borderRadius: '20px',
    border: '1px solid rgba(102,126,234,0.3)',
  },
  membreChipPhoto: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  membreChipAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold' as const,
  },
  membreChipNom: { color: 'white', fontSize: '13px', fontWeight: 500 },
  membreChipRetirer: {
    background: 'rgba(220,53,69,0.8)',
    border: 'none',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flexShrink: 0,
  },
  rechercheArea: { marginBottom: '15px' },
  searchRow: { display: 'flex', gap: '8px', alignItems: 'stretch' },
  searchWrap: { flex: 1, position: 'relative' as const },
  searchBtn: {
    width: '46px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultats: {
    background: '#1a1a2e',
    borderRadius: '12px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    marginTop: '10px',
    border: '1px solid #2a2a3e',
  },
  resultatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderBottom: '1px solid #2a2a3e',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  resultatPhoto: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  resultatAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    flexShrink: 0,
  },
  resultatNom: { color: 'white', margin: 0, fontSize: '14px', fontWeight: 500 },
  resultatInfo: { color: '#888', margin: '2px 0 0 0', fontSize: '12px' },
  ajouterBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(102,126,234,0.2)',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  adminInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(102,126,234,0.08)',
    borderRadius: '12px',
    marginBottom: '15px',
    color: '#aaa',
    fontSize: '13px',
    border: '1px solid rgba(102,126,234,0.15)',
  },
  erreur: { color: '#dc3545', fontSize: '13px', margin: '0 0 10px 0', textAlign: 'center' as const },
  success: { color: '#28a745', fontSize: '13px', margin: '0 0 10px 0', textAlign: 'center' as const },
  creerBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    marginTop: 'auto',
  },
};

export default CreerGroupe;
