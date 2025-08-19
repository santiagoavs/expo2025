// src/screens/CodeConfirmationScreen.js - 6 DÍGITOS RESPONSIVE
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';
import CustomAlert from '../components/CustomAlert';
import LoadingOverlay from '../components/LoadingOverlay';

const { width, height } = Dimensions.get('window');

const CodeConfirmationScreen = () => {
  console.log('[CodeConfirmation] Renderizando pantalla de verificación');
  
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};
  
  // Referencias para los inputs
  const inputRefs = useRef([]);
  
  // 🔥 HOOK CON ALERTAS BONITAS
  const { 
    code,
    setCode,
    isSubmitting, 
    error, 
    setError,
    timer,
    canResend,
    handleVerifyCode,
    handleResendCode,
    handleGoBack,
    // Nuevos estados para alertas bonitas
    showAlert,
    showLoading,
    alertConfig,
    setShowAlert
  } = usePasswordRecovery();

  // Auto-enfoque al primer input
  useEffect(() => {
    if (inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 300);
    }
  }, []);

  // Manejo de cambio de input
  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Solo números
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(''); // Limpiar error al escribir
    
    // Auto-enfoque al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejo de tecla backspace
  const handleKeyPress = (index, { nativeEvent }) => {
    if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verificar código
  const handleSubmit = async () => {
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      setError('Ingresa los 6 dígitos del código');
      return;
    }
    
    await handleVerifyCode();
  };

  // Limpiar código
  const handleClearCode = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const isCodeComplete = code.join('').length === 6;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            
            {/* Botón de volver */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
              disabled={isSubmitting}
            >
              <Ionicons name="arrow-back" size={20} color="#1F64BF" />
            </TouchableOpacity>

            {/* Header compacto */}
            <View style={styles.header}>
              <View style={styles.logoPlaceholder}>
                <Ionicons name="key" size={48} color="#040DBF" />
              </View>
              <Text style={styles.title}>DIAMBARS</Text>
              <Text style={styles.subtitle}>sublimado</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.formTitle}>Verifica tu código</Text>
              <Text style={styles.formDescription}>
                Ingresa el código de 6 dígitos enviado a tu correo
              </Text>
              
              {/* Email display */}
              {email && (
                <View style={styles.emailContainer}>
                  <Ionicons name="mail" size={16} color="#040DBF" />
                  <Text style={styles.emailText}>{email}</Text>
                </View>
              )}
              
              {/* Error message */}
              {error && (
                <View style={styles.errorMessage}>
                  <Ionicons name="warning" size={18} color="#dc2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Code inputs - 6 dígitos */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => inputRefs.current[index] = ref}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      error && styles.codeInputError
                    ]}
                    value={digit}
                    onChangeText={(value) => handleInputChange(index, value)}
                    onKeyPress={(e) => handleKeyPress(index, e)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    selectionColor="#040DBF"
                    editable={!isSubmitting}
                  />
                ))}
              </View>

              {/* Botón limpiar código */}
              {code.some(digit => digit) && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={handleClearCode}
                  disabled={isSubmitting}
                >
                  <Ionicons name="refresh" size={16} color="#64748b" />
                  <Text style={styles.clearButtonText}>Limpiar código</Text>
                </TouchableOpacity>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (!isCodeComplete || isSubmitting) && styles.verifyButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!isCodeComplete || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.verifyButtonText}>Verificando...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                    <Text style={styles.verifyButtonText}>Verificar código</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Timer y reenvío */}
              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Reenviar código en {timer}s
                  </Text>
                ) : (
                  <TouchableOpacity 
                    style={styles.resendButton}
                    onPress={handleResendCode}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="paper-plane" size={16} color="#040DBF" />
                    <Text style={styles.resendButtonText}>Reenviar código</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Debug Info */}
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>🔑 Verificación de código</Text>
                <Text style={styles.debugText}>Código: {code.join('')}</Text>
                <Text style={styles.debugText}>Completo: {isCodeComplete ? 'Sí' : 'No'}</Text>
                <Text style={styles.debugText}>Timer: {timer}s</Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
        type="verifying"
        message="Verificando código..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    minHeight: height - 100,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(31, 100, 191, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 30,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(4, 13, 191, 0.1)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#040DBF',
    marginBottom: 2,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '300',
    letterSpacing: 3,
    fontStyle: 'italic',
  },
  form: {
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
    textAlign: 'center',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 13, 191, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#040DBF',
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 13,
    flex: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  codeInput: {
    width: (width - 120) / 6, // Responsive width
    maxWidth: 50,
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#010326',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: '#040DBF',
    backgroundColor: 'rgba(4, 13, 191, 0.05)',
  },
  codeInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#040DBF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  timerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#040DBF',
    fontSize: 14,
    fontWeight: '600',
  },
  debugInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'monospace',
  },
});

export default CodeConfirmationScreen;