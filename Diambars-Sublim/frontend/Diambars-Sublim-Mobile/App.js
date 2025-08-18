// App.js - VERSIÓN SIMPLE SIN ERRORES
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RecoveryPasswordScreen from './src/screens/RecoveryPasswordScreen';
import CodeConfirmationScreen from './src/screens/CodeConfirmationScreen';
import NewPasswordScreen from './src/screens/NewPasswordScreen';
import CatalogManagementScreen from './src/screens/CatalogManagementScreen';

const Stack = createStackNavigator();

export default function App() {
  console.log('[App] Inicializando aplicación con SplashScreen simple');
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
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
                duration: 250,
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
        {/* SPLASH SCREEN SIMPLE */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{
            title: 'Cargando',
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />

        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            title: 'Iniciar Sesión',
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />
        <Stack.Screen 
          name="RecoveryPassword" 
          component={RecoveryPasswordScreen}
          options={{
            title: 'Recuperar Contraseña',
          }}
        />
        <Stack.Screen 
          name="CodeConfirmation" 
          component={CodeConfirmationScreen}
          options={{
            title: 'Verificar Código',
          }}
        />
        <Stack.Screen 
          name="NewPassword" 
          component={NewPasswordScreen}
          options={{
            title: 'Nueva Contraseña',
          }}
        />
        <Stack.Screen 
          name="CatalogManagement" 
          component={CatalogManagementScreen}
          options={{
            title: 'Panel Administrativo',
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}