// src/components/Sidebar.js - Sidebar de navegación para la app móvil
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = useNavigation();

  // ==================== ESTRUCTURA DE NAVEGACIÓN ====================
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: 'home-outline',
      screen: 'CatalogManagement',
      description: 'Panel principal'
    },
    {
      id: 'personal',
      label: 'Personal',
      icon: 'people-outline',
      items: [
        {
          id: 'employees',
          label: 'Empleados',
          icon: 'person-outline',
          screen: 'Employees',
          description: 'Gestión de personal'
        },
        {
          id: 'users',
          label: 'Usuarios',
          icon: 'people-outline',
          screen: 'Users',
          description: 'Administración de usuarios'
        }
      ]
    },
    {
      id: 'gestion',
      label: 'Gestión',
      icon: 'folder-outline',
      items: [
        {
          id: 'products',
          label: 'Productos',
          icon: 'cube-outline',
          screen: 'Products',
          description: 'Gestión de productos y servicios'
        },
        {
          id: 'categories',
          label: 'Categorías',
          icon: 'folder-outline',
          screen: 'Categories',
          description: 'Organización de productos'
        },
        {
          id: 'addresses',
          label: 'Direcciones',
          icon: 'location-outline',
          screen: 'Addresses',
          description: 'Gestión de direcciones de envío'
        },
        {
          id: 'reviews',
          label: 'Reseñas',
          icon: 'star-outline',
          screen: 'Reviews',
          description: 'Opiniones de clientes'
        }
      ]
    },
    {
      id: 'herramientas',
      label: 'Herramientas',
      icon: 'construct-outline',
      items: [
        {
          id: 'designs',
          label: 'Editor de Diseños',
          icon: 'brush-outline',
          screen: 'Designs',
          description: 'Herramientas de diseño'
        },
        {
          id: 'orders',
          label: 'Pedidos',
          icon: 'cart-outline',
          screen: 'Orders',
          description: 'Control de pedidos y órdenes'
        }
      ]
    },
    {
      id: 'analisis',
      label: 'Análisis',
      icon: 'analytics-outline',
      items: [
        {
          id: 'reports',
          label: 'Reportes',
          icon: 'document-text-outline',
          screen: 'Reports',
          description: 'Informes detallados'
        },
        {
          id: 'payments',
          label: 'Métodos de Pago',
          icon: 'card-outline',
          screen: 'PaymentMethods',
          description: 'Gestión de pagos'
        }
      ]
    }
  ];

  // ==================== FUNCIONES ====================
  const handleNavigation = (screen) => {
    if (screen) {
      navigation.navigate(screen);
      onClose();
    } else {
      Alert.alert(
        'Función en desarrollo',
        'Esta funcionalidad estará disponible próximamente',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // ==================== RENDER ITEMS ====================
  const renderNavigationItem = (item, level = 0) => {
    if (item.items) {
      // Es un grupo con subitems
      return (
        <View key={item.id} style={styles.groupContainer}>
          <View style={[styles.groupHeader, { paddingLeft: 16 + (level * 16) }]}>
            <Ionicons name={item.icon} size={20} color="#6B7280" />
            <Text style={styles.groupLabel}>{item.label}</Text>
          </View>
          {item.items.map((subItem) => renderNavigationItem(subItem, level + 1))}
        </View>
      );
    } else {
      // Es un item individual
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.navItem, { paddingLeft: 16 + (level * 16) }]}
          onPress={() => handleNavigation(item.screen)}
          activeOpacity={0.7}
        >
          <View style={styles.navItemContent}>
            <Ionicons name={item.icon} size={20} color="#1F64BF" />
            <View style={styles.navItemText}>
              <Text style={styles.navItemLabel}>{item.label}</Text>
              <Text style={styles.navItemDescription}>{item.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  // ==================== RENDER ====================
  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={styles.sidebar}>
        {/* Header del Sidebar */}
        <View style={styles.sidebarHeader}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="diamond" size={24} color="#1F64BF" />
            </View>
            <View style={styles.logoText}>
              <Text style={styles.logoTitle}>DIAMBARS</Text>
              <Text style={styles.logoSubtitle}>Panel Administrativo</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Navegación */}
        <ScrollView style={styles.navigationContainer} showsVerticalScrollIndicator={false}>
          {navigationItems.map((item) => renderNavigationItem(item))}
        </ScrollView>

        {/* Footer del Sidebar */}
        <View style={styles.sidebarFooter}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: width * 0.85,
    maxWidth: 320,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  logoText: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F64BF',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  navigationContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  groupContainer: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItemText: {
    flex: 1,
    marginLeft: 12,
  },
  navItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  navItemDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  sidebarFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 12,
  },
});

export default Sidebar;
