import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { createRegistro, getRegistros } from '../services/DatabaseService';
import { classifyBloodPressure, formatBloodPressure } from '../utils/HealthUtils';

export default function HomeScreen() {
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [pulso, setPulso] = useState('');
  const [notas, setNotas] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRegistro, setLastRegistro] = useState(null);
  const [recentRegistros, setRecentRegistros] = useState([]);

  useEffect(() => {
    loadRecentRegistros();
  }, []);

  const loadRecentRegistros = async () => {
    try {
      const registros = await getRegistros(5);
      setRecentRegistros(registros);
      if (registros.length > 0) {
        setLastRegistro(registros[0]);
      }
    } catch (error) {
      console.error('Error loading registros:', error);
    }
  };

  const handleSubmit = async () => {
    // Validación
    if (!sistolica || !diastolica) {
      Alert.alert('Error', 'Por favor ingresa los valores de presión arterial');
      return;
    }

    const sistolicaNum = parseInt(sistolica);
    const diastolicaNum = parseInt(diastolica);
    const pulsoNum = pulso ? parseInt(pulso) : null;

    if (sistolicaNum <= 0 || diastolicaNum <= 0) {
      Alert.alert('Error', 'Los valores de presión deben ser mayores a 0');
      return;
    }

    if (sistolicaNum > 300 || diastolicaNum > 200) {
      Alert.alert('Error', 'Los valores parecen ser demasiado altos. Verifica los datos.');
      return;
    }

    try {
      setIsLoading(true);

      const registro = await createRegistro(
        sistolicaNum,
        diastolicaNum,
        pulsoNum,
        notas,
        'manual'
      );

      // Limpiar formulario
      setSistolica('');
      setDiastolica('');
      setPulso('');
      setNotas('');

      // Recargar registros recientes
      await loadRecentRegistros();

      // Mostrar clasificación
      const classification = classifyBloodPressure(sistolicaNum, diastolicaNum);
      Alert.alert(
        'Registro Guardado',
        `Presión: ${formatBloodPressure(sistolicaNum, diastolicaNum)}\nClasificación: ${classification.classification}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getClassificationColor = (classification) => {
    return classification.color;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Presión Arterial</Text>
        <Text style={styles.headerSubtitle}>Entrada rápida y segura</Text>
      </View>

      {/* Último Registro */}
      {lastRegistro && (
        <View style={styles.lastRegistroCard}>
          <Text style={styles.lastRegistroLabel}>Último Registro</Text>
          <View style={styles.lastRegistroContent}>
            <Text style={styles.lastRegistroValue}>
              {formatBloodPressure(lastRegistro.sistolica, lastRegistro.diastolica)}
            </Text>
            <Text style={styles.lastRegistroTime}>
              {new Date(lastRegistro.fecha_hora).toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
      )}

      {/* Formulario */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Nuevo Registro</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sistólica</Text>
            <TextInput
              style={styles.input}
              placeholder="120"
              keyboardType="number-pad"
              value={sistolica}
              onChangeText={setSistolica}
              editable={!isLoading}
            />
            <Text style={styles.unit}>mmHg</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diastólica</Text>
            <TextInput
              style={styles.input}
              placeholder="80"
              keyboardType="number-pad"
              value={diastolica}
              onChangeText={setDiastolica}
              editable={!isLoading}
            />
            <Text style={styles.unit}>mmHg</Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pulso (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="72"
              keyboardType="number-pad"
              value={pulso}
              onChangeText={setPulso}
              editable={!isLoading}
            />
            <Text style={styles.unit}>bpm</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notas (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.notasInput]}
            placeholder="Ej: Después de ejercicio, estrés, etc."
            value={notas}
            onChangeText={setNotas}
            multiline
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Guardar Registro</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Registros Recientes */}
      {recentRegistros.length > 0 && (
        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Últimos Registros</Text>

          {recentRegistros.map((registro, index) => {
            const classification = classifyBloodPressure(
              registro.sistolica,
              registro.diastolica
            );

            return (
              <View key={index} style={styles.registroItem}>
                <View style={styles.registroLeft}>
                  <Text style={styles.registroDate}>
                    {new Date(registro.fecha_hora).toLocaleString('es-AR')}
                  </Text>
                  {registro.notas && (
                    <Text style={styles.registroNotes}>{registro.notas}</Text>
                  )}
                </View>

                <View style={styles.registroRight}>
                  <Text
                    style={[
                      styles.registroValue,
                      { color: classification.color },
                    ]}
                  >
                    {formatBloodPressure(registro.sistolica, registro.diastolica)}
                  </Text>
                  <View
                    style={[
                      styles.classificationBadge,
                      { backgroundColor: classification.color },
                    ]}
                  >
                    <Text style={styles.classificationText}>
                      {classification.classification}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

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
  lastRegistroCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lastRegistroLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  lastRegistroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRegistroValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  lastRegistroTime: {
    fontSize: 12,
    color: '#666',
  },
  formCard: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  inputGroup: {
    flex: 1,
  },
  separator: {
    width: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  notasInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  unit: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recentCard: {
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
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  registroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  registroLeft: {
    flex: 1,
  },
  registroDate: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  registroNotes: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  registroRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  registroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  classificationText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  spacer: {
    height: 20,
  },
});
