import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRegistros, deleteRegistro } from '../services/DatabaseService';
import { classifyBloodPressure, formatBloodPressure } from '../utils/HealthUtils';

export default function HistoryScreen() {
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadRegistros();
    }, [])
  );

  const loadRegistros = async () => {
    try {
      setIsLoading(true);
      const data = await getRegistros(500);
      setRegistros(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los registros');
      console.error('Error loading registros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadRegistros();
    setIsRefreshing(false);
  };

  const handleDeleteRegistro = (id) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Estás seguro de que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRegistro(id);
              await loadRegistros();
              Alert.alert('Éxito', 'Registro eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el registro');
            }
          },
        },
      ]
    );
  };

  const getFilteredRegistros = () => {
    if (selectedFilter === 'all') return registros;

    return registros.filter(registro => {
      const classification = classifyBloodPressure(
        registro.sistolica,
        registro.diastolica
      );
      return classification.level.toString() === selectedFilter;
    });
  };

  const filteredRegistros = getFilteredRegistros();

  const renderRegistroItem = ({ item }) => {
    const classification = classifyBloodPressure(item.sistolica, item.diastolica);
    const fecha = new Date(item.fecha_hora);

    return (
      <TouchableOpacity
        style={styles.registroCard}
        onLongPress={() => handleDeleteRegistro(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.date}>
              {fecha.toLocaleDateString('es-AR')}
            </Text>
            <Text style={styles.time}>
              {fecha.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.rightContainer}>
            <Text
              style={[
                styles.pressureValue,
                { color: classification.color },
              ]}
            >
              {formatBloodPressure(item.sistolica, item.diastolica)}
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

        {(item.pulso || item.notas) && (
          <View style={styles.cardFooter}>
            {item.pulso && (
              <Text style={styles.pulsoText}>💓 {item.pulso} bpm</Text>
            )}
            {item.notas && (
              <Text style={styles.notasText} numberOfLines={2}>
                {item.notas}
              </Text>
            )}
          </View>
        )}

        <Text style={styles.deleteHint}>Mantén presionado para eliminar</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>Sin Registros</Text>
      <Text style={styles.emptyStateText}>
        Comienza a registrar tu presión arterial en la pestaña de Registro
      </Text>
    </View>
  );

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSubtitle}>
          {filteredRegistros.length} registros
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === '0' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('0')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === '0' && styles.filterButtonTextActive,
            ]}
          >
            Normal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === '1' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('1')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === '1' && styles.filterButtonTextActive,
            ]}
          >
            Elevado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === '2' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('2')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === '2' && styles.filterButtonTextActive,
            ]}
          >
            Etapa 1
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedFilter === '3' || selectedFilter === '4') &&
              styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('3')}
        >
          <Text
            style={[
              styles.filterButtonText,
              (selectedFilter === '3' || selectedFilter === '4') &&
                styles.filterButtonTextActive,
            ]}
          >
            Crítico
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRegistros}
        renderItem={renderRegistroItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  registroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeContainer: {
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  pressureValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  classificationText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  pulsoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notasText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  deleteHint: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
