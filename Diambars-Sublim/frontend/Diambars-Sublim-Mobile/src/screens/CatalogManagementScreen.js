// src/screens/CatalogManagementScreen.js
// Pantalla principal del panel administrativo con animaciones, tarjetas de acciones y estado del sistema

import React from 'react'; // Importamos React para manejar componentes y hooks
import {
  View,             // Contenedor general
  Text,             // Para mostrar textos
  TouchableOpacity, // Botones táctiles
  StyleSheet,       // Para estilos
  ScrollView,       // Scrollable content
  Dimensions,       // Para obtener dimensiones de pantalla
  Alert             // Para mostrar alertas nativas
} from 'react-native';

import { Ionicons } from '@expo/vector-icons'; // Iconos de Ionicons
import { useNavigation } from '@react-navigation/native'; // Para navegar entre pantallas
import AuthenticatedWrapper from '../components/AuthenticatedWrapper'; // Wrapper con navbar
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
    const translateY = interpolate(
      logoAnimation.value,
      [0, 1],
      [0, -8] // Se mueve 8 píxeles hacia arriba y abajo
    );

    const rotate = interpolate(
      logoAnimation.value,
      [0, 1],
      [0, 360] // Rotación completa de 360 grados
    );

    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    };
  });

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
    if (actionName === 'Catálogo') {
      navigation.navigate('Products');
    } else {
      Alert.alert('Funcionalidad', `${actionName} será implementado próximamente`);
    }
  };

  return (
    <AuthenticatedWrapper title="DIAMBARS" subtitle="Panel Administrativo">
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
              onPress={() => handleActionPress('Reportes')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="analytics-outline" size={24} color="#040DBF" />
              </View>
              <Text style={styles.actionTitle}>Reportes</Text>
              <Text style={styles.actionSubtitle}>Ver estadísticas</Text>
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
            Desde aquí puedes gestionar productos, usuarios, pedidos y más.
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={16} color="#ffffff" />
            <Text style={styles.backButtonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </AuthenticatedWrapper>
  );
};

// -----------------------------
// Estilos de la pantalla
// -----------------------------
const styles = StyleSheet.create({
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