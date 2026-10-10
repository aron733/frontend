import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vokyvo.com/api';

const PAYS_OPTIONS = [
  { code: '+226', nom: 'Burkina Faso', drapeau: '🇧🇫' },
  { code: '+223', nom: 'Mali', drapeau: '🇲🇱' },
  { code: '+227', nom: 'Niger', drapeau: '🇳🇪' },
  { code: '+225', nom: "Côte d'Ivoire", drapeau: '🇨🇮' },
  { code: '+221', nom: 'Sénégal', drapeau: '🇸🇳' },
  { code: '+229', nom: 'Bénin', drapeau: '🇧🇯' },
  { code: '+228', nom: 'Togo', drapeau: '🇹🇬' },
  { code: '+224', nom: 'Guinée', drapeau: '🇬🇳' },
  { code: '+233', nom: 'Ghana', drapeau: '🇬🇭' },
  { code: '+234', nom: 'Nigeria', drapeau: '🇳🇬' },
];

export default function ModalCompleterProfil() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('M');
  const [numero, setNumero] = useState('');
  const [pays, setPays] = useState('Burkina Faso');

  useEffect(() => {
    // Vérifie si le profil est incomplet
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      // Ne pas afficher si déjà reporté dans cette session
      if (sessionStorage.getItem('modal_profil_reporte') === 'true') return;
      // Ne pas afficher si profil complet
      if (user.a_complete_profil === true) return;
      // Vérifier les champs manquants
      const manquants: string[] = [];
      if (!user.age) manquants.push('age');
      if (!user.sexe) manquants.push('sexe');
      if (!user.numero) manquants.push('numero');
      if (!user.pays || user.pays === 'Inconnu') manquants.push('pays');
      if (manquants.length > 0) {
        setVisible(true);
      }
    } catch (e) {}
  }, []);

  const enregistrer = async () => {
    setErreur('');
    if (!age || parseInt(age) < 15) {
      setErreur('Âge requis (15 ans minimum)');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/user/profil/`, {
        age: parseInt(age),
        sexe,
        numero,
        pays,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Met à jour localStorage
      const userStr = localStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);
      user.age = parseInt(age);
      user.sexe = sexe;
      user.numero = numero;
      user.pays = pays;
      user.a_complete_profil = true;
      localStorage.setItem('user', JSON.stringify(user));
      setVisible(false);
      window.location.reload();
    } catch (e: any) {
      setErreur(e.response?.data?.erreur || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const plusTard = () => {
    sessionStorage.setItem('modal_profil_reporte', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Complète ton profil</h2>
        <p style={styles.subtitle}>
          Aide-nous à mieux te connaître. Ces informations restent privées.
        </p>

        <label style={styles.label}>Âge *</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Ex: 20"
          style={styles.input}
        />

        <label style={styles.label}>Sexe</label>
        <select value={sexe} onChange={(e) => setSexe(e.target.value)} style={styles.input}>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
          <option value="A">Autre</option>
        </select>

        <label style={styles.label}>Numéro de téléphone</label>
        <input
          type="tel"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="Ex: 06 96 54 41"
          style={styles.input}
        />

        <label style={styles.label}>Pays</label>
        <select value={pays} onChange={(e) => setPays(e.target.value)} style={styles.input}>
          {PAYS_OPTIONS.map((p) => (
            <option key={p.nom} value={p.nom}>{p.drapeau} {p.nom}</option>
          ))}
        </select>

        {erreur && <p style={styles.erreur}>{erreur}</p>}

        <div style={styles.buttons}>
          <button onClick={plusTard} style={styles.btnSecondaire}>
            Plus tard
          </button>
          <button onClick={enregistrer} disabled={loading} style={styles.btnPrimaire}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    background: '#111120',
    border: '1px solid #1a1a2e',
    borderRadius: '16px',
    padding: '25px',
    maxWidth: '420px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    marginBottom: '8px',
    marginTop: 0,
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    color: '#aaa',
    fontSize: '13px',
    marginBottom: '6px',
    marginTop: '14px',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  erreur: {
    color: '#ff6b6b',
    fontSize: '13px',
    marginTop: '12px',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginTop: '22px',
  },
  btnPrimaire: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSecondaire: {
    flex: 1,
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    cursor: 'pointer',
  },
};
