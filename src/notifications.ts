import { API_URL } from './config';

export async function demanderPermissionNotifications() {
  if (!('Notification' in window)) {
    console.log('Notifications non supportées');
    return false;
  }

  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    console.log('Permission refusée');
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  
  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    const vapidPublicKey = 'BN54LRNE7NRh7xPFvyXVokAym82SHGMgyQpUI7liehucJjviK8qRWxwGs3rEq6WDJaKeOsuc7VQ_RlyIio5AaNw';
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });
  }

  const token = localStorage.getItem('access_token');
  
  try {
    await fetch(`${API_URL}/notifications/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription })
    });
    console.log('Subscription sauvegardée !');
    return true;
  } catch (err) {
    console.error('Erreur sauvegarde subscription :', err);
    return false;
  }
}

export async function envoyerNotificationTest() {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(`${API_URL}/notifications/test/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'VOKYVO',
        body: 'Notification de test !'
      })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Erreur test notification :', err);
    return null;
  }
}

// Écoute les notifications quand l'app est ouverte
export function ecouterNotifications() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION') {
        // Affiche un popup dans l'app
        const popup = document.createElement('div');
        popup.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1a1a2e;
          color: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 99999;
          max-width: 300px;
          border: 1px solid rgba(255,255,255,0.1);
          animation: slideIn 0.3s ease-out;
        `;
        popup.innerHTML = `
          <p style="margin:0;font-weight:bold;color:#667eea">${event.data.title}</p>
          <p style="margin:5px 0 0;color:#aaa">${event.data.body}</p>
        `;
        document.body.appendChild(popup);
        
        setTimeout(() => {
          popup.style.opacity = '0';
          popup.style.transition = 'opacity 0.5s';
          setTimeout(() => popup.remove(), 500);
        }, 5000);
      }
    });
  }
}

// Vérifie les messages manqués au chargement
export function afficherMessagesManques() {
  const manques = localStorage.getItem('messages_manques');
  if (manques) {
    const messages = JSON.parse(manques);
    messages.forEach((msg: any) => {
      const popup = document.createElement('div');
      popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a2e;
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 99999;
        max-width: 300px;
        border: 1px solid rgba(255,255,255,0.1);
      `;
      popup.innerHTML = `
        <p style="margin:0;font-weight:bold;color:#667eea">${msg.titre}</p>
        <p style="margin:5px 0 0;color:#aaa">${msg.corps}</p>
      `;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 5000);
    });
    localStorage.removeItem('messages_manques');
  }
}
