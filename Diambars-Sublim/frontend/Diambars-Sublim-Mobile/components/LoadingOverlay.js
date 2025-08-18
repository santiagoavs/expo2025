// src/components/LoadingOverlay.js - SPINNER BONITO
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LoadingOverlay = ({ 
  visible, 
  message = 'Cargando...', 
  type = 'default' // 'default', 'login', 'sending', 'verifying', 'updating'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación de rotación continua
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Animación de pulso para el texto
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      spinAnimation.start();
      pulseAnimation.start();

      return () => {
        spinAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getLoadingConfig = () => {
    switch (type) {
      case 'login':
        return {
          icon: 'log-in-outline',
          primaryColor: '#040DBF',
          secondaryColor: '#1F64BF',
          accentColor: '#3B82F6',
          message: message || 'Iniciando sesión...',
        };
      case 'sending':
        return {
          icon: 'paper-plane-outline',
          primaryColor: '#10b981',
          secondaryColor: '#34d399',
          accentColor: '#6ee7b7',
          message: message || 'Enviando código...',
        };
      case 'verifying':
        return {
          icon: 'shield-checkmark-outline',
          primaryColor: '#8b5cf6',
          secondaryColor: '#a78bfa',
          accentColor: '#c4b5fd',
          message: message || 'Verificando código...',
        };
      case 'updating':
        return {
          icon: 'key-outline',
          primaryColor: '#f59e0b',
          secondaryColor: '#fbbf24',
          accentColor: '#fcd34d',
          message: message || 'Actualizando contraseña...',
        };
      default:
        return {
          icon: 'sync-outline',
          primaryColor: '#040DBF',
          secondaryColor: '#1F64BF',
          accentColor: '#3B82F6',
          message: message || 'Cargando...',
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityValue }
        ]}
      >
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Círculos de fondo animados */}
          <View style={styles.circlesContainer}>
            <View style={[styles.circle, styles.circle1, { backgroundColor: config.accentColor + '30' }]} />
            <View style={[styles.circle, styles.circle2, { backgroundColor: config.secondaryColor + '20' }]} />
            <View style={[styles.circle, styles.circle3, { backgroundColor: config.primaryColor + '10' }]} />
          </View>

          {/* Icono giratorio */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: config.primaryColor + '20',
                borderColor: config.primaryColor + '30',
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Ionicons 
              name={config.icon} 
              size={36} 
              color={config.primaryColor} 
            />
          </Animated.View>

          {/* Texto con animación de pulso */}
          <Animated.Text
            style={[
              styles.message,
              {
                color: config.primaryColor,
                opacity: pulseValue,
              },
            ]}
          >
            {config.message}
          </Animated.Text>

          {/* Puntos animados */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: config.secondaryColor,
                    opacity: pulseValue,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  circlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
  },
  circle1: {
    width: 120,
    height: 120,
    top: -20,
    right: -30,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -10,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 20,
    left: -10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#040DBF',
  },
});

export default LoadingOverlay;