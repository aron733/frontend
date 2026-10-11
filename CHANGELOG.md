# Changelog VOKYVO

Toutes les modifications notables de VOKYVO.

## [3.15.0] — 11/10/2026

### Ajouté
- PWA complète (vite-plugin-pwa + manifest + workbox)
- Icône maskable PWA (fond dégradé violet)
- Lightbox photo dans le chat privé
- Bandeau WS reconnexion dans le header Chat
- Bandeau offline modernisé
- Table News + cron (push / 15 min)

### Modifié
- Refresh dans une conv conserve la conv active
- CSP nettoyé (retrait onrender.com + OneSignal)

### Corrigé
- Fix Huawei : protection typeof Notification
- Fix useEffect hoisting (refresh conv)
- Prompt notifs : condition simplifiée

## [3.14.0] — 11/10/2026

### Ajouté
- Pages 404 + 500 custom (Nginx)
- Rate limits (Cloudflare + Nginx + Django)
- UFW activé

### Supprimé
- OneSignal (remplacé par Web Push VAPID)
- emails.py (code mort Gmail)
- onesignal_utils.py

## [3.13.0] — 11/10/2026

### Ajouté
- Bandeau WS reconnexion
- Lightbox photo (privé)

### Modifié
- Style bandeau offline
