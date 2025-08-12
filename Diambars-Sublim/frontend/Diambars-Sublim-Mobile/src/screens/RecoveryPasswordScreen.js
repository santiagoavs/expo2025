// screens/RecoveryPasswordScreen.js - REACT NATIVE VERSION
import React, { useEffect } from 'react';
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
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
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

const RecoveryPasswordScreen = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, formState: { errors } } = useForm();
  const {
    isSubmitting,
    error,
    handleRequestCode
  } = usePasswordRecovery();

  // Animaciones
  const logoAnimation = useSharedValue(0);
  const particleAnimation = useSharedValue(0);

  useEffect(() => {
    // Animación del logo
    logoAnimation.value = withRepeat(
      withTiming(1, {
        duration: 5000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Animación de partículas
    particleAnimation.value = withRepeat(
      withTiming(1, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1,
      false
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

  const onSubmit = async (data) => {
    // El hook ya maneja la navegación internamente
    await handleRequestCode(data.email);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
              onPress={navigateToLogin}
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
                <Text style={styles.formTitle}>Recupera tu contraseña</Text>
                <Text style={styles.formDescription}>
                  Introduce tu correo electrónico y te enviaremos un código para restablecer tu contraseña
                </Text>
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
                {/* Campo Email */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color="#94a3b8" 
                      style={styles.inputIcon} 
                    />
                    <Controller
                      control={control}
                      name="email"
                      rules={{
                        required: 'Este campo es requerido',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Email inválido'
                        }
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={[
                            styles.input,
                            errors.email && styles.inputError
                          ]}
                          placeholder="admin@diambars.com"
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      )}
                    />
                  </View>
                  {errors.email && (
                    <View style={styles.fieldError}>
                      <Ionicons name="warning" size={16} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>
                        {errors.email.message}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Botón de envío */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Enviar código</Text>
                      <Ionicons name="paper-plane-outline" size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.formFooter}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>¿Recordaste tu contraseña?</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity 
                  style={styles.backToLogin}
                  onPress={navigateToLogin}
                >
                  <Text style={styles.backToLoginText}>
                    Volver al inicio de sesión
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
    minHeight: 600,
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
    gap: 24,
  },
  formGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
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
  fieldError: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fieldErrorText: {
    marginLeft: 8,
    color: '#dc2626',
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
    shadowOffset: {
      width: 0,
      height: 8,
    },
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
  formFooter: {
    marginTop: 32,
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
  backToLogin: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backToLoginText: {
    color: '#1F64BF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default RecoveryPasswordScreen;