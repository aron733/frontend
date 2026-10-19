import { viderCache } from '../db';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Vokyvo from './Vokyvo';
// import Visio from './Visio'; // Caché temporairement
import Chat from './Chat';
import News from './News';
// import Cours from './Cours';  // Désactivé - fusionné dans Vokyvo AI
import VokyvoPlus from './VokyvoPlus';
// import { demanderPermissionNotifications, envoyerNotificationTest } from '../notifications';
import BadgeVerifie from '../BadgeVerifie';
import toast from 'react-hot-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

import { API_URL } from '../config';
import BottomNav from '../BottomNav';
import Dashboard from './Dashboard';



const longueurParIndicatif = (code: string): number => {
  const longueurs: Record<string, number> = {
    '+226': 8, '+223': 8, '+227': 8, '+225': 10, '+221': 9,
    '+229': 8, '+228': 8, '+224': 9, '+245': 9, '+220': 7,
    '+222': 8, '+231': 8, '+232': 8, '+233': 9, '+234': 10,
    '+235': 8, '+236': 8, '+237': 9, '+240': 9, '+241': 8,
    '+242': 9, '+243': 9, '+244': 9,
    '+212': 9, '+213': 9, '+216': 8, '+218': 9, '+20': 10,
    '+249': 9, '+211': 9, '+251': 9, '+252': 8, '+253': 8,
    '+254': 9, '+255': 9, '+256': 9, '+250': 9, '+257': 8,
    '+258': 9, '+260': 9, '+261': 9, '+263': 9, '+264': 9,
    '+265': 9, '+266': 8, '+267': 8, '+268': 8, '+269': 7,
    '+27': 9, '+230': 8, '+33': 9, '+32': 9, '+41': 9,
    '+49': 11, '+39': 10, '+34': 9, '+44': 10, '+1': 10,
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
  { code: '+44', pays: 'Royaume-Uni', drapeau: '🇬🇧' },
  { code: '+351', pays: 'Portugal', drapeau: '🇵🇹' },
  { code: '+31', pays: 'Pays-Bas', drapeau: '🇳🇱' },
  { code: '+43', pays: 'Autriche', drapeau: '🇦🇹' },
  { code: '+30', pays: 'Grèce', drapeau: '🇬🇷' },
  { code: '+48', pays: 'Pologne', drapeau: '🇵🇱' },
  { code: '+40', pays: 'Roumanie', drapeau: '🇷🇴' },
  { code: '+7', pays: 'Russie', drapeau: '🇷🇺' },
  { code: '+380', pays: 'Ukraine', drapeau: '🇺🇦' },
  // Amériques
  { code: '+1', pays: 'USA/Canada', drapeau: '🇺🇸' },
  { code: '+52', pays: 'Mexique', drapeau: '🇲🇽' },
  { code: '+55', pays: 'Brésil', drapeau: '🇧🇷' },
  { code: '+54', pays: 'Argentine', drapeau: '🇦🇷' },
  // Asie
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
  // Océanie
  { code: '+61', pays: 'Australie', drapeau: '🇦🇺' },
  { code: '+64', pays: 'Nouvelle-Zélande', drapeau: '🇳🇿' },
];

function Profil({ user, onLogout, champsManquants }: { user: any; onLogout: () => void; champsManquants?: string[] }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [convInitiale, setConvInitiale] = useState<string | null>(null);
  const [pageActive, setPageActive] = useState<'profil' | 'vokyvo' | 'visio' | 'news' | 'messages' | 'confidentialite' | 'cours' | 'vokyvo-plus'>(() => (localStorage.getItem('vokyvo_page') as any) || 'profil');
  const [userData, setUserData] = useState(user);
  const [stats, setStats] = useState({ nb_messages: 0, nb_conversations: 0, anciennete: 0, unite: 'jours', date_inscription: '' });

  const [photoUrl, setPhotoUrl] = useState<string | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      return userData.photo_profil || null;
    }
    return user.photo_profil || null;
  });
  const [uploading, setUploading] = useState(false);
  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false);
  const [modalProfilOuvert, setModalProfilOuvert] = useState(false);
  const [modalSecuriteOuvert, setModalSecuriteOuvert] = useState(false);
  const [modalMdpOuvert, setModalMdpOuvert] = useState(false);
  const [modeMdp, setModeMdp] = useState<'email' | 'otp' | 'nouveau' | 'succes'>('email');
  const [mdpEmail, setMdpEmail] = useState('');
  const [mdpCode, setMdpCode] = useState('');
  const [mdpNouveau, setMdpNouveau] = useState('');
  const [mdpLoading, setMdpLoading] = useState(false);
  const [connexions, setConnexions] = useState<any[]>([]);
  const [editAge, setEditAge] = useState('');
  const [editSexe, setEditSexe] = useState('');
  const [editNumero, setEditNumero] = useState('');
  const [editIndicatif, setEditIndicatif] = useState('+226');
  const [editPays, setEditPays] = useState('');
  const [editPrenom, setEditPrenom] = useState('');
  const [editNom, setEditNom] = useState('');
  const [saveEnCours, setSaveEnCours] = useState(false);
  const [lightboxOuverte, setLightboxOuverte] = useState(false);
  const [photoLightbox, setPhotoLightbox] = useState<string | null>(null);

  // Ouvre le modal si des champs manquent (après OAuth Google) — UNE SEULE FOIS
  useEffect(() => {
    if (champsManquants && champsManquants.length > 0 && !localStorage.getItem('profil_force_ouvert')) {
      localStorage.setItem('profil_force_ouvert', '1');
      setModalProfilOuvert(true);
    }
  }, [champsManquants]);

  // Recharge les vraies infos du profil depuis l'API (au montage)
  useEffect(() => {
    const chargerProfil = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/user/profil/statut/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res.data;
        const updated = {
          ...userData,
          prenom: u.prenom || userData.prenom,
          nom: u.nom || userData.nom,
          numero: u.numero || userData.numero,
          pays: u.pays || userData.pays,
          age: u.age || userData.age,
          sexe: u.sexe || userData.sexe,
        };
        setUserData(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erreur chargement profil', e);
      }
    };
    chargerProfil();
  }, []);

  useEffect(() => {
    const chargerStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/user/stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (e) {
        console.warn('Erreur chargement stats', e);
      }
    };
    chargerStats();
  }, []);

  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);
  const [modalQuitter, setModalQuitter] = useState(false);
  const [modalSuppression, setModalSuppression] = useState(false);

  // Ref pour garder l'état à jour dans le listener natif
  const etatActuelRef = useRef({ pageActive, menuOuvert, modalProfilOuvert, confirmDeconnexion, modalQuitter, modalSuppression, lightboxOuverte });
  useEffect(() => {
    etatActuelRef.current = { pageActive, menuOuvert, modalProfilOuvert, confirmDeconnexion, modalQuitter, modalSuppression, lightboxOuverte };
  }, [pageActive, menuOuvert, modalProfilOuvert, confirmDeconnexion, modalQuitter, modalSuppression, lightboxOuverte]);

  // Swipe / bouton retour natif Android (réplique exacte des boutons UI)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let listener: any = null;
    CapacitorApp.addListener('backButton', () => {
      const etat = etatActuelRef.current;
      if (etat.modalProfilOuvert) { setModalProfilOuvert(false); return; }
      if (etat.modalQuitter) { setModalQuitter(false); return; }
      if (etat.modalSuppression) { setModalSuppression(false); return; }
      if (etat.confirmDeconnexion) { setConfirmDeconnexion(false); return; }
      if (etat.lightboxOuverte) { setLightboxOuverte(false); return; }
      if (etat.menuOuvert) { setMenuOuvert(false); return; }
      if (etat.pageActive !== 'profil') { setPageActive('profil'); return; }
      CapacitorApp.exitApp();
    }).then((l: any) => { listener = l; });
    return () => { if (listener) listener.remove(); };
  }, []);

  const [etapeSuppression, setEtapeSuppression] = useState<'otp' | 'raison'>('otp');
  const [otpSuppression, setOtpSuppression] = useState('');
  const [raisonSuppression, setRaisonSuppression] = useState('');
  const [erreurSuppression, setErreurSuppression] = useState('');
  const [chargementSuppression, setChargementSuppression] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('vokyvo_page', pageActive);
  }, [pageActive]);

  const token = localStorage.getItem('access_token');

  const demanderSuppression = async () => {
    setErreurSuppression('');
    setChargementSuppression(true);
    try {
      await axios.post(`${API_URL}/supprimer-compte/demander/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEtapeSuppression('otp');
      setModalSuppression(true);
    } catch (e: any) {
      setErreurSuppression(e.response?.data?.erreur || 'Erreur lors de l\'envoi du code');
    } finally {
      setChargementSuppression(false);
    }
  };

  const validerOtpSuppression = () => {
    setErreurSuppression('');
    if (otpSuppression.length !== 6) {
      setErreurSuppression('Code à 6 chiffres requis');
      return;
    }
    setEtapeSuppression('raison');
  };

  const confirmerSuppressionFinale = async () => {
    setErreurSuppression('');
    setChargementSuppression(true);
    try {
      await axios.post(`${API_URL}/supprimer-compte/confirmer/`, {
        code: otpSuppression,
        raison: raisonSuppression,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Succès → déconnexion + reload
      localStorage.clear();
      await viderCache();
      window.location.href = '/';
    } catch (e: any) {
      setErreurSuppression(e.response?.data?.erreur || 'Erreur lors de la suppression');
      // Si erreur OTP, revenir à l'étape OTP
      if (e.response?.data?.erreur?.includes('Code')) {
        setEtapeSuppression('otp');
      }
    } finally {
      setChargementSuppression(false);
    }
  };

  const fermerModalSuppression = () => {
    setModalSuppression(false);
    setEtapeSuppression('otp');
    setOtpSuppression('');
    setRaisonSuppression('');
    setErreurSuppression('');
  };

  const deconnexion = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('vokyvo_page');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Vide le cache IndexedDB (messages + conversations)
    await viderCache();
    onLogout();
  };

  const confirmerDeconnexion = () => {
    setConfirmDeconnexion(true);
  };

  const annulerDeconnexion = () => {
    setConfirmDeconnexion(false);
  };

  const confirmerEtQuitter = () => {
    setDeconnexionEnCours(true);
    // Délai de 3 secondes avant de quitter
    setTimeout(() => {
      deconnexion();
    }, 3000);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photo = e.target.files?.[0];
    if (!photo) return;

    setUploading(true);

    // Aperçu immédiat
    const apercu = URL.createObjectURL(photo);
    setPhotoUrl(apercu);

    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const response = await axios.post(`${API_URL}/upload-photo/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload réussi :', response.data);
      
      // Met à jour l'URL avec la vraie URL du serveur
      const serveurUrl = response.data.photo_url;
      setPhotoUrl(serveurUrl);
      console.log('Photo sauvegardée:', serveurUrl);
      
      // Met à jour le user dans le localStorage
      const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
      userLocal.photo_profil = serveurUrl;
      localStorage.setItem('user', JSON.stringify(userLocal));
      setUserData(userLocal);
      
      toast.success('Photo de profil mise à jour !');
    } catch (err: any) {
      console.error('Erreur upload :', err);
      toast.error('Erreur upload : ' + (err.response?.data?.erreur || err.message));
      setPhotoUrl(userData.photo_profil || null);
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const ouvrirModalSecurite = async () => {
    setModalSecuriteOuvert(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/user/connexions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnexions(res.data.connexions || []);
    } catch (e) {
      console.warn('Erreur chargement connexions', e);
    }
  };

  const envoyerCodeMdp = async () => {
    setMdpLoading(true);
    try {
      await axios.post(`${API_URL}/mot-de-passe-oublie/`, { email: mdpEmail });
      setModeMdp('otp');
    } catch (e) {
      toast.error('Erreur envoi code');
    } finally {
      setMdpLoading(false);
    }
  };

  const verifierCodeMdp = async () => {
    setMdpLoading(true);
    try {
      await axios.post(`${API_URL}/verifier-code-reset/`, { email: mdpEmail, code: mdpCode });
      setModeMdp('nouveau');
    } catch (e) {
      toast.error('Code incorrect');
    } finally {
      setMdpLoading(false);
    }
  };

  const reinitialiserMdp = async () => {
    setMdpLoading(true);
    try {
      await axios.post(`${API_URL}/reinitialiser-mdp/`, { email: mdpEmail, code: mdpCode, nouveau_mdp: mdpNouveau });
      setModeMdp('succes');
    } catch (e) {
      toast.error('Erreur réinitialisation');
    } finally {
      setMdpLoading(false);
    }
  };

  const ouvrirModalProfil = () => {
    // Utilise userData (déjà chargé depuis l'API au montage)
    setEditAge(userData.age ? String(userData.age) : '');
    setEditSexe(userData.sexe || '');
    setEditNumero(userData.numero || '');
    setEditPays(userData.pays || '');
    setEditPrenom(userData.prenom || userData.first_name || '');
    setEditNom(userData.nom || userData.last_name || '');
    setModalProfilOuvert(true);
  };

  const sauvegarderProfil = async () => {
    setSaveEnCours(true);
    try {
      await axios.patch(`${API_URL}/user/profil/`, {
        age: editAge,
        sexe: editSexe,
        numero: `${editIndicatif} ${editNumero}`.trim(),
        pays: editPays,
        prenom: editPrenom,
        nom: editNom,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Met à jour userData
      const updated = { ...userData, age: editAge, sexe: editSexe, numero: editNumero, pays: editPays };
      setUserData(updated);
      localStorage.setItem('user', JSON.stringify(updated));

      setModalProfilOuvert(false);
      toast.success('Profil mis à jour !');
    } catch (err: any) {
      toast.error('Erreur : ' + (err.response?.data?.erreur || err.message));
    } finally {
      setSaveEnCours(false);
    }
  };


  // const IconeVideo = () => (
    // <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      // <polygon points="23 7 16 12 23 17 23 7" />
      // <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    // </svg>
  // );


  const IconeDeconnexion = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const IconeCamera = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>VOKYVO</h1>
        <button onClick={() => setMenuOuvert(!menuOuvert)} style={{ ...styles.hamburger, transform: menuOuvert ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="5" r="1" fill="white" />
            <circle cx="12" cy="12" r="1" fill="white" />
            <circle cx="12" cy="19" r="1" fill="white" />
          </svg>
        </button>
      </header>

        {menuOuvert && (
          <div onClick={() => setMenuOuvert(false)} style={styles.overlayMenu} />
        )}

        <div style={{
          ...styles.menu,
          transform: menuOuvert ? 'translateX(0)' : 'translateX(120%)',
          opacity: menuOuvert ? 1 : 0,
          pointerEvents: menuOuvert ? 'auto' : 'none',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Compte */}
          <p style={{ color: '#888', fontSize: '12px', margin: '15px 0 5px', textTransform: 'uppercase', fontWeight: 'bold' }}>Compte</p>
          <button onClick={() => { setModalProfilOuvert(true); setMenuOuvert(false); }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Modifier le profil
          </button>

          {/* Support */}
          <p style={{ color: '#888', fontSize: '12px', margin: '15px 0 5px', textTransform: 'uppercase', fontWeight: 'bold' }}>Support</p>
          <button onClick={async () => { const { Capacitor } = await import("@capacitor/core"); const { Browser } = await import("@capacitor/browser"); const url = Capacitor.isNativePlatform() ? "https://vokyvo.com/help?from=app" : "https://vokyvo.com/help"; if (Capacitor.isNativePlatform()) await Browser.open({ url }); else window.location.href = url; }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Centre d'aide
          </button>
          <button onClick={async () => { const { Capacitor } = await import("@capacitor/core"); const { Browser } = await import("@capacitor/browser"); const url = Capacitor.isNativePlatform() ? "https://vokyvo.com/cgu?from=app" : "https://vokyvo.com/cgu"; if (Capacitor.isNativePlatform()) await Browser.open({ url }); else window.location.href = url; }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            CGU
          </button>
          <button onClick={async () => { const { Capacitor } = await import("@capacitor/core"); const { Browser } = await import("@capacitor/browser"); const url = Capacitor.isNativePlatform() ? "https://vokyvo.com/confidentialite?from=app" : "https://vokyvo.com/confidentialite"; if (Capacitor.isNativePlatform()) await Browser.open({ url }); else window.location.href = url; }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Confidentialité
          </button>
          <button onClick={async () => { const { Capacitor } = await import("@capacitor/core"); const { Browser } = await import("@capacitor/browser"); const url = "mailto:support@vokyvo.com"; if (Capacitor.isNativePlatform()) await Browser.open({ url }); else window.location.href = url; }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Contacter le support
          </button>

          {/* VOKYVO+ */}
          <p style={{ color: '#888', fontSize: '12px', margin: '15px 0 5px', textTransform: 'uppercase', fontWeight: 'bold' }}>VOKYVO+</p>
          <button onClick={() => { setPageActive('vokyvo-plus'); setMenuOuvert(false); }} style={{ ...styles.menuItem, color: '#f0ad4e' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0ad4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M10 7V5h4v2" />
              <path d="M12 12v4" />
              <path d="M10 14h4" />
            </svg> Découvrir VOKYVO+
          </button>

          <div style={{ height: '1px', background: '#2a2a3e', margin: '15px 0' }} />
          <button onClick={() => { ouvrirModalSecurite(); setMenuOuvert(false); }} style={styles.menuItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Sécurité
          </button>
          <button onClick={() => { setModalQuitter(true); setMenuOuvert(false); }} style={{ ...styles.menuItem, color: '#dc3545' }}>
            <IconeDeconnexion /> Déconnexion
          </button>

          <p style={{ color: '#555', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
            VOKYVO v{(window as any).__APP_VERSION__ || '3.30.0'}
          </p>
        </div>

      {lightboxOuverte && (photoLightbox || photoUrl) && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 3000, overflow: 'hidden' }}
        >
          <TransformWrapper
            initialScale={1}
            maxScale={4}
            centerOnInit={true}
            doubleClick={{ mode: 'toggle' }}
            wheel={{ step: 0.1 }}
            panning={{ velocityDisabled: true, lockAxisX: false, lockAxisY: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img 
                src={photoLightbox || photoUrl || ''} 
                style={{ 
                  maxWidth: '100vw', 
                  maxHeight: '100vh', 
                  objectFit: 'contain' as const,
                }} 
                alt="photo plein écran"
              />
            </TransformComponent>
          </TransformWrapper>
          <button 
            onClick={() => setLightboxOuverte(false)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', zIndex: 3001 }}
          >
            ✕
          </button>
        </div>
      )}

      <main style={styles.main}>
        {pageActive === 'profil' && (
          <Dashboard user={userData} onNavigate={(page, convId) => { if (convId) setConvInitiale(convId); setPageActive(page); }} onPhotoClick={(url) => { setPhotoLightbox(url); setLightboxOuverte(true); }} />
        )}
        {false && (
          <div style={styles.profilCard}>
            <div style={styles.coverPhoto}>
              {photoUrl ? (
                <img 
                  src={photoUrl || ''} 
                  style={{ ...styles.coverImg, cursor: 'zoom-in' }} 
                  alt="photo" 
                  onClick={() => setLightboxOuverte(true)}
                />
              ) : (
                <div style={styles.coverPlaceholder}>{userData.prenom?.charAt(0) || userData.first_name?.charAt(0) || '?'}</div>
              )}
              <div style={styles.coverOverlay} />
              <button onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }} style={styles.cameraBtn} disabled={uploading}>
                <IconeCamera />
              </button>
              <input type="file" ref={photoInputRef} onChange={uploadPhoto} accept="image/*" style={{ display: 'none' }} />
              <div style={styles.coverInfo}>
                <h2 style={styles.coverNom}>
                  {userData.prenom || userData.first_name} {userData.nom || userData.last_name}
                  {userData.badge_verifie && <BadgeVerifie size={22} />}
                </h2>
                <p style={styles.coverPseudo}>{userData.email}</p>
              </div>
            </div>

            <div style={{ padding: '16px 24px', textAlign: 'center' as const, color: '#aaa', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <strong style={{ color: 'white' }}>{stats.nb_messages}</strong> messages
              {' · '}
              <strong style={{ color: 'white' }}>{stats.nb_conversations}</strong> conversations
              {' · '}
              Membre depuis <strong style={{ color: 'white' }}>{stats.date_inscription?.split('/').slice(1).join('/') || 'aujourd\'hui'}</strong>
            </div>

            {uploading && <p style={{ color: '#aaa', textAlign: 'center' }}>Upload en cours...</p>}

            

            <div style={styles.actionSection}>
              <button style={styles.modifierBtn} onClick={ouvrirModalProfil}>
                <IconeCamera />
                Modifier le profil
              </button>
            </div>
          </div>
        )}


        
        {pageActive === 'vokyvo' && <Vokyvo onRetour={() => setPageActive('profil')} />}
        {/* {pageActive === 'visio' && <Visio />} */}
        {pageActive === 'messages' && <Chat onRetour={() => setPageActive('profil')} convInitiale={convInitiale} />}
        {/* Composant Confidentialite retire (remplace par page HTML statique) */}
        {/* {pageActive === 'cours' && <Cours onRetour={() => setPageActive('profil')} />} Désactivé */}
        {pageActive === 'vokyvo-plus' && <VokyvoPlus onRetour={() => setPageActive('profil')} />}
        {pageActive === 'news' && <News onRetour={() => setPageActive('profil')} />}
      </main>

      {/* Modal Modifier le profil */}
      {modalProfilOuvert && (
        <div style={styles.overlayConfirmation} onClick={() => setModalProfilOuvert(false)}>
          <div style={styles.modalProfil} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitre}>Modifier le profil</h3>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Email (non modifiable)</label>
              <input type="text" value={userData.email || ''} disabled style={styles.inputDisabled} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Prénom</label>
              <input type="text" value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} placeholder="Ton prénom" style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Nom</label>
              <input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Ton nom" style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Téléphone</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={editIndicatif} 
                  onChange={(e) => {
                    setEditIndicatif(e.target.value);
                    // Le pays se met à jour automatiquement
                    const pays = INDICATIFS.find(i => i.code === e.target.value);
                    if (pays) setEditPays(pays.pays);
                  }} 
                  style={{ ...styles.input, width: '120px' }}
                >
                  {INDICATIFS.map((i) => (
                    <option key={i.code} value={i.code}>{i.drapeau} {i.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={editNumero}
                  onChange={(e) => setEditNumero(formaterNumero(e.target.value, editIndicatif))}
                  placeholder={genererPlaceholder(editIndicatif)}
                  style={styles.input} 
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Pays</label>
              <select value={editPays} onChange={(e) => setEditPays(e.target.value)} style={styles.input}>
                {INDICATIFS.map((i) => (
                  <option key={i.pays} value={i.pays}>{i.drapeau} {i.pays}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Âge</label>
              <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} placeholder="Ton âge" min="16" max="120" style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Sexe</label>
              <select value={editSexe} onChange={(e) => setEditSexe(e.target.value)} style={styles.input}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setModalProfilOuvert(false)} style={{ ...styles.saveBtn, background: '#2a2a3e', color: '#aaa' }}>
                Annuler
              </button>
              <button onClick={sauvegarderProfil} disabled={saveEnCours} style={styles.saveBtn}>
                {saveEnCours ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Écran Sécurité (full screen) */}
      {modalSecuriteOuvert && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0f', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
            <h2 style={{ color: 'white', fontSize: '20px', margin: 0 }}>Sécurité</h2>
            <button onClick={() => setModalSecuriteOuvert(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {!modalMdpOuvert ? (
            <div style={{ padding: '20px' }}>
              <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
                Voici tes dernières connexions. Si tu ne reconnais pas une connexion, change ton mot de passe.
              </p>
              {connexions.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center' }}>Aucune connexion récente.</p>
              ) : (
                connexions.map((c, i) => (
                  <div key={i} style={{ background: '#111120', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '15px', marginBottom: '10px' }}>
                    <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>{c.device || 'Appareil inconnu'} · {c.navigateur || '?'}</p>
                    <p style={{ color: '#888', fontSize: '12px', margin: '5px 0 0 0' }}>IP: {c.ip} · {new Date(c.date).toLocaleString('fr-FR')}</p>
                  </div>
                ))
              )}
              <button
                onClick={() => { setMdpEmail(userData.email || ''); setModeMdp('email'); setModalMdpOuvert(true); }}
                style={{ ...styles.successBtn, marginTop: '20px' }}
              >
                Changer mon mot de passe
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={styles.successBox}>
                {modeMdp === 'email' && (
                  <>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <h2 style={styles.successTitle}>Réinitialisation</h2>
                    <p style={styles.successText}>Saisis ton email pour recevoir un code de vérification.</p>
                    <input type="email" value={mdpEmail} onChange={(e) => setMdpEmail(e.target.value)} placeholder="ton@email.com" style={{ ...styles.input, marginBottom: '15px' }} />
                    <button onClick={envoyerCodeMdp} disabled={mdpLoading || !mdpEmail} style={{ ...styles.successBtn, opacity: mdpLoading || !mdpEmail ? 0.5 : 1 }}>
                      {mdpLoading ? 'Envoi...' : 'Envoyer le code'}
                    </button>
                  </>
                )}
                {modeMdp === 'otp' && (
                  <>
                    <h2 style={styles.successTitle}>Vérification</h2>
                    <p style={styles.successText}>Saisis le code envoyé à <strong>{mdpEmail}</strong></p>
                    <input type="text" value={mdpCode} onChange={(e) => setMdpCode(e.target.value)} placeholder="123456" maxLength={6} style={{ ...styles.input, textAlign: 'center', fontSize: '24px', letterSpacing: '10px', marginBottom: '15px' }} />
                    <button onClick={verifierCodeMdp} disabled={mdpLoading || mdpCode.length !== 6} style={{ ...styles.successBtn, opacity: mdpLoading || mdpCode.length !== 6 ? 0.5 : 1 }}>
                      {mdpLoading ? 'Vérification...' : 'Vérifier'}
                    </button>
                  </>
                )}
                {modeMdp === 'nouveau' && (
                  <>
                    <h2 style={styles.successTitle}>Nouveau mot de passe</h2>
                    <input type="password" value={mdpNouveau} onChange={(e) => setMdpNouveau(e.target.value)} placeholder="Nouveau mot de passe" style={{ ...styles.input, marginBottom: '15px' }} />
                    <button onClick={reinitialiserMdp} disabled={mdpLoading || mdpNouveau.length < 6} style={{ ...styles.successBtn, opacity: mdpLoading || mdpNouveau.length < 6 ? 0.5 : 1 }}>
                      {mdpLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </>
                )}
                {modeMdp === 'succes' && (
                  <>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="8 12 11 15 16 9" />
                    </svg>
                    <h2 style={styles.successTitle}>Mot de passe changé !</h2>
                    <p style={styles.successText}>Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
                    <button onClick={() => { setModalMdpOuvert(false); setModalSecuriteOuvert(false); }} style={styles.successBtn}>Fermer</button>
                  </>
                )}
                {modeMdp !== 'succes' && (
                  <button onClick={() => setModalMdpOuvert(false)} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', marginTop: '15px', cursor: 'pointer' }}>
                    Annuler
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmation déconnexion */}
      {modalSuppression && (
        <div style={styles.overlayConfirmation} onClick={fermerModalSuppression}>
          <div style={styles.modalConfirmation} onClick={(e) => e.stopPropagation()}>
            {etapeSuppression === 'otp' && (
              <>
                <div style={styles.modalIconWrap}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p style={styles.modalTexte}>Supprimer mon compte</p>
                <p style={{ ...styles.modalSousTexte, marginTop: '10px' }}>
                  Un code à 6 chiffres a été envoyé à<br />
                  <strong style={{ color: '#ccc' }}>{userData.email}</strong>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpSuppression}
                  onChange={(e) => setOtpSuppression(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1.5px solid rgba(102,126,234,0.5)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '24px',
                    textAlign: 'center',
                    letterSpacing: '10px',
                    marginTop: '20px',
                    outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                {erreurSuppression && (
                  <p style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', margin: '12px 0 0 0' }}>
                    {erreurSuppression}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                  <button
                    onClick={fermerModalSuppression}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: '#888',
                      border: '1px solid #2a2a3e',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={validerOtpSuppression}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Continuer
                  </button>
                </div>
              </>
            )}

            {etapeSuppression === 'raison' && (
              <>
                <div style={styles.modalIconWrap}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p style={styles.modalTexte}>Une dernière chose…</p>
                <p style={{ ...styles.modalSousTexte, marginTop: '10px' }}>
                  Pourquoi tu pars ? (facultatif)<br />
                  Cela nous aide à améliorer VOKYVO.
                </p>
                <textarea
                  value={raisonSuppression}
                  onChange={(e) => setRaisonSuppression(e.target.value)}
                  placeholder="Trop lent, pas utile, autre…"
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '14px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    marginTop: '16px',
                  }}
                />
                <div style={{
                  background: 'rgba(220,53,69,0.1)',
                  borderLeft: '3px solid #dc3545',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  marginTop: '16px',
                  textAlign: 'left',
                }}>
                  <p style={{ color: '#ff8a8a', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                    Cette action est <strong>définitive</strong>. Messages, photos et conversations seront effacés.
                  </p>
                </div>
                {erreurSuppression && (
                  <p style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', margin: '12px 0 0 0' }}>
                    {erreurSuppression}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                  <button
                    onClick={fermerModalSuppression}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: '#888',
                      border: '1px solid #2a2a3e',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmerSuppressionFinale}
                    disabled={chargementSuppression}
                    style={{
                      flex: 1,
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: chargementSuppression ? 0.6 : 1,
                    }}
                  >
                    {chargementSuppression ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {modalQuitter && (
        <div style={styles.overlayConfirmation} onClick={() => setModalQuitter(false)}>
          <div style={styles.modalConfirmation} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <p style={styles.modalTexte}>Que veux-tu faire ?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
              <button
                onClick={() => { setModalQuitter(false); confirmerDeconnexion(); }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Déconnexion
              </button>

              <button
                onClick={() => { setModalQuitter(false); demanderSuppression(); }}
                style={{
                  background: 'transparent',
                  color: '#dc3545',
                  border: '1px solid rgba(220,53,69,0.4)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Supprimer mon compte
              </button>

              <button
                onClick={() => setModalQuitter(false)}
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeconnexion && (
        <div style={styles.overlayConfirmation} onClick={annulerDeconnexion}>
          <div style={styles.modalConfirmation} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <p style={styles.modalTexte}>Se déconnecter ?</p>
            <p style={styles.modalSousTexte}>Tu pourras te reconnecter à tout moment.</p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
              <button onClick={annulerDeconnexion} style={styles.modalBtnAnnuler}>
                Annuler
              </button>
              <button onClick={confirmerEtQuitter} disabled={deconnexionEnCours} style={{ ...styles.modalBtnConfirmer, opacity: deconnexionEnCours ? 0.6 : 1, cursor: deconnexionEnCours ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {deconnexionEnCours ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}/>
                    </svg>
                    Déconnexion...
                  </>
                ) : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {(pageActive === 'profil' || pageActive === 'news') && <BottomNav pageActive={pageActive} setPageActive={setPageActive} />}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', position: 'sticky' as const, top: 0, zIndex: 1000 },
  logo: { color: 'white', fontSize: '22px', margin: 0, fontWeight: 'bold', letterSpacing: '2px' },
  hamburger: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  menu: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: '75%',
    maxWidth: '320px',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '20px 15px',
    paddingTop: '80px',
    zIndex: 1001,
    boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
    overflowY: 'auto' as const,
  },
  overlayMenu: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 10, 15, 0.4)',
    zIndex: 1000,
  },
  menuItem: { padding: '15px 20px', background: 'transparent', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', textAlign: 'left' as const, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, width: '100%' },
  profilCard: { maxWidth: '100%', width: '100%', textAlign: 'center' as const },
  avatarContainer: { position: 'relative' as const, width: '150px', height: '150px', margin: '0 auto 25px', borderRadius: '50%', padding: '3px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', background: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', fontWeight: 'bold' },
  avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' as const },
  cameraBtn: { position: 'absolute' as const, bottom: '5px', right: '5px', width: '42px', height: '42px', borderRadius: '50%', border: '3px solid #0a0a0f', background: '#667eea', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nom: { color: 'white', fontSize: '26px', margin: '0 0 5px' },
  pseudo: { color: '#aaa', margin: '0 0 30px' },
  overlayConfirmation: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  modalConfirmation: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '25px',
    padding: '35px',
    maxWidth: '350px',
    width: '100%',
    textAlign: 'center' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  modalTexte: { color: 'white', fontSize: '18px', fontWeight: 'bold' as const, margin: '0 0 10px' },
  modalProfil: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '20px',
    padding: '25px',
    maxWidth: '400px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  modalTitre: { color: 'white', fontSize: '20px', fontWeight: 'bold' as const, margin: '0 0 20px', textAlign: 'left' as const },
  fieldGroup: { marginBottom: '16px' },
  fieldLabel: { color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0f0f1a', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const },
  inputDisabled: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a0f', color: '#666', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, cursor: 'not-allowed' as const },
  successBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '20px',
  },
  successTitle: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 600,
    marginBottom: '10px',
  },
  successText: {
    color: '#888',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  successBtn: {
    padding: '14px 30px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    width: '100%',
    maxWidth: '400px',
  },
  saveBtn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '15px', fontWeight: 'bold' as const, cursor: 'pointer', marginTop: '10px' },
  modalIconWrap: { width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(220, 53, 69, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  modalSousTexte: { color: '#888', fontSize: '14px', margin: '0 0 0', lineHeight: 1.4 },
  modalCompteRebours: { color: '#666', fontSize: '13px', margin: '0 0 20px' },
  modalBtnAnnuler: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    background: 'transparent',
    color: '#aaa',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalBtnConfirmer: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  coverPhoto: { position: 'relative' as const, width: '100%', aspectRatio: '3 / 4' as const, overflow: 'hidden', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' },
  coverPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '120px', fontWeight: 'bold', color: 'white' },
  coverOverlay: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.95) 100%)', pointerEvents: 'none' as const },
  coverInfo: { position: 'absolute' as const, bottom: '24px', left: '24px', right: '24px', zIndex: 2, textAlign: 'left' as const },
  coverNom: { color: 'white', fontSize: '28px', fontWeight: 'bold', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' },
  coverPseudo: { color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '14px' },
  statsGrid: { display: 'flex', justifyContent: 'space-around', padding: '20px 0', background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  bioSection: { padding: '16px 24px 0', textAlign: 'left' as const },
  bioText: { color: '#aaa', fontSize: '14px', margin: 0, lineHeight: 1.5 },
  actionSection: { padding: '16px 24px 24px' },
  modifierBtn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'white', color: '#0a0a0f', fontSize: '15px', fontWeight: 'bold' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  statItem: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' },
  statValue: { color: 'white', fontSize: '26px', fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: '12px' },
  infoGrid: { display: 'flex', flexDirection: 'column' as const, padding: '8px 24px 24px 24px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  infoLabel: { color: '#888', fontSize: '14px' },
  infoValue: { color: 'white', fontSize: '14px', fontWeight: '500' as const, textAlign: 'right' as const, maxWidth: '60%', overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const },
};

export default Profil;
