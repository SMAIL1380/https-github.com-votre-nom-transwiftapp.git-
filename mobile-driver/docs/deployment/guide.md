# Guide de déploiement - TranswiftApp Driver

## Prérequis
- Node.js 18+
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS)
- Compte développeur Apple (pour iOS)
- Compte Google Play Console (pour Android)

## Configuration de l'environnement

### Variables d'environnement
Créer un fichier `.env` pour chaque environnement :

```bash
# .env.development
API_URL=https://dev-api.transwift.com
GOOGLE_MAPS_KEY=your_dev_key

# .env.production
API_URL=https://api.transwift.com
GOOGLE_MAPS_KEY=your_prod_key
```

### Configuration Firebase
1. Créer un projet Firebase
2. Télécharger `google-services.json` (Android) et `GoogleService-Info.plist` (iOS)
3. Placer les fichiers dans les dossiers appropriés :
   ```
   android/app/google-services.json
   ios/TranswiftDriver/GoogleService-Info.plist
   ```

## Build et déploiement

### Android

1. Générer une clé de signature :
```bash
keytool -genkeypair -v -keystore transwift.keystore -alias transwift -keyalg RSA -keysize 2048 -validity 10000
```

2. Configurer la signature dans `android/app/build.gradle` :
```gradle
signingConfigs {
    release {
        storeFile file("transwift.keystore")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias "transwift"
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

3. Build APK/Bundle :
```bash
# APK
cd android
./gradlew assembleRelease

# Bundle
./gradlew bundleRelease
```

4. Tester le build :
```bash
# APK
react-native run-android --variant=release

# Bundle
bundletool build-apks --bundle=./app/build/outputs/bundle/release/app-release.aab
```

### iOS

1. Configurer les certificats dans Xcode :
   - Ouvrir le projet dans Xcode
   - Sélectionner le projet dans le navigateur
   - Sous "Signing & Capabilities", sélectionner l'équipe et le profil

2. Build IPA :
```bash
cd ios
xcodebuild -workspace TranswiftDriver.xcworkspace -scheme TranswiftDriver -configuration Release archive -archivePath build/TranswiftDriver.xcarchive
xcodebuild -exportArchive -archivePath build/TranswiftDriver.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath build/
```

## Optimisations

### Android

1. Activer Hermes :
```json
// android/app/build.gradle
project.ext.react = [
    enableHermes: true
]
```

2. Configurer ProGuard :
```
# android/app/proguard-rules.pro
-keep class com.transwift.** { *; }
```

3. Optimiser les ressources :
```gradle
android {
    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
        }
    }
}
```

### iOS

1. Activer les optimisations :
   - Ouvrir le projet dans Xcode
   - Build Settings > Optimization Level > Fastest, Smallest [-Os]
   - Enable Bitcode > Yes

2. Gérer les assets :
   - Utiliser Asset Catalogs
   - Optimiser les images avec ImageOptim

## CI/CD

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    tags:
      - 'v*'

jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Android
        run: |
          cd android
          ./gradlew bundleRelease
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJson: ${{ secrets.PLAY_STORE_JSON }}
          packageName: com.transwift.driver
          releaseFiles: android/app/build/outputs/bundle/release/*.aab

  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build iOS
        run: |
          cd ios
          xcodebuild archive
      - name: Upload to TestFlight
        uses: apple-actions/upload-testflight@v1
        with:
          app-path: ios/build/TranswiftDriver.ipa
          api-key: ${{ secrets.APPSTORE_API_KEY }}
```

## Monitoring

### Firebase Crashlytics
```javascript
// App.tsx
import crashlytics from '@react-native-firebase/crashlytics';

// Log des erreurs
crashlytics().log('App mounted.');
crashlytics().recordError(error);
```

### Performance Monitoring
```javascript
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('load_data');
// ... code ...
await trace.stop();
```

## Maintenance

### Mises à jour
1. Vérifier régulièrement les dépendances :
```bash
npm outdated
```

2. Mettre à jour React Native :
```bash
react-native upgrade
```

3. Tester après chaque mise à jour :
```bash
npm test
npm run e2e
```

### Backups
1. Code source : GitHub
2. Configurations : 1Password/Vault
3. Certificats : Backup local + cloud sécurisé

## Sécurité

1. Obfusquer le code sensible
2. Sécuriser le stockage local
3. Implémenter le SSL pinning
4. Activer la détection du root/jailbreak

## Support

- Documentation : [lien]
- Issues : GitHub
- Contact : devops@transwift.com
