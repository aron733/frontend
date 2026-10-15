import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

import { NotificationProvider } from './NotificationContext'
import ForceUpdateModal from './ForceUpdateModal'
import { ChatProvider } from './ChatContext'
// Intercepteur Axios : refresh auto + bannissement
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const urlRequete = error.config?.url || '';

    // Endpoints publics : un 401 = identifiants invalides, PAS un token expiré
    const endpointsPublics = ['/connexion/', '/inscription/', '/envoyer-otp/', '/verifier-otp/', '/mot-de-passe-oublie/', '/reinitialiser-mdp/', '/token/refresh/'];
    if (endpointsPublics.some(p => urlRequete.includes(p))) {
      return Promise.reject(error);
    }

    // Si 401 (token expiré) et pas déjà tenté
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(error);
      }
      
      // Si un refresh est déjà en cours, on met la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axios(originalRequest));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      }
      
      // Premier appel : on lance le refresh
      isRefreshing = true;
      try {
        const response = await axios.post('https://api.vokyvo.com/api/token/refresh/', {
          refresh: refreshToken,
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        processQueue(newAccessToken);
        
        // Réessaie la requête d'origine avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh échoué → déconnexion
        processQueue(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Si 403 = Accès refusé (banni)
    if (error.response && error.response.status === 403) {
      const data = error.response.data || {};
      const url = error.config?.url || '';

      // Si c'est un appel /connexion/ → laisse la Landing gerer l'erreur
      if (url.includes('/connexion/')) {
        return Promise.reject(error);
      }

      // Sinon (bannissement en cours de session)
      if (data.erreur === 'Accès refusé') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <ChatProvider>
      <App />
      <ForceUpdateModal />
      </ChatProvider>
    </NotificationProvider>
  </StrictMode>,
)
