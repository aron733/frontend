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

with open(MANIFEST, "w") as f:
    f.write(nouveau)

print("OK: intent-filter App Links insere")
