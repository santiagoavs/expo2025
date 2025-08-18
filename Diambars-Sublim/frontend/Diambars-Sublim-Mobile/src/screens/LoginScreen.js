// src/screens/LoginScreen.js - CONECTADO AL BACKEND
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form'; // 👈 NUEVA IMPORTACIÓN
import { useLogin } from '../hooks/useLogin'; // 👈 NUEVA IMPORTACIÓN

const LoginScreen = () => {
  console.log("[LoginScreen] Renderizando pantalla con backend");
  
  const navigation = useNavigation();
  
  // 🔥 USAR EL HOOK CONECTADO AL BACKEND
  const { 
    control, 
    handleSubmit, 
    onSubmit, 
    errors, 
    isSubmitting, 
    validateEmail, 
    validatePassword 
  } = useLogin();

  const handleRecoveryPress = () => {
    console.log('[LoginScreen] Navegando a RecoveryPassword');
    navigation.navigate('RecoveryPassword');
  };

  console.log("[LoginScreen] Renderizando UI");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          
          {/* Header - IGUAL QUE ANTES */}
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <Ionicons name="diamond" size={60} color="#040DBF" />
            </View>
            <Text style={styles.title}>DIAMBARS</Text>
            <Text style={styles.subtitle}>Acceso Administrativo</Text>
          </View>

          {/* Form - CONECTADO AL HOOK */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
            {/* Email Input - CON REACT HOOK FORM */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Controller
                control={control}
                name="email"
                rules={{ validate: validateEmail }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      errors.email && styles.inputError
                    ]}
                    placeholder="admin@diambars.com"
                    value={value}
                    onChangeText={(text) => {
                      console.log('[LoginScreen] Email cambiado:', text);
                      onChange(text);
                    }}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password Input - CON REACT HOOK FORM */}
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
                    secureTextEntry
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Error del formulario */}
            {errors.root && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.root.message}</Text>
              </View>
            )}

            {/* Recovery Link - IGUAL QUE ANTES */}
            <TouchableOpacity onPress={handleRecoveryPress} disabled={isSubmitting}>
              <Text style={[styles.recoveryText, isSubmitting && styles.disabledText]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button - CONECTADO AL BACKEND */}
            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              onPress={handleSubmit(onSubmit)} // 👈 USAR FUNCIÓN DEL HOOK
              disabled={isSubmitting}
            >
              <Text style={styles.loginButtonText}>
                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Debug Info - ACTUALIZADO */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Debug Info (Backend conectado):</Text>
              <Text style={styles.debugText}>Estado: {isSubmitting ? 'Enviando...' : 'Listo'}</Text>
              <Text style={styles.debugText}>Errores: {Object.keys(errors).length}</Text>
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
  // 👈 NUEVOS ESTILOS PARA ERRORES
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
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
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
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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