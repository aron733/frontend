import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

import { NotificationProvider } from './NotificationContext'
import ForceUpdateModal from './ForceUpdateModal'
import { ChatProvider } from './ChatContext'
import { initOneSignal } from './onesignal'
// Intercepteur Axios : refresh auto + bannissement
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 (token expiré) et pas déjà tenté
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post('https://django-43v1.onrender.com/api/token/refresh/', {
            refresh: refreshToken,
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          
          // Réessaie la requête avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh échoué → déconnexion
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      }
    }

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

void initOneSignal();
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
