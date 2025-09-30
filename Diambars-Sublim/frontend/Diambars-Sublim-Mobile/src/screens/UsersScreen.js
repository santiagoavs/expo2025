// src/screens/UsersScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import useUsers from '../hooks/useUsers';

const { width } = Dimensions.get('window');

const UsersScreen = ({ navigation }) => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    getUserStats
  } = useUsers();

  // ==================== ESTADOS LOCALES ====================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name');
  const [refreshing, setRefreshing] = useState(false);

  // ==================== FILTROS Y BÚSQUEDA ====================
  const updateFilters = useCallback((newFilters) => {
    setSelectedFilter(newFilters.status || selectedFilter);
    setSortOption(newFilters.sort || sortOption);
  }, [selectedFilter, sortOption]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchQuery))
      );
    }

    // Aplicar filtro de estado
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(user => user.status === selectedFilter);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchQuery, selectedFilter, sortOption]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => {
    const userStats = getUserStats();
    
    return [
      {
        id: 'total-users',
        title: "Total Usuarios",
        value: userStats.total,
        icon: 'people-outline'
      },
      {
        id: 'active-users',
        title: "Usuarios Activos",
        value: userStats.active,
        icon: 'checkmark-circle-outline'
      }
    ];
  }, [getUserStats]);

  // ==================== MANEJADORES ====================
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUsers]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortOption(sort);
  }, []);

  const handleCreateUser = useCallback(() => {
    navigation.navigate('CreateUser');
  }, [navigation]);

  const handleUserPress = useCallback((user) => {
    navigation.navigate('UserDetail', { user });
  }, [navigation]);

  const handleEditUser = useCallback((user) => {
    navigation.navigate('EditUser', { user });
  }, [navigation]);

  const handleToggleStatus = useCallback(async (user) => {
    try {
      const newStatus = user.status === 'active' ? false : true;
      await updateUserStatus(user.id, newStatus);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  }, [updateUserStatus]);

  const handleDeleteUser = useCallback(async (user) => {
    try {
      await deleteUser(user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }, [deleteUser]);

  // ==================== RENDERIZADO ====================
  const renderUserCard = useCallback(({ item: user }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(user)}
      activeOpacity={0.7}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons 
              name={user.role === 'admin' ? 'shield-outline' : 
                    user.role === 'premium' ? 'star-outline' : 'person-outline'} 
              size={24} 
              color="#1F64BF" 
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phoneNumber && (
              <Text style={styles.userPhone}>{user.phoneNumber}</Text>
            )}
          </View>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.statusButton, user.status === 'active' ? styles.activeButton : styles.inactiveButton]}
            onPress={() => handleToggleStatus(user)}
          >
            <Ionicons 
              name={user.status === 'active' ? 'checkmark' : 'close'} 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditUser(user)}
          >
            <Ionicons name="pencil" size={16} color="#1F64BF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(user)}
          >
            <Ionicons name="trash" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.userFooter}>
        <View style={styles.userMeta}>
          <Text style={styles.userRole}>
            {user.role === 'admin' ? 'Administrador' : 
             user.role === 'premium' ? 'Premium' : 'Cliente'}
          </Text>
          <View style={[styles.statusBadge, user.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusText, user.status === 'active' ? styles.activeText : styles.inactiveText]}>
              {user.status === 'active' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
        {user.lastLogin && (
          <Text style={styles.lastLogin}>
            Último acceso: {new Date(user.lastLogin).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ), [handleUserPress, handleEditUser, handleToggleStatus, handleDeleteUser]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No hay usuarios</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'No se encontraron usuarios con ese criterio' : 'Aún no hay usuarios registrados'}
      </Text>
    </View>
  ), [searchQuery]);

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper title="Usuarios" subtitle="Gestión de Usuarios">
      {/* Header con botón de crear */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Usuarios</Text>
          <Text style={styles.headerSubtitle}>Gestiona todos los usuarios del sistema</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateUser}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <Ionicons name={stat.icon} size={24} color="#1F64BF" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {/* Filtros y Búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'active' && styles.activeFilter]}
            onPress={() => handleFilterChange('active')}
          >
            <Text style={[styles.filterText, selectedFilter === 'active' && styles.activeFilterText]}>
              Activos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'inactive' && styles.activeFilter]}
            onPress={() => handleFilterChange('inactive')}
          >
            <Text style={[styles.filterText, selectedFilter === 'inactive' && styles.activeFilterText]}>
              Inactivos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id || item._id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1F64BF']}
            tintColor="#1F64BF"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F64BF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flex: 1, // Usa todo el ancho disponible
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F64BF',
    marginTop: 4,
  },
  statTitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Filtros
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  filtersScroll: {
    marginTop: 8,
  },
  filtersContent: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#1F64BF',
    borderColor: '#1F64BF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: 'white',
  },
  
  // Lista
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  
  // Cards de usuarios
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  inactiveButton: {
    backgroundColor: '#EF4444',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#065F46',
  },
  inactiveText: {
    color: '#991B1B',
  },
  lastLogin: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default UsersScreen;
