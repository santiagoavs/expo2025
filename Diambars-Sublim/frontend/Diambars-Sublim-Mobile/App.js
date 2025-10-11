// App.js - CON SPLASH Y LOADING SCREENS + ORDERS CORREGIDO + DESIGN MANAGEMENT
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import SplashScreen from './src/screens/SplashScreen';
import LoadingScreen from './src/screens/LoadingScreen';
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

// Importar pantallas de categorías
import CategoriesScreen from './src/screens/CategoriesScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import EditCategoryScreen from './src/screens/EditCategoryScreen';
import CreateCategoryScreen from './src/screens/CreateCategoryScreen';

// Importar pantallas de empleados
import EmployeesScreen from './src/screens/EmployeesScreen';
import EmployeeDetailScreen from './src/screens/EmployeeDetailScreen';
import CreateEmployeeScreen from './src/screens/CreateEmployeeScreen';
import EditEmployeeScreen from './src/screens/EditEmployeeScreen';

// Importar pantallas de usuarios
import UsersScreen from './src/screens/UsersScreen';
import UserDetailScreen from './src/screens/UserDetailScreen';
import CreateUserScreen from './src/screens/CreateUserScreen';
import EditUserScreen from './src/screens/EditUserScreen';

// Importar pantallas de reseñas
import ReviewsScreen from './src/screens/ReviewsScreen';

// Importar pantalla de métodos de pago
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import PaymentStatsScreen from './src/screens/PaymentStatsScreen';

// Importar pantalla de ÓRDENES (RUTA CORREGIDA)
import OrderScreen from './src/screens/OrderScreen';

// Importar pantalla de GESTIÓN DE DISEÑOS (NUEVA) - IMPORTACIÓN AGREGADA
import DesignManagementScreen from './src/screens/DesignManagementScreen';

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

        {/* 📦 PANTALLA DE ÓRDENES (RUTA CORREGIDA) */}
        <Stack.Screen 
          name="Orders" 
          component={OrderScreen}
          options={{
            title: 'Gestión de Órdenes',
            headerShown: false,
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
        />

        {/* 🎨 PANTALLA DE GESTIÓN DE DISEÑOS (NUEVA) */}
        <Stack.Screen 
          name="DesignManagement" 
          component={DesignManagementScreen}
          options={{
            title: 'Gestión de Diseños',
            headerShown: false,
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

        {/* 📁 PANTALLAS DE CATEGORÍAS */}
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            title: 'Gestión de Categorías',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CategoryDetail"
          component={CategoryDetailScreen}
          options={{
            title: 'Detalles de Categoría',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditCategory"
          component={EditCategoryScreen}
          options={{
            title: 'Editar Categoría',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateCategory"
          component={CreateCategoryScreen}
          options={{
            title: 'Crear Categoría',
            headerShown: false,
          }}
        />

        {/* 👥 PANTALLAS DE EMPLEADOS */}
        <Stack.Screen
          name="Employees"
          component={EmployeesScreen}
          options={{
            title: 'Gestión de Empleados',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EmployeeDetail"
          component={EmployeeDetailScreen}
          options={{
            title: 'Detalles de Empleado',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateEmployee"
          component={CreateEmployeeScreen}
          options={{
            title: 'Crear Empleado',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditEmployee"
          component={EditEmployeeScreen}
          options={{
            title: 'Editar Empleado',
            headerShown: false,
          }}
        />

        {/* 👤 PANTALLAS DE USUARIOS */}
        <Stack.Screen
          name="Users"
          component={UsersScreen}
          options={{
            title: 'Gestión de Usuarios',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UserDetail"
          component={UserDetailScreen}
          options={{
            title: 'Detalles de Usuario',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateUser"
          component={CreateUserScreen}
          options={{
            title: 'Crear Usuario',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditUser"
          component={EditUserScreen}
          options={{
            title: 'Editar Usuario',
            headerShown: false,
          }}
        />

        {/* ⭐ PANTALLAS DE RESEÑAS */}
        <Stack.Screen
          name="Reviews"
          component={ReviewsScreen}
          options={{
            title: 'Gestión de Reseñas',
            headerShown: false,
          }}
        />

        {/* 💳 PANTALLAS DE MÉTODOS DE PAGO */}
        <Stack.Screen
          name="PaymentMethods"
          component={PaymentMethodsScreen}
          options={{
            title: 'Métodos de Pago',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PaymentStats"
          component={PaymentStatsScreen}
          options={{
            title: 'Estadísticas de Métodos de Pago',
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}