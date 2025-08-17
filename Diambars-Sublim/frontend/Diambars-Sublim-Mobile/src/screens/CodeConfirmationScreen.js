// screens/CodeConfirmationScreen.js - REACT NATIVE VERSION
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing 
} from 'react-native-reanimated';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

const { width, height } = Dimensions.get('window');

const CodeConfirmationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Obtener el email del estado de navegación
  const stateEmail = route.params?.email;
  const fromRecovery = route.params?.fromRecovery;

  const {
    email,
    setEmail,
    code,
    isSubmitting,
    error,
    setError,
    timer,
    canResend,
    handleVerifyCode,
    handleResendCode,
    handleInputChange,
  } = usePasswordRecovery();

  // Referencias para los inputs
  const inputRefs = useRef([]);

  // Animaciones
  const logoAnimation = useSharedValue(0);

  useEffect(() => {
    logoAnimation.value = withRepeat(
      withTiming(1, {
        duration: 5000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(logoAnimation.value, [0, 1], [0, -8]);
    const rotate = interpolate(logoAnimation.value, [0, 1], [0, 3]);
    
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    };
  });

  // Verificar que venimos del flujo correcto
  useEffect(() => {
    if (!stateEmail && !email) {
      console.warn('No hay email disponible, redirigiendo a recovery');
      navigation.navigate('RecoveryPassword', {
        error: 'Debes ingresar tu email primero'
      });
      return;
    }

    if (stateEmail && stateEmail !== email) {
      setEmail(stateEmail);
    }
  }, [stateEmail, email, setEmail, navigation]);

  const onSubmit = async () => {
    // Validar que el código esté completo
    if (code.length !== 6 || code.some(digit => !digit)) {
      setError('Ingresa el código completo');
      return;
    }

    // El hook ya maneja la navegación internamente
    await handleVerifyCode();
  };

  const handleBack = () => {
    if (fromRecovery) {
      navigation.navigate('RecoveryPassword');
    } else {
      navigation.navigate('RecoveryPassword');
    }
  };

  const handleResend = async () => {
    await handleResendCode();
  };

  // Manejar cambio en los inputs de código
  const onCodeChange = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    handleInputChange(index, value);
    
    // Auto enfoque al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar backspace
  const onKeyPress = (index, key) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Partículas de fondo animadas */}
      <View style={styles.particlesContainer}>
        {[...Array(12)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.06 + Math.random() * 0.04,
              }
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card principal */}
          <View style={styles.card}>
            
            {/* Botón de volver */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color="#1F64BF" />
            </TouchableOpacity>

            {/* Sección de branding */}
            <View style={styles.brandSection}>
              <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
                <View style={styles.logoGlow} />
                <Image 
                  source={require('../assets/logo.png')} // Ajusta la ruta
                  style={styles.logo}
                  resizeMode="contain"
                  onError={() => console.log('Logo no encontrado')}
                />
              </Animated.View>
              
              <View style={styles.brandText}>
                <Text style={styles.brandTitle}>DIAMBARS</Text>
                <Text style={styles.brandSubtitle}>sublimado</Text>
              </View>
            </View>

            {/* Sección del formulario */}
            <View style={styles.formSection}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Verifica tu código</Text>
                <Text style={styles.formDescription}>
                  Ingresa el código de 6 dígitos enviado a tu correo
                </Text>
                
                {email && (
                  <View style={styles.emailDisplay}>
                    <Text style={styles.emailText}>{email}</Text>
                  </View>
                )}
              </View>
              
              {/* Error general */}
              {error && (
                <View style={styles.errorMessage}>
                  <Ionicons name="warning" size={20} color="#dc2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Formulario */}
              <View style={styles.form}>
                {/* Inputs de código */}
                <View style={styles.codeInputGroup}>
                  {[...Array(6)].map((_, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => inputRefs.current[index] = ref}
                      style={styles.codeInput}
                      value={code[index] || ''}
                      onChangeText={(value) => onCodeChange(index, value)}
                      onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
                      maxLength={1}
                      keyboardType="numeric"
                      textAlign="center"
                      autoFocus={index === 0}
                      selectTextOnFocus
                    />
                  ))}
                </View>
                
                {/* Botón de verificar */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isSubmitting || code.length !== 6 || code.some(digit => !digit)) && styles.submitButtonDisabled
                  ]}
                  onPress={onSubmit}
                  disabled={isSubmitting || code.length !== 6 || code.some(digit => !digit)}
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
              </View>

              {/* Footer */}
              <View style={styles.formFooter}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>¿No recibiste el código?</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity 
                  style={[
                    styles.resendButton,
                    !canResend && styles.resendButtonDisabled
                  ]}
                  onPress={handleResend}
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
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#1F64BF',
    borderRadius: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#040DBF',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 2,
    position: 'relative',
    minHeight: 650,
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
  brandSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(4, 13, 191, 0.02)',
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(4, 13, 191, 0.12)',
    borderRadius: 60,
    zIndex: -1,
  },
  logo: {
    width: 100,
    height: 100,
  },
  brandText: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#040DBF',
    marginBottom: 5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#64748b',
    letterSpacing: 4,
    fontStyle: 'italic',
  },
  formSection: {
    padding: 40,
  },
  formHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 12,
    textAlign: 'center',
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
    marginTop: 12,
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
    marginBottom: 24,
  },
  errorText: {
    marginLeft: 8,
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 14,
  },
  form: {
    gap: 32,
  },
  codeInputGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 20,
  },
  codeInput: {
    width: 54,
    height: 54,
    borderWidth: 2,
    borderColor: '#F2F2F2',
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#010326',
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
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
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
  formFooter: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F2F2F2',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 20,
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
});

export default CodeConfirmationScreen;