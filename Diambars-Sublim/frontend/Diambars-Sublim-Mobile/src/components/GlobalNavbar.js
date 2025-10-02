// src/components/GlobalNavbar.js - Navbar global para todas las pantallas autenticadas
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Sidebar from './Sidebar';
import useSidebar from '../hooks/useSidebar';

const { width } = Dimensions.get('window');

const GlobalNavbar = ({ children, title = "DIAMBARS", subtitle = "Panel Administrativo" }) => {
  const navigation = useNavigation();
  const { isSidebarOpen, openSidebar, closeSidebar } = useSidebar();

  // Función de logout removida - ahora está en el sidebar

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header Global */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo y título */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Image 
                source={require('../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.logoText}>
              <Text style={styles.logoTitle}>{title}</Text>
              <Text style={styles.logoSubtitle}>{subtitle}</Text>
            </View>
          </View>
          
          {/* Botón del sidebar (ahora en la derecha donde estaba logout) */}
          <TouchableOpacity 
            style={styles.sidebarButton}
            onPress={openSidebar}
          >
            <Ionicons name="menu" size={24} color="#1F64BF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido de la pantalla */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Sidebar (derecha) */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </SafeAreaView>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sidebarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoText: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F64BF',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  // logoutButton removido - ya no se usa
  content: {
    flex: 1,
  },
});

export default GlobalNavbar;
