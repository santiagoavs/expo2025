// src/components/LoadingOverlay.js - VERSIÓN SIMPLE PARA DEBUG
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

const LoadingOverlay = ({ 
  visible, 
  message = 'Cargando...', 
  type = 'default'
}) => {
  console.log('🌀 [LoadingOverlay] Renderizando con visible:', visible);
  console.log('🌀 [LoadingOverlay] Message:', message);
  console.log('🌀 [LoadingOverlay] Type:', type);

  if (!visible) {
    console.log('🌀 [LoadingOverlay] No visible, no renderizar modal');
    return null;
  }

  console.log('🌀 [LoadingOverlay] MOSTRANDO MODAL');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator 
            size="large" 
            color="#040DBF" 
          />
          <Text style={styles.message}>
            {message}
          </Text>
          <Text style={styles.debug}>
            ¡SPINNER FUNCIONANDO! 🌀
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040DBF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  debug: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoadingOverlay;