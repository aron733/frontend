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
      const response = await axios.post(`${API_URL}/groupes/creer/`, {
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
        <div style={styles.header}>
          <button onClick={onFermer} style={styles.backButton}>←</button>
          <h2 style={styles.title}>Créer un groupe</h2>
        </div>

        <input
          type="text"
          value={nomGroupe}
          onChange={(e) => setNomGroupe(e.target.value)}
          placeholder="Nom du groupe"
          style={styles.input}
        />

        {/* Membres sélectionnés */}
        {membresSelectionnes.length > 0 && (
          <div style={styles.membresSelectionnes}>
            <p style={styles.sectionTitle}>Membres ({membresSelectionnes.length})</p>
            {membresSelectionnes.map((membre) => (
              <div key={membre.id} style={styles.membreItem}>
                <span style={styles.membreNom}>
                  {membre.first_name || membre.prenom || ''} {membre.last_name || membre.nom || membre.username}
                </span>
                <button onClick={() => retirerMembre(membre.id)} style={styles.retirerBtn}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Recherche de users */}
        <div style={styles.rechercheArea}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && rechercherUsers()}
              placeholder="Rechercher un utilisateur..."
              style={styles.input}
            />
            <button onClick={rechercherUsers} style={styles.searchBtn}>🔍</button>
          </div>

          {resultats.length > 0 && (
            <div style={styles.resultats}>
              {resultats.map((user) => (
                <div key={user.id} style={styles.resultatItem} onClick={() => ajouterMembre(user)}>
                  <span>{user.first_name || user.prenom || ''} {user.last_name || user.nom || user.username}</span>
                  <span style={styles.ajouterHint}>+ Ajouter</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Créateur = Admin */}
        <div style={styles.adminInfo}>
          <span style={styles.adminBadge}>ADMIN</span>
          <span>Vous serez l'administrateur du groupe</span>
        </div>

        {erreur && <p style={styles.erreur}>{erreur}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button onClick={creerGroupe} style={styles.creerBtn}>
          Créer le groupe
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 5000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
  },
  panel: {
    background: '#111120',
    borderRadius: '20px',
    padding: '20px',
    maxWidth: '450px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    border: '1px solid #2a2a3e',
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
    fontSize: '18px',
  },
  title: { color: 'white', margin: 0, fontSize: '18px' },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1px solid #2a2a3e',
    background: '#1a1a2e',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '10px',
    boxSizing: 'border-box' as const,
  },
  membresSelectionnes: { marginBottom: '15px' },
  sectionTitle: { color: '#667eea', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' },
  membreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(102,126,234,0.1)',
    borderRadius: '8px',
    marginBottom: '5px',
  },
  membreNom: { color: 'white', fontSize: '13px' },
  retirerBtn: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' },
  rechercheArea: { marginBottom: '15px' },
  searchBtn: {
    padding: '0 15px',
    borderRadius: '12px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    cursor: 'pointer',
  },
  resultats: {
    background: '#1a1a2e',
    borderRadius: '10px',
    maxHeight: '150px',
    overflowY: 'auto' as const,
    marginTop: '5px',
  },
  resultatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderBottom: '1px solid #2a2a3e',
    cursor: 'pointer',
    color: '#aaa',
    fontSize: '13px',
  },
  ajouterHint: { color: '#667eea', fontSize: '12px' },
  adminInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'rgba(102,126,234,0.1)',
    borderRadius: '10px',
    marginBottom: '15px',
    color: '#aaa',
    fontSize: '12px',
  },
  adminBadge: {
    background: '#667eea',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '5px',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  erreur: { color: '#dc3545', fontSize: '13px', marginBottom: '10px' },
  success: { color: '#28a745', fontSize: '13px', marginBottom: '10px' },
  creerBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default CreerGroupe;
