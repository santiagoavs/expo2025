// src/screens/UserDetailScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import useUsers from '../hooks/useUsers';

const { width } = Dimensions.get('window');

const UserDetailScreen = ({ navigation, route }) => {
  const { user: initialUser } = route.params;
  const { updateUserStatus, deleteUser } = useUsers();
  
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  // ==================== MANEJADORES ====================
  const handleEdit = useCallback(() => {
    navigation.navigate('EditUser', { user });
  }, [navigation, user]);

  const handleToggleStatus = useCallback(async () => {
    try {
      setLoading(true);
      const newStatus = user.status === 'active' ? false : true;
      await updateUserStatus(user.id, newStatus);
      
      // Actualizar estado local
      setUser(prev => ({
        ...prev,
        status: newStatus ? 'active' : 'inactive',
        active: newStatus
      }));
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setLoading(false);
    }
  }, [user, updateUserStatus]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de que quieres eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting user:', error);
            }
          }
        }
      ]
    );
  }, [user, deleteUser, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper title="Detalles de Usuario" subtitle="Información del Usuario">
      {/* Header con navegación */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1F64BF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Detalles de Usuario</Text>
          <Text style={styles.headerSubtitle}>Información completa del usuario</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Información principal */}
        <View style={styles.section}>
          <View style={styles.userHeader}>
            <View style={styles.userAvatar}>
              <Ionicons 
                name={user.role === 'admin' ? 'shield' : 
                      user.role === 'premium' ? 'star' : 'person'} 
                size={32} 
                color="#1F64BF" 
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <View style={[styles.statusBadge, user.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={[styles.statusText, user.status === 'active' ? styles.activeText : styles.inactiveText]}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
                <Text style={styles.userRole}>
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'premium' ? 'Premium' : 'Cliente'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información de contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
            
            {user.phoneNumber && (
              <View style={styles.infoItem}>
                <Ionicons name="call" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{user.phoneNumber}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Información del sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Sistema</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Registro</Text>
                <Text style={styles.infoValue}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No disponible'}
                </Text>
              </View>
            </View>
            
            {user.lastLogin && (
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color="#6B7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Último Acceso</Text>
                  <Text style={styles.infoValue}>
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, user.status === 'active' ? styles.inactiveAction : styles.activeAction]}
              onPress={handleToggleStatus}
              disabled={loading}
            >
              <Ionicons 
                name={user.status === 'active' ? 'pause' : 'play'} 
                size={20} 
                color="white" 
              />
              <Text style={styles.actionText}>
                {user.status === 'active' ? 'Desactivar' : 'Activar'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteAction}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.actionText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F64BF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Secciones
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Usuario header
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#065F46',
  },
  inactiveText: {
    color: '#991B1B',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Información
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },

  // Acciones
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeAction: {
    backgroundColor: '#10B981',
  },
  inactiveAction: {
    backgroundColor: '#EF4444',
  },
  deleteAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserDetailScreen;
