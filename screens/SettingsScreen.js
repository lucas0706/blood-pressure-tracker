import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { importFile } from '../services/ImporterService';
import { getRegistrosCount, deleteAllRegistros } from '../services/DatabaseService';
import { getPreferencia, setPreferencia } from '../services/DatabaseService';

export default function SettingsScreen() {
  const [registrosCount, setRegistrosCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [guideline, setGuideline] = useState('AHA_USA');
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
    loadRegistrosCount();
  }, []);

  const loadSettings = async () => {
    try {
      const savedGuideline = await getPreferencia('guideline', 'AHA_USA');
      const savedBiometric = await getPreferencia('biometric_enabled', 'false');

      setGuideline(savedGuideline);
      setBiometricEnabled(savedBiometric === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadRegistrosCount = async () => {
    try {
      const count = await getRegistrosCount();
      setRegistrosCount(count);
    } catch (error) {
      console.error('Error loading registros count:', error);
    }
  };

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'application/vnd.ms-excel',
               'text/html',
               'text/csv',
               'application/x-sqlite3'],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setIsImporting(true);

      // Copiar archivo a directorio temporal
      const tempPath = `${FileSystem.cacheDirectory}${file.name}`;
      await FileSystem.copyAsync({
        from: file.uri,
        to: tempPath,
      });

      // Importar
      const importResult = await importFile(tempPath, file.name);

      if (importResult.success) {
        await loadRegistrosCount();
        Alert.alert(
          'Importación Exitosa',
          `Se importaron ${importResult.imported} registros correctamente.${
            importResult.errors.length > 0
              ? `\n\nErrores: ${importResult.errors.slice(0, 3).join('\n')}`
              : ''
          }`
        );
      } else {
        Alert.alert(
          'Error en Importación',
          importResult.errors.join('\n')
        );
      }

      // Limpiar archivo temporal
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
    } catch (error) {
      Alert.alert('Error', 'Error al importar archivo: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleGuidelineChange = async (newGuideline) => {
    setGuideline(newGuideline);
    await setPreferencia('guideline', newGuideline);
  };

  const handleBiometricToggle = async (value) => {
    setBiometricEnabled(value);
    await setPreferencia('biometric_enabled', value.toString());
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Eliminar Todos los Datos',
      '¿Estás seguro de que deseas eliminar todos los registros? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllRegistros();
              await loadRegistrosCount();
              Alert.alert('Éxito', 'Todos los datos han sido eliminados');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron eliminar los datos');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
      </View>

      {/* Información General */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información General</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total de Registros</Text>
            <Text style={styles.infoValue}>{registrosCount}</Text>
          </View>
        </View>
      </View>

      {/* Guía Clínica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guía Clínica de Referencia</Text>
        <Text style={styles.sectionDescription}>
          Selecciona la guía que deseas usar para clasificar tu presión arterial
        </Text>

        <TouchableOpacity
          style={[
            styles.optionButton,
            guideline === 'AHA_USA' && styles.optionButtonActive,
          ]}
          onPress={() => handleGuidelineChange('AHA_USA')}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>AHA (USA)</Text>
            <Text style={styles.optionDescription}>
              Sistólica ≥ 130 o Diastólica ≥ 80
            </Text>
          </View>
          <View
            style={[
              styles.radioButton,
              guideline === 'AHA_USA' && styles.radioButtonActive,
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            guideline === 'SAHA_ARGENTINA' && styles.optionButtonActive,
          ]}
          onPress={() => handleGuidelineChange('SAHA_ARGENTINA')}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>SAHA (Argentina)</Text>
            <Text style={styles.optionDescription}>
              Sistólica ≥ 140 o Diastólica ≥ 90
            </Text>
          </View>
          <View
            style={[
              styles.radioButton,
              guideline === 'SAHA_ARGENTINA' && styles.radioButtonActive,
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            guideline === 'ESC_EUROPA' && styles.optionButtonActive,
          ]}
          onPress={() => handleGuidelineChange('ESC_EUROPA')}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>ESC (Europa)</Text>
            <Text style={styles.optionDescription}>
              Sistólica ≥ 140 o Diastólica ≥ 90
            </Text>
          </View>
          <View
            style={[
              styles.radioButton,
              guideline === 'ESC_EUROPA' && styles.radioButtonActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Seguridad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>

        <View style={styles.securityCard}>
          <View style={styles.securityItem}>
            <View style={styles.securityContent}>
              <Text style={styles.securityLabel}>Autenticación Biométrica</Text>
              <Text style={styles.securityDescription}>
                Usa Face ID o huella dactilar para acceder a la aplicación
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#ccc', true: '#81C784' }}
              thumbColor={biometricEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Importación de Datos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Importación de Datos</Text>
        <Text style={styles.sectionDescription}>
          Importa registros desde archivos Excel, CSV, HTML o bases de datos SQLite
        </Text>

        <TouchableOpacity
          style={[
            styles.importButton,
            isImporting && styles.importButtonDisabled,
          ]}
          onPress={handleImportFile}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.importButtonIcon}>📁</Text>
              <Text style={styles.importButtonText}>Seleccionar Archivo</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.importInfo}>
          <Text style={styles.importInfoTitle}>Formatos Soportados:</Text>
          <Text style={styles.importInfoItem}>• Excel (.xlsx, .xls)</Text>
          <Text style={styles.importInfoItem}>• CSV (.csv)</Text>
          <Text style={styles.importInfoItem}>• HTML (.html, .htm)</Text>
          <Text style={styles.importInfoItem}>• SQLite (.db, .sqlite)</Text>
        </View>
      </View>

      {/* Peligro */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zona de Peligro</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleDeleteAllData}
        >
          <Text style={styles.dangerButtonIcon}>🗑️</Text>
          <Text style={styles.dangerButtonText}>Eliminar Todos los Datos</Text>
        </TouchableOpacity>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Esta acción eliminará permanentemente todos tus registros de presión
            arterial. Esta acción no se puede deshacer.
          </Text>
        </View>
      </View>

      {/* Información de la App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Blood Pressure Tracker</Text>
          <Text style={styles.aboutVersion}>Versión 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            Aplicación local-first para el seguimiento seguro y privado de tu
            presión arterial. Todos tus datos se almacenan localmente en tu
            dispositivo.
          </Text>

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Características:</Text>
            <Text style={styles.featureItem}>✓ Almacenamiento local seguro</Text>
            <Text style={styles.featureItem}>✓ Clasificación clínica automática</Text>
            <Text style={styles.featureItem}>✓ Reportes y estadísticas</Text>
            <Text style={styles.featureItem}>✓ Importación de datos</Text>
            <Text style={styles.featureItem}>✓ Autenticación biométrica</Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
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
  section: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginLeft: 10,
  },
  radioButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  securityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityContent: {
    flex: 1,
  },
  securityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    color: '#999',
  },
  importButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  importInfo: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  importInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  importInfoItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dangerButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
  aboutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  spacer: {
    height: 20,
  },
});
