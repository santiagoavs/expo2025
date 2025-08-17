// src/screens/CatalogManagementScreen.js - PANTALLA COMPLETA CON NAVEGACIÓN
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const CatalogManagementScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...');
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Administrativo</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          ¡Bienvenido, {user?.name || user?.email}!
        </Text>
        <Text style={styles.roleText}>
          Rol: {user?.role || user?.type}
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎉 ¡Transcripción Completada!</Text>
          <Text style={styles.cardText}>
            Tu sistema de autenticación React Native está listo. 
            Ahora puedes continuar desarrollando las funcionalidades del catálogo.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>✅ Estado del Sistema</Text>
          <Text style={styles.statusText}>• Login funcionando</Text>
          <Text style={styles.statusText}>• Navegación operativa</Text>
          <Text style={styles.statusText}>• Autenticación activa</Text>
          <Text style={styles.statusText}>• Logout funcional</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#040DBF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default CatalogManagementScreen;