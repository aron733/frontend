import os

# Modifie le build.gradle racine
with open('android/build.gradle', 'r') as f:
    build = f.read()

if 'google-services' not in build:
    build = build.replace('classpath ', "classpath 'com.google.gms:google-services:4.4.4'\n        classpath ", 1)

with open('android/build.gradle', 'w') as f:
    f.write(build)

# Modifie app/build.gradle
with open('android/app/build.gradle', 'r') as f:
    app_build = f.read()

if 'gms.google-services' not in app_build:
    app_build = "apply plugin: 'com.google.gms.google-services'\n" + app_build

with open('android/app/build.gradle', 'w') as f:
    f.write(app_build)

# Ajoute les dépendances Firebase
if 'firebase-messaging' not in app_build:
    app_build = app_build.replace(
        'dependencies {',
        "dependencies {\n    implementation platform('com.google.firebase:firebase-bom:34.18.0')\n    implementation 'com.google.firebase:firebase-messaging'"
    )
    with open('android/app/build.gradle', 'w') as f:
        f.write(app_build)

print('Firebase configuré')
