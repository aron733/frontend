// OneSignal pour VOKYVO
// - APK : utilise le plugin natif Capacitor (onesignal-cordova-plugin)
// - Web : ne fait rien (évite le crash du SDK Web)

const ONESIGNAL_APP_ID = 'd3dcbd09-2d90-4fa4-88fd-04d133f7106c';

function isCapacitor(): boolean {
  return typeof navigator !== 'undefined' && (navigator.userAgent.includes('wv') || navigator.userAgent.includes('Capacitor'));
}

export async function initOneSignal() {
  if (!isCapacitor()) return;

  try {
    const mod = await import('onesignal-cordova-plugin');
    const OneSignal = (mod as any).default || mod;
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Demande la permission notifications
    OneSignal.Notifications.requestPermission(true);
  } catch (e) {
    console.warn('OneSignal init :', e);
  }
}

export async function loginOneSignal(userId: string | number) {
  if (!isCapacitor()) return;

  try {
    const mod = await import('onesignal-cordova-plugin');
    const OneSignal = (mod as any).default || mod;
    OneSignal.login(String(userId));
  } catch (e) {
    console.warn('OneSignal login :', e);
  }
}

export async function logoutOneSignal() {
  if (!isCapacitor()) return;

  try {
    const mod = await import('onesignal-cordova-plugin');
    const OneSignal = (mod as any).default || mod;
    OneSignal.logout();
  } catch (e) {
    console.warn('OneSignal logout :', e);
  }
}
