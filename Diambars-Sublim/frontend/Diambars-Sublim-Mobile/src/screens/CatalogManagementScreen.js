// src/screens/CatalogManagementScreen.js
// Pantalla principal del panel administrativo con animaciones, tarjetas de acciones y estado del sistema

import React from 'react'; // Importamos React para manejar componentes y hooks
import {
  View,             // Contenedor general
  Text,             // Para mostrar textos
  TouchableOpacity, // Botones táctiles
  StyleSheet,       // Para estilos
  ScrollView,       // Scrollable content
  StatusBar,        // Control de la barra de estado
  Dimensions,       // Para obtener dimensiones de pantalla
  Alert             // Para mostrar alertas nativas
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context'; // Asegura que el contenido no se superponga a barras del sistema
import { Ionicons } from '@expo/vector-icons'; // Iconos de Ionicons
import { useNavigation } from '@react-navigation/native'; // Para navegar entre pantallas
import Animated, { 
  useSharedValue,      // Valor compartido para animaciones
  useAnimatedStyle,    // Estilos animados
  withRepeat,          // Animaciones repetitivas
  withTiming,          // Animaciones temporizadas
  interpolate,         // Interpolación de valores
  Easing               // Funciones de easing para suavizar animaciones
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window'); // Obtenemos ancho y alto de la pantalla

const CatalogManagementScreen = () => {
  const navigation = useNavigation(); // Hook de navegación

  // -----------------------------
  // Animaciones del logo
  // -----------------------------
  const logoAnimation = useSharedValue(0); // Valor inicial de animación

  React.useEffect(() => {
    // Animación repetitiva del logo: movimiento vertical y rotación
    logoAnimation.value = withRepeat(
      withTiming(1, {       // Va de 0 a 1 en 4 segundos
        duration: 4000,
        easing: Easing.inOut(Easing.ease), // Suaviza la animación
      }),
      -1,                   // Repetir infinitamente
      true                  // Alterna dirección (va y viene)
    );
  }, []);

  // Estilo animado del logo usando reanimated
  const logoAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(logoAnimation.value, [0, 1], [0, -5]); // Mueve hacia arriba
    const rotate = interpolate(logoAnimation.value, [0, 1], [0, 2]);       // Rota levemente
    
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    };
  });

  // -----------------------------
  // Función para cerrar sesión
  // -----------------------------
  const handleLogoutPress = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          onPress: () => {
            // Resetea la navegación y regresa a Login
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      ]
    );
  };

  // -----------------------------
  // Función de acciones rápidas (placeholders)
  // -----------------------------
  const handleActionPress = (actionName) => {
    Alert.alert('Funcionalidad', `${actionName} será implementado próximamente`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* -----------------------------
          Header con logo, título y logout
      ----------------------------- */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo animado */}
          <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
            <View style={styles.logoIcon}>
              <Ionicons name="diamond" size={24} color="#040DBF" />
            </View>
          </Animated.View>
          
          {/* Texto del header */}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>DIAMBARS</Text>
            <Text style={styles.headerSubtitle}>Panel Administrativo</Text>
          </View>
          
          {/* Botón de logout */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogoutPress}
          >
            <Ionicons name="log-out-outline" size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

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
                Gestiona tu catálogo y configuraciones desde aquí
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            
            {/* Tarjeta de Catálogo */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Products')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="library-outline" size={32} color="#040DBF" />
              </View>
              <Text style={styles.actionTitle}>Catálogo</Text>
              <Text style={styles.actionSubtitle}>Gestionar productos</Text>
            </TouchableOpacity>

            {/* Tarjeta de Usuarios */}
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

            {/* Tarjeta de Reportes */}
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

            {/* Tarjeta de Configuración */}
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

        {/* Sección Estado del Sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Sistema</Text>
          <View style={styles.statusGrid}>
            {/* Estado del Sistema */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.statusTitle}>Sistema</Text>
              </View>
              <Text style={styles.statusValue}>Online</Text>
              <Text style={styles.statusDescription}>Funcionando correctamente</Text>
            </View>

            {/* Estado de Base de Datos */}
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

        {/* Tarjeta de Información */}
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

        {/* Tarjeta de prueba de navegación */}
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

// -----------------------------
// Estilos de la pantalla
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' }, // Contenedor principal
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
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  logoWrapper: { marginRight: 12 },
  logoIcon: { width: 40, height: 40, backgroundColor: 'rgba(4, 13, 191, 0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#040DBF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  logoutButton: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(220, 38, 38, 0.1)' },
  content: { flex: 1, padding: 20 },
  welcomeCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  welcomeContent: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { flex: 1, marginLeft: 16 },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#010326', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, fontWeight: '600', color: '#040DBF', marginBottom: 8 },
  welcomeDescription: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#010326', marginBottom: 16 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, alignItems: 'center', width: (width - 52) / 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(4, 13, 191, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#010326', marginBottom: 4 },
  actionSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center' },
  statusGrid: { flexDirection: 'row', gap: 12 },
  statusCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusTitle: { fontSize: 14, fontWeight: '600', color: '#010326', marginLeft: 8 },
  statusValue: { fontSize: 18, fontWeight: '700', color: '#10b981', marginBottom: 4 },
  statusDescription: { fontSize: 12, color: '#64748b' },
  infoCard: { backgroundColor: 'rgba(4, 13, 191, 0.05)', borderWidth: 1, borderColor: 'rgba(4, 13, 191, 0.1)', borderRadius: 12, padding: 16, marginBottom: 20 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#040DBF', marginLeft: 8 },
  infoText: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  testCard: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: 16, marginBottom: 20 },
  testHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  testTitle: { fontSize: 16, fontWeight: '600', color: '#040DBF', marginLeft: 8 },
  testText: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 16 },
  backButton: { backgroundColor: '#040DBF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  backButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

export default CatalogManagementScreen; // Exportamos la pantalla para poder usarla en navegación
