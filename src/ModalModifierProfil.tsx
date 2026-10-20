import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from './config';

const INDICATIFS = [
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
  { code: '+33', pays: 'France', drapeau: '🇫🇷' },
  { code: '+32', pays: 'Belgique', drapeau: '🇧🇪' },
  { code: '+41', pays: 'Suisse', drapeau: '🇨🇭' },
  { code: '+49', pays: 'Allemagne', drapeau: '🇩🇪' },
  { code: '+39', pays: 'Italie', drapeau: '🇮🇹' },
  { code: '+34', pays: 'Espagne', drapeau: '🇪🇸' },
  { code: '+44', pays: 'Royaume-Uni', drapeau: '🇬🇧' },
  { code: '+351', pays: 'Portugal', drapeau: '🇵🇹' },
  { code: '+31', pays: 'Pays-Bas', drapeau: '🇳🇱' },
  { code: '+43', pays: 'Autriche', drapeau: '🇦🇹' },
  { code: '+30', pays: 'Grèce', drapeau: '🇬🇷' },
  { code: '+48', pays: 'Pologne', drapeau: '🇵🇱' },
  { code: '+40', pays: 'Roumanie', drapeau: '🇷🇴' },
  { code: '+7', pays: 'Russie', drapeau: '🇷🇺' },
  { code: '+380', pays: 'Ukraine', drapeau: '🇺🇦' },
  { code: '+1', pays: 'USA/Canada', drapeau: '🇺🇸' },
  { code: '+52', pays: 'Mexique', drapeau: '🇲🇽' },
  { code: '+55', pays: 'Brésil', drapeau: '🇧🇷' },
  { code: '+54', pays: 'Argentine', drapeau: '🇦🇷' },
  { code: '+86', pays: 'Chine', drapeau: '🇨🇳' },
  { code: '+81', pays: 'Japon', drapeau: '🇯🇵' },
  { code: '+82', pays: 'Corée du Sud', drapeau: '🇰🇷' },
  { code: '+91', pays: 'Inde', drapeau: '🇮🇳' },
  { code: '+92', pays: 'Pakistan', drapeau: '🇵🇰' },
  { code: '+880', pays: 'Bangladesh', drapeau: '🇧🇩' },
  { code: '+62', pays: 'Indonésie', drapeau: '🇮🇩' },
  { code: '+60', pays: 'Malaisie', drapeau: '🇲🇾' },
  { code: '+65', pays: 'Singapour', drapeau: '🇸🇬' },
  { code: '+66', pays: 'Thaïlande', drapeau: '🇹🇭' },
  { code: '+84', pays: 'Vietnam', drapeau: '🇻🇳' },
  { code: '+63', pays: 'Philippines', drapeau: '🇵🇭' },
  { code: '+61', pays: 'Australie', drapeau: '🇦🇺' },
  { code: '+64', pays: 'Nouvelle-Zélande', drapeau: '🇳🇿' },
];

const longueurParIndicatif = (code: string): number => {
  const longueurs: Record<string, number> = {
    '+226': 8, '+223': 8, '+227': 8, '+225': 10, '+221': 9,
    '+229': 8, '+228': 8, '+224': 9, '+245': 9, '+220': 7,
    '+222': 8, '+231': 8, '+232': 8, '+233': 9, '+234': 10,
    '+235': 8, '+236': 8, '+237': 9, '+240': 9, '+241': 8,
    '+242': 9, '+243': 9, '+244': 9, '+212': 9, '+213': 9,
    '+216': 8, '+218': 9, '+20': 10, '+249': 9, '+211': 9,
    '+251': 9, '+252': 8, '+253': 8, '+254': 9, '+255': 9,
    '+256': 9, '+250': 9, '+257': 8, '+258': 9, '+260': 9,
    '+261': 9, '+263': 9, '+264': 9, '+265': 9, '+266': 8,
    '+267': 8, '+268': 8, '+269': 7, '+27': 9, '+230': 8,
    '+33': 9, '+32': 9, '+41': 9, '+49': 11, '+39': 10,
    '+34': 9, '+44': 10, '+1': 10,
  };
  return longueurs[code] || 9;
};

const formaterNumero = (valeur: string, code: string) => {
  const max = longueurParIndicatif(code);
  const chiffres = valeur.replace(/\D/g, '').slice(0, max);
  return chiffres.replace(/(\d{2})(?=\d)/g, '$1 ');
};

const genererPlaceholder = (code: string): string => {
  const max = longueurParIndicatif(code);
  const blocs: string[] = [];
  let reste = max;
  while (reste > 0) {
    blocs.push('XX');
    reste -= 2;
  }
  return blocs.join(' ');
};

interface Props {
  user: any;
  onFermer: () => void;
  onSauvegarder: (data: any) => void;
  ouvrirLightbox: (url: string) => void;
}

export default function ModalModifierProfil({ user, onFermer, onSauvegarder, ouvrirLightbox }: Props) {
  const [chargement, setChargement] = useState(true);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [numero, setNumero] = useState('');
  const [indicatif, setIndicatif] = useState('+226');
  const [pays, setPays] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [saveEnCours, setSaveEnCours] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.photo_profil || null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/user/profil/statut/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res.data;
        setPrenom(u.prenom || '');
        setNom(u.nom || '');
        // Sépare l'indicatif du numéro (ex: "+226 03 45 67 78")
        if (u.numero) {
          const parts = u.numero.trim().split(' ');
          if (parts.length > 1 && parts[0].startsWith('+')) {
            setIndicatif(parts[0]);
            setNumero(parts.slice(1).join(' '));
          } else {
            setNumero(u.numero);
          }
        }
        setPays(u.pays || '');
        setAge(u.age ? String(u.age) : '');
        setSexe(u.sexe || '');
      } catch (e) {
        console.warn('Erreur chargement profil', e);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photo = e.target.files?.[0];
    if (!photo) return;
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('photo', photo);
      const res = await axios.post(`${API_URL}/upload-photo/`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.photo_url;
      setPhotoUrl(url);
      const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
      userLocal.photo_profil = url;
      localStorage.setItem('user', JSON.stringify(userLocal));
    } catch (err) {
      toast.error('Erreur upload photo');
    }
  };

  const sauvegarder = async () => {
    setSaveEnCours(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/user/profil/`, {
        age: age,
        sexe: sexe,
        numero: `${indicatif} ${numero}`.trim(),
        pays: pays,
        prenom: prenom,
        nom: nom,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSauvegarder({ prenom, nom, numero: `${indicatif} ${numero}`.trim(), pays, age, sexe, photo_profil: photoUrl });
      toast.success('Profil mis à jour !');
      onFermer();
    } catch (err) {
      toast.error('Erreur sauvegarde profil');
    } finally {
      setSaveEnCours(false);
    }
  };

  if (chargement) {
    return (
      <div style={styles.overlay} onClick={onFermer}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #2a2a3e', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onFermer}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.titre}>Modifier le profil</h3>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <div
            onClick={() => { if (photoUrl) ouvrirLightbox(photoUrl); }}
            style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1a1a2e', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: photoUrl ? 'pointer' : 'default', border: '2px solid #667eea' }}
          >
            {photoUrl ? (
              <img src={photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            ) : (
              <span style={{ color: '#667eea', fontSize: '30px', fontWeight: 'bold' }}>
                {(prenom || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(102,126,234,0.1)', border: '1px solid #667eea', color: '#667eea', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '8px 16px', borderRadius: '10px', marginTop: '10px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Changer la photo
          </button>
          <input type="file" ref={photoInputRef} onChange={uploadPhoto} accept="image/*" style={{ display: 'none' }} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Email (non modifiable)</label>
          <input type="text" value={user?.email || ''} disabled style={styles.inputDisabled} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Prénom</label>
          <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ton prénom" style={styles.input} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Nom</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ton nom" style={styles.input} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Téléphone</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={indicatif} onChange={(e) => { setIndicatif(e.target.value); const p = INDICATIFS.find(i => i.code === e.target.value); if (p) setPays(p.pays); }} style={{ ...styles.input, width: '120px' }}>
              {INDICATIFS.map((i) => (<option key={i.code} value={i.code}>{i.drapeau} {i.code}</option>))}
            </select>
            <input type="tel" value={numero} onChange={(e) => setNumero(formaterNumero(e.target.value, indicatif))} placeholder={genererPlaceholder(indicatif)} style={styles.input} />
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Pays</label>
          <select value={pays} onChange={(e) => setPays(e.target.value)} style={styles.input}>
            {INDICATIFS.map((i) => (<option key={i.pays} value={i.pays}>{i.drapeau} {i.pays}</option>))}
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Âge</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ton âge" min="16" max="120" style={styles.input} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Sexe</label>
          <select value={sexe} onChange={(e) => setSexe(e.target.value)} style={styles.input}>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onFermer} style={{ ...styles.saveBtn, background: '#2a2a3e', color: '#aaa' }}>Annuler</button>
          <button onClick={sauvegarder} disabled={saveEnCours} style={styles.saveBtn}>{saveEnCours ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  modal: {
    background: '#1a1a2e', borderRadius: '16px', padding: '20px',
    width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto',
    border: '1px solid #2a2a3e',
  },
  titre: { color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '20px', textAlign: 'center' },
  group: { marginBottom: '15px' },
  label: { display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  inputDisabled: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#111120', color: '#666', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
};
