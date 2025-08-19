// src/screens/NewPasswordScreen.js - VERSIÓN SIMPLE

import React, { useState } from 'react';
// Importa React y useState para manejar estados locales del componente

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
// Importa componentes de React Native:
// View → contenedor de UI
// Text → para mostrar texto
// TextInput → campo de entrada
// TouchableOpacity → botón táctil con opacidad
// StyleSheet → para definir estilos
// ScrollView → contenedor scrollable
// StatusBar → para controlar la barra de estado
// ActivityIndicator → spinner de carga
// Alert → para mostrar alertas nativas

import { SafeAreaView } from 'react-native-safe-area-context';
// SafeAreaView evita que el contenido se superponga al notch o barra superior

import { useRoute, useNavigation } from '@react-navigation/native';
// Hooks para navegación y acceso a parámetros de la ruta

import { Ionicons } from '@expo/vector-icons';
// Librería de iconos Ionicons

// ------------------------------
// Componente principal NewPasswordScreen
// ------------------------------
const NewPasswordScreen = () => {
  console.log('[NewPassword] Renderizando pantalla');
  
  const route = useRoute();
  const navigation = useNavigation();
  
  // ------------------------------
  // Obtener datos enviados desde pantalla anterior
  // ------------------------------
  const email = route.params?.email;
  const verificationToken = route.params?.verificationToken;
  const fromCodeConfirmation = route.params?.fromCodeConfirmation;
  
  // ------------------------------
  // Estados locales
  // ------------------------------
  const [password, setPassword] = useState('');                 // Nuevo password
  const [confirmPassword, setConfirmPassword] = useState('');   // Confirmación de password
  const [showPassword, setShowPassword] = useState(false);      // Mostrar/ocultar password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Mostrar/ocultar confirm
  const [isSubmitting, setIsSubmitting] = useState(false);      // Estado de envío
  const [error, setError] = useState('');                       // Mensaje de error

  // ------------------------------
  // Función para validar el formulario
  // ------------------------------
  const validateForm = () => {
    if (!password) {
      setError('La contraseña es requerida');
      return false;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };

  // ------------------------------
  // Función para resetear la contraseña
  // ------------------------------
  const handleResetPassword = async () => {
    console.log('[NewPassword] Iniciando reset de contraseña');
    
    if (!validateForm()) {
      return; // Si el formulario no es válido, no continuar
    }

    setIsSubmitting(true); // Activar spinner
    setError('');          // Limpiar errores previos

    try {
      // Simulación de petición de actualización de contraseña (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('[NewPassword] Contraseña actualizada exitosamente');
      
      // Mostrar alerta nativa de éxito
      Alert.alert(
        '¡Contraseña actualizada!', 
        'Tu contraseña ha sido cambiada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reinicia la navegación y va a Login
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: 'Login', 
                  params: { 
                    message: 'Contraseña actualizada correctamente',
                    type: 'success'
                  }
                }],
              });
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('[NewPassword] Error al actualizar contraseña:', err);
      setError('Error al actualizar contraseña'); // Mostrar error
    } finally {
      setIsSubmitting(false); // Ocultar spinner
    }
  };

  // ------------------------------
  // Función para volver a la pantalla anterior
  // ------------------------------
  const handleBack = () => {
    navigation.goBack();
  };

  // ------------------------------
  // Validación rápida para habilitar botón
  // ------------------------------
  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 6;

  return (
    <SafeAreaView style={styles.container}>
      {/* Configura la barra de estado */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          
          {/* -------------------- */}
          {/* Botón de volver */}
          {/* -------------------- */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color="#1F64BF" />
          </TouchableOpacity>

          {/* -------------------- */}
          {/* Header con logo y título */}
          {/* -------------------- */}
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <Ionicons name="shield-checkmark" size={60} color="#040DBF" />
            </View>
            <Text style={styles.title}>DIAMBARS</Text>
            <Text style={styles.subtitle}>sublimado</Text>
          </View>

          {/* -------------------- */}
          {/* Formulario */}
          {/* -------------------- */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Crea tu nueva contraseña</Text>
            <Text style={styles.formDescription}>
              Tu nueva contraseña debe ser diferente a las anteriores
            </Text>
            
            {/* -------------------- */}
            {/* Mensaje de error */}
            {/* -------------------- */}
            {error && (
              <View style={styles.errorMessage}>
                <Ionicons name="warning" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* -------------------- */}
            {/* Input de nueva contraseña */}
            {/* -------------------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color="#94a3b8" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(text) => {
                    console.log('[NewPassword] Password cambiado');
                    setPassword(text);
                    if (error) setError('');
                  }}
                  secureTextEntry={!showPassword} // Oculta o muestra contraseña
                />
                {/* Botón para mostrar/ocultar password */}
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
            </View>

            {/* -------------------- */}
            {/* Input de confirmación de contraseña */}
            {/* -------------------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color="#94a3b8" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[
                    styles.input,
                    confirmPassword && password !== confirmPassword && styles.inputError
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    console.log('[NewPassword] Confirm password cambiado');
                    setConfirmPassword(text);
                    if (error) setError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
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
              
              {/* -------------------- */}
              {/* Indicador de coincidencia */}
              {/* -------------------- */}
              {confirmPassword && (
                <View style={styles.matchIndicator}>
                  <Ionicons 
                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={password === confirmPassword ? "#10b981" : "#dc2626"} 
                  />
                  <Text style={[
                    styles.matchText,
                    { color: password === confirmPassword ? "#10b981" : "#dc2626" }
                  ]}>
                    {password === confirmPassword ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                  </Text>
                </View>
              )}
            </View>

            {/* -------------------- */}
            {/* Requisitos de contraseña */}
            {/* -------------------- */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Requisitos:</Text>
              <View style={styles.requirement}>
                <Ionicons 
                  name="checkmark-circle-outline" 
                  size={16} 
                  color={password.length >= 6 ? "#10b981" : "#94a3b8"}
                />
                <Text style={[
                  styles.requirementText,
                  password.length >= 6 && styles.requirementTextMet
                ]}>
                  Al menos 6 caracteres
                </Text>
              </View>
            </View>

            {/* -------------------- */}
            {/* Botón de submit */}
            {/* -------------------- */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={!isFormValid || isSubmitting}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --------------------
// Estilos
// --------------------
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
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requirements: {
    padding: 16,
    backgroundColor: 'rgba(31, 100, 191, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.1)',
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

export default NewPasswordScreen;
// Exporta el componente para ser utilizado en la app
