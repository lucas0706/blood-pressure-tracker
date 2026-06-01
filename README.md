# Blood Pressure Tracker - Aplicación Local-First

Una aplicación React Native (Expo) profesional para el registro y seguimiento de presión arterial con almacenamiento local, clasificación clínica automática y reportes detallados.

## 🎯 Características Principales

### 📊 Registro de Presión Arterial
- **Entrada rápida y optimizada** para una sola mano
- Campos: Sistólica, Diastólica, Pulso (opcional), Notas
- Interfaz limpia y profesional diseñada para entrada de datos ultra rápida

### 🏥 Clasificación Clínica
Soporte para múltiples guías clínicas internacionales:
- **AHA (USA)**: Sistólica ≥ 130 o Diastólica ≥ 80
- **SAHA (Argentina)**: Sistólica ≥ 140 o Diastólica ≥ 90
- **ESC (Europa)**: Sistólica ≥ 140 o Diastólica ≥ 90

Sistema de colores dinámico:
- 🟢 **Verde**: Normal
- 🟡 **Amarillo**: Elevado
- 🟠 **Naranja**: Etapa 1
- 🔴 **Rojo**: Etapa 2 / Crisis Hipertensiva

### 📈 Reportes y Estadísticas
- Estadísticas detalladas (promedio, máximo, mínimo)
- Distribución de clasificaciones
- Filtrado por período (7 días, 30 días, 90 días, todo)
- Generación de reportes PDF profesionales
- Exportación a CSV

### 📁 Importación de Datos
Soporte para múltiples formatos:
- **Excel** (.xlsx, .xls) - Mapeo flexible de columnas
- **CSV** (.csv) - Detección automática de separador
- **HTML** (.html, .htm) - Extracción de tablas
- **SQLite** (.db, .sqlite) - Importación de bases de datos

### 🔒 Seguridad
- **Almacenamiento local-first**: Todos los datos se guardan en tu dispositivo
- **Autenticación biométrica**: Face ID o huella dactilar
- **Sin conexión requerida**: Funciona completamente sin internet
- **Privacidad garantizada**: Tus datos nunca se envían a servidores

## 🚀 Instalación

### Requisitos Previos
- Node.js 16+ y npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- Dispositivo iOS/Android o emulador

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd blood-pressure-tracker
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Iniciar la aplicación**
   ```bash
   pnpm start
   # o
   npm start
   ```

4. **Ejecutar en tu dispositivo**
   - **iOS**: Presiona `i` en la terminal
   - **Android**: Presiona `a` en la terminal
   - **Expo Go**: Escanea el código QR con Expo Go

## 📱 Uso

### Registro de Presión Arterial
1. Abre la pestaña "Registro"
2. Ingresa los valores de Sistólica y Diastólica
3. Opcionalmente, agrega Pulso y Notas
4. Presiona "Guardar Registro"

### Visualizar Historial
1. Abre la pestaña "Historial"
2. Filtra por clasificación (Normal, Elevado, Etapa 1, Crítico)
3. Desliza hacia abajo para actualizar
4. Mantén presionado un registro para eliminarlo

### Generar Reportes
1. Abre la pestaña "Reportes"
2. Selecciona el período (7 días, 30 días, 90 días, todo)
3. Revisa las estadísticas y distribuciones
4. Presiona "Generar Reporte PDF" para descargar

### Importar Datos
1. Abre la pestaña "Configuración"
2. Presiona "Seleccionar Archivo"
3. Elige un archivo en formato Excel, CSV, HTML o SQLite
4. Los registros se importarán automáticamente

## 🏗️ Estructura del Proyecto

```
blood-pressure-tracker/
├── app/
│   └── App.js                 # Componente principal
├── screens/
│   ├── HomeScreen.js          # Registro de presión
│   ├── HistoryScreen.js       # Historial
│   ├── ReportsScreen.js       # Reportes y estadísticas
│   └── SettingsScreen.js      # Configuración e importación
├── services/
│   ├── DatabaseService.js     # Operaciones SQLite
│   ├── ImporterService.js     # Importación multiformato
│   └── PdfService.js          # Generación de reportes
├── components/
│   └── BiometricLock.js       # Autenticación biométrica
├── utils/
│   └── HealthUtils.js         # Lógica de clasificación clínica
├── assets/
│   └── icon.png               # Icono de la aplicación
├── app.json                   # Configuración de Expo
├── package.json               # Dependencias
└── README.md                  # Este archivo
```

## 🔧 Configuración

### Variables de Entorno
No se requieren variables de entorno. La aplicación funciona completamente local.

### Personalización
Edita `app.json` para:
- Cambiar el nombre de la aplicación
- Modificar el icono
- Ajustar la configuración de Expo

## 📚 Dependencias Principales

- **expo**: Framework para React Native
- **expo-sqlite**: Base de datos local
- **expo-local-authentication**: Autenticación biométrica
- **react-native-chart-kit**: Gráficos
- **xlsx**: Lectura de archivos Excel
- **cheerio**: Parsing de HTML
- **react-navigation**: Navegación entre pantallas

## 🐛 Solución de Problemas

### La aplicación no inicia
```bash
# Limpiar caché
pnpm start --clear
# o
npm start -- --clear
```

### Errores de dependencias
```bash
# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problemas con SQLite
- Asegúrate de que `expo-sqlite` esté instalado correctamente
- En iOS, puede requerir pod install: `cd ios && pod install && cd ..`

## 📄 Aviso Médico Legal

**IMPORTANTE**: Esta aplicación es únicamente para propósitos informativos y de seguimiento personal. No constituye asesoramiento médico profesional, diagnóstico o tratamiento.

- **NO** reemplaza la consulta médica profesional
- **NO** debe usarse como única fuente para decisiones médicas
- **SIEMPRE** consulta con un profesional de salud calificado
- En caso de crisis hipertensiva (presión muy elevada, síntomas graves), busca atención médica de emergencia inmediatamente

## 🔐 Privacidad y Seguridad

- ✅ Almacenamiento 100% local
- ✅ Sin conexión a internet requerida
- ✅ Tus datos nunca se envían a servidores
- ✅ Autenticación biométrica disponible
- ✅ Compatible con GDPR y regulaciones de privacidad

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📧 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio.

## 🙏 Agradecimientos

- Guías clínicas: AHA, SAHA, ESC
- Comunidad de React Native y Expo
- Todos los usuarios que contribuyen con feedback

---

**Versión**: 1.0.0  
**Última actualización**: Junio 2024  
**Desarrollado con ❤️ para tu salud**
