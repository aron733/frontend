// Initialisation OneSignal pour VOKYVO
// Utilise le plugin natif Capacitor sur APK, et le SDK Web sur navigateur

const ONESIGNAL_APP_ID = 'd3dcbd09-2d90-4fa4-88fd-04d133f7106c';

export function initOneSignal() {
  // Sur le Web (navigateur)
  if (typeof window !== 'undefined' && (window as any).OneSignal) {
    (window as any).OneSignal.push(() => {
      (window as any).OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });
    });
  }
}

export function loginOneSignal(userId: string | number) {
  if (typeof window !== 'undefined' && (window as any).OneSignal) {
    (window as any).OneSignal.push(() => {
      (window as any).OneSignal.login(String(userId));
    });
  }
}

export function logoutOneSignal() {
  if (typeof window !== 'undefined' && (window as any).OneSignal) {
    (window as any).OneSignal.push(() => {
      (window as any).OneSignal.logout();
    });
  }
}
