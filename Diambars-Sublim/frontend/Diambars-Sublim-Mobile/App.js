import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Pantalla de login simple (sin formularios complejos todavía)
function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 DIAMBARS</Text>
      <Text style={styles.subtitle}>sublimado</Text>
      <Text style={styles.description}>Acceso Administrativo</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Iniciar Sesión (Test)</Text>
      </TouchableOpacity>
      
      <StatusBar style="auto" />
    </View>
  );
}

// Dashboard simple
function DashboardScreen({ navigation }) {
  return (
    <View style={styles.dashboardContainer}>
      <Text style={styles.dashboardTitle}>✅ ¡LOGIN EXITOSO!</Text>
      <Text style={styles.dashboardText}>Panel Administrativo</Text>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#040DBF',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#64748b',
    fontStyle: 'italic',
    letterSpacing: 4,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#010326',
    fontWeight: '500',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#040DBF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#040DBF',
    marginBottom: 20,
  },
  dashboardText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
});