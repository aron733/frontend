import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vokyvo.com/api';

// Liste identique à l'inscription Landing.tsx
const INDICATIFS = [
  // Afrique de l'Ouest
  { code: '+226', pays: 'Burkina Faso', drapeau: '🇧🇫' },
  { code: '+223', pays: 'Mali', drapeau: '🇲🇱' },
  { code: '+227', pays: 'Niger', drapeau: '🇳🇪' },
  { code: '+225', pays: "Côte d'Ivoire", drapeau: '🇨🇮' },
  { code: '+221', pays: 'Sénégal', drapeau: '🇸🇳' },
  { code: '+229', pays: 'Bénin', drapeau: '🇧🇯' },
  { code: '+228', pays: 'Togo', drapeau: '🇹🇬' },
  { code: '+224', pays: 'Guinée', drapeau: '🇬🇳' },
  { code: '+245', pays: 'Guinée-Bissau', drapeau: '🇬🇼' },
  { code: '+220', pays: 'Gambie', drapeau: '🇬🇲' },
  { code: '+222', pays: 'Mauritanie', drapeau: '🇲🇷' },
  { code: '+231', pays: 'Liberia', drapeau: '🇱🇷' },
  { code: '+232', pays: 'Sierra Leone', drapeau: '🇸🇱' },
  { code: '+233', pays: 'Ghana', drapeau: '🇬🇭' },
  { code: '+234', pays: 'Nigeria', drapeau: '🇳🇬' },
  { code: '+235', pays: 'Tchad', drapeau: '🇹🇩' },
  { code: '+236', pays: 'Centrafrique', drapeau: '🇨🇫' },
  { code: '+237', pays: 'Cameroun', drapeau: '🇨🇲' },
  { code: '+240', pays: 'Guinée équatoriale', drapeau: '🇬🇶' },
  { code: '+241', pays: 'Gabon', drapeau: '🇬🇦' },
  { code: '+242', pays: 'Congo', drapeau: '🇨🇬' },
  { code: '+243', pays: 'RD Congo', drapeau: '🇨🇩' },
  { code: '+244', pays: 'Angola', drapeau: '🇦🇴' },
  // Afrique du Nord
  { code: '+212', pays: 'Maroc', drapeau: '🇲🇦' },
  { code: '+213', pays: 'Algérie', drapeau: '🇩🇿' },
  { code: '+216', pays: 'Tunisie', drapeau: '🇹🇳' },
  { code: '+218', pays: 'Libye', drapeau: '🇱🇾' },
  { code: '+20', pays: 'Égypte', drapeau: '🇪🇬' },
  { code: '+249', pays: 'Soudan', drapeau: '🇸🇩' },
  { code: '+211', pays: 'Soudan du Sud', drapeau: '🇸🇸' },
  { code: '+251', pays: 'Éthiopie', drapeau: '🇪🇹' },
  { code: '+252', pays: 'Somalie', drapeau: '🇸🇴' },
  { code: '+253', pays: 'Djibouti', drapeau: '🇩🇯' },
  { code: '+254', pays: 'Kenya', drapeau: '🇰🇪' },
  { code: '+255', pays: 'Tanzanie', drapeau: '🇹🇿' },
  { code: '+256', pays: 'Ouganda', drapeau: '🇺🇬' },
  { code: '+250', pays: 'Rwanda', drapeau: '🇷🇼' },
  { code: '+257', pays: 'Burundi', drapeau: '🇧🇮' },
  { code: '+258', pays: 'Mozambique', drapeau: '🇲🇿' },
  { code: '+260', pays: 'Zambie', drapeau: '🇿🇲' },
  { code: '+261', pays: 'Madagascar', drapeau: '🇲🇬' },
  { code: '+263', pays: 'Zimbabwe', drapeau: '🇿🇼' },
  { code: '+264', pays: 'Namibie', drapeau: '🇳🇦' },
  { code: '+265', pays: 'Malawi', drapeau: '🇲🇼' },
  { code: '+266', pays: 'Lesotho', drapeau: '🇱🇸' },
  { code: '+267', pays: 'Botswana', drapeau: '🇧🇼' },
  { code: '+268', pays: 'Eswatini', drapeau: '🇸🇿' },
  { code: '+27', pays: 'Afrique du Sud', drapeau: '🇿🇦' },
  // Europe
  { code: '+33', pays: 'France', drapeau: '🇫🇷' },
  { code: '+32', pays: 'Belgique', drapeau: '🇧🇪' },
  { code: '+41', pays: 'Suisse', drapeau: '🇨🇭' },
  { code: '+49', pays: 'Allemagne', drapeau: '🇩🇪' },
  { code: '+39', pays: 'Italie', drapeau: '🇮🇹' },
  { code: '+34', pays: 'Espagne', drapeau: '🇪🇸' },
  { code: '+351', pays: 'Portugal', drapeau: '🇵🇹' },
  { code: '+44', pays: 'Royaume-Uni', drapeau: '🇬🇧' },
  { code: '+31', pays: 'Pays-Bas', drapeau: '🇳🇱' },
  { code: '+48', pays: 'Pologne', drapeau: '🇵🇱' },
  { code: '+7', pays: 'Russie', drapeau: '🇷🇺' },
  // Amériques
  { code: '+1', pays: 'USA', drapeau: '🇺🇸' },
  { code: '+1', pays: 'Canada', drapeau: '🇨🇦' },
  { code: '+52', pays: 'Mexique', drapeau: '🇲🇽' },
  { code: '+55', pays: 'Brésil', drapeau: '🇧🇷' },
  { code: '+54', pays: 'Argentine', drapeau: '🇦🇷' },
  { code: '+56', pays: 'Chili', drapeau: '🇨🇱' },
  { code: '+57', pays: 'Colombie', drapeau: '🇨🇴' },
  // Asie & Moyen-Orient
  { code: '+86', pays: 'Chine', drapeau: '🇨🇳' },
  { code: '+91', pays: 'Inde', drapeau: '🇮🇳' },
  { code: '+81', pays: 'Japon', drapeau: '🇯🇵' },
  { code: '+82', pays: 'Corée du Sud', drapeau: '🇰🇷' },
  { code: '+971', pays: 'Émirats arabes unis', drapeau: '🇦🇪' },
  { code: '+966', pays: 'Arabie saoudite', drapeau: '🇸🇦' },
];

export default function ModalCompleterProfil() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('M');
  const [numero, setNumero] = useState('');
  const [indicatif, setIndicatif] = useState('+226');

  // Pays dérivé de l'indicatif (sauf si plusieurs pays partagent le même indicatif)
  const paysSelectionne = INDICATIFS.find((p) => p.code === indicatif)?.pays || 'Burkina Faso';

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      if (user.a_complete_profil === true) return;
      // Ne pas ré-afficher si l'utilisateur a déjà vu le modal aujourd'hui
      const reportDate = localStorage.getItem('modal_profil_reporte_date');
      const today = new Date().toISOString().slice(0, 10);
      if (reportDate === today) return;

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
    const ageInt = parseInt(age);
    if (!age || isNaN(ageInt) || ageInt < 15) {
      setErreur('Âge requis (15 ans minimum)');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      // Numéro complet avec indicatif
      const numeroComplet = numero ? `${indicatif}${numero.replace(/^0+/, '')}` : '';
      await axios.patch(`${API_URL}/user/profil/`, {
        age: ageInt,
        sexe,
        numero: numeroComplet,
        pays: paysSelectionne,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userStr = localStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);
      user.age = ageInt;
      user.sexe = sexe;
      user.numero = numeroComplet;
      user.pays = paysSelectionne;
      user.a_complete_profil = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('modal_profil_reporte_date');
      setVisible(false);
      window.location.reload();
    } catch (e: any) {
      setErreur(e.response?.data?.erreur || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const plusTard = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('modal_profil_reporte_date', today);
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

        <label style={styles.label}>Sexe *</label>
        <div style={styles.sexeRow}>
          <button
            type="button"
            onClick={() => setSexe('M')}
            style={sexe === 'M' ? styles.sexeBtnActive : styles.sexeBtn}
          >
            Masculin
          </button>
          <button
            type="button"
            onClick={() => setSexe('F')}
            style={sexe === 'F' ? styles.sexeBtnActive : styles.sexeBtn}
          >
            Féminin
          </button>
        </div>

        <label style={styles.label}>Pays</label>
        <select
          value={indicatif}
          onChange={(e) => setIndicatif(e.target.value)}
          style={styles.input}
        >
          {INDICATIFS.map((p, i) => (
            <option key={`${p.code}-${i}`} value={p.code}>
              {p.drapeau} {p.pays} ({p.code})
            </option>
          ))}
        </select>

        <label style={styles.label}>Numéro de téléphone</label>
        <div style={styles.numeroRow}>
          <span style={styles.indicatifLabel}>{indicatif}</span>
          <input
            type="tel"
            value={numero}
            onChange={(e) => setNumero(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="06 96 54 41"
            style={styles.numeroInput}
          />
        </div>

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
  sexeRow: {
    display: 'flex',
    gap: '10px',
  },
  sexeBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px',
    color: '#aaa',
    fontSize: '14px',
    cursor: 'pointer',
  },
  sexeBtnActive: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  numeroRow: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  indicatifLabel: {
    color: '#667eea',
    fontSize: '15px',
    fontWeight: 600,
    padding: '12px 10px',
    borderRight: '1px solid rgba(255,255,255,0.1)',
  },
  numeroInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
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
