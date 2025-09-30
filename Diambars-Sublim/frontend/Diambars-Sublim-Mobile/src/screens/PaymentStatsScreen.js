// src/screens/PaymentStatsScreen.js - Pantalla de estadísticas de métodos de pago
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import paymentMethodService from '../api/paymentMethodService';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';

const { width } = Dimensions.get('window');

const PaymentStatsScreen = ({ navigation }) => {
  // ==================== ESTADOS LOCALES ====================
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================== FUNCIONES DE CARGA ====================
  
  /**
   * Cargar estadísticas
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentStats();
      if (response.success) {
        setStats(response.stats);
        console.log('✅ [PaymentStatsScreen] Estadísticas cargadas');
      }
    } catch (error) {
      console.error('❌ [PaymentStatsScreen] Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== EFECTOS ====================
  useEffect(() => {
    loadStats();
  }, []);

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Obtener icono del método
   */
  const getMethodIcon = (type) => {
    switch (type) {
      case 'wompi':
        return 'card';
      case 'cash':
        return 'cash';
      case 'bank_transfer':
        return 'business';
      case 'credit_card':
        return 'card-outline';
      default:
        return 'wallet';
    }
  };

  /**
   * Obtener color del método
   */
  const getMethodColor = (type) => {
    switch (type) {
      case 'wompi':
        return '#8B5CF6';
      case 'cash':
        return '#10B981';
      case 'bank_transfer':
        return '#3B82F6';
      case 'credit_card':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  /**
   * Obtener nombre del método
   */
  const getMethodName = (type) => {
    switch (type) {
      case 'wompi':
        return 'Wompi';
      case 'cash':
        return 'Efectivo';
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      default:
        return type;
    }
  };

  // ==================== RENDERIZADO ====================

  /**
   * Renderizar tarjeta de estadística
   */
  const renderStatCard = (title, value, icon, color, subtitle) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  /**
   * Renderizar método de pago en estadísticas
   */
  const renderMethodStat = (method) => (
    <View key={method.type} style={styles.methodStatCard}>
      <View style={styles.methodStatHeader}>
        <View style={[styles.methodStatIcon, { backgroundColor: getMethodColor(method.type) }]}>
          <Ionicons 
            name={getMethodIcon(method.type)} 
            size={20} 
            color="white" 
          />
        </View>
        <View style={styles.methodStatInfo}>
          <Text style={styles.methodStatName}>{method.name}</Text>
          <Text style={styles.methodStatType}>{getMethodName(method.type)}</Text>
        </View>
        <View style={[
          styles.methodStatStatus,
          { backgroundColor: method.enabled ? '#10B981' : '#E53E3E' }
        ]}>
          <Text style={styles.methodStatStatusText}>
            {method.enabled ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      
      {method.hasConfig && (
        <View style={styles.methodStatConfig}>
          <Ionicons name="settings" size={16} color="#6B7280" />
          <Text style={styles.methodStatConfigText}>Configurado</Text>
        </View>
      )}
    </View>
  );

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#032CA6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas de Métodos de Pago</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#032CA6" />
            <Text style={styles.loadingText}>Cargando estadísticas...</Text>
          </View>
        ) : stats ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Estadísticas generales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen General</Text>
              <View style={styles.statsGrid}>
                {renderStatCard(
                  'Total de Métodos',
                  stats.totalMethods || 0,
                  'card-outline',
                  '#032CA6',
                  'Métodos configurados'
                )}
                {renderStatCard(
                  'Métodos Activos',
                  stats.activeMethods || 0,
                  'checkmark-circle',
                  '#10B981',
                  'Disponibles para clientes'
                )}
                {renderStatCard(
                  'Métodos Inactivos',
                  stats.inactiveMethods || 0,
                  'close-circle',
                  '#E53E3E',
                  'No disponibles'
                )}
              </View>
            </View>

            {/* Lista de métodos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalle por Método</Text>
              {stats.methods && stats.methods.length > 0 ? (
                <View style={styles.methodsList}>
                  {stats.methods.map(renderMethodStat)}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay métodos configurados</Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#E53E3E" />
            <Text style={styles.errorText}>Error cargando estadísticas</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  methodsList: {
    gap: 12,
  },
  methodStatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  methodStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodStatInfo: {
    flex: 1,
  },
  methodStatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 2,
  },
  methodStatType: {
    fontSize: 14,
    color: '#6B7280',
  },
  methodStatStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  methodStatStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  methodStatConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  methodStatConfigText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E53E3E',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#032CA6',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default PaymentStatsScreen;
