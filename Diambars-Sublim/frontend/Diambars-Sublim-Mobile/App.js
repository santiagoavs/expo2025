// App.js - CONFIGURACIÓN PRINCIPAL
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';

// Importar pantallas
import LoginScreen from './src/screens/LoginScreen';
import RecoveryPasswordScreen from './src/screens/RecoveryPasswordScreen';
import CodeConfirmationScreen from './src/screens/CodeConfirmationScreen';
import NewPasswordScreen from './src/screens/NewPasswordScreen';
import CatalogManagementScreen from './src/screens/CatalogManagementScreen'; // Tu pantalla principal

const Stack = createStackNavigator();

// Configuración personalizada de Toast
const toastConfig = {
  success: (props) => (
    <Toast.BaseToast
      {...props}
      style={{
        borderLeftColor: '#10b981',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        backgroundColor: '#ffffff',
        shadowColor: '#10b981',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        flex: 1,
        justifyContent: 'center',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#010326',
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
        lineHeight: 18,
      }}
    />
  ),
  error: (props) => (
    <Toast.ErrorToast
      {...props}
      style={{
        borderLeftColor: '#dc2626',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        backgroundColor: '#ffffff',
        shadowColor: '#dc2626',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        flex: 1,
        justifyContent: 'center',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#010326',
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
        lineHeight: 18,
      }}
    />
  ),
  info: (props) => (
    <Toast.BaseToast
      {...props}
      style={{
        borderLeftColor: '#040DBF',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        backgroundColor: '#ffffff',
        shadowColor: '#040DBF',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        flex: 1,
        justifyContent: 'center',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#010326',
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
        lineHeight: 18,
      }}
    />
  ),
};

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión'
        }}
      />
      <Stack.Screen 
        name="RecoveryPassword" 
        component={RecoveryPasswordScreen}
        options={{
          title: 'Recuperar Contraseña'
        }}
      />
      <Stack.Screen 
        name="CodeConfirmation" 
        component={CodeConfirmationScreen}
        options={{
          title: 'Verificar Código'
        }}
      />
      <Stack.Screen 
        name="NewPassword" 
        component={NewPasswordScreen}
        options={{
          title: 'Nueva Contraseña'
        }}
      />
      <Stack.Screen 
        name="CatalogManagement" 
        component={CatalogManagementScreen}
        options={{
          title: 'Panel Administrativo'
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <AuthStack />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </AuthProvider>
  );
}

// =========================================

// src/context/AuthContext.js - CONTEXTO DE AUTENTICACIÓN
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/authService'; // Tu servicio de API

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un usuario almacenado al iniciar
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[AuthContext-RN] Attempting login for:', credentials.email);
      
      // Llamar a tu API de login
      const response = await loginUser(credentials);
      
      const { user, token } = response;
      
      // Verificar permisos (igual que en web)
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      if (!hasValidType && !hasValidRole) {
        throw new Error('Se requiere una cuenta de empleado para acceder al panel administrativo');
      }

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('[AuthContext-RN] Login successful');
      return user;
      
    } catch (error) {
      console.error('[AuthContext-RN] Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('recoveryToken');
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('[AuthContext-RN] Logout successful');
    } catch (error) {
      console.error('[AuthContext-RN] Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =========================================

// src/api/authService.js - SERVICIOS DE API
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:4000/api'; // Cambia por tu URL de API

// Función helper para hacer requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed [${endpoint}]:`, error);
    throw error;
  }
};

// Login de usuario
export const loginUser = async (credentials) => {
  console.log('[authService-RN] Login request for:', credentials.email);
  
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Solicitar código de recuperación
export const requestRecoveryCode = async (email) => {
  console.log('[authService-RN] Requesting recovery code for:', email);
  
  return await apiRequest('/auth/request-recovery', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// Verificar código de recuperación
export const verifyRecoveryCode = async (email, code) => {
  console.log('[authService-RN] Verifying recovery code for:', email);
  
  return await apiRequest('/auth/verify-recovery', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
};

// Resetear contraseña
export const resetPassword = async (data) => {
  console.log('[authService-RN] Resetting password');
  
  return await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};