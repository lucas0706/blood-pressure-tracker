# Guía de Contribución

¡Gracias por tu interés en contribuir a Blood Pressure Tracker! Este documento proporciona pautas y directrices para contribuir al proyecto.

## Código de Conducta

Por favor, sé respetuoso y profesional en todas las interacciones.

## Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado antes
2. Abre un nuevo issue con:
   - Título claro y descriptivo
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es relevante
   - Tu entorno (dispositivo, versión de Expo, etc.)

### Sugerir Mejoras

1. Abre un issue con la etiqueta `enhancement`
2. Describe la mejora con claridad
3. Explica por qué sería útil
4. Proporciona ejemplos si es posible

### Pull Requests

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Estándares de Código

### JavaScript/React Native

- Usa JavaScript ES6+
- Sigue el estilo de código existente
- Comenta el código complejo
- Usa nombres descriptivos para variables y funciones
- Mantén las funciones pequeñas y enfocadas

### Ejemplo de Estilo

```javascript
// ✅ Bien
const calculateAverageBloodPressure = (registros) => {
  if (!registros || registros.length === 0) return 0;
  
  const sum = registros.reduce((acc, r) => acc + r.sistolica, 0);
  return Math.round(sum / registros.length);
};

// ❌ Evitar
const calc = (r) => r.reduce((a, b) => a + b.s, 0) / r.length;
```

### Estructura de Componentes

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Lógica de efecto
  }, []);

  const handleAction = () => {
    // Manejador de evento
  };

  return (
    <View style={styles.container}>
      <Text>{prop1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

## Proceso de Revisión

1. Los PRs serán revisados por los mantenedores
2. Se pueden solicitar cambios
3. Una vez aprobado, se fusionará a la rama principal
4. Tu contribución será reconocida en el README

## Desarrollo Local

### Configuración

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/blood-pressure-tracker.git
cd blood-pressure-tracker

# Instalar dependencias
pnpm install

# Iniciar la aplicación
pnpm start
```

### Pruebas

```bash
# Ejecutar pruebas
pnpm test

# Linting
pnpm lint
```

## Estructura del Proyecto

```
blood-pressure-tracker/
├── app/              # Componentes principales
├── screens/          # Pantallas
├── services/         # Lógica de negocio
├── components/       # Componentes reutilizables
├── utils/            # Funciones utilitarias
└── assets/           # Recursos
```

## Áreas de Contribución

### 🐛 Bugs Conocidos
- Revisar issues abiertos con etiqueta `bug`

### ✨ Mejoras Solicitadas
- Revisar issues con etiqueta `enhancement`

### 📚 Documentación
- Mejorar README
- Agregar comentarios al código
- Crear guías de uso

### 🧪 Pruebas
- Agregar unit tests
- Mejorar cobertura de pruebas

### 🎨 UI/UX
- Mejoras de diseño
- Optimizaciones de rendimiento

## Preguntas

Si tienes preguntas, abre un issue con la etiqueta `question`.

## Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la Licencia MIT.

---

¡Gracias por contribuir a Blood Pressure Tracker! 🙏
