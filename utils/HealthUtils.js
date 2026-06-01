/**
 * Clasificación de presión arterial según diferentes guías clínicas
 * SAHA (Argentina): 140/90
 * AHA (USA): 130/80
 * ESC (Europa): 140/90
 */

export const GUIDELINES = {
  SAHA_ARGENTINA: {
    name: 'SAHA (Argentina)',
    systolic: 140,
    diastolic: 90,
  },
  AHA_USA: {
    name: 'AHA (USA)',
    systolic: 130,
    diastolic: 80,
  },
  ESC_EUROPA: {
    name: 'ESC (Europa)',
    systolic: 140,
    diastolic: 90,
  },
};

export const COLORS = {
  GREEN: '#34C759',      // Normal
  YELLOW: '#FFCC00',     // Elevado
  ORANGE: '#FF9500',     // Etapa 1
  RED: '#FF3B30',        // Etapa 2 / Crisis
};

export const CLASSIFICATION_LABELS = {
  NORMAL: 'Normal',
  ELEVATED: 'Elevado',
  STAGE1: 'Etapa 1',
  STAGE2: 'Etapa 2',
  CRISIS: 'Crisis Hipertensiva',
};

/**
 * Clasifica la presión arterial según una guía específica
 * @param {number} sistolica - Presión sistólica
 * @param {number} diastolica - Presión diastólica
 * @param {string} guideline - Clave de la guía (SAHA_ARGENTINA, AHA_USA, ESC_EUROPA)
 * @returns {object} Objeto con clasificación, color y etiqueta
 */
export const classifyBloodPressure = (sistolica, diastolica, guideline = 'AHA_USA') => {
  const guide = GUIDELINES[guideline] || GUIDELINES.AHA_USA;

  // Crisis Hipertensiva: Sistólica > 180 O Diastólica > 120
  if (sistolica > 180 || diastolica > 120) {
    return {
      classification: CLASSIFICATION_LABELS.CRISIS,
      color: COLORS.RED,
      level: 4,
      guideline: guide.name,
    };
  }

  // Etapa 2: Sistólica >= 160 O Diastólica >= 100
  if (sistolica >= 160 || diastolica >= 100) {
    return {
      classification: CLASSIFICATION_LABELS.STAGE2,
      color: COLORS.RED,
      level: 3,
      guideline: guide.name,
    };
  }

  // Etapa 1: Sistólica >= guía O Diastólica >= guía
  if (sistolica >= guide.systolic || diastolica >= guide.diastolic) {
    return {
      classification: CLASSIFICATION_LABELS.STAGE1,
      color: COLORS.ORANGE,
      level: 2,
      guideline: guide.name,
    };
  }

  // Elevado: Sistólica 120-129 Y Diastólica < 80 (solo para AHA)
  if (guideline === 'AHA_USA' && sistolica >= 120 && sistolica < 130 && diastolica < 80) {
    return {
      classification: CLASSIFICATION_LABELS.ELEVATED,
      color: COLORS.YELLOW,
      level: 1,
      guideline: guide.name,
    };
  }

  // Normal
  return {
    classification: CLASSIFICATION_LABELS.NORMAL,
    color: COLORS.GREEN,
    level: 0,
    guideline: guide.name,
  };
};

/**
 * Obtiene la clasificación para múltiples registros
 * @param {array} registros - Array de registros con sistolica y diastolica
 * @param {string} guideline - Clave de la guía
 * @returns {array} Array de registros con clasificación
 */
export const classifyRegistros = (registros, guideline = 'AHA_USA') => {
  return registros.map(registro => ({
    ...registro,
    classification: classifyBloodPressure(registro.sistolica, registro.diastolica, guideline),
  }));
};

/**
 * Calcula estadísticas de presión arterial
 * @param {array} registros - Array de registros
 * @returns {object} Objeto con estadísticas
 */
export const calculateStatistics = (registros) => {
  if (!registros || registros.length === 0) {
    return {
      count: 0,
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: 0,
      maxSystolic: 0,
      minSystolic: 0,
      maxDiastolic: 0,
      minDiastolic: 0,
      normalCount: 0,
      elevatedCount: 0,
      stage1Count: 0,
      stage2Count: 0,
      crisisCount: 0,
    };
  }

  const systolics = registros.map(r => r.sistolica);
  const diastolics = registros.map(r => r.diastolica);
  const pulses = registros.filter(r => r.pulso).map(r => r.pulso);

  const classifications = registros.map(r =>
    classifyBloodPressure(r.sistolica, r.diastolica)
  );

  const counts = {
    normal: classifications.filter(c => c.level === 0).length,
    elevated: classifications.filter(c => c.level === 1).length,
    stage1: classifications.filter(c => c.level === 2).length,
    stage2: classifications.filter(c => c.level === 3).length,
    crisis: classifications.filter(c => c.level === 4).length,
  };

  return {
    count: registros.length,
    avgSystolic: Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length),
    avgDiastolic: Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length),
    avgPulse: pulses.length > 0 ? Math.round(pulses.reduce((a, b) => a + b, 0) / pulses.length) : 0,
    maxSystolic: Math.max(...systolics),
    minSystolic: Math.min(...systolics),
    maxDiastolic: Math.max(...diastolics),
    minDiastolic: Math.min(...diastolics),
    normalCount: counts.normal,
    elevatedCount: counts.elevated,
    stage1Count: counts.stage1,
    stage2Count: counts.stage2,
    crisisCount: counts.crisis,
  };
};

/**
 * Formatea un valor de presión arterial para mostrar
 * @param {number} sistolica
 * @param {number} diastolica
 * @returns {string} Formato: "120/80"
 */
export const formatBloodPressure = (sistolica, diastolica) => {
  return `${sistolica}/${diastolica}`;
};

/**
 * Obtiene el color según el nivel de clasificación
 * @param {number} level - Nivel de clasificación (0-4)
 * @returns {string} Color en formato hex
 */
export const getColorByLevel = (level) => {
  const colorMap = {
    0: COLORS.GREEN,
    1: COLORS.YELLOW,
    2: COLORS.ORANGE,
    3: COLORS.RED,
    4: COLORS.RED,
  };
  return colorMap[level] || COLORS.GREEN;
};

/**
 * Obtiene recomendaciones basadas en la clasificación
 * @param {object} classification - Objeto de clasificación
 * @returns {string} Recomendación
 */
export const getRecommendation = (classification) => {
  const recommendations = {
    [CLASSIFICATION_LABELS.NORMAL]: 'Mantén un estilo de vida saludable. Revisa tu presión regularmente.',
    [CLASSIFICATION_LABELS.ELEVATED]: 'Considera cambios en el estilo de vida: dieta baja en sodio, ejercicio regular.',
    [CLASSIFICATION_LABELS.STAGE1]: 'Consulta con tu médico. Implementa cambios en el estilo de vida.',
    [CLASSIFICATION_LABELS.STAGE2]: 'Busca atención médica. Puede ser necesario tratamiento farmacológico.',
    [CLASSIFICATION_LABELS.CRISIS]: '¡EMERGENCIA! Busca atención médica inmediata.',
  };

  return recommendations[classification.classification] || 'Consulta con tu médico.';
};
