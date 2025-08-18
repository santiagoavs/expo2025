// src/components/CustomAlert.js - ALERTAS BONITAS
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Continuar',
  cancelText = 'Cancelar',
  showCancel = false 
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
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

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: '#10b981',
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          titleColor: '#065f46',
          messageColor: '#047857',
          buttonColor: '#10b981',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: '#ef4444',
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          titleColor: '#991b1b',
          messageColor: '#dc2626',
          buttonColor: '#ef4444',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#f59e0b',
          backgroundColor: '#fffbeb',
          borderColor: '#fed7aa',
          titleColor: '#92400e',
          messageColor: '#d97706',
          buttonColor: '#f59e0b',
        };
      case 'info':
        return {
          icon: 'information-circle',
          iconColor: '#3b82f6',
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          titleColor: '#1e40af',
          messageColor: '#2563eb',
          buttonColor: '#3b82f6',
        };
      default:
        return {
          icon: 'information-circle',
          iconColor: '#040DBF',
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0',
          titleColor: '#010326',
          messageColor: '#64748b',
          buttonColor: '#040DBF',
        };
    }
  };

  const config = getAlertConfig();

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
            styles.alertContainer,
            {
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Icono */}
          <View style={[styles.iconContainer, { backgroundColor: config.iconColor + '20' }]}>
            <Ionicons name={config.icon} size={40} color={config.iconColor} />
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: config.titleColor }]}>
            {title}
          </Text>

          {/* Mensaje */}
          {message && (
            <Text style={[styles.message, { color: config.messageColor }]}>
              {message}
            </Text>
          )}

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            {showCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: config.buttonColor },
                showCancel && styles.confirmButtonWithCancel
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: width - 40,
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '400',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#040DBF',
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmButtonWithCancel: {
    flex: 1.2,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default CustomAlert;