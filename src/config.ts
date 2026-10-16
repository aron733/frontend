export const API_URL = import.meta.env.VITE_API_URL || 'https://api.vokyvo.com/api';
export const MEDIA_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://api.vokyvo.com';

export function getUserSecurise(): any | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user || typeof user !== 'object' || (!user.id && !user.user_id)) {
      localStorage.removeItem('user');
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}
