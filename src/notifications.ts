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

  // Enregistre le service worker
  const registration = await navigator.serviceWorker.ready;
  
  // Récupère la subscription
  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    const vapidPublicKey = 'BN54LRNE7NRh7xPFvyXVokAym82SHGMgyQpUI7liehucJjviK8qRWxwGs3rEq6WDJaKeOsuc7VQ_RlyIio5AaNw';
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });
  }

  // Envoie la subscription au backend
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
