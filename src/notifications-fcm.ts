import { PushNotifications } from '@capacitor/push-notifications';
import axios from 'axios';
import { API_URL } from './config';

// Demande la permission et récupère le token FCM
export async function initialiserNotificationsFCM() {
  try {
    // Tente d'initialiser (le plugin sera disponible uniquement dans l'APK)

    // Demande la permission
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      console.log('Permission notifications refusée');
      return;
    }

    // Enregistre le device
    await PushNotifications.register();

    // Écoute l'enregistrement du token
    PushNotifications.addListener('registration', async (token: any) => {
      console.log('Token FCM reçu:', token.value);
      
      // Sauvegarde le token dans le backend
      const accessToken = localStorage.getItem('access_token');
      if (accessToken && token.value) {
        try {
          await axios.post(`${API_URL}/fcm/token/`, {
            fcm_token: token.value,
          }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          console.log('Token FCM sauvegardé');
        } catch (err) {
          console.error('Erreur sauvegarde token FCM:', err);
        }
      }
    });

    // Écoute les notifications entrantes
    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('Notification reçue:', notification);
      // Affiche une notification système (Android le fait automatiquement)
    });

    // Écoute le clic sur une notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
      console.log('Notification cliquée:', notification);
      // Redirige vers la conversation si nécessaire
      const data = notification.notification.data;
      if (data && data.conversation_id) {
        window.location.href = `/texto?conversation=${data.conversation_id}`;
      }
    });

    console.log('Notifications FCM initialisées');
  } catch (err) {
    console.error('Erreur initialisation FCM:', err);
  }
}
