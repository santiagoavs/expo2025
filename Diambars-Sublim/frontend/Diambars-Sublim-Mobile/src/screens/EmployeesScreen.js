// src/screens/EmployeesScreen.js - Pantalla principal de gestión de empleados
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useEmployees from '../hooks/useEmployees';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import { showDeleteConfirm, showStatusChange } from '../utils/SweetAlert';

const { width } = Dimensions.get('window');

const EmployeesScreen = ({ navigation }) => {
  // ==================== HOOKS ====================
  const {
    employees,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    hasEmployees,
    isEmpty,
    hasError,
    canRetry,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    hardDeleteEmployee,
    changePassword,
    getEmployeeById,
    searchEmployees,
    getEmployeesByRole,
    getEmployeesByStatus,
    updateFilters,
    clearFilters,
    updateSorting,
    getEmployeeStats,
    clearError
  } = useEmployees();

  // ==================== ESTADOS LOCALES ====================
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name');

  // ==================== EFECTOS ====================
  useEffect(() => {
    // Aplicar filtros cuando cambien
    updateFilters({
      search: searchQuery,
      role: selectedFilter === 'all' ? '' : selectedFilter,
      sort: sortOption
    });
  }, [searchQuery, selectedFilter, sortOption, updateFilters]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => {
    const employeeStats = getEmployeeStats();
    
    return [
      {
        id: 'total-employees',
        title: "Total Empleados",
        value: employeeStats.total,
        icon: 'people-outline'
      },
      {
        id: 'active-employees',
        title: "Empleados Activos",
        value: employeeStats.active,
        icon: 'checkmark-circle-outline'
      }
    ];
  }, [getEmployeeStats]);

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      filtered = searchEmployees(searchQuery);
    }

    // Aplicar filtros
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(employee => employee.role === selectedFilter);
    }

    return filtered;
  }, [employees, searchQuery, selectedFilter, searchEmployees]);

  // ==================== FUNCIONES ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEmployees();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    clearError();
    fetchEmployees();
  };

  const handleCreateEmployee = () => {
    navigation.navigate('CreateEmployee');
  };

  const handleViewEmployee = (employee) => {
    navigation.navigate('EmployeeDetail', { employee });
  };

  const handleEditEmployee = (employee) => {
    navigation.navigate('EditEmployee', { employee });
  };

  const handleDeleteEmployee = (employee) => {
    showDeleteConfirm(
      employee.name,
      () => deleteEmployee(employee.id || employee._id),
      null
    );
  };

  const handleToggleStatus = (employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    showStatusChange(
      employee.name,
      newStatus === 'active',
      () => updateEmployee(employee.id || employee._id, { 
        ...employee, 
        status: newStatus,
        active: newStatus === 'active'
      }),
      null
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const handleSortChange = (sort) => {
    setSortOption(sort);
    updateSorting(sort, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // ==================== RENDERIZADO ====================

  // Loading state
  if (loading && employees.length === 0) {
    return (
      <AuthenticatedWrapper title="Empleados" subtitle="Gestión de Empleados">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando empleados...</Text>
        </View>
      </AuthenticatedWrapper>
    );
  }

  // Error state
  if (hasError && canRetry) {
    return (
      <AuthenticatedWrapper title="Empleados" subtitle="Gestión de Empleados">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error al cargar empleados</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </AuthenticatedWrapper>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <AuthenticatedWrapper title="Empleados" subtitle="Gestión de Empleados">
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color="#6B7280" />
          <Text style={styles.emptyTitle}>No hay empleados</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No se encontraron empleados con ese criterio' : 'Comienza agregando un empleado'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.addButton} onPress={handleCreateEmployee}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Agregar Empleado</Text>
            </TouchableOpacity>
          )}
        </View>
      </AuthenticatedWrapper>
    );
  }

  return (
    <AuthenticatedWrapper title="Empleados" subtitle="Gestión de Empleados">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Empleados</Text>
          <Text style={styles.headerSubtitle}>
            {filteredEmployees.length} de {employees.length} empleados
          </Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleCreateEmployee}>
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
            placeholder="Buscar empleados..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'manager' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('manager')}
          >
            <Text style={[styles.filterText, selectedFilter === 'manager' && styles.filterTextActive]}>
              Gerentes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'employee' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('employee')}
          >
            <Text style={[styles.filterText, selectedFilter === 'employee' && styles.filterTextActive]}>
              Empleados
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'delivery' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('delivery')}
          >
            <Text style={[styles.filterText, selectedFilter === 'delivery' && styles.filterTextActive]}>
              Repartidores
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'production' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('production')}
          >
            <Text style={[styles.filterText, selectedFilter === 'production' && styles.filterTextActive]}>
              Producción
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de Empleados */}
      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.employeeCard}
            onPress={() => handleViewEmployee(item)}
          >
            <View style={styles.employeeInfo}>
              <View style={styles.employeeImageContainer}>
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={styles.employeeImage} />
                ) : (
                  <View style={styles.employeeImagePlaceholder}>
                    <Ionicons name="person" size={24} color="#1F64BF" />
                  </View>
                )}
              </View>
              
              <View style={styles.employeeDetails}>
                <Text style={styles.employeeName}>{item.name}</Text>
                <Text style={styles.employeeRole}>{item.roleDisplay}</Text>
                <Text style={styles.employeeEmail}>{item.email}</Text>
                <View style={styles.employeeMeta}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: item.status === 'active' ? '#10B981' : '#EF4444' 
                  }]}>
                    <Text style={styles.statusText}>
                      {item.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.employeeActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#1F64BF' }]}
                onPress={() => handleEditEmployee(item)}
              >
                <Ionicons name="create" size={16} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: item.status === 'active' ? '#EF4444' : '#10B981' 
                }]}
                onPress={() => handleToggleStatus(item)}
              >
                <Ionicons 
                  name={item.status === 'active' ? 'pause' : 'play'} 
                  size={16} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                onPress={() => handleDeleteEmployee(item)}
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
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
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#010326',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#010326',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1F64BF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: 'white',
  },
  
  // Lista
  listContainer: {
    padding: 16,
  },
  employeeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  employeeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeImageContainer: {
    marginRight: 12,
  },
  employeeImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  employeeImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 2,
  },
  employeeRole: {
    fontSize: 14,
    color: '#1F64BF',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  employeeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  employeeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  
  // Estados
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EmployeesScreen;
