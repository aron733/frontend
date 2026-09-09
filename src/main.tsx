import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

// Intercepteur Axios : détecte le bannissement (403)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si 403 = Accès refusé (banni)
    if (error.response && error.response.status === 403) {
      const data = error.response.data || {};
      // Vérifie si c'est un bannissement
      if (data.erreur === 'Accès refusé' || data.raison) {
        // Déconnecte : supprime token + user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        // Redirige vers la page de connexion
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
