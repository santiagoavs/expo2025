import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  Image,
  RefreshControl,
  Modal,
  Pressable,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Componentes personalizados
import DesignCard from '../components/DesignCard/DesignCard';
import CreateDesignModal from '../components/DesignManagement/CreateDesignModal';

// Obtener dimensiones de la pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ================ HOOKS SIMULADOS CON DATOS DE PRUEBA ================
const useDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Datos de prueba
  const mockDesigns = [
    {
      id: '1',
      name: 'Diseño Corporativo',
      clientName: 'Juan Pérez',
      productName: 'Taza Personalizada',
      status: 'pending',
      previewImage: null,
      price: 45.00,
      formattedPrice: '$45.00',
      daysAgo: 'Hace 2 días',
      canEdit: true,
      canQuote: true
    },
    {
      id: '2',
      name: 'Logo Empresarial',
      clientName: 'María García',
      productName: 'Camiseta Premium',
      status: 'approved',
      previewImage: null,
      price: 120.00,
      formattedPrice: '$120.00',
      daysAgo: 'Hace 1 semana',
      canEdit: false,
      canQuote: false
    }
  ];

  const fetchDesigns = () => {
    setLoading(true);
    setTimeout(() => {
      setDesigns(mockDesigns);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  return {
    designs,
    loading,
    error: null,
    pagination: { currentPage: 1, totalPages: 1, totalDesigns: mockDesigns.length, hasPrev: false, hasNext: false },
    filters: {},
    fetchDesigns,
    createDesignForClient: () => Promise.resolve(),
    updateDesign: () => Promise.resolve(),
    getDesignById: (id) => Promise.resolve(mockDesigns.find(d => d.id === id)),
    cloneDesign: () => Promise.resolve(),
    submitQuote: () => Promise.resolve(),
    changeDesignStatus: () => Promise.resolve(),
    cancelDesign: () => Promise.resolve(),
    getDesignStats: () => ({
      total: mockDesigns.length,
      pending: mockDesigns.filter(d => d.status === 'pending').length,
      approved: mockDesigns.filter(d => d.status === 'approved').length,
      totalRevenue: 165,
      conversionRate: 50
    }),
    updateFilters: () => {},
    clearFilters: () => {},
    hasDesigns: mockDesigns.length > 0,
    isEmpty: mockDesigns.length === 0,
    refetch: fetchDesigns
  };
};

const useProducts = () => {
  return {
    products: [
      { id: '1', name: 'Taza Personalizada' },
      { id: '2', name: 'Camiseta Premium' },
      { id: '3', name: 'Llavero Metálico' }
    ],
    loading: false,
    fetchProducts: () => Promise.resolve()
  };
};

const useUsers = () => {
  return {
    users: [
      { id: '1', name: 'Juan Pérez' },
      { id: '2', name: 'María García' },
      { id: '3', name: 'Carlos López' }
    ],
    loading: false,
    fetchUsers: () => Promise.resolve()
  };
};

// ================ COMPONENTE SIMPLIFICADO DE COTIZACIÓN ================
const SimpleQuoteModal = ({ visible, onClose, onSubmit, design, loading }) => {
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (design && visible) {
      setPrice(design.price ? design.price.toString() : '50');
    }
  }, [design, visible]);

  const handleSubmit = () => {
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor que 0');
      return;
    }

    const quoteData = {
      price: parseFloat(price),
      productionDays: 3,
      adminNotes: ''
    };

    onSubmit(quoteData);
  };

  const handleClose = () => {
    if (!loading) {
      setPrice('');
      onClose();
    }
  };

  if (!design) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={quoteStyles.overlay}>
        <View style={quoteStyles.modalContainer}>
          <View style={quoteStyles.header}>
            <Text style={quoteStyles.headerTitle}>Cotizar Diseño</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={quoteStyles.content}>
            <Text style={quoteStyles.designName}>{design.name}</Text>
            <Text style={quoteStyles.clientInfo}>Cliente: {design.clientName}</Text>
            
            <View style={quoteStyles.inputGroup}>
              <Text style={quoteStyles.inputLabel}>Precio ($)</Text>
              <TextInput
                style={quoteStyles.textInput}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>

          <View style={quoteStyles.actions}>
            <TouchableOpacity
              style={quoteStyles.cancelButton}
              onPress={handleClose}
            >
              <Text style={quoteStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={quoteStyles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={quoteStyles.submitButtonText}>Enviar Cotización</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const quoteStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1F64BF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  designName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#1F64BF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

// ================ COMPONENTE SIMPLIFICADO DE VISUALIZADOR ================
const SimpleDesignViewer = ({ visible, onClose, design }) => {
  if (!design) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={viewerStyles.overlay}>
        <View style={viewerStyles.modalContainer}>
          <View style={viewerStyles.header}>
            <Text style={viewerStyles.title}>Vista Previa</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#010326" />
            </TouchableOpacity>
          </View>
          
          <View style={viewerStyles.content}>
            {design.previewImage ? (
              <Image 
                source={{ uri: design.previewImage }} 
                style={viewerStyles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={viewerStyles.placeholder}>
                <Icon name="image-off" size={48} color="#ccc" />
                <Text style={viewerStyles.placeholderText}>Sin vista previa</Text>
              </View>
            )}
            
            <Text style={viewerStyles.designName}>{design.name}</Text>
            <Text style={viewerStyles.designInfo}>Cliente: {design.clientName}</Text>
            <Text style={viewerStyles.designInfo}>Producto: {design.productName}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const viewerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
  },
  designName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  designInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

// ================ COMPONENTES DE UI SIMPLIFICADOS ================
const CustomCard = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const CustomButton = ({ onPress, children, disabled, style, icon }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.buttonDisabled, style]}
    onPress={onPress}
    disabled={disabled}
  >
    {icon && <Icon name={icon} size={16} color="white" style={styles.buttonIcon} />}
    <Text style={styles.buttonText}>{children}</Text>
  </TouchableOpacity>
);

const CustomSearchBar = ({ placeholder, value, onChangeText }) => (
  <View style={styles.searchBar}>
    <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.searchInput}
      placeholderTextColor="#666"
    />
  </View>
);

// ================ COMPONENTE PRINCIPAL ================
const DesignManagementScreen = () => {
  const {
    designs,
    loading,
    fetchDesigns,
    getDesignById,
    cloneDesign,
    submitQuote,
    getDesignStats,
    hasDesigns,
    isEmpty,
    refetch
  } = useDesigns();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quotingDesign, setQuotingDesign] = useState(null);
  const [viewingDesign, setViewingDesign] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = () => {
    refetch();
  };

  const handleViewDesign = async (designId) => {
    try {
      const design = await getDesignById(designId);
      if (design) {
        setViewingDesign(design);
        setShowViewerModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el diseño');
    }
  };

  const handleQuoteDesign = async (designId) => {
    try {
      const design = await getDesignById(designId);
      if (design) {
        setQuotingDesign(design);
        setShowQuoteModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el diseño');
    }
  };

  const handleQuoteSubmitted = async (quoteData) => {
    try {
      setActionLoading(true);
      await submitQuote(quotingDesign.id, quoteData);
      setShowQuoteModal(false);
      setQuotingDesign(null);
      Alert.alert('Éxito', 'Cotización enviada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la cotización');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => {
    const designStats = getDesignStats();
    
    return [
      {
        id: 'total-designs',
        title: "Total de Diseños",
        value: designStats.total,
        icon: 'palette',
        color: '#1F64BF'
      },
      {
        id: 'pending-designs',
        title: "Pendientes",
        value: designStats.pending,
        icon: 'clock',
        color: '#F59E0B'
      },
      {
        id: 'approved-designs',
        title: "Aprobados",
        value: designStats.approved,
        icon: 'check-circle',
        color: '#10B981'
      }
    ];
  }, [getDesignStats]);

  const StatCard = ({ stat }) => (
    <View style={[styles.statCard, { backgroundColor: stat.color }]}>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.title}</Text>
      </View>
      <Icon name={stat.icon} size={24} color="white" />
    </View>
  );

  if (loading && !hasDesigns) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F64BF" />
        <Text style={styles.loadingText}>Cargando diseños...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#1F64BF']}
          />
        }
      >
        {/* Header */}
        <CustomCard style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Gestión de Diseños</Text>
              <Text style={styles.subtitle}>
                Administra diseños personalizados y cotizaciones
              </Text>
            </View>
            <CustomButton
              onPress={() => setShowCreateModal(true)}
              icon="plus"
            >
              Nuevo Diseño
            </CustomButton>
          </View>
        </CustomCard>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </View>

        {/* Búsqueda */}
        <CustomCard style={styles.searchCard}>
          <CustomSearchBar
            placeholder="Buscar diseños..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </CustomCard>

        {/* Lista de Diseños */}
        <CustomCard style={styles.designsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Diseños ({designs.length})</Text>
          </View>

          {designs.length > 0 ? (
            <View style={styles.designsList}>
              {designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  onView={handleViewDesign}
                  onEdit={() => {}} // Implementar si es necesario
                  onClone={() => {}} // Implementar si es necesario
                  onQuote={handleQuoteDesign}
                  loading={actionLoading}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="palette" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay diseños</Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer diseño personalizado
              </Text>
            </View>
          )}
        </CustomCard>
      </ScrollView>

      {/* Modales */}
      <CreateDesignModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />

      <SimpleQuoteModal
        visible={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleQuoteSubmitted}
        design={quotingDesign}
        loading={actionLoading}
      />

      <SimpleDesignViewer
        visible={showViewerModal}
        onClose={() => setShowViewerModal(false)}
        design={viewingDesign}
      />
    </View>
  );
};

// ================ ESTILOS SIMPLIFICADOS ================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCard: {
    marginTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010326',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#1F64BF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  searchCard: {
    marginVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#010326',
  },
  designsCard: {
    marginVertical: 8,
    minHeight: 200,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
  },
  designsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DesignManagementScreen;