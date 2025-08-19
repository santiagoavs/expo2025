// src/screens/CatalogManagementScreen.js - VERSIÓN CORREGIDA Y FUNCIONAL
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CatalogManagementScreen = () => {
  const navigation = useNavigation();

  // Animaciones
  const logoAnimation = useSharedValue(0);

  React.useEffect(() => {
    logoAnimation.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(logoAnimation.value, [0, 1], [0, -5]);
    const rotate = interpolate(logoAnimation.value, [0, 1], [0, 2]);
    
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    };
  });

  const handleLogoutPress = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      ]
    );
  };

  const handleActionPress = (actionName) => {
    Alert.alert('Funcionalidad', `${actionName} será implementado próximamente`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo reemplazado por icono */}
          <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
            <View style={styles.logoIcon}>
              <Ionicons name="diamond" size={24} color="#040DBF" />
            </View>
          </Animated.View>
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>DIAMBARS</Text>
            <Text style={styles.headerSubtitle}>Panel Administrativo</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogoutPress}
          >
            <Ionicons name="log-out-outline" size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Ionicons name="person-circle" size={60} color="#040DBF" />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                ¡Bienvenido, Administrador!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Rol: Administrador
              </Text>
              <Text style={styles.welcomeDescription}>
                Gestiona tu catálogo y configuraciones desde aquí
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleActionPress('Catálogo')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="library-outline" size={32} color="#040DBF" />
              </View>
              <Text style={styles.actionTitle}>Catálogo</Text>
              <Text style={styles.actionSubtitle}>Gestionar productos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleActionPress('Usuarios')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={32} color="#1F64BF" />
              </View>
              <Text style={styles.actionTitle}>Usuarios</Text>
              <Text style={styles.actionSubtitle}>Administrar clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleActionPress('Reportes')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="bar-chart-outline" size={32} color="#10b981" />
              </View>
              <Text style={styles.actionTitle}>Reportes</Text>
              <Text style={styles.actionSubtitle}>Ver estadísticas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleActionPress('Configuración')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="settings-outline" size={32} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>Configuración</Text>
              <Text style={styles.actionSubtitle}>Ajustes del sistema</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Sistema</Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.statusTitle}>Sistema</Text>
              </View>
              <Text style={styles.statusValue}>Online</Text>
              <Text style={styles.statusDescription}>Funcionando correctamente</Text>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons name="server-outline" size={24} color="#040DBF" />
                <Text style={styles.statusTitle}>Base de Datos</Text>
              </View>
              <Text style={styles.statusValue}>Conectada</Text>
              <Text style={styles.statusDescription}>Respuesta óptima</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#040DBF" />
            <Text style={styles.infoTitle}>Información</Text>
          </View>
          <Text style={styles.infoText}>
            Esta es la pantalla principal del panel administrativo. 
            Aquí se agregarán más funcionalidades en futuras actualizaciones.
          </Text>
        </View>

        {/* Test Navigation Card */}
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <Ionicons name="rocket" size={24} color="#040DBF" />
            <Text style={styles.testTitle}>Navegación Funcionando</Text>
          </View>
          <Text style={styles.testText}>
            ¡Excelente! La navegación entre pantallas está funcionando correctamente.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={16} color="#ffffff" />
            <Text style={styles.backButtonText}>Volver al Login</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoWrapper: {
    marginRight: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(4, 13, 191, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#040DBF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  content: {
    flex: 1,
    padding: 20,
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
    elevation: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
    marginLeft: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040DBF',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    elevation: 2,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(4, 13, 191, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
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
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginLeft: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  infoCard: {
    backgroundColor: 'rgba(4, 13, 191, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(4, 13, 191, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040DBF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  testCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040DBF',
    marginLeft: 8,
  },
  testText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#040DBF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default CatalogManagementScreen;