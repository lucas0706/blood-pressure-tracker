import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { calculateStatistics, classifyBloodPressure, formatBloodPressure } from '../utils/HealthUtils';

/**
 * Genera un reporte PDF profesional con tabla, estadísticas y gráfico
 */
export const generatePdfReport = async (registros, options = {}) => {
  try {
    const {
      title = 'Reporte de Presión Arterial',
      includeChart = true,
      dateRange = null,
    } = options;

    // Calcular estadísticas
    const stats = calculateStatistics(registros);

    // Crear contenido HTML
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007AFF;
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .date-generated {
            text-align: right;
            color: #999;
            font-size: 12px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            background-color: #007AFF;
            color: white;
            padding: 12px 15px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-box {
            background-color: #f9f9f9;
            border-left: 4px solid #007AFF;
            padding: 15px;
            border-radius: 4px;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .stat-unit {
            font-size: 12px;
            color: #999;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background-color: #007AFF;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .classification {
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
          .normal { background-color: #34C759; color: white; }
          .elevated { background-color: #FFCC00; color: #333; }
          .stage1 { background-color: #FF9500; color: white; }
          .stage2 { background-color: #FF3B30; color: white; }
          .crisis { background-color: #FF3B30; color: white; }
          .disclaimer {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin-top: 30px;
            font-size: 12px;
            color: #333;
          }
          .disclaimer-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #856404;
          }
          .classification-summary {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .classification-item {
            text-align: center;
            padding: 10px;
            border-radius: 4px;
            background-color: #f9f9f9;
          }
          .classification-count {
            font-size: 20px;
            font-weight: bold;
          }
          .classification-name {
            font-size: 12px;
            color: #666;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 ${title}</h1>
            <p>Reporte Profesional de Presión Arterial</p>
          </div>

          <div class="date-generated">
            Generado: ${new Date().toLocaleString('es-AR')}
          </div>

          <div class="section">
            <div class="section-title">📈 Resumen Estadístico</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Sistólica Promedio</div>
                <div class="stat-value">${stats.avgSystolic}<span class="stat-unit"> mmHg</span></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Diastólica Promedio</div>
                <div class="stat-value">${stats.avgDiastolic}<span class="stat-unit"> mmHg</span></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Pulso Promedio</div>
                <div class="stat-value">${stats.avgPulse}<span class="stat-unit"> bpm</span></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Sistólica Máxima</div>
                <div class="stat-value">${stats.maxSystolic}<span class="stat-unit"> mmHg</span></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Sistólica Mínima</div>
                <div class="stat-value">${stats.minSystolic}<span class="stat-unit"> mmHg</span></div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total de Registros</div>
                <div class="stat-value">${stats.count}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📊 Distribución de Clasificaciones</div>
            <div class="classification-summary">
              <div class="classification-item">
                <div class="classification-count" style="color: #34C759;">${stats.normalCount}</div>
                <div class="classification-name">Normal</div>
              </div>
              <div class="classification-item">
                <div class="classification-count" style="color: #FFCC00;">${stats.elevatedCount}</div>
                <div class="classification-name">Elevado</div>
              </div>
              <div class="classification-item">
                <div class="classification-count" style="color: #FF9500;">${stats.stage1Count}</div>
                <div class="classification-name">Etapa 1</div>
              </div>
              <div class="classification-item">
                <div class="classification-count" style="color: #FF3B30;">${stats.stage2Count}</div>
                <div class="classification-name">Etapa 2</div>
              </div>
              <div class="classification-item">
                <div class="classification-count" style="color: #FF3B30;">${stats.crisisCount}</div>
                <div class="classification-name">Crisis</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📋 Historial de Registros</div>
            <table>
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Presión</th>
                  <th>Pulso</th>
                  <th>Clasificación</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                ${registros.slice(0, 50).map(registro => {
                  const classification = classifyBloodPressure(
                    registro.sistolica,
                    registro.diastolica
                  );
                  const classificationClass = classification.classification
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .replace('ó', 'o');

                  return `
                    <tr>
                      <td>${new Date(registro.fecha_hora).toLocaleString('es-AR')}</td>
                      <td>${formatBloodPressure(registro.sistolica, registro.diastolica)}</td>
                      <td>${registro.pulso || '-'}</td>
                      <td>
                        <span class="classification ${classificationClass}">
                          ${classification.classification}
                        </span>
                      </td>
                      <td>${registro.notas || '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="disclaimer">
            <div class="disclaimer-title">⚠️ AVISO MÉDICO LEGAL</div>
            <p>
              Este reporte es generado automáticamente por la aplicación Blood Pressure Tracker y es
              únicamente para propósitos informativos y de seguimiento personal. No constituye asesoramiento
              médico profesional, diagnóstico o tratamiento.
            </p>
            <p style="margin-top: 10px;">
              <strong>IMPORTANTE:</strong> Si experimenta síntomas de crisis hipertensiva (presión arterial
              muy elevada, dolor de cabeza severo, dificultad para respirar, dolor en el pecho), busque
              atención médica de emergencia inmediatamente.
            </p>
            <p style="margin-top: 10px;">
              Consulte siempre con su médico o profesional de salud calificado para la interpretación
              adecuada de estos datos y para cualquier decisión relacionada con su tratamiento.
            </p>
          </div>

          <div class="footer">
            <p>Blood Pressure Tracker | Aplicación Local-First para Seguimiento de Presión Arterial</p>
            <p style="margin-top: 5px;">© 2024 - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      success: true,
      html: htmlContent,
      fileName: `reporte-presion-${new Date().getTime()}.html`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Guarda y comparte el reporte PDF
 */
export const saveAndShareReport = async (htmlContent, fileName) => {
  try {
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, htmlContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/html',
        dialogTitle: 'Compartir Reporte',
      });
    }

    return {
      success: true,
      filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Exporta datos a CSV
 */
export const exportToCSV = async (registros) => {
  try {
    let csvContent = 'Fecha y Hora,Sistólica,Diastólica,Pulso,Notas\n';

    registros.forEach(registro => {
      const fecha = new Date(registro.fecha_hora).toLocaleString('es-AR');
      const pulso = registro.pulso || '';
      const notas = (registro.notas || '').replace(/,/g, ';');

      csvContent += `"${fecha}",${registro.sistolica},${registro.diastolica},${pulso},"${notas}"\n`;
    });

    const fileName = `presion-arterial-${new Date().getTime()}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);

    return {
      success: true,
      filePath,
      fileName,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
