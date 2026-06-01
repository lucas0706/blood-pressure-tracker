# Instrucciones para Exportar a GitHub

## Opción 1: Usar la Interfaz de Gestión (Recomendado)

1. En la interfaz de gestión, haz clic en el menú **⋯** (tres puntos) en la esquina superior derecha
2. Selecciona **"Publish to GitHub"** o similar
3. Sigue los pasos de autenticación
4. El proyecto se exportará automáticamente a tu cuenta

## Opción 2: Exportar Manualmente

### Pasos:

1. **Descargar el proyecto como ZIP**
   - En la interfaz de gestión, haz clic en **⋯** → **"Download as ZIP"**
   - Extrae el archivo

2. **Crear un nuevo repositorio en GitHub**
   ```bash
   # Abre https://github.com/new
   # Nombre: blood-pressure-tracker
   # Descripción: Aplicación local-first para registro de presión arterial
   # Privacidad: Pública o Privada (tu elección)
   ```

3. **Inicializar y pushear**
   ```bash
   cd blood-pressure-tracker
   git init
   git add .
   git commit -m "Initial commit: Blood Pressure Tracker"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/blood-pressure-tracker.git
   git push -u origin main
   ```

## Estructura del Proyecto

```
blood-pressure-tracker/
├── app/                          # Componentes principales
│   └── App.js                    # Punto de entrada
├── screens/                      # Pantallas de la aplicación
│   ├── HomeScreen.js             # Registro de presión
│   ├── HistoryScreen.js          # Historial
│   ├── ReportsScreen.js          # Reportes
│   └── SettingsScreen.js         # Configuración
├── services/                     # Servicios de lógica
│   ├── DatabaseService.js        # SQLite CRUD
│   ├── ImporterService.js        # Importación multiformato
│   └── PdfService.js             # Generación de reportes
├── components/                   # Componentes reutilizables
│   └── BiometricLock.js          # Autenticación biométrica
├── utils/                        # Utilidades
│   └── HealthUtils.js            # Clasificación clínica
├── assets/                       # Recursos
├── app.json                      # Configuración de Expo
├── package.json                  # Dependencias
├── babel.config.js               # Configuración de Babel
├── index.js                      # Punto de entrada
└── README.md                     # Documentación
```

## Características Implementadas

✅ **Base de Datos**: SQLite local con operaciones CRUD completas  
✅ **Clasificación Clínica**: AHA, SAHA, ESC con sistema de colores  
✅ **Importación**: Excel, CSV, HTML, SQLite  
✅ **Reportes**: PDF profesionales con estadísticas  
✅ **Seguridad**: Autenticación biométrica  
✅ **UI**: Optimizada para entrada rápida  

## Instalación y Ejecución

```bash
# Instalar dependencias
pnpm install

# Iniciar la aplicación
pnpm start

# En iOS
pnpm ios

# En Android
pnpm android
```

## Próximos Pasos

1. Instala las dependencias: `pnpm install`
2. Prueba la aplicación en tu dispositivo o emulador
3. Personaliza según tus necesidades
4. Genera un APK o IPA para distribución

## Soporte

Para más información, consulta el README.md incluido en el proyecto.
