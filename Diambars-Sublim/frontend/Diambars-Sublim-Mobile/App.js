// App.js - CON SPLASH Y LOADING SCREENS
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import SplashScreen from './src/screens/SplashScreen';        // 👈 SPLASH ANIMADO
import LoadingScreen from './src/screens/LoadingScreen';      // 👈 NUEVA PANTALLA DE CARGA
import LoginScreen from './src/screens/LoginScreen';
import RecoveryPasswordScreen from './src/screens/RecoveryPasswordScreen';
import CodeConfirmationScreen from './src/screens/CodeConfirmationScreen';
import NewPasswordScreen from './src/screens/NewPasswordScreen';
import CatalogManagementScreen from './src/screens/CatalogManagementScreen';

// Importar pantallas de productos
import ProductsScreen from './src/screens/ProductsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import CreateProductScreen from './src/screens/CreateProductScreen';

const Stack = createStackNavigator();

export default function App() {
  console.log('[App] Inicializando con Splash → Loading → Login');
  
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
        {/* 🎨 SPLASH SCREEN - Primera pantalla con logo animado */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{
            title: 'Splash',
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />

        {/* ⚙️ LOADING SCREEN - Segunda pantalla de carga */}
        <Stack.Screen 
          name="Loading" 
          component={LoadingScreen}
          options={{
            title: 'Cargando',
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />

        {/* 🔐 LOGIN SCREEN - Pantalla principal */}
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

        {/* 📱 PANTALLAS DE PRODUCTOS */}
        <Stack.Screen 
          name="Products" 
          component={ProductsScreen}
          options={{
            title: 'Gestión de Productos',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{
            title: 'Detalles del Producto',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="EditProduct" 
          component={EditProductScreen}
          options={{
            title: 'Editar Producto',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CreateProduct" 
          component={CreateProductScreen}
          options={{
            title: 'Crear Producto',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}