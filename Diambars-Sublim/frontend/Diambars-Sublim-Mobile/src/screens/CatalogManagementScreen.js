// src/screens/CatalogManagementScreen.js
// Pantalla principal del panel administrativo con navegación a Orders, Users y Design Management

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';

const { width, height } = Dimensions.get('window');

const CatalogManagementScreen = () => {
  const navigation = useNavigation();

  // -----------------------------
  // Funciones de manejo
  // -----------------------------
  const handleLogoutPress = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  const handleActionPress = (actionName) => {
    switch (actionName) {
      case 'Catálogo':
        navigation.navigate('Products');
        break;
      case 'Pedidos':
        navigation.navigate('Orders'); // Navegación directa a Orders
        break;
      case 'Usuarios':
        navigation.navigate('Users'); // Navegación directa a UsersScreen
        break;
      case 'Editor de Diseño':
        navigation.navigate('DesignManagement'); // Navegación a DesignManagementScreen
        break;
      default:
        Alert.alert('Funcionalidad', `${actionName} será implementado próximamente`);
    }
  };

  return (
    <AuthenticatedWrapper title="DIAMBARS" subtitle="Panel Administrativo">
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#040DBF" barStyle="light-content" />
        
        {/* -----------------------------
            Contenido principal (scrollable)
        ----------------------------- */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Tarjeta de bienvenida */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeContent}>
              <Ionicons name="person-circle" size={60} color="#040DBF" />
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeTitle}>¡Bienvenido, Administrador!</Text>
                <Text style={styles.welcomeSubtitle}>Rol: Administrador</Text>
                <Text style={styles.welcomeDescription}>
                  Gestiona tu catálogo, usuarios, diseños y configuraciones desde aquí
                </Text>
              </View>
            </View>
          </View>

          {/* Sección de Acciones Rápidas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => handleActionPress('Catálogo')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="cube-outline" size={24} color="#040DBF" />
                </View>
                <Text style={styles.actionTitle}>Catálogo</Text>
                <Text style={styles.actionSubtitle}>Gestionar productos</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => handleActionPress('Pedidos')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="cart-outline" size={24} color="#040DBF" />
                </View>
                <Text style={styles.actionTitle}>Pedidos</Text>
                <Text style={styles.actionSubtitle}>Ver órdenes</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => handleActionPress('Usuarios')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="people-outline" size={24} color="#040DBF" />
                </View>
                <Text style={styles.actionTitle}>Usuarios</Text>
                <Text style={styles.actionSubtitle}>Administrar usuarios</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => handleActionPress('Editor de Diseño')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="brush-outline" size={24} color="#040DBF" />
                </View>
                <Text style={styles.actionTitle}>Editor de Diseño</Text>
                <Text style={styles.actionSubtitle}>Gestionar diseños</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sección de Estado del Sistema */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado del Sistema</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.statusTitle}>Sistema</Text>
                </View>
                <Text style={styles.statusValue}>Activo</Text>
                <Text style={styles.statusDescription}>Todo funcionando correctamente</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="server" size={16} color="#10b981" />
                  <Text style={styles.statusTitle}>Servidor</Text>
                </View>
                <Text style={styles.statusValue}>Online</Text>
                <Text style={styles.statusDescription}>Conexión estable</Text>
              </View>
            </View>
          </View>

          {/* Información del Sistema */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#040DBF" />
              <Text style={styles.infoTitle}>Información del Sistema</Text>
            </View>
            <Text style={styles.infoText}>
              Esta es la aplicación móvil del panel administrativo de DIAMBARS. 
              Desde aquí puedes gestionar productos, usuarios, pedidos, diseños y más.
            </Text>
          </View>

          {/* Tarjeta de Prueba de Conexión */}
          <View style={styles.testCard}>
            <View style={styles.testHeader}>
              <Ionicons name="wifi" size={20} color="#10b981" />
              <Text style={styles.testTitle}>Conexión Verificada</Text>
            </View>
            <Text style={styles.testText}>
              La conexión con el servidor backend está funcionando correctamente. 
              Puedes proceder a usar todas las funcionalidades disponibles.
            </Text>
            
            {/* Botones de acción adicionales */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('DesignManagement')}
              >
                <Ionicons name="brush" size={16} color="#040DBF" />
                <Text style={styles.secondaryButtonText}>Ir a Diseños</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Users')}
              >
                <Ionicons name="people" size={16} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Gestionar Usuarios</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estadísticas Rápidas */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Estadísticas Rápidas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="cart" size={20} color="#040DBF" />
                  <Text style={styles.statTitle}>Pedidos Hoy</Text>
                </View>
                <Text style={styles.statValue}>15</Text>
                <Text style={styles.statTrend}>+12% vs ayer</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="cash" size={20} color="#10b981" />
                  <Text style={styles.statTitle}>Ingresos</Text>
                </View>
                <Text style={styles.statValue}>$1,250</Text>
                <Text style={styles.statTrend}>+8% semanal</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="brush" size={20} color="#f59e0b" />
                  <Text style={styles.statTitle}>Diseños Activos</Text>
                </View>
                <Text style={styles.statValue}>28</Text>
                <Text style={styles.statTrend}>+3 este mes</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="time" size={20} color="#ef4444" />
                  <Text style={styles.statTitle}>Pendientes</Text>
                </View>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statTrend}>-2 desde ayer</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </AuthenticatedWrapper>
  );
};

// -----------------------------
// Estilos de la pantalla
// -----------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  welcomeCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  welcomeContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  welcomeText: { 
    flex: 1, 
    marginLeft: 16 
  },
  welcomeTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#010326', 
    marginBottom: 4 
  },
  welcomeSubtitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#040DBF', 
    marginBottom: 8 
  },
  welcomeDescription: { 
    fontSize: 14, 
    color: '#64748b', 
    lineHeight: 20 
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#010326', 
    marginBottom: 16 
  },
  actionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  actionCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    width: (width - 52) / 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  actionIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(4, 13, 191, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12 
  },
  actionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#010326', 
    marginBottom: 4,
    textAlign: 'center'
  },
  actionSubtitle: { 
    fontSize: 12, 
    color: '#64748b', 
    textAlign: 'center' 
  },
  statusGrid: { 
    flexDirection: 'row', 
    gap: 12 
  },
  statusCard: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  statusHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  statusTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#010326', 
    marginLeft: 8 
  },
  statusValue: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#10b981', 
    marginBottom: 4 
  },
  statusDescription: { 
    fontSize: 12, 
    color: '#64748b' 
  },
  infoCard: { 
    backgroundColor: 'rgba(4, 13, 191, 0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(4, 13, 191, 0.1)', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20 
  },
  infoHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#040DBF', 
    marginLeft: 8 
  },
  infoText: { 
    fontSize: 14, 
    color: '#64748b', 
    lineHeight: 20 
  },
  testCard: { 
    backgroundColor: 'rgba(16, 185, 129, 0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(16, 185, 129, 0.2)', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20 
  },
  testHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  testTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#040DBF', 
    marginLeft: 8 
  },
  testText: { 
    fontSize: 14, 
    color: '#64748b', 
    lineHeight: 20, 
    marginBottom: 16 
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(4, 13, 191, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: {
    color: '#040DBF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#040DBF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  statsSection: {
    marginBottom: 24
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 4
  },
  statTrend: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600'
  }
});

export default CatalogManagementScreen;