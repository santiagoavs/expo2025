import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Badge,
  Paper,
  Divider,
  Skeleton,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  Select,
  InputLabel,
  Switch,
  FormControlLabel,
  styled,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MapPin as LocationIcon,
  House as HomeIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  Compass as DepartmentIcon,
  Funnel as FilterIcon,
  Eye as ViewIcon,
  EyeSlash as HideIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
  ArrowsOut as FullscreenIcon,
  ArrowsIn as ExitFullscreenIcon,
  Target as CenterIcon,
  List as ListIcon,
  DotsThree as MoreIcon,
  Pencil as EditIcon,
  Trash as DeleteIcon,
  Star as StarIcon
} from '@phosphor-icons/react';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ================ ESTILOS STYLED COMPONENTS ================
const AddressMapContainer = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  overflow: 'hidden',
  fontFamily: "'Mona Sans'",
  height: '700px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    height: '650px',
  },
  [theme.breakpoints.down('md')]: {
    height: '600px',
    borderRadius: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '500px',
  }
}));

const AddressMapHeader = styled(Box)(({ theme }) => ({
  padding: '24px 32px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  zIndex: 1000,
  [theme.breakpoints.down('lg')]: {
    padding: '20px 24px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '16px 20px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const AddressMapTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '1.2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  }
}));

const AddressMapControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  [theme.breakpoints.down('lg')]: {
    gap: '10px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    justifyContent: 'flex-start',
    gap: '8px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '6px',
  }
}));

const AddressMapControlButton = styled(Button)(({ theme, variant: controlVariant, active }) => {
  const variants = {
    filter: {
      background: active ? alpha('#1F64BF', 0.1) : '#F2F2F2',
      color: active ? '#1F64BF' : '#032CA6',
      border: `1px solid ${active ? alpha('#1F64BF', 0.2) : 'transparent'}`,
    },
    action: {
      background: alpha('#1F64BF', 0.1),
      color: '#1F64BF',
      border: `1px solid ${alpha('#1F64BF', 0.2)}`,
    }
  };

  const selectedVariant = variants[controlVariant] || variants.action;

  return {
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    minWidth: 'auto',
    transition: 'all 0.2s ease',
    ...selectedVariant,
    '&:hover': {
      background: active ? alpha('#1F64BF', 0.15) : alpha('#1F64BF', 0.08),
      transform: 'translateY(-1px)',
    },
    [theme.breakpoints.down('md')]: {
      padding: '6px 10px',
      fontSize: '0.8rem',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '6px 8px',
      fontSize: '0.75rem',
    }
  };
});

const AddressMapBody = styled(Box)({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  '& .leaflet-container': {
    width: '100%',
    height: '100%',
    fontFamily: "'Mona Sans'",
  },
  '& .leaflet-control-zoom': {
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '& .leaflet-control-zoom a': {
    backgroundColor: 'white',
    color: '#1F64BF',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '26px',
    fontFamily: "'Mona Sans'",
    '&:hover': {
      backgroundColor: alpha('#1F64BF', 0.1),
    },
    '&:first-of-type': {
      borderRadius: '8px 8px 0 0',
    },
    '&:last-of-type': {
      borderRadius: '0 0 8px 8px',
    },
  }
});

const AddressMapSidebar = styled(Box)(({ theme, open }) => ({
  position: 'absolute',
  top: 0,
  right: open ? 0 : '-350px',
  width: '350px',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderLeft: `1px solid ${alpha('#1F64BF', 0.1)}`,
  transition: 'right 0.3s ease',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: '300px',
    right: open ? 0 : '-300px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    right: open ? 0 : '-100%',
  }
}));

const AddressSidebarHeader = styled(Box)(({ theme }) => ({
  padding: '20px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'white',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const AddressSidebarTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  }
}));

const AddressSidebarContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha('#1F64BF', 0.05),
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha('#1F64BF', 0.2),
    borderRadius: '10px',
    '&:hover': {
      background: alpha('#1F64BF', 0.3),
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const AddressMapLegend = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  padding: '16px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  zIndex: 500,
  minWidth: '200px',
  [theme.breakpoints.down('md')]: {
    bottom: '16px',
    left: '16px',
    padding: '12px',
    minWidth: '180px',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: '12px',
    left: '12px',
    padding: '10px',
    minWidth: '160px',
  }
}));

const AddressLegendTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '8px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    marginBottom: '6px',
  }
}));

const AddressLegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '6px',
  fontSize: '0.8rem',
  color: '#032CA6',
  fontFamily: "'Mona Sans'",
  '&:last-child': {
    marginBottom: 0,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    marginBottom: '4px',
  }
}));

const AddressMarkerIndicator = styled(Box)(({ status }) => {
  const statusConfig = {
    active: {
      backgroundColor: '#10B981',
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)'
    },
    inactive: {
      backgroundColor: '#EF4444',
      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)'
    },
    default: {
      backgroundColor: '#F59E0B',
      boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.3)'
    }
  };

  return {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    ...(statusConfig[status] || statusConfig.active)
  };
});

const AddressInfoCard = styled(Card)(({ theme }) => ({
  marginBottom: '12px',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  background: 'white',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.1)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '10px',
  }
}));

const AddressInfoContent = styled(CardContent)(({ theme }) => ({
  padding: '16px !important',
  '&:last-child': {
    paddingBottom: '16px !important',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px !important',
    '&:last-child': {
      paddingBottom: '12px !important',
    },
  }
}));

const AddressInfoHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '8px',
});

const AddressInfoName = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
  }
}));

const AddressInfoDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const AddressInfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem',
  color: '#032CA6',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const AddressStatusChip = styled(Chip)(({ status }) => {
  const statusConfig = {
    active: {
      backgroundColor: alpha('#10B981', 0.1),
      color: '#10B981',
      border: `1px solid ${alpha('#10B981', 0.2)}`
    },
    inactive: {
      backgroundColor: alpha('#EF4444', 0.1),
      color: '#EF4444',
      border: `1px solid ${alpha('#EF4444', 0.2)}`
    }
  };

  return {
    fontSize: '0.7rem',
    fontWeight: 600,
    height: '20px',
    fontFamily: "'Mona Sans'",
    ...(statusConfig[status] || statusConfig.active)
  };
});

const AddressDefaultBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 6px',
  borderRadius: '6px',
  backgroundColor: alpha('#F59E0B', 0.1),
  color: '#F59E0B',
  fontSize: '0.7rem',
  fontWeight: 600,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
    padding: '2px 4px',
  }
}));

const AddressLoadingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  background: alpha('#1F64BF', 0.02),
});

const AddressEmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '40px',
  textAlign: 'center',
  background: alpha('#1F64BF', 0.02),
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

const AddressEmptyIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: alpha('#1F64BF', 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  color: '#1F64BF',
  [theme.breakpoints.down('sm')]: {
    width: '60px',
    height: '60px',
    marginBottom: '16px',
  }
}));

// ================ COMPONENTES AUXILIARES ================

// Controlador para ajustar vista del mapa
const AddressMapViewController = ({ addresses, selectedDepartment, zoomToAddress }) => {
  const map = useMap();

  useEffect(() => {
    if (addresses.length === 0) return;

    // Si hay un departamento seleccionado, enfocar en él
    if (selectedDepartment && addresses.some(addr => addr.department === selectedDepartment)) {
      const departmentAddresses = addresses.filter(addr => addr.department === selectedDepartment);
      if (departmentAddresses.length > 0) {
        const bounds = L.latLngBounds();
        departmentAddresses.forEach(addr => {
          if (addr.coordinates && addr.coordinates.length >= 2) {
            bounds.extend([addr.coordinates[1], addr.coordinates[0]]);
          }
        });
        
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    } else {
      // Mostrar todas las direcciones
      const bounds = L.latLngBounds();
      addresses.forEach(addr => {
        if (addr.coordinates && addr.coordinates.length >= 2) {
          bounds.extend([addr.coordinates[1], addr.coordinates[0]]);
        }
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, addresses, selectedDepartment]);

  useEffect(() => {
    if (zoomToAddress && zoomToAddress.coordinates && zoomToAddress.coordinates.length >= 2) {
      map.setView([zoomToAddress.coordinates[1], zoomToAddress.coordinates[0]], 15);
    }
  }, [map, zoomToAddress]);

  return null;
};

// Componente para manejar clusters de marcadores
const AddressMarkersLayer = ({ addresses, onMarkerClick, showInactive, showDefault }) => {
  const map = useMap();
  const markersRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Limpiar marcadores previos
    if (markersRef.current) {
      map.removeLayer(markersRef.current);
    }

    // Crear grupo de clusters
    markersRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50
    });

    // Filtrar direcciones según configuración
    const filteredAddresses = addresses.filter(addr => {
      if (!addr.coordinates || addr.coordinates.length < 2) return false;
      if (!showInactive && !addr.isActive) return false;
      return true;
    });

    // Crear marcadores
    filteredAddresses.forEach(address => {
      const [lng, lat] = address.coordinates;
      
      // Crear icono personalizado según estado
      let iconColor = '#10B981'; // Activa
      if (!address.isActive) iconColor = '#EF4444'; // Inactiva
      if (address.isDefault) iconColor = '#F59E0B'; // Predeterminada

      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 12px;
            height: 12px;
            background-color: ${iconColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
          "></div>
        `,
        className: 'address-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      
      // Popup con información
      const popupContent = `
        <div style="font-family: 'Mona Sans'; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <strong style="color: #010326; font-size: 0.9rem;">${address.userName}</strong>
            <span style="
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.7rem;
              font-weight: 600;
              background-color: ${address.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
              color: ${address.isActive ? '#10B981' : '#EF4444'};
            ">${address.statusText}</span>
          </div>
          ${address.isDefault ? `
            <div style="margin-bottom: 6px;">
              <span style="
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.7rem;
                font-weight: 600;
                background-color: rgba(245, 158, 11, 0.1);
                color: #F59E0B;
              ">⭐ Principal</span>
            </div>
          ` : ''}
          <div style="color: #032CA6; font-size: 0.8rem; margin-bottom: 4px;">
            📍 ${address.address}
          </div>
          <div style="color: #032CA6; font-size: 0.8rem; margin-bottom: 4px;">
            🏢 ${address.municipality}, ${address.department}
          </div>
          <div style="color: #032CA6; font-size: 0.8rem; margin-bottom: 8px;">
            📞 ${address.formattedPhone}
          </div>
          <div style="text-align: center;">
            <button 
              onclick="window.handleAddressAction && window.handleAddressAction('view', '${address.id}')"
              style="
                background: linear-gradient(135deg, #1F64BF 0%, #032CA6 100%);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                font-family: 'Mona Sans';
              "
            >Ver Detalles</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'address-popup'
      });

      // Evento click
      marker.on('click', () => {
        onMarkerClick?.(address);
      });

      markersRef.current.addLayer(marker);
    });

    map.addLayer(markersRef.current);

    return () => {
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
      }
    };
  }, [map, addresses, onMarkerClick, showInactive, showDefault]);

  return null;
};

// ================ COMPONENTE PRINCIPAL ================
const AddressMap = ({
  addresses = [],
  loading = false,
  onEdit,
  onDelete,
  selectedDepartment = '',
  onDepartmentSelect
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ==================== ESTADOS LOCALES ====================
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInactiveAddresses, setShowInactiveAddresses] = useState(true);
  const [showDefaultOnly, setShowDefaultOnly] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [zoomToAddress, setZoomToAddress] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // ==================== DATOS CALCULADOS ====================
  const filteredAddresses = useMemo(() => {
    let filtered = addresses.filter(addr => {
      // Filtrar por coordenadas válidas
      if (!addr.coordinates || addr.coordinates.length < 2) return false;
      
      // Filtrar por departamento seleccionado
      if (selectedDepartment && addr.department !== selectedDepartment) return false;
      
      // Filtrar por solo predeterminadas
      if (showDefaultOnly && !addr.isDefault) return false;
      
      return true;
    });
    
    return filtered;
  }, [addresses, selectedDepartment, showDefaultOnly]);

  const statistics = useMemo(() => {
    const total = filteredAddresses.length;
    const active = filteredAddresses.filter(addr => addr.isActive).length;
    const defaultAddresses = filteredAddresses.filter(addr => addr.isDefault).length;
    const departments = [...new Set(filteredAddresses.map(addr => addr.department))];
    
    return {
      total,
      active,
      inactive: total - active,
      defaultAddresses,
      departments: departments.length,
      departmentsList: departments
    };
  }, [filteredAddresses]);

  // El Salvador bounds y center
  const elSalvadorBounds = [
    [13.148, -90.128], // Southwest
    [14.445, -87.692]  // Northeast
  ];
  const elSalvadorCenter = [13.6929, -89.2182];

  // ==================== MANEJADORES ====================
  const handleMarkerClick = (address) => {
    setSelectedAddress(address);
    setShowSidebar(true);
  };

  const handleAddressSelect = (address) => {
    setZoomToAddress(address);
    setSelectedAddress(address);
  };

  const handleMenuOpen = (event, address) => {
    setAnchorEl(event.currentTarget);
    setSelectedAddress(address);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action) => {
    if (!selectedAddress) return;
    
    switch (action) {
      case 'edit':
        onEdit?.(selectedAddress);
        break;
      case 'delete':
        onDelete?.(selectedAddress.id);
        break;
      case 'view':
        handleAddressSelect(selectedAddress);
        break;
    }
    
    handleMenuClose();
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // ==================== EFECTOS ====================
  useEffect(() => {
    // Función global para manejar acciones desde popups
    window.handleAddressAction = (action, addressId) => {
      const address = addresses.find(addr => addr.id === addressId);
      if (address) {
        if (action === 'view') {
          handleAddressSelect(address);
        }
      }
    };

    return () => {
      delete window.handleAddressAction;
    };
  }, [addresses]);

  // ==================== RENDER ====================
  if (loading) {
    return (
      <AddressMapContainer>
        <AddressMapHeader>
          <AddressMapTitle>
            <LocationIcon size={20} />
            Mapa de Direcciones
          </AddressMapTitle>
        </AddressMapHeader>
        <AddressLoadingContainer>
          <Box sx={{ textAlign: 'center' }}>
            <Skeleton variant="rectangular" width={200} height={20} sx={{ mb: 2, mx: 'auto' }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </AddressLoadingContainer>
      </AddressMapContainer>
    );
  }

  if (filteredAddresses.length === 0) {
    return (
      <AddressMapContainer>
        <AddressMapHeader>
          <AddressMapTitle>
            <LocationIcon size={20} />
            Mapa de Direcciones
          </AddressMapTitle>
          
          <AddressMapControls>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={selectedDepartment}
                label="Departamento"
                onChange={(e) => onDepartmentSelect?.(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {statistics.departmentsList.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </AddressMapControls>
        </AddressMapHeader>
        
        <AddressEmptyState>
          <AddressEmptyIcon>
            <LocationIcon size={32} weight="duotone" />
          </AddressEmptyIcon>
          <Typography variant="h6" sx={{ 
            color: '#010326', 
            fontWeight: 600, 
            mb: 1,
            fontFamily: "'Mona Sans'" 
          }}>
            No hay direcciones para mostrar
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#032CA6',
            fontFamily: "'Mona Sans'" 
          }}>
            {selectedDepartment 
              ? `No se encontraron direcciones en ${selectedDepartment}`
              : 'Las direcciones con coordenadas aparecerán aquí'
            }
          </Typography>
        </AddressEmptyState>
      </AddressMapContainer>
    );
  }

  return (
    <AddressMapContainer sx={{ height: fullscreen ? '100vh' : '700px' }}>
      {/* Header del Mapa */}
      <AddressMapHeader>
        <AddressMapTitle>
          <LocationIcon size={20} />
          Mapa de Direcciones
          <Badge 
            badgeContent={filteredAddresses.length} 
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': { 
                fontFamily: "'Mona Sans'",
                fontWeight: 600 
              } 
            }}
          />
        </AddressMapTitle>

        <AddressMapControls>
          {/* Filtro por Departamento */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Departamento</InputLabel>
            <Select
              value={selectedDepartment}
              label="Departamento"
              onChange={(e) => onDepartmentSelect?.(e.target.value)}
              sx={{ fontFamily: "'Mona Sans'" }}
            >
              <MenuItem value="">Todos ({statistics.departments})</MenuItem>
              {statistics.departmentsList.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Toggle Direcciones Inactivas */}
          <AddressMapControlButton
            variant="filter"
            active={showInactiveAddresses}
            size="small"
            onClick={() => setShowInactiveAddresses(!showInactiveAddresses)}
            startIcon={showInactiveAddresses ? <ViewIcon size={14} /> : <HideIcon size={14} />}
          >
            Inactivas
          </AddressMapControlButton>

          {/* Toggle Solo Predeterminadas */}
          <AddressMapControlButton
            variant="filter"
            active={showDefaultOnly}
            size="small"
            onClick={() => setShowDefaultOnly(!showDefaultOnly)}
            startIcon={<StarIcon size={14} />}
          >
            Solo Principales
          </AddressMapControlButton>

          {/* Toggle Sidebar */}
          <AddressMapControlButton
            variant="action"
            size="small"
            onClick={() => setShowSidebar(!showSidebar)}
            startIcon={<ListIcon size={14} />}
          >
            {isMobile ? 'Lista' : 'Ver Lista'}
          </AddressMapControlButton>

          {/* Toggle Fullscreen */}
          <Tooltip title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                color: '#1F64BF',
                backgroundColor: alpha('#1F64BF', 0.1),
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: alpha('#1F64BF', 0.15),
                }
              }}
            >
              {fullscreen ? <ExitFullscreenIcon size={16} /> : <FullscreenIcon size={16} />}
            </IconButton>
          </Tooltip>
        </AddressMapControls>
      </AddressMapHeader>

      {/* Cuerpo del Mapa */}
      <AddressMapBody>
        <MapContainer
          center={elSalvadorCenter}
          zoom={9}
          style={{ width: '100%', height: '100%' }}
          bounds={elSalvadorBounds}
          maxBounds={elSalvadorBounds}
          maxBoundsViscosity={1.0}
          minZoom={8}
          maxZoom={18}
          zoomControl={true}
          attributionControl={true}
        >
          {/* Capa de Tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Controlador de Vista */}
          <AddressMapViewController
            addresses={filteredAddresses}
            selectedDepartment={selectedDepartment}
            zoomToAddress={zoomToAddress}
          />

          {/* Capa de Marcadores */}
          <AddressMarkersLayer
            addresses={filteredAddresses}
            onMarkerClick={handleMarkerClick}
            showInactive={showInactiveAddresses}
            showDefault={showDefaultOnly}
          />
        </MapContainer>

        {/* Leyenda */}
        <AddressMapLegend>
          <AddressLegendTitle>Estado de Direcciones</AddressLegendTitle>
          
          <AddressLegendItem>
            <AddressMarkerIndicator status="active" />
            <span>Activas ({statistics.active})</span>
          </AddressLegendItem>
          
          {showInactiveAddresses && (
            <AddressLegendItem>
              <AddressMarkerIndicator status="inactive" />
              <span>Inactivas ({statistics.inactive})</span>
            </AddressLegendItem>
          )}
          
          <AddressLegendItem>
            <AddressMarkerIndicator status="default" />
            <span>Principales ({statistics.defaultAddresses})</span>
          </AddressLegendItem>

          <Divider sx={{ my: 1 }} />
          
          <AddressLegendItem>
            <LocationIcon size={12} color="#032CA6" />
            <span>Total: {statistics.total}</span>
          </AddressLegendItem>
        </AddressMapLegend>

        {/* Sidebar */}
        <AddressMapSidebar open={showSidebar}>
          <AddressSidebarHeader>
            <AddressSidebarTitle>
              Direcciones ({filteredAddresses.length})
            </AddressSidebarTitle>
            
            <IconButton
              onClick={() => setShowSidebar(false)}
              size="small"
              sx={{ color: '#032CA6' }}
            >
              <MinusIcon size={16} />
            </IconButton>
          </AddressSidebarHeader>

          <AddressSidebarContent>
            {filteredAddresses.length > 0 ? (
              filteredAddresses.map((address) => (
                <AddressInfoCard
                  key={address.id}
                  onClick={() => handleAddressSelect(address)}
                >
                  <AddressInfoContent>
                    <AddressInfoHeader>
                      <AddressInfoName>
                        {address.userName}
                        {address.isDefault && (
                          <AddressDefaultBadge sx={{ ml: 1 }}>
                            <StarIcon size={10} weight="fill" />
                            Principal
                          </AddressDefaultBadge>
                        )}
                      </AddressInfoName>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddressStatusChip 
                          status={address.isActive ? 'active' : 'inactive'}
                          label={address.statusText}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, address);
                          }}
                          sx={{ color: '#032CA6' }}
                        >
                          <MoreIcon size={14} />
                        </IconButton>
                      </Box>
                    </AddressInfoHeader>

                    <AddressInfoDetails>
                      <AddressInfoRow>
                        <HomeIcon size={12} />
                        <span>{address.address}</span>
                      </AddressInfoRow>
                      
                      <AddressInfoRow>
                        <DepartmentIcon size={12} />
                        <span>{address.municipality}, {address.department}</span>
                      </AddressInfoRow>
                      
                      <AddressInfoRow>
                        <PhoneIcon size={12} />
                        <span>{address.formattedPhone}</span>
                      </AddressInfoRow>

                      {address.additionalDetails && (
                        <AddressInfoRow>
                          <LocationIcon size={12} />
                          <span>{address.additionalDetails}</span>
                        </AddressInfoRow>
                      )}
                    </AddressInfoDetails>
                  </AddressInfoContent>
                </AddressInfoCard>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ 
                  color: '#032CA6',
                  fontFamily: "'Mona Sans'" 
                }}>
                  No hay direcciones que mostrar con los filtros actuales
                </Typography>
              </Box>
            )}
          </AddressSidebarContent>
        </AddressMapSidebar>
      </AddressMapBody>

      {/* Menú Contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha('#1F64BF', 0.1)}`,
            minWidth: '180px'
          }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <ViewIcon size={16} color="#1F64BF" />
          </ListItemIcon>
          <ListItemText 
            primary="Ver en mapa" 
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontFamily: "'Mona Sans'"
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon size={16} color="#1F64BF" />
          </ListItemIcon>
          <ListItemText 
            primary="Editar dirección" 
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontFamily: "'Mona Sans'"
            }}
          />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuAction('delete')}
          sx={{ color: '#EF4444' }}
        >
          <ListItemIcon>
            <DeleteIcon size={16} color="#EF4444" />
          </ListItemIcon>
          <ListItemText 
            primary="Eliminar dirección" 
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontFamily: "'Mona Sans'",
              color: '#EF4444'
            }}
          />
        </MenuItem>
      </Menu>
    </AddressMapContainer>
  );
};

export default AddressMap;