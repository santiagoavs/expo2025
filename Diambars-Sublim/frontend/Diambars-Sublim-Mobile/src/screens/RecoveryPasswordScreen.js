// src/screens/RecoveryPasswordScreen.js - CON ALERTAS BONITAS
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';
import CustomAlert from '../components/CustomAlert'; // 👈 NUEVA IMPORTACIÓN
import LoadingOverlay from '../components/LoadingOverlay'; // 👈 NUEVA IMPORTACIÓN

const RecoveryPasswordScreen = () => {
  console.log('[RecoveryScreen] Renderizando pantalla con alertas bonitas');
  
  const navigation = useNavigation();
  
  // 🔥 HOOK CON ALERTAS BONITAS
  const { 
    email, 
    setEmail, 
    isSubmitting, 
    error, 
    setError,
    handleRequestCode,
    // Nuevos estados para alertas bonitas
    showAlert,
    showLoading,
    alertConfig,
    setShowAlert
  } = usePasswordRecovery();

  const validateEmail = (emailValue) => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return false;
    }
    return true;
  };

  // 🔥 FUNCIÓN QUE LLAMA AL BACKEND CON ALERTAS BONITAS
  const handleSubmit = async () => {
    console.log('[RecoveryScreen] Llamando al backend para:', email);
    
    if (!validateEmail(email)) {
      setError('Ingresa un correo válido');
      return;
    }

    // Llamar a la función del hook que conecta al backend
    await handleRequestCode(email);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          
          {/* Botón de volver */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color="#1F64BF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <Ionicons name="diamond" size={60} color="#040DBF" />
            </View>
            <Text style={styles.title}>DIAMBARS</Text>
            <Text style={styles.subtitle}>sublimado</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Recupera tu contraseña</Text>
            <Text style={styles.formDescription}>
              Introduce tu correo electrónico y te enviaremos un código para restablecer tu contraseña
            </Text>
            
            {/* Error general - CONECTADO AL HOOK */}
            {error && (
              <View style={styles.errorMessage}>
                <Ionicons name="warning" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Email Input - CONECTADO AL HOOK */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#94a3b8" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[
                    styles.input,
                    error && !validateEmail(email) && styles.inputError
                  ]}
                  placeholder="admin@diambars.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(text) => {
                    console.log('[RecoveryScreen] Email cambiado:', text);
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Submit Button - CON EFECTOS BONITOS */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!email || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!email || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.submitButtonText}>Enviando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="paper-plane-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Enviar código</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Recordaste tu contraseña?</Text>
              <TouchableOpacity 
                style={styles.backToLogin}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginText}>
                  Volver al inicio de sesión
                </Text>
              </TouchableOpacity>
            </View>

            {/* Debug Info - CON ALERTAS BONITAS */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>🚀 Backend conectado con alertas bonitas</Text>
              <Text style={styles.debugText}>Email: {email}</Text>
              <Text style={styles.debugText}>Valid: {validateEmail(email) ? 'Sí' : 'No'}</Text>
              <Text style={styles.debugText}>Status: {isSubmitting ? 'Enviando...' : 'Listo'}</Text>
            </View>

          </View>
        </View>
      </ScrollView>

      {/* 🎨 ALERTA BONITA */}
      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        confirmText="Continuar"
      />

      {/* 🎨 LOADING BONITO */}
      <LoadingOverlay
        visible={showLoading}
        type="sending"
        message="Enviando código de recuperación..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(31, 100, 191, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(4, 13, 191, 0.1)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#040DBF',
    marginBottom: 4,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '300',
    letterSpacing: 4,
    fontStyle: 'italic',
  },
  form: {
    gap: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
    textAlign: 'center',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderWidth: 2,
    borderColor: '#f87171',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#F2F2F2',
    borderRadius: 16,
    paddingLeft: 50,
    paddingRight: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#010326',
  },
  inputError: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(220, 38, 38, 0.02)',
  },
  submitButton: {
    backgroundColor: '#040DBF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  backToLogin: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backToLoginText: {
    color: '#1F64BF',
    fontSize: 14,
    fontWeight: '500',
  },
  debugInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'monospace',
  },
});

export default RecoveryPasswordScreen;