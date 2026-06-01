import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function BiometricLock({ onUnlock }) {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        setIsBiometricAvailable(true);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Huella Dactilar');
        }

        // Intentar autenticar automáticamente
        await authenticate();
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const authenticate = async () => {
    try {
      setIsLoading(true);

      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Autentícate para acceder a tu registro de presión arterial',
      });

      if (result.success) {
        onUnlock();
      } else if (result.error === 'user_cancel') {
        // Usuario canceló, permitir reintentar
      }
    } catch (error) {
      Alert.alert('Error de Autenticación', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔒</Text>
        </View>

        <Text style={styles.title}>Acceso Seguro</Text>
        <Text style={styles.subtitle}>
          {biometricType
            ? `Usa tu ${biometricType} para acceder`
            : 'Autenticación requerida'}
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <>
            {isBiometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={authenticate}
                disabled={isLoading}
              >
                <Text style={styles.biometricButtonText}>
                  {biometricType === 'Face ID' ? '👤' : '👆'} Autenticar
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onUnlock}
            >
              <Text style={styles.skipButtonText}>Omitir por ahora</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Tu información está protegida y almacenada localmente en tu dispositivo.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
  biometricButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  biometricButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    color: '#333',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
