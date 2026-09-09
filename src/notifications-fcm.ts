import axios from 'axios';
import { API_URL } from './config';

// Récupère le token FCM et l'envoie au backend
export async function initialiserNotificationsFCM() {
  console.log('FCM: démarrage...');
  
  // Debug visuel
  const cap = (window as any).Capacitor;
  if (cap && cap.Plugins && cap.Plugins.PushNotifications) {
    alert('✅ FCM: plugin trouvé !');
  } else {
    alert('❌ FCM: plugin NON trouvé !');
  }

  try {
    // Accède au plugin via Capacitor global
    const Capacitor = (window as any).Capacitor;
    
    if (!Capacitor || !Capacitor.Plugins || !Capacitor.Plugins.PushNotifications) {
      console.log('FCM: plugin PushNotifications non disponible');
      return;
    }

    const PushNotifications = Capacitor.Plugins.PushNotifications;

    // Demande la permission (Android 13+)
    try {
      const permission = await PushNotifications.requestPermissions();
      console.log('FCM: permission:', JSON.stringify(permission));
    } catch (e) {
      console.log('FCM: pas besoin de permission (Android 10)');
    }

    // Enregistre le device
    await PushNotifications.register();
    console.log('FCM: device enregistré');

    // Écoute le token
    PushNotifications.addListener('registration', async (token: any) => {
      console.log('FCM: token reçu:', token.value);

      const accessToken = localStorage.getItem('access_token');
      if (accessToken && token.value) {
        try {
          await axios.post(`${API_URL}/fcm/token/`, {
            fcm_token: token.value,
          }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          console.log('FCM: token sauvegardé au backend');
        } catch (err) {
          console.error('FCM: erreur sauvegarde token:', err);
        }
      }
    });

    // Écoute les notifications
    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('FCM: notification reçue:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
      console.log('FCM: notification cliquée:', notification);
      const data = notification.notification?.data;
      if (data && data.conversation_id) {
        window.location.href = `/texto?conversation=${data.conversation_id}`;
      }
    });

    console.log('FCM: initialisation complète');
  } catch (err) {
    console.error('FCM: erreur:', err);
  }
}
