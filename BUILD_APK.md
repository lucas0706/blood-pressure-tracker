# Guía de Compilación de APK - Blood Pressure Tracker

## Opción 1: Compilación Local (Recomendado)

### Requisitos Previos

1. **Node.js 16+** - [Descargar](https://nodejs.org/)
2. **Android Studio** - [Descargar](https://developer.android.com/studio)
3. **Java Development Kit (JDK) 11+** - Incluido en Android Studio
4. **Git** - [Descargar](https://git-scm.com/)

### Pasos de Compilación

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/lucas0706/blood-pressure-tracker.git
cd blood-pressure-tracker
```

#### 2. Instalar Dependencias

```bash
# Usando pnpm (recomendado)
npm install -g pnpm
pnpm install

# O usando npm
npm install
```

#### 3. Preparar el Proyecto para Compilación

```bash
npx expo prebuild --clean
```

Este comando genera los directorios `android/` e `ios/` con la configuración nativa.

#### 4. Compilar el APK

**Opción A: Compilación Debug (Más rápida, para pruebas)**

```bash
cd android
./gradlew assembleDebug
```

El APK se generará en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Opción B: Compilación Release (Para distribución)**

```bash
cd android
./gradlew assembleRelease
```

El APK se generará en:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### 5. Instalar en tu Dispositivo

**Con ADB (Android Debug Bridge):**

```bash
# Conecta tu dispositivo Android por USB
# Habilita "Depuración USB" en Configuración > Opciones de Desarrollador

adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**O manualmente:**
1. Copia el archivo APK a tu dispositivo
2. Abre el administrador de archivos
3. Toca el APK para instalar

### Compilación Release Firmada (Para Google Play)

Para distribuir en Google Play, necesitas firmar el APK:

#### 1. Generar Keystore

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias
```

Responde las preguntas sobre tu información.

#### 2. Configurar Gradle para Firmar

Edita `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 3. Crear archivo gradle.properties

En el directorio raíz, crea `gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña
```

#### 4. Compilar APK Firmado

```bash
cd android
./gradlew assembleRelease
```

---

## Opción 2: Compilación en la Nube con EAS (Expo Application Services)

### Requisitos

1. Cuenta de Expo - [Crear](https://expo.dev/)
2. EAS CLI instalado

### Pasos

#### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

#### 2. Autenticarse con Expo

```bash
eas login
```

#### 3. Compilar con EAS

```bash
# Compilación Debug
eas build --platform android

# Compilación Release
eas build --platform android --release
```

#### 4. Descargar el APK

Una vez completada, EAS proporciona un enlace para descargar el APK.

### Ventajas de EAS

- ✅ No requiere configuración local compleja
- ✅ Compilación en servidores potentes
- ✅ Soporte para firmar automáticamente
- ✅ Integración con Google Play Store

---

## Solución de Problemas

### Error: "Gradle not found"

```bash
# Asegúrate de estar en el directorio android/
cd android
./gradlew --version
```

### Error: "Java not found"

```bash
# Instala JDK 11 o superior
# En Ubuntu/Debian:
sudo apt-get install openjdk-11-jdk

# En macOS:
brew install openjdk@11
```

### Error: "SDK not found"

```bash
# Abre Android Studio y descarga los SDK necesarios
# O configura ANDROID_HOME:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### El APK es muy grande

Los APKs de React Native suelen ser de 50-100 MB. Para reducir:

1. Habilita ProGuard en `android/app/build.gradle`
2. Usa App Bundles en lugar de APK universal
3. Divide en APKs por arquitectura

### Errores de Memoria

```bash
# Aumenta la memoria de Gradle
export GRADLE_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
```

---

## Verificación del APK

### Inspeccionar el APK

```bash
# Listar contenido
unzip -l app-debug.apk

# Extraer manifest
unzip -p app-debug.apk AndroidManifest.xml | python3 -m axml.axmlprinter
```

### Instalar y Probar

```bash
# Instalar
adb install app-debug.apk

# Abrir la aplicación
adb shell am start -n com.bloodpressuretracker.app/.MainActivity

# Ver logs
adb logcat | grep "BloodPressure"
```

---

## Distribución en Google Play Store

### Requisitos

1. Cuenta de Google Play Developer ($25 USD)
2. APK firmado (ver sección anterior)
3. Información de la aplicación (descripción, screenshots, etc.)

### Pasos

1. Accede a [Google Play Console](https://play.google.com/console)
2. Crea una nueva aplicación
3. Completa la información de la aplicación
4. Carga el APK firmado
5. Configura precios y distribución
6. Envía para revisión

---

## Recursos Útiles

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de React Native](https://reactnative.dev/)
- [Guía de Gradle](https://gradle.org/guides/)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## Soporte

Si encuentras problemas:

1. Revisa los logs: `adb logcat`
2. Consulta la documentación oficial
3. Abre un issue en el repositorio de GitHub
4. Busca en Stack Overflow

---

**¡Éxito con tu compilación!** 🚀
