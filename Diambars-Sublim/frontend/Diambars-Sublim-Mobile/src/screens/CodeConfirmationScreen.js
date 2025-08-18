// src/screens/CodeConfirmationScreen.js - VERSIÓN SIMPLE (4 DÍGITOS)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CodeConfirmationScreen = () => {
  console.log('[CodeConfirmation] Renderizando pantalla');
  
  const route = useRoute();
  const navigation = useNavigation();
  
  // Obtener el email del estado de navegación
  const email = route.params?.email || '';
  const fromRecovery = route.params?.fromRecovery;

  const [code, setCode] = useState(['', '', '', '']); // 4 dígitos
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Referencias para los inputs
  const inputRefs = useRef([]);

  useEffect(() => {
    startTimer();
  }, []);

  const startTimer = () => {
    setCanResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async () => {
    console.log('[CodeConfirmation] Verificando código:', code);
    
    const completeCode = code.join('');
    if (completeCode.length !== 4) {
      setError('Ingresa el código completo de 4 dígitos');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simular verificación de código
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('[CodeConfirmation] Código verificado exitosamente');
      
      Alert.alert(
        '¡Código verificado!', 
        'Ahora puedes crear una nueva contraseña',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('NewPassword', {
                email,
                verificationToken: 'fake-token-123',
                fromCodeConfirmation: true
              });
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('[CodeConfirmation] Error al verificar código:', err);
      setError('Código inválido o expirado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    console.log('[CodeConfirmation] Reenviando código para:', email);
    
    if (!email) {
      setError('No se puede reenviar sin email');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simular reenvío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu correo');
      startTimer();
      // Limpiar código actual
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('[CodeConfirmation] Error al reenviar código:', error);
      setError('Error al reenviar el correo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Manejar cambio en los inputs de código
  const onCodeChange = (index, value) => {
    console.log(`[CodeConfirmation] Input ${index} cambió a:`, value);
    
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    console.log('[CodeConfirmation] Nuevo código:', newCode);
    
    // Limpiar error si existe
    if (error) setError('');
    
    // Auto enfoque al siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar tecla presionada (para backspace)
  const onKeyPress = (index, key) => {
    console.log(`[CodeConfirmation] Tecla presionada en input ${index}:`, key);
    
    if (key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Si el campo actual está vacío y presiona backspace, ir al anterior
        inputRefs.current[index - 1]?.focus();
      } else {
        // Si el campo tiene contenido, borrarlo
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  // Función para borrar todo el código
  const clearCode = () => {
    setCode(['', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const isCodeComplete = code.every(digit => digit !== '');

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
              <Ionicons name="key" size={60} color="#040DBF" />
            </View>
            <Text style={styles.title}>DIAMBARS</Text>
            <Text style={styles.subtitle}>sublimado</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Verifica tu código</Text>
            <Text style={styles.formDescription}>
              Ingresa el código de 4 dígitos enviado a tu correo
            </Text>
            
            {email && (
              <View style={styles.emailDisplay}>
                <Text style={styles.emailText}>{email}</Text>
              </View>
            )}
            
            {/* Error general */}
            {error && (
              <View style={styles.errorMessage}>
                <Ionicons name="warning" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Code Inputs */}
            <View style={styles.codeInputGroup}>
              {[...Array(4)].map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputRefs.current[index] = ref}
                  style={[
                    styles.codeInput,
                    code[index] && styles.codeInputFilled,
                    error && !isCodeComplete && styles.codeInputError
                  ]}
                  value={code[index] || ''}
                  onChangeText={(value) => onCodeChange(index, value)}
                  onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  autoFocus={index === 0}
                  selectTextOnFocus
                  placeholder="•"
                  placeholderTextColor="#94a3b8"
                />
              ))}
            </View>

            {/* Botón para limpiar código */}
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearCode}
            >
              <Ionicons name="refresh" size={16} color="#64748b" />
              <Text style={styles.clearButtonText}>Limpiar código</Text>
            </TouchableOpacity>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isCodeComplete || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleVerifyCode}
              disabled={!isCodeComplete || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Verificar código</Text>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>¿No recibiste el código?</Text>
              <TouchableOpacity 
                style={[
                  styles.resendButton,
                  !canResend && styles.resendButtonDisabled
                ]}
                onPress={handleResendCode}
                disabled={!canResend || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#1F64BF" />
                ) : (
                  <Ionicons name="paper-plane-outline" size={16} color={canResend ? "#1F64BF" : "#94a3b8"} />
                )}
                <Text style={[
                  styles.resendButtonText,
                  !canResend && styles.resendButtonTextDisabled
                ]}>
                  {canResend ? 'Reenviar código' : `Reenviar en ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Debug Info */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Debug Info:</Text>
              <Text style={styles.debugText}>Código: [{code.join(', ')}]</Text>
              <Text style={styles.debugText}>Completo: {isCodeComplete ? 'Sí' : 'No'}</Text>
              <Text style={styles.debugText}>Email: {email}</Text>
            </View>

          </View>
        </View>
      </ScrollView>
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
  emailDisplay: {
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(31, 100, 191, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040DBF',
    textAlign: 'center',
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
  codeInputGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#F2F2F2',
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#010326',
  },
  codeInputFilled: {
    borderColor: '#040DBF',
    backgroundColor: 'rgba(4, 13, 191, 0.05)',
  },
  codeInputError: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(220, 38, 38, 0.02)',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  clearButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#040DBF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
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
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  resendText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(31, 100, 191, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  resendButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F64BF',
  },
  resendButtonTextDisabled: {
    color: '#94a3b8',
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

export default CodeConfirmationScreen;