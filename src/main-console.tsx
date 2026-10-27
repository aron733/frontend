import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import './index.css'
import ConsoleApp from './ConsoleApp'

// Intercepteur Axios : refresh auto pour la console
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

      const refreshToken = localStorage.getItem('console_refresh');
      if (!refreshToken || refreshToken.trim() === '') {
        localStorage.removeItem('console_token');
        localStorage.removeItem('console_refresh');
        window.location.href = '/';
        return Promise.reject(error);
      }

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

      isRefreshing = true;
      try {
        const response = await axios.post('https://api.vokyvo.com/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('console_token', newAccessToken);
        // Avec ROTATE_REFRESH_TOKENS, un nouveau refresh token est renvoye
        if (response.data.refresh) {
          localStorage.setItem('console_refresh', response.data.refresh);
        }
        processQueue(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(null);
        localStorage.removeItem('console_token');
        localStorage.removeItem('console_refresh');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConsoleApp />
  </React.StrictMode>,
)
