// src/screens/LoginScreen.js - CON ALERTAS BONITAS Y SPINNER DE NAVEGACIÓN

import React from 'react';
// Importa React para definir componentes funcionales

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image
} from 'react-native';
// Importa componentes básicos de React Native:
// View → contenedor de UI
// Text → para mostrar texto
// TextInput → campo de entrada de texto
// TouchableOpacity → botón táctil con opacidad
// StyleSheet → para estilos
// ScrollView → contenedor scrollable
// StatusBar → para controlar la barra de estado del dispositivo

import { SafeAreaView } from 'react-native-safe-area-context';
// SafeAreaView asegura que el contenido no se sobreponga con notch o barra superior

import { useNavigation } from '@react-navigation/native';
// Hook para navegación entre pantallas

import { Ionicons } from '@expo/vector-icons';
// Librería de iconos Ionicons

import { Controller } from 'react-hook-form';
// Controller permite conectar inputs de React Native con react-hook-form

import { useLogin } from '../hooks/useLogin';
// Hook personalizado que maneja la lógica de login, validaciones y estados

import CustomAlert from '../components/CustomAlert';
// Componente de alerta personalizada

import LoadingOverlay from '../components/LoadingOverlay';
// Componente de overlay de carga (spinner/overlay)

// ------------------------------
// Componente principal LoginScreen
// ------------------------------
const LoginScreen = () => {
  console.log("[LoginScreen] Renderizando pantalla con alertas bonitas");

  const navigation = useNavigation();
  // Hook de navegación para cambiar de pantalla

  // 🔥 Hook useLogin
  const { 
    control,             // Controlador de react-hook-form para inputs
    handleSubmit,        // Función para enviar formulario
    onSubmit,            // Función personalizada que maneja el envío
    errors,              // Objeto que contiene errores de validación
    isSubmitting,        // Booleano, indica si el formulario está enviando
    validateEmail,       // Función para validar correo electrónico
    validatePassword,    // Función para validar contraseña
    showAlert,           // Booleano, indica si mostrar alerta bonita
    showLoading,         // Booleano, indica si mostrar overlay de carga
    alertConfig,         // Configuración de alerta: type, title, message, onConfirm
    setShowAlert,        // Función para controlar visibilidad de alerta
    showLoadingOverlay   // Función para mostrar u ocultar overlay de carga manualmente
  } = useLogin();

  // 🔍 Logs de depuración
  console.log('🔍 [LoginScreen] Estados actuales:', {
    showAlert,
    showLoading,
    isSubmitting,
    errorsCount: Object.keys(errors).length
  });

  // ------------------------------
  // Función para navegar a RecoveryPassword con spinner
  // ------------------------------
  const handleRecoveryPress = () => {
    console.log('[LoginScreen] Navegando a RecoveryPassword con spinner...');
    
    // Muestra overlay de carga
    showLoadingOverlay(true);
    
    // Espera 1 segundo antes de navegar
    setTimeout(() => {
      navigation.navigate('RecoveryPassword');
      
      // Oculta overlay después de 300ms
      setTimeout(() => {
        showLoadingOverlay(false);
      }, 300);
    }, 1000);
  };

  console.log("[LoginScreen] Renderizando UI");

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de estado */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          
          {/* -------------------- */}
          {/* Header - Logo y título */}
          {/* -------------------- */}
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <Image 
                source={require('../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>DIAMBARS</Text>
            <Text style={styles.subtitle}>Acceso Administrativo</Text>
          </View>

          {/* -------------------- */}
          {/* Formulario */}
          {/* -------------------- */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
            {/* -------------------- */}
            {/* Input de Email */}
            {/* -------------------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Controller
                control={control}  // Conecta input con react-hook-form
                name="email"       // Nombre del campo
                rules={{ validate: validateEmail }} // Validación personalizada
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      errors.email && styles.inputError
                    ]}
                    placeholder="admin@diambars.com"
                    value={value}              // Valor actual del input
                    onChangeText={(text) => {
                      console.log('[LoginScreen] Email cambiado:', text);
                      onChange(text);          // Actualiza el valor en react-hook-form
                    }}
                    onBlur={onBlur}            // Maneja pérdida de foco
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}   // Deshabilita input mientras envía
                  />
                )}
              />
              {/* Mensaje de error */}
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* -------------------- */}
            {/* Input de Contraseña */}
            {/* -------------------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <Controller
                control={control}
                name="password"
                rules={{ validate: validatePassword }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      errors.password && styles.inputError
                    ]}
                    placeholder="••••••••"
                    value={value}
                    onChangeText={(text) => {
                      console.log('[LoginScreen] Password cambiado');
                      onChange(text);
                    }}
                    onBlur={onBlur}
                    secureTextEntry  // Oculta el texto ingresado
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* -------------------- */}
            {/* Error global del formulario */}
            {/* -------------------- */}
            {errors.root && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{errors.root.message}</Text>
              </View>
            )}

            {/* -------------------- */}
            {/* Link de recuperación de contraseña */}
            {/* -------------------- */}
            <TouchableOpacity onPress={handleRecoveryPress} disabled={isSubmitting || showLoading}>
              <Text style={[
                styles.recoveryText, 
                (isSubmitting || showLoading) && styles.disabledText
              ]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* -------------------- */}
            {/* Botón de Login */}
            {/* -------------------- */}
            <TouchableOpacity
              style={[
                styles.loginButton, 
                (isSubmitting || showLoading) && styles.loginButtonDisabled
              ]}
              onPress={handleSubmit(onSubmit)}  // Envía formulario
              disabled={isSubmitting || showLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {isSubmitting ? (
                  <>
                    {/* Spinner pequeño mientras se envía */}
                    <View style={styles.loadingDot} />
                    <Text style={styles.loginButtonText}>Iniciando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* -------------------- */}
      {/* ALERTA BONITA */}
      {/* -------------------- */}
      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}         // Tipo de alerta (error, success)
        title={alertConfig.title}       // Título de alerta
        message={alertConfig.message}   // Mensaje de alerta
        onConfirm={alertConfig.onConfirm} // Acción al confirmar
        confirmText="Continuar"
      />

      {/* -------------------- */}
      {/* LOADING OVERLAY */}
      {/* -------------------- */}
      {console.log('🌀 [LoginScreen] Punto antes de LoadingOverlay, showLoading:', showLoading)}
      <LoadingOverlay
        visible={showLoading}            // Muestra/oculta overlay
        type="login"                     // Tipo de loading (login, general)
        message={showLoading ? (isSubmitting ? "Verificando credenciales..." : "Cargando...") : ""}
      />
    </SafeAreaView>
  );
};

// --------------------
// Estilos del componente
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
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#040DBF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#010326',
    textAlign: 'center',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    gap: 8,
  },
  disabledText: {
    opacity: 0.5,
  },
  recoveryText: {
    color: '#040DBF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 8,
  },
  loginButton: {
    backgroundColor: '#040DBF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
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

export default LoginScreen;
// Exporta el componente para que pueda ser usado en la app
