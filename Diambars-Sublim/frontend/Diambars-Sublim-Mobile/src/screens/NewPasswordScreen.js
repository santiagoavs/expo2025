// screens/NewPasswordScreen.js - REACT NATIVE VERSION
import React, { useState, useEffect } from 'react';
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

const NewPasswordScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { 
    handleResetPassword,
    isSubmitting,
    error,
    verificationToken
  } = usePasswordRecovery();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Obtener datos del estado de navegación
  const stateEmail = route.params?.email;
  const stateToken = route.params?.verificationToken;
  const fromCodeConfirmation = route.params?.fromCodeConfirmation;
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  // Animaciones
  const logoAnimation = useSharedValue(0);

  useEffect(() => {
    logoAnimation.value = withRepeat(
      withTiming(1, {
        duration: 6000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(logoAnimation.value, [0, 1], [0, -10]);
    const rotate = interpolate(logoAnimation.value, [0, 1], [0, 4]);
    
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    };
  });

  const requirements = [
    { id: 'length', label: 'Al menos 8 caracteres', regex: /.{8,}/ },
    { id: 'lowercase', label: 'Al menos una minúscula', regex: /[a-z]/ },
    { id: 'uppercase', label: 'Al menos una mayúscula', regex: /[A-Z]/ },
    { id: 'number', label: 'Al menos un número', regex: /[0-9]/ },
    { id: 'special', label: 'Al menos un carácter especial', regex: /[!@#$%^&*]/ }
  ];

  const password = watch("password");
  
  // Verificar que tenemos el token de verificación
  useEffect(() => {
    const currentToken = stateToken || verificationToken;
    
    if (!currentToken) {
      console.error('No se encontró token de verificación - Redirigiendo...');
      navigation.navigate('CodeConfirmation', {
        error: 'Debes verificar el código primero',
        email: stateEmail 
      });
      return;
    }

    // Verificar que venimos del flujo correcto
    if (!fromCodeConfirmation && !verificationToken) {
      console.warn('Acceso directo a nueva contraseña sin verificación');
      navigation.navigate('RecoveryPassword', {
        error: 'Debes completar el proceso de verificación' 
      });
      return;
    }
  }, [stateToken, verificationToken, fromCodeConfirmation, stateEmail, navigation]);

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    const metRequirements = requirements.filter(req => 
      req.regex.test(password)
    ).length;
    
    setPasswordStrength((metRequirements / requirements.length) * 100);
  }, [password, requirements]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#dc2626';
    if (passwordStrength <= 50) return '#f59e0b';
    if (passwordStrength <= 75) return '#eab308';
    return '#10b981';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Muy débil';
    if (passwordStrength <= 50) return 'Débil';
    if (passwordStrength <= 75) return 'Media';
    return 'Fuerte';
  };

  const onSubmit = async (data) => {
    const currentToken = stateToken || verificationToken;
    
    if (!currentToken) {
      console.error('No hay token de verificación');
      navigation.navigate('CodeConfirmation', {
        error: 'Token de verificación expirado',
        email: stateEmail 
      });
      return;
    }

    // El hook ya maneja la navegación internamente
    await handleResetPassword(data.password);
  };

  const handleBack = () => {
    navigation.navigate('CodeConfirmation', {
      email: stateEmail,
      fromRecovery: true 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Partículas de fondo animadas */}
      <View style={styles.particlesContainer}>
        {[...Array(10)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.05 + Math.random() * 0.03,
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
                <Text style={styles.formTitle}>Crea tu nueva contraseña</Text>
                <Text style={styles.formDescription}>
                  Tu nueva contraseña debe ser diferente a las anteriores
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
                {/* Campo Nueva Contraseña */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color="#94a3b8" 
                      style={styles.inputIcon} 
                    />
                    <Controller
                      control={control}
                      name="password"
                      rules={{
                        required: 'Este campo es requerido',
                        minLength: {
                          value: 8,
                          message: 'Mínimo 8 caracteres'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                          message: 'Debe incluir mayúscula, minúscula, número y carácter especial'
                        }
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={[
                            styles.input,
                            errors.password && styles.inputError
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                        />
                      )}
                    />
                    <TouchableOpacity
                      style={styles.togglePassword}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#94a3b8" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <View style={styles.fieldError}>
                      <Ionicons name="warning" size={16} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>
                        {errors.password.message}
                      </Text>
                    </View>
                  )}

                  {/* Indicador de fuerza de contraseña */}
                  {password && (
                    <View style={styles.strengthIndicator}>
                      <View style={styles.strengthBar}>
                        <View 
                          style={[
                            styles.strengthFill,
                            {
                              width: `${passwordStrength}%`,
                              backgroundColor: getStrengthColor()
                            }
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                        {getStrengthText()}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Campo Confirmar Contraseña */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color="#94a3b8" 
                      style={styles.inputIcon} 
                    />
                    <Controller
                      control={control}
                      name="confirmPassword"
                      rules={{
                        required: 'Este campo es requerido',
                        validate: value => 
                          value === password || 'Las contraseñas no coinciden'
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={[
                            styles.input,
                            errors.confirmPassword && styles.inputError
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showConfirmPassword}
                        />
                      )}
                    />
                    <TouchableOpacity
                      style={styles.togglePassword}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#94a3b8" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <View style={styles.fieldError}>
                      <Ionicons name="warning" size={16} color="#dc2626" />
                      <Text style={styles.fieldErrorText}>
                        {errors.confirmPassword.message}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Requisitos de contraseña */}
                <View style={styles.requirements}>
                  <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
                  <View style={styles.requirementsList}>
                    {requirements.map((req) => (
                      <View 
                        key={req.id} 
                        style={[
                          styles.requirement,
                          password && req.regex.test(password) && styles.requirementMet
                        ]}
                      >
                        <Ionicons 
                          name="checkmark-circle-outline" 
                          size={18} 
                          color={password && req.regex.test(password) ? "#10b981" : "#94a3b8"}
                        />
                        <Text style={[
                          styles.requirementText,
                          password && req.regex.test(password) && styles.requirementTextMet
                        ]}>
                          {req.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Botón de guardar */}
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
                      <Text style={styles.submitButtonText}>Guardar nueva contraseña</Text>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.formFooter}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Protección avanzada</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Text style={styles.footerText}>
                  Tu contraseña será encriptada con los más altos estándares de seguridad
                </Text>
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
    minHeight: 700,
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
    width: 130,
    height: 130,
    backgroundColor: 'rgba(4, 13, 191, 0.12)',
    borderRadius: 65,
    zIndex: -1,
  },
  logo: {
    width: 110,
    height: 110,
  },
  brandText: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: '#040DBF',
    marginBottom: 5,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#64748b',
    letterSpacing: 5,
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
    fontSize: 19,
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
    paddingRight: 56,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#010326',
  },
  inputError: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(220, 38, 38, 0.02)',
  },
  togglePassword: {
    position: 'absolute',
    right: 16,
    padding: 4,
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
  strengthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F2F2F2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  requirements: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(31, 100, 191, 0.02)',
    borderWidth: 2,
    borderColor: 'rgba(31, 100, 191, 0.1)',
    borderRadius: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 16,
  },
  requirementsList: {
    gap: 10,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementMet: {
    // Estilos adicionales cuando se cumple el requisito
  },
  requirementText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  requirementTextMet: {
    color: '#10b981',
    fontWeight: '600',
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
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
});

export default NewPasswordScreen;