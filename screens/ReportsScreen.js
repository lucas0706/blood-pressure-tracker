import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRegistros } from '../services/DatabaseService';
import { calculateStatistics, classifyBloodPressure } from '../utils/HealthUtils';
import { generatePdfReport, exportToCSV } from '../services/PdfService';
import * as Sharing from 'expo-sharing';

export default function ReportsScreen() {
  const [registros, setRegistros] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedPeriod])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);

      let data = await getRegistros(1000);

      // Filtrar por período
      if (selectedPeriod !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (selectedPeriod) {
          case '7days':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30days':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90days':
            startDate.setDate(now.getDate() - 90);
            break;
          default:
            break;
        }

        data = data.filter(
          registro => new Date(registro.fecha_hora) >= startDate
        );
      }

      setRegistros(data);
      setStatistics(calculateStatistics(data));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (registros.length === 0) {
      Alert.alert('Sin datos', 'No hay registros para generar el reporte');
      return;
    }

    try {
      setIsGenerating(true);

      const result = await generatePdfReport(registros, {
        title: 'Reporte de Presión Arterial',
        includeChart: true,
      });

      if (result.success) {
        // Guardar y compartir
        const csvResult = await exportToCSV(registros);

        if (csvResult.success && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(csvResult.filePath, {
            mimeType: 'text/csv',
            dialogTitle: 'Compartir Reporte CSV',
          });
        }

        Alert.alert('Éxito', 'Reporte generado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo generar el reporte');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al generar el reporte: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <Text style={styles.headerSubtitle}>Análisis de tu presión arterial</Text>
      </View>

      {/* Selector de Período */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'all' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('all')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'all' && styles.periodButtonTextActive,
            ]}
          >
            Todo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === '7days' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('7days')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === '7days' && styles.periodButtonTextActive,
            ]}
          >
            7 días
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === '30days' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('30days')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === '30days' && styles.periodButtonTextActive,
            ]}
          >
            30 días
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === '90days' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('90days')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === '90days' && styles.periodButtonTextActive,
            ]}
          >
            90 días
          </Text>
        </TouchableOpacity>
      </View>

      {statistics && (
        <>
          {/* Estadísticas Principales */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Estadísticas Principales</Text>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Sistólica Promedio</Text>
                <Text style={styles.statValue}>{statistics.avgSystolic}</Text>
                <Text style={styles.statUnit}>mmHg</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Diastólica Promedio</Text>
                <Text style={styles.statValue}>{statistics.avgDiastolic}</Text>
                <Text style={styles.statUnit}>mmHg</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Pulso Promedio</Text>
                <Text style={styles.statValue}>{statistics.avgPulse}</Text>
                <Text style={styles.statUnit}>bpm</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Máxima Sistólica</Text>
                <Text style={styles.statValue}>{statistics.maxSystolic}</Text>
                <Text style={styles.statUnit}>mmHg</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Mínima Sistólica</Text>
                <Text style={styles.statValue}>{statistics.minSystolic}</Text>
                <Text style={styles.statUnit}>mmHg</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Registros</Text>
                <Text style={styles.statValue}>{statistics.count}</Text>
                <Text style={styles.statUnit}>registros</Text>
              </View>
            </View>
          </View>

          {/* Distribución de Clasificaciones */}
          <View style={styles.classificationCard}>
            <Text style={styles.classificationTitle}>
              Distribución de Clasificaciones
            </Text>

            <View style={styles.classificationItem}>
              <View style={styles.classificationBar}>
                <View style={styles.classificationLabel}>
                  <Text style={styles.classificationName}>Normal</Text>
                  <Text style={styles.classificationCount}>
                    {statistics.normalCount}
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        statistics.count > 0
                          ? (statistics.normalCount / statistics.count) * 100
                          : 0
                      }%`,
                      backgroundColor: '#34C759',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.classificationItem}>
              <View style={styles.classificationBar}>
                <View style={styles.classificationLabel}>
                  <Text style={styles.classificationName}>Elevado</Text>
                  <Text style={styles.classificationCount}>
                    {statistics.elevatedCount}
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        statistics.count > 0
                          ? (statistics.elevatedCount / statistics.count) * 100
                          : 0
                      }%`,
                      backgroundColor: '#FFCC00',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.classificationItem}>
              <View style={styles.classificationBar}>
                <View style={styles.classificationLabel}>
                  <Text style={styles.classificationName}>Etapa 1</Text>
                  <Text style={styles.classificationCount}>
                    {statistics.stage1Count}
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        statistics.count > 0
                          ? (statistics.stage1Count / statistics.count) * 100
                          : 0
                      }%`,
                      backgroundColor: '#FF9500',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.classificationItem}>
              <View style={styles.classificationBar}>
                <View style={styles.classificationLabel}>
                  <Text style={styles.classificationName}>Etapa 2</Text>
                  <Text style={styles.classificationCount}>
                    {statistics.stage2Count}
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        statistics.count > 0
                          ? (statistics.stage2Count / statistics.count) * 100
                          : 0
                      }%`,
                      backgroundColor: '#FF3B30',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.classificationItem}>
              <View style={styles.classificationBar}>
                <View style={styles.classificationLabel}>
                  <Text style={styles.classificationName}>Crisis</Text>
                  <Text style={styles.classificationCount}>
                    {statistics.crisisCount}
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        statistics.count > 0
                          ? (statistics.crisisCount / statistics.count) * 100
                          : 0
                      }%`,
                      backgroundColor: '#FF3B30',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Botón Generar Reporte */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              isGenerating && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.generateButtonIcon}>📊</Text>
                <Text style={styles.generateButtonText}>Generar Reporte PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statUnit: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  classificationCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  classificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  classificationItem: {
    marginBottom: 15,
  },
  classificationBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classificationLabel: {
    width: 80,
    marginRight: 10,
  },
  classificationName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  classificationCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 20,
  },
});
