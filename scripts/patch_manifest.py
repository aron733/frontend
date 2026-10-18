#!/usr/bin/env python3
"""Patch AndroidManifest.xml pour ajouter App Links (deep link OAuth)."""
import re
import sys

MANIFEST = "android/app/src/main/AndroidManifest.xml"

INTENT = """                <intent-filter android:autoVerify="true">
                    <action android:name="android.intent.action.VIEW" />
                    <category android:name="android.intent.category.DEFAULT" />
                    <category android:name="android.intent.category.BROWSABLE" />
                    <data android:scheme="https" android:host="vokyvo.com" android:pathPrefix="/oauth-callback" />
                </intent-filter>
"""

with open(MANIFEST, "r") as f:
    content = f.read()

pattern = r'(<category android:name="android\.intent\.category\.LAUNCHER"\s*/>\s*</intent-filter>)(\s*)</activity>'
match = re.search(pattern, content)

if not match:
    print("ATTENTION: pattern LAUNCHER + </activity> non trouve")
    print(content[:3000])
    sys.exit(1)

remplacement = match.group(1) + "\n" + INTENT + match.group(2) + "</activity>"
nouveau = content[:match.start()] + remplacement + content[match.end():]


# --- Intent Filter pour le partage (ACTION_SEND) ---
INTENT_SEND = '''                <intent-filter>
                    <action android:name="android.intent.action.SEND" />
                    <category android:name="android.intent.category.DEFAULT" />
                    <data android:mimeType="text/plain" />
                </intent-filter>
'''

if 'android.intent.action.SEND' not in nouveau:
    # On insère juste après l'intent-filter de l'OAuth (ou après le LAUNCHER)
    # On cherche la fermeture du dernier intent-filter ajouté
    idx = nouveau.rfind('</intent-filter>')
    if idx != -1:
        idx = nouveau.find('</intent-filter>', idx)
        nouveau = nouveau[:idx+len('</intent-filter>')] + '\n' + INTENT_SEND + nouveau[idx+len('</intent-filter>'):]
        print("OK: intent-filter SEND ajoute")
    else:
        print("ERREUR: intent-filter non trouve")

# --- Active le Predictive Back (swipe Android 13+) ---
if 'android:enableOnBackInvokedCallback' not in nouveau:
    nouveau = nouveau.replace(
        '<application',
        '<application\n        android:enableOnBackInvokedCallback="true"',
        1
    )
    print("OK: enableOnBackInvokedCallback ajoute")
else:
    print("OK: enableOnBackInvokedCallback deja present")

with open(MANIFEST, "w") as f:
    f.write(nouveau)

print("OK: intent-filter App Links insere")
