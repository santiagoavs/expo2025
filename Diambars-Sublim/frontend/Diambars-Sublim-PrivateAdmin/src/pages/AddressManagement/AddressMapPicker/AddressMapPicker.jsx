import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Paper,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import {
  MapPin as LocationIcon,
  Compass as CenterIcon,
  MagnifyingGlass as SearchIcon,
  Target as CrosshairIcon,
  Check as ConfirmIcon,
  ArrowsOut as FullscreenIcon,
  ArrowsIn as ExitFullscreenIcon,
  Star as StarIcon,
  X as CloseIcon,
  Truck as TruckIcon,
  Warning as WarningIcon,
  XCircle as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@phosphor-icons/react';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import useGeolocation from '../../../hooks/useGeolocation';
import addressService from '../../../api/AddressService';
import geocodingService from '../../../api/GeocodingService';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ================ ESTILOS STYLED COMPONENTS ================
const AddressMapPickerContainer = styled(Box)(({ theme, isFullscreen }) => ({
  position: isFullscreen ? 'fixed' : 'relative',
  top: isFullscreen ? 0 : 'auto',
  left: isFullscreen ? 0 : 'auto',
  width: isFullscreen ? '100vw' : '100%',
  height: isFullscreen ? '100vh' : '100%',
  borderRadius: isFullscreen ? 0 : '12px',
  overflow: 'hidden',
  fontFamily: "'Mona Sans'",
  zIndex: isFullscreen ? 9999 : 'auto',
  backgroundColor: isFullscreen ? '#f8fafc' : 'transparent',
  display: 'flex',
  flexDirection: 'column',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    height: isFullscreen ? '100vh' : '300px',
    borderRadius: isFullscreen ? 0 : '8px',
  },
  [theme.breakpoints.up('sm')]: {
    height: isFullscreen ? '100vh' : '400px',
  },
  [theme.breakpoints.up('md')]: {
    height: isFullscreen ? '100vh' : '500px',
  },
  [theme.breakpoints.up('lg')]: {
    height: isFullscreen ? '100vh' : '600px',
  },
  '& .leaflet-container': {
    width: '100%',
    height: isFullscreen ? 'calc(100vh - 60px)' : '100%',
    borderRadius: isFullscreen ? 0 : '12px',
    fontFamily: "'Mona Sans'",
    flex: 1,
  },
  '& .leaflet-control-zoom': {
    border: 'none',
    borderRadius: '8px',
    boxShadow: isFullscreen ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
    marginTop: isFullscreen ? '80px' : '120px', // Más abajo para centrado vertical
    marginLeft: isFullscreen ? '20px' : '10px',
    // Responsive positioning
    [theme.breakpoints.down('xs')]: {
      marginTop: isFullscreen ? '70px' : '100px', // Ajustado para móviles
      marginLeft: isFullscreen ? '16px' : '8px',
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: isFullscreen ? '75px' : '110px',
    },
    [theme.breakpoints.up('md')]: {
      marginTop: isFullscreen ? '80px' : '120px',
    },
  },
  '& .leaflet-control-zoom a': {
    backgroundColor: '#ffffff',
    color: '#1F64BF',
    border: 'none',
    borderRadius: '0',
    fontWeight: 'bold',
    fontSize: isFullscreen ? '20px' : '16px',
    lineHeight: isFullscreen ? '32px' : '26px',
    textAlign: 'center',
    fontFamily: "'Mona Sans'",
    width: isFullscreen ? '40px' : '30px',
    height: isFullscreen ? '40px' : '30px',
    // Responsive sizing
    [theme.breakpoints.down('xs')]: {
      fontSize: isFullscreen ? '18px' : '14px',
      width: isFullscreen ? '36px' : '28px',
      height: isFullscreen ? '36px' : '28px',
    },
    '&:hover': {
      backgroundColor: alpha('#1F64BF', 0.1),
      color: '#1F64BF',
    },
    '&:first-of-type': {
      borderRadius: '8px 8px 0 0',
    },
    '&:last-of-type': {
      borderRadius: '0 0 8px 8px',
    },
  },
  '& .leaflet-control-attribution': {
    fontSize: isFullscreen ? '12px' : '10px',
    backgroundColor: alpha('#ffffff', 0.9),
    fontFamily: "'Mona Sans'",
    padding: isFullscreen ? '8px 12px' : '4px 8px',
    [theme.breakpoints.down('xs')]: {
      fontSize: isFullscreen ? '10px' : '8px',
      padding: isFullscreen ? '6px 10px' : '3px 6px',
    },
  },
}));

const AddressMapOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Mona Sans'",
}));

const AddressMapHeader = styled(Paper)(({ theme, isFullscreen }) => ({
  position: 'absolute',
  top: isFullscreen ? '0' : '12px',
  left: isFullscreen ? '0' : '12px',
  right: isFullscreen ? '0' : '12px',
  padding: isFullscreen ? '8px 20px' : '12px 16px',
  backgroundColor: isFullscreen ? alpha('#ffffff', 0.98) : alpha('#ffffff', 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: isFullscreen ? '0' : '12px',
  border: isFullscreen ? 'none' : `1px solid ${alpha('#1F64BF', 0.1)}`,
  borderBottom: isFullscreen ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
  boxShadow: isFullscreen ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'auto',
  zIndex: 1001,
  height: isFullscreen ? '60px' : 'auto',
  minHeight: isFullscreen ? '60px' : 'auto',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    top: isFullscreen ? '0' : '8px',
    left: isFullscreen ? '0' : '8px',
    right: isFullscreen ? '0' : '8px',
    padding: isFullscreen ? '6px 12px' : '8px 10px',
    height: isFullscreen ? '50px' : 'auto',
    minHeight: isFullscreen ? '50px' : 'auto',
  },
  [theme.breakpoints.up('sm')]: {
    padding: isFullscreen ? '8px 18px' : '10px 14px',
  },
  [theme.breakpoints.up('md')]: {
    padding: isFullscreen ? '8px 20px' : '12px 16px',
  }
}));

const AddressMapHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
  },
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  [theme.breakpoints.up('md')]: {
    gap: '12px',
  }
}));

const AddressMapTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Mona Sans'",
  flex: 1,
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    fontSize: '0.75rem',
    gap: '6px',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.85rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '0.9rem',
  }
}));

const AddressMapControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    gap: '4px',
    flexWrap: 'wrap',
    alignSelf: 'flex-end',
  },
  [theme.breakpoints.up('sm')]: {
    gap: '6px',
    alignSelf: 'flex-end',
  },
  [theme.breakpoints.up('md')]: {
    gap: '8px',
  }
}));

const AddressMapControlButton = styled(IconButton)(({ theme }) => ({
  width: '32px',
  height: '32px',
  backgroundColor: alpha('#1F64BF', 0.1),
  color: '#1F64BF',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#1F64BF', 0.15),
    transform: 'translateY(-1px)',
  },
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    width: '24px',
    height: '24px',
    '& svg': {
      width: '14px',
      height: '14px',
    }
  },
  [theme.breakpoints.up('sm')]: {
    width: '28px',
    height: '28px',
  },
  [theme.breakpoints.up('md')]: {
    width: '32px',
    height: '32px',
  }
}));

const AddressMapFooter = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: '12px',
  left: '12px',
  right: '12px',
  padding: '16px',
  backgroundColor: alpha('#ffffff', 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'auto',
  zIndex: 1001,
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    bottom: '8px',
    left: '8px',
    right: '8px',
    padding: '12px',
    borderRadius: '8px',
  },
  [theme.breakpoints.up('sm')]: {
    bottom: '10px',
    left: '10px',
    right: '10px',
    padding: '14px',
  },
  [theme.breakpoints.up('md')]: {
    bottom: '12px',
    left: '12px',
    right: '12px',
    padding: '16px',
  }
}));

const AddressCoordinatesInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '12px',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '10px',
  },
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    gap: '10px',
  },
  [theme.breakpoints.up('md')]: {
    gap: '12px',
  }
}));

const AddressCoordinatesText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: '#032CA6',
  fontWeight: 500,
  fontFamily: "'Mona Sans'",
  marginBottom: '4px',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    fontSize: '0.75rem',
    marginBottom: '3px',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '0.85rem',
  }
}));

const AddressConfirmButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 2px 8px rgba(31, 100, 191, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.4)',
  },
  '&:disabled': {
    background: alpha('#1F64BF', 0.3),
    boxShadow: 'none',
  },
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '0.75rem',
  },
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
    padding: '8px 14px',
    fontSize: '0.8rem',
  },
  [theme.breakpoints.up('md')]: {
    padding: '8px 16px',
    fontSize: '0.85rem',
  }
}));

const AddressSetDefaultButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  color: 'white',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
  },
  '&:disabled': {
    background: alpha('#F59E0B', 0.3),
    boxShadow: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: '10px 16px',
  }
}));

const AddressCrosshair = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1002,
  pointerEvents: 'none',
  color: '#EF4444',
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
}));

const AddressLoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: alpha('#ffffff', 0.8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  zIndex: 2000,
  borderRadius: '12px',
}));

const AddressErrorAlert = styled(Alert)(({ theme }) => ({
  position: 'absolute',
  top: '60px',
  left: '12px',
  right: '12px',
  zIndex: 1001,
  borderRadius: '8px',
  fontSize: '0.8rem',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    top: '50px',
    left: '8px',
    right: '8px',
  }
}));

const AddressLocationStatus = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '8px',
  backgroundColor: alpha('#10B981', 0.1),
  border: `1px solid ${alpha('#10B981', 0.2)}`,
  marginBottom: '8px',
  fontFamily: "'Mona Sans'",
}));

const AddressLocationStatusText = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: '#059669',
  fontWeight: 600,
  fontFamily: "'Mona Sans'",
}));

const AddressValidationStatus = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontFamily: "'Mona Sans'",
  fontWeight: 500,
  backgroundColor: status === 'valid' ? alpha('#10B981', 0.1) : 
                   status === 'invalid' ? alpha('#EF4444', 0.1) : 
                   alpha('#F59E0B', 0.1),
  color: status === 'valid' ? '#059669' : 
         status === 'invalid' ? '#DC2626' : 
         '#D97706',
  border: `1px solid ${status === 'valid' ? alpha('#10B981', 0.2) : 
                       status === 'invalid' ? alpha('#EF4444', 0.2) : 
                       alpha('#F59E0B', 0.2)}`,
}));

const AddressButtonStatus = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontFamily: "'Mona Sans'",
  fontWeight: 500,
  backgroundColor: alpha('#6B7280', 0.1),
  color: '#6B7280',
  border: `1px solid ${alpha('#6B7280', 0.2)}`,
  marginTop: '4px',
}));

const FullscreenInfoPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '80px',
  right: '20px',
  backgroundColor: alpha('#ffffff', 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  zIndex: 1000,
  minWidth: '280px',
  fontFamily: "'Mona Sans'",
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    top: '60px',
    right: '12px',
    left: '12px',
    minWidth: 'auto',
    padding: '12px',
    borderRadius: '8px',
  },
  [theme.breakpoints.up('sm')]: {
    top: '70px',
    right: '16px',
    minWidth: '260px',
  },
  [theme.breakpoints.up('md')]: {
    top: '80px',
    right: '20px',
    minWidth: '280px',
  }
}));

const FullscreenCoordinates = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '16px',
}));

const FullscreenCoordinateItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.875rem',
  color: '#374151',
}));

const FullscreenControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}));

const FullscreenControlButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '8px 12px',
  fontSize: '0.875rem',
  fontWeight: '500',
  borderRadius: '8px',
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
}));

const FullscreenZoomIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  backgroundColor: alpha('#ffffff', 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  zIndex: 1000,
  fontFamily: "'Mona Sans'",
  fontSize: '0.875rem',
  color: '#374151',
  fontWeight: '500',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    bottom: '12px',
    left: '12px',
    padding: '6px 10px',
    fontSize: '0.75rem',
  },
  [theme.breakpoints.up('sm')]: {
    bottom: '16px',
    left: '16px',
  },
  [theme.breakpoints.up('md')]: {
    bottom: '20px',
    left: '20px',
  }
}));

const LocationConfirmationToast = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: alpha('#ffffff', 0.98),
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '16px 20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  border: `1px solid ${alpha('#10B981', 0.2)}`,
  zIndex: 2000,
  fontFamily: "'Mona Sans'",
  textAlign: 'center',
  minWidth: '280px',
  // Responsive breakpoints
  [theme.breakpoints.down('xs')]: {
    minWidth: '240px',
    padding: '12px 16px',
    borderRadius: '8px',
  },
  [theme.breakpoints.up('sm')]: {
    minWidth: '260px',
    padding: '14px 18px',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: '280px',
    padding: '16px 20px',
  }
}));

// ================ COMPONENTES AUXILIARES ================

// Componente para manejar clicks en el mapa
const AddressMapClickHandler = ({ onLocationSelect, crosshairMode }) => {
  useMapEvents({
    click: (e) => {
      if (crosshairMode) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    },
  });
  return null;
};

// Componente para manejar el zoom del mapa
const AddressMapZoomHandler = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    }
  });
  return null;
};

// Componente para detectar interacción manual del usuario (MEJORADO)
const AddressMapInteractionHandler = ({ onUserInteraction }) => {
  useMapEvents({
    dragstart: () => {
      console.log('🗺️ [InteractionHandler] Usuario comenzó a arrastrar el mapa');
      onUserInteraction('drag');
    },
    drag: () => {
      // Reportar continuamente durante el drag para mantener la protección
      onUserInteraction('drag');
    },
    movestart: (e) => {
      // Solo reportar si el movimiento no es por código programático
      if (!e.target._animatingZoom && !e.target._moving && !e.target._mapPane?.classList?.contains('leaflet-zoom-anim')) {
        console.log('🗺️ [InteractionHandler] Usuario comenzó a mover el mapa manualmente');
        onUserInteraction('move');
      }
    },
    move: (e) => {
      // Detectar movimiento manual continuo
      if (!e.target._animatingZoom && !e.target._moving) {
        onUserInteraction('move');
      }
    },
    zoomstart: (e) => {
      console.log('🗺️ [InteractionHandler] Usuario comenzó a hacer zoom');
      onUserInteraction('zoom');
    },
    zoom: () => {
      // Reportar continuamente durante el zoom
      onUserInteraction('zoom');
    },
    click: () => {
      // Cualquier click indica interacción del usuario
      onUserInteraction('click');
    }
  });
  return null;
};

// Componente para centrar el mapa
const AddressMapCenterController = ({ center, shouldCenter, zoom = 15 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldCenter && center && map) {
      console.log('🗺️ [AddressMapCenterController] Centrando mapa en:', center, 'con zoom:', zoom);
      
      // Verificar que el mapa esté listo
      if (map.getContainer()) {
        map.flyTo([center.lat, center.lng], zoom, {
          animate: true,
          duration: 0.8,
          easeLinearity: 0.2
        });
        
        // Invalidación más conservadora del tamaño
        setTimeout(() => {
          if (map.getContainer()) {
            map.invalidateSize({ animate: false });
          }
        }, 200);
      }
    }
  }, [map, center, shouldCenter, zoom]);
  
  return null;
};

// ================ COMPONENTE PRINCIPAL ================
const AddressMapPicker = ({
  center = { lat: 13.6929, lng: -89.2182 }, // San Salvador
  zoom = 12,
  onLocationSelect,
  selectedLocation = null,
  disabled = false,
  height = '100%',
  // Nuevas props para funcionalidad de ubicación predeterminada
  onSetAsDefault = null,
  isDefaultLocation = false,
  showSetDefaultButton = false,
  userId = null,
  // Nuevas props para centrado automático por departamento/municipio
  selectedDepartment = null,
  selectedMunicipality = null,
  autoCenterOnLocationChange = true,
  // Nuevas props para auto-población de formulario
  onAddressDataChange = null,
  enableAutoFormPopulation = true,
  // Nueva prop para manejar limpieza de campos
  onClearFields = null,
  // Prop adicional para función de limpieza directa del formulario
  onClearAllFormFields = null
}) => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    reverseGeocode,
    isWithinElSalvador,
    getElSalvadorCenter,
    getElSalvadorBounds,
    getElSalvadorNavigationBounds,
    loading: geocoding
  } = useGeolocation();

  // ==================== ESTADOS LOCALES ====================
  const [currentLocation, setCurrentLocation] = useState(selectedLocation || center);
  const [crosshairMode, setCrosshairMode] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);
  const [deliveryTimeInfo, setDeliveryTimeInfo] = useState(null);
  const [settingAsDefault, setSettingAsDefault] = useState(false);
  const [showLocationPanel, setShowLocationPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [showConfirmationToast, setShowConfirmationToast] = useState(false);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false); // Bandera para evitar bucles
  const [lastAutoCenter, setLastAutoCenter] = useState(null); // Último auto-centrado
  const [lastProcessedLocation, setLastProcessedLocation] = useState(null); // Última ubicación procesada
  const [userInteracting, setUserInteracting] = useState(false); // Rastrea si el usuario está interactuando manualmente

  const mapRef = useRef(null);
  const reverseGeocodingTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false); // Ref para evitar múltiples procesamientos

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (selectedLocation) {
      setCurrentLocation(selectedLocation);
      setCrosshairMode(false);
    }
  }, [selectedLocation]);

  // Efecto para centrar automáticamente el mapa cuando cambien departamento/municipio (COMPLETAMENTE DESHABILITADO)
  // NOTA: Este efecto está COMPLETAMENTE DESHABILITADO para evitar auto-centrado no deseado
  // cuando el usuario navega manualmente por el mapa
  /*
  useEffect(() => {
    // DESHABILITADO PERMANENTEMENTE - causaba auto-centrado no deseado durante navegación manual
    console.log('🗺️ [AddressMapPicker] Auto-centrado por departamento/municipio DESHABILITADO');
  }, [selectedDepartment, selectedMunicipality, autoCenterOnLocationChange, isAutoPopulating, lastAutoCenter]);
  */

  // Efecto para centrar automáticamente cuando cambie currentLocation (OPTIMIZADO)
  useEffect(() => {
    if (currentLocation && !crosshairMode && mapReady && !userInteracting) {
      console.log('🗺️ [AddressMapPicker] Evaluando auto-centrado:', {
        currentLocation: !!currentLocation,
        crosshairMode,
        mapReady,
        userInteracting
      });
      
      // Solo auto-centrar si la ubicación cambió significativamente (más de 100m)
      if (selectedLocation && currentLocation) {
        const distance = calculateDistance(
          selectedLocation.lat, selectedLocation.lng,
          currentLocation.lat, currentLocation.lng
        );
        
        // Solo centrar si el cambio es significativo y el usuario no está interactuando
        if (distance > 0.1) { // 100 metros
          console.log('🗺️ [AddressMapPicker] Auto-centrando por cambio significativo de ubicación');
          setShouldCenter(true);
          setTimeout(() => setShouldCenter(false), 300);
        }
      } else {
        // Primera vez o no hay ubicación previa
        console.log('🗺️ [AddressMapPicker] Auto-centrando por nueva ubicación inicial');
        setShouldCenter(true);
        setTimeout(() => setShouldCenter(false), 300);
      }
    } else if (userInteracting) {
      console.log('🗺️ [AddressMapPicker] Auto-centrado OMITIDO - usuario interactuando con el mapa');
    }
  }, [currentLocation, crosshairMode, mapReady, selectedLocation, userInteracting]);

  // Auto reverse geocoding con auto-población de formulario
  useEffect(() => {
    const performReverseGeocode = async () => {
      // Verificar si ya estamos procesando para evitar bucles
      if (isProcessingRef.current) {
        console.log('🗺️ [AddressMapPicker] Saltando reverse geocoding - ya procesando');
        return;
      }
      
      // Verificar si la ubicación ya fue procesada
      if (lastProcessedLocation && currentLocation &&
          Math.abs(lastProcessedLocation.lat - currentLocation.lat) < 0.0001 &&
          Math.abs(lastProcessedLocation.lng - currentLocation.lng) < 0.0001) {
        console.log('🗺️ [AddressMapPicker] Saltando reverse geocoding - ubicación ya procesada');
        return;
      }
      
      console.log('🗺️ [useEffect] Evaluando condiciones para reverse geocoding:', {
        currentLocation: !!currentLocation,
        crosshairMode,
        enableAutoFormPopulation,
        hasCallback: !!onAddressDataChange,
        isAutoPopulating,
        isProcessing: isProcessingRef.current
      });
      
      if (currentLocation && !crosshairMode && enableAutoFormPopulation && onAddressDataChange) {
        try {
          // Marcar que estamos procesando
          isProcessingRef.current = true;
          setIsAutoPopulating(true);
          
          console.log('🗺️ [AddressMapPicker] Iniciando reverse geocoding para:', currentLocation);
          
          // Usar el servicio de geocodificación
          const result = await reverseGeocode(currentLocation.lat, currentLocation.lng);
          
          if (result && result.addressComponents) {
            console.log('🗺️ [AddressMapPicker] Resultado de reverse geocoding:', result);
            
            // Actualizar addressInfo
            setAddressInfo(result.addressComponents);
            
            // Marcar esta ubicación como procesada
            setLastProcessedLocation({
              lat: currentLocation.lat,
              lng: currentLocation.lng
            });
            
            console.log('🗺️ [AddressMapPicker] Auto-poblando formulario con:', result.addressComponents);
            
            // Calcular tiempo estimado de entrega desde San Salvador
            const deliveryTimeInfo = calculateDeliveryTime(currentLocation.lat, currentLocation.lng);
            console.log('🚚 [AddressMapPicker] Tiempo estimado de entrega calculado:', deliveryTimeInfo);
            
            // Actualizar estado del tiempo de entrega
            setDeliveryTimeInfo(deliveryTimeInfo);
            
            const formData = {
              department: result.addressComponents.department || '',
              municipality: result.addressComponents.municipality || '',
              suggestedAddress: result.addressComponents.formattedAddress || '',
              coordinates: {
                lat: currentLocation.lat,
                lng: currentLocation.lng
              },
              // Información de tiempo de entrega calculado
              estimatedDeliveryTime: deliveryTimeInfo.estimatedMinutes,
              estimatedDeliveryTimeFormatted: deliveryTimeInfo.formattedTime,
              deliveryDistance: deliveryTimeInfo.distance,
              confidence: 'medium',
              isAutoPopulated: true,
              source: 'geocoding_service',
              timestamp: new Date().toISOString()
            };
            
            console.log('🗺️ [AddressMapPicker] Enviando datos al formulario:', formData);
            onAddressDataChange(formData);
            
          } else {
            console.warn('⚠️ [AddressMapPicker] No se obtuvo resultado válido del reverse geocoding');
          }
        } catch (error) {
          console.error('❌ [AddressMapPicker] Reverse geocoding failed:', error);
          setError('Error al obtener información de la ubicación');
        } finally {
          // Siempre limpiar las banderas de procesamiento
          setTimeout(() => {
            isProcessingRef.current = false;
            setIsAutoPopulating(false);
          }, 2000);
        }
      } else {
        console.log('🗺️ [AddressMapPicker] Saltando reverse geocoding - condiciones no cumplidas');
      }
    };

    // Limpiar timeout anterior si existe
    if (reverseGeocodingTimeoutRef.current) {
      clearTimeout(reverseGeocodingTimeoutRef.current);
    }

    // Solo ejecutar si no estamos procesando
    if (!isProcessingRef.current) {
      reverseGeocodingTimeoutRef.current = setTimeout(performReverseGeocode, 1500);
    }
    
    return () => {
      if (reverseGeocodingTimeoutRef.current) {
        clearTimeout(reverseGeocodingTimeoutRef.current);
        console.log('🗺️ [AddressMapPicker] Limpiando timeout de reverse geocoding');
      }
    };
  }, [currentLocation, crosshairMode, reverseGeocode, enableAutoFormPopulation, onAddressDataChange]);

  // Efecto para manejar tecla Escape en pantalla completa
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen]);

  // ==================== MANEJADORES ====================
  const handleLocationSelect = useCallback((location) => {
    console.log('🗺️ [handleLocationSelect] Nueva ubicación seleccionada:', location);
    
    // Validar que esté dentro de El Salvador (usando límites ULTRA-ESTRICTOS)
    if (!isWithinElSalvador(location.lat, location.lng)) {
      setError('La ubicación debe estar ÚNICAMENTE dentro del territorio de El Salvador. No se permite colocación en fronteras, océano o países vecinos.');
      return;
    }

    // Limpiar COMPLETAMENTE el estado anterior
    setAddressInfo(null);
    setDeliveryTimeInfo(null);
    setError(null);
    setIsAutoPopulating(false);
    setLastAutoCenter(null);
    setLastProcessedLocation(null); // Resetear ubicación procesada
    isProcessingRef.current = false; // Resetear ref de procesamiento
    
    // Limpiar timeout si existe
    if (reverseGeocodingTimeoutRef.current) {
      clearTimeout(reverseGeocodingTimeoutRef.current);
      reverseGeocodingTimeoutRef.current = null;
    }
    
    // Establecer nueva ubicación y estado
    setCurrentLocation(location);
    setCrosshairMode(false);
    setShowLocationPanel(true);
    
    console.log('🗺️ [handleLocationSelect] Estado actualizado - crosshairMode: false, location:', location);
  }, [isWithinElSalvador]);

  const handleConfirmLocation = () => {
    console.log('🗺️ [handleConfirmLocation] Confirmando ubicación:', currentLocation);
    
    if (currentLocation && onLocationSelect) {
      onLocationSelect(currentLocation);
      setShowLocationPanel(false); // Ocultar panel después de confirmar
      
      // Mostrar toast de confirmación
      setShowConfirmationToast(true);
      setTimeout(() => {
        setShowConfirmationToast(false);
      }, 3000); // Ocultar después de 3 segundos
      
      console.log('🗺️ [handleConfirmLocation] Ubicación confirmada y panel ocultado');
    } else {
      console.warn('⚠️ [handleConfirmLocation] No se puede confirmar - falta ubicación o callback');
    }
  };

  const handleSetAsDefault = async () => {
    if (!currentLocation || !userId) {
      setError('No se puede establecer como predeterminada: faltan datos necesarios');
      return;
    }

    setSettingAsDefault(true);
    setError(null);

    try {
      // Si no tenemos addressInfo, intentar obtenerlo primero
      let finalAddressInfo = addressInfo;
      if (!finalAddressInfo) {
        console.log('🗺️ [AddressMapPicker] Obteniendo información de ubicación...');
        const result = await reverseGeocode(currentLocation.lat, currentLocation.lng);
        if (result) {
          finalAddressInfo = result.addressComponents;
          setAddressInfo(finalAddressInfo);
        }
      }

      // Crear objeto con la información de la ubicación
      const locationData = {
        coordinates: {
          lat: currentLocation.lat,
          lng: currentLocation.lng
        },
        department: finalAddressInfo?.department || selectedDepartment || 'Desconocido',
        municipality: finalAddressInfo?.municipality || selectedMunicipality || 'Desconocido',
        userId: userId
      };

      console.log('🗺️ [AddressMapPicker] Estableciendo ubicación como predeterminada:', locationData);

      // Llamar al nuevo endpoint del backend
      const response = await addressService.setDefaultLocationFromCoordinates(locationData);
      
      if (response.success) {
        console.log('✅ Ubicación establecida como predeterminada');
        
        // Llamar a la función callback si existe (para notificar al componente padre)
        if (onSetAsDefault) {
          await onSetAsDefault({
            ...locationData,
            addressComponents: finalAddressInfo,
            addressId: response.data.address._id
          });
        }
      } else {
        throw new Error(response.message || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('❌ Error estableciendo ubicación como predeterminada:', error);
      setError('Error al establecer como ubicación predeterminada: ' + (error.message || 'Error desconocido'));
    } finally {
      setSettingAsDefault(false);
    }
  };

  // Función auxiliar para calcular distancia entre dos puntos
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
  };

  // Función para calcular tiempo estimado de transporte desde San Salvador
  const calculateDeliveryTime = (lat, lng) => {
    try {
      // Coordenadas del centro de San Salvador (punto de partida)
      const sanSalvadorLat = 13.6929;
      const sanSalvadorLng = -89.2182;
      
      // Calcular distancia haversine en km
      const distance = calculateDistance(sanSalvadorLat, sanSalvadorLng, lat, lng);
      
      // Estimación basada en características de tráfico de San Salvador
      let estimatedMinutes;
      
      if (distance <= 5) {
        // Dentro de la ciudad - tráfico denso
        estimatedMinutes = Math.max(15, distance * 8); // 8 min/km mínimo
      } else if (distance <= 15) {
        // Área metropolitana - tráfico moderado  
        estimatedMinutes = 20 + (distance - 5) * 5; // Base + 5 min/km adicional
      } else if (distance <= 30) {
        // Periferia - tráfico ligero
        estimatedMinutes = 70 + (distance - 15) * 3; // Base + 3 min/km
      } else {
        // Departamentos lejanos - carretera
        estimatedMinutes = 115 + (distance - 30) * 2; // Base + 2 min/km
      }
      
      // Factores de corrección por área geográfica
      if (lat > 14.0) {
        // Norte (Chalatenango, etc.) - carreteras montañosas
        estimatedMinutes *= 1.3;
      } else if (lng < -89.5) {
        // Oeste (Ahuachapán, Sonsonate) - carreteras costeras
        estimatedMinutes *= 1.2;
      } else if (lng > -88.5) {
        // Este (La Unión, Morazán) - carreteras menos desarrolladas
        estimatedMinutes *= 1.4;
      }
      
      return {
        estimatedMinutes: Math.round(estimatedMinutes),
        distance: Math.round(distance * 100) / 100,
        estimatedHours: Math.round((estimatedMinutes / 60) * 100) / 100,
        formattedTime: estimatedMinutes < 60 ? 
          `${Math.round(estimatedMinutes)} min` : 
          `${Math.floor(estimatedMinutes / 60)}h ${Math.round(estimatedMinutes % 60)}min`
      };
    } catch (error) {
      console.error('Error calculando tiempo de entrega:', error);
      return {
        estimatedMinutes: 30,
        distance: 0,
        estimatedHours: 0.5,
        formattedTime: '30 min' // Fallback
      };
    }
  };

  // Manejar interacción manual del usuario con el mapa (MEJORADO)
  const handleUserInteraction = (interactionType) => {
    console.log(`🗺️ [UserInteraction] Detectada interacción: ${interactionType}`);
    setUserInteracting(true);
    
    // Tiempo más largo para evitar auto-centrado no deseado durante navegación
    const resetTimeout = interactionType === 'drag' ? 10000 : 7000; // 10s para drag, 7s para otros
    
    // Limpiar timeout anterior si existe
    if (window.userInteractionTimeout) {
      clearTimeout(window.userInteractionTimeout);
    }
    
    // Resetear el flag después de un tiempo
    window.userInteractionTimeout = setTimeout(() => {
      setUserInteracting(false);
      console.log('🗺️ [UserInteraction] Permitiendo auto-centrado nuevamente');
    }, resetTimeout);
  };

  const handleCenterMap = () => {
    if (currentLocation) {
      console.log('🗺️ [handleCenterMap] Centrando mapa en ubicación actual:', currentLocation);
      setShouldCenter(true);
      setTimeout(() => setShouldCenter(false), 500); // Más tiempo para completar la animación
    }
  };

  const handleEnableCrosshair = () => {
    console.log('🗺️ [handleEnableCrosshair] Habilitando modo crosshair');
    setCrosshairMode(true);
    setError(null);
    // Limpiar información anterior cuando se habilita el crosshair
    setAddressInfo(null);
    setDeliveryTimeInfo(null);
    setShowLocationPanel(false);
    // Resetear TODAS las banderas de auto-población
    setIsAutoPopulating(false);
    setLastAutoCenter(null);
    setLastProcessedLocation(null);
    isProcessingRef.current = false;
    
    // Limpiar timeout si existe
    if (reverseGeocodingTimeoutRef.current) {
      clearTimeout(reverseGeocodingTimeoutRef.current);
      reverseGeocodingTimeoutRef.current = null;
    }
  };

  const handleCenterToElSalvador = () => {
    const center = getElSalvadorCenter();
    const newLocation = {
      lat: center[1],
      lng: center[0]
    };
    console.log('🗺️ [handleCenterToElSalvador] Centrando en El Salvador:', newLocation);
    setCurrentLocation(newLocation);
    setCrosshairMode(false);
    setShowLocationPanel(true);
    setShouldCenter(true);
    setTimeout(() => setShouldCenter(false), 800); // Más tiempo para la animación completa
  };

  const handleToggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    // Invalidar el tamaño del mapa después del cambio de pantalla completa
    setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current;
        map.invalidateSize({ animate: true });
        
        // Re-centrar si hay ubicación actual
        if (currentLocation) {
          map.flyTo([currentLocation.lat, currentLocation.lng], newFullscreenState ? 12 : 15, {
            animate: true,
            duration: 0.5
          });
        }
      }
    }, 100);
  };

  const handleClearLocation = () => {
    console.log('🗺️ [handleClearLocation] Limpiando ubicación y reseteando estado COMPLETO');
    
    // Limpiar COMPLETAMENTE todo el estado
    setCurrentLocation(null);
    setCrosshairMode(true);
    setAddressInfo(null);
    setDeliveryTimeInfo(null);
    setShowLocationPanel(false);
    setError(null);
    setIsAutoPopulating(false);
    setLastAutoCenter(null);
    setLastProcessedLocation(null);
    isProcessingRef.current = false;
    
    // Limpiar timeout de reverse geocoding si existe
    if (reverseGeocodingTimeoutRef.current) {
      clearTimeout(reverseGeocodingTimeoutRef.current);
      reverseGeocodingTimeoutRef.current = null;
    }
    
    // Notificar al componente padre que se limpió la ubicación Y los campos
    console.log('🗺️ [handleClearLocation] Limpiando campos de departamento y municipio');
    
    // Usar callback específico para limpieza si está disponible
    if (onClearFields) {
      console.log('🗺️ [handleClearLocation] Usando callback específico de limpieza');
      onClearFields();
    }
    
    // Usar función de limpieza directa del formulario si está disponible
    if (onClearAllFormFields) {
      console.log('🗺️ [handleClearLocation] Usando función de limpieza directa del formulario');
      onClearAllFormFields();
    }
    
    // FORZAR limpieza COMPLETA de todos los campos - Estrategia más agresiva
    if (onAddressDataChange) {
      console.log('🗺️ [handleClearLocation] FORZANDO limpieza completa de TODOS los campos');
      
      // Estrategia más directa: Enviar valores que el AddressFormModal no pueda ignorar
      // Usar valores especiales que indiquen limpieza forzada
      
      const clearData = {
        // Usar valores especiales que no sean ni falsy ni truthy normales
        department: '___FORCE_CLEAR___',
        municipality: '___FORCE_CLEAR___',
        suggestedAddress: '___FORCE_CLEAR___',
        address: '___FORCE_CLEAR___', // También limpiar el campo address
        coordinates: null,
        confidence: null,
        isAutoPopulated: true,
        source: 'force_clear_all_fields',
        timestamp: new Date().toISOString(),
        clearFields: true,
        forceClear: true,
        clearAll: true,
        // Banderas adicionales para máxima compatibilidad
        action: 'CLEAR_ALL_FIELDS',
        mustClear: true,
        resetForm: true
      };
      
      console.log('🗺️ [handleClearLocation] Enviando datos de limpieza:', clearData);
      onAddressDataChange(clearData);
      
      // Enviar una segunda actualización con valores completamente vacíos
      setTimeout(() => {
        const finalClearData = {
          department: '',
          municipality: '',
          suggestedAddress: '',
          address: '',
          coordinates: [],
          confidence: null,
          isAutoPopulated: true,
          source: 'final_clear_empty',
          timestamp: new Date().toISOString(),
          clearFields: true,
          forceClear: true,
          clearAll: true,
          action: 'CLEAR_ALL_FIELDS',
          mustClear: true,
          resetForm: true
        };
        
        console.log('🗺️ [handleClearLocation] Enviando limpieza final:', finalClearData);
        onAddressDataChange(finalClearData);
      }, 50);
    }
  };

  // ==================== DATOS CALCULADOS ====================
  const mapCenter = currentLocation ? [currentLocation.lat, currentLocation.lng] : [center.lat, center.lng];
  
  // LÍMITES DUALES: Navegación vs Validación
  // - navigationBounds: Permiten navegación por zonas fronterizas (evita rebotes molestos)
  // - validationBounds: Solo permiten colocación de marcadores dentro de El Salvador
  const navigationBounds = getElSalvadorNavigationBounds(); // Límites expandidos para navegación suave
  const validationBounds = getElSalvadorBounds(); // Límites estrictos para colocación
  const initialZoom = isFullscreen ? 10 : 13; // Zoom más amplio en pantalla completa

  // Validaciones para botones
  const canConfirmLocation = !disabled && currentLocation;
  const canSetAsDefault = !disabled && currentLocation && userId && !settingAsDefault;
  
  const getButtonStatusMessage = () => {
    if (disabled) return 'Mapa deshabilitado';
    if (!currentLocation) return 'Selecciona una ubicación en el mapa';
    if (showSetDefaultButton && !userId) return 'ID de usuario requerido';
    return null;
  };

  // Crear icono personalizado para el marcador
  const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // ==================== RENDER ====================
  return (
    <AddressMapPickerContainer style={{ height }} isFullscreen={isFullscreen}>
      {/* Overlay con controles */}
      <AddressMapOverlay>
        {/* Header */}
        <AddressMapHeader isFullscreen={isFullscreen}>
          <AddressMapHeaderContent>
            <AddressMapTitle>
              <LocationIcon size={16} />
              {crosshairMode ? 'Haz clic para seleccionar ubicación' : 'Ubicación seleccionada'}
              {isDefaultLocation && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', ml: 1 }}>
                  <StarIcon size={14} color="#F59E0B" weight="fill" />
                  <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                    Predeterminada
                  </Typography>
                </Box>
              )}
            </AddressMapTitle>
            
            <AddressMapControls>
              <Tooltip title="Centrar mapa">
                <AddressMapControlButton
                  onClick={handleCenterMap}
                  disabled={disabled}
                >
                  <CenterIcon size={16} />
                </AddressMapControlButton>
              </Tooltip>
              
              <Tooltip title="Centrar en El Salvador">
                <AddressMapControlButton
                  onClick={handleCenterToElSalvador}
                  disabled={disabled}
                >
                  <SearchIcon size={16} />
                </AddressMapControlButton>
              </Tooltip>
              
              {!crosshairMode && (
                <Tooltip title="Seleccionar nueva ubicación">
                  <AddressMapControlButton
                    onClick={handleEnableCrosshair}
                    disabled={disabled}
                  >
                    <CrosshairIcon size={16} />
                  </AddressMapControlButton>
                </Tooltip>
              )}
              
              <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                <AddressMapControlButton
                  onClick={handleToggleFullscreen}
                  disabled={disabled}
                >
                  {isFullscreen ? <ExitFullscreenIcon size={16} /> : <FullscreenIcon size={16} />}
                </AddressMapControlButton>
              </Tooltip>
            </AddressMapControls>
          </AddressMapHeaderContent>
        </AddressMapHeader>

        {/* Panel de información eliminado - Se usa Swal para notificaciones en tiempo real */}

        {/* Indicador de zoom en pantalla completa */}
        {isFullscreen && (
          <FullscreenZoomIndicator>
            Zoom: {currentZoom}
          </FullscreenZoomIndicator>
        )}

        {/* Error Alert */}
        {error && (
          <AddressErrorAlert 
            severity="error" 
            onClose={() => setError(null)}
            icon={<ErrorIcon size={20} weight="fill" />}
          >
            {error}
          </AddressErrorAlert>
        )}

        {/* Footer con información de coordenadas */}
        {currentLocation && !crosshairMode && showLocationPanel && (
          <AddressMapFooter>
            {/* Estado de ubicación */}
            <AddressLocationStatus>
              <LocationIcon size={16} color="#059669" weight="fill" />
              <AddressLocationStatusText>
                Ubicación seleccionada y lista para confirmar
              </AddressLocationStatusText>
              <IconButton
                size="small"
                onClick={handleClearLocation}
                sx={{ 
                  ml: 'auto',
                  color: '#6B7280',
                  '&:hover': { color: '#EF4444' }
                }}
              >
                <CloseIcon size={16} />
              </IconButton>
            </AddressLocationStatus>

            <AddressCoordinatesInfo>
              <Box sx={{ flex: 1 }}>
                <AddressCoordinatesText>
                  <strong>Coordenadas:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </AddressCoordinatesText>
                {addressInfo && (
                  <AddressCoordinatesText>
                    <strong>Área:</strong> {addressInfo.municipality || 'Desconocida'}, {addressInfo.department || 'Desconocido'}
                  </AddressCoordinatesText>
                )}
                {deliveryTimeInfo && (
                  <AddressCoordinatesText sx={{ color: '#1F64BF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TruckIcon size={16} weight="fill" />
                    <strong>Tiempo de envío:</strong> {deliveryTimeInfo.formattedTime} • {deliveryTimeInfo.distance} km desde San Salvador
                  </AddressCoordinatesText>
                )}
                {isDefaultLocation && (
                  <AddressCoordinatesText sx={{ color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StarIcon size={16} weight="fill" />
                    Ubicación predeterminada
                  </AddressCoordinatesText>
                )}
                
                {/* Estado de validación */}
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <AddressValidationStatus status="valid">
                    <ConfirmIcon size={12} weight="fill" />
                    Coordenadas válidas
                  </AddressValidationStatus>
                  {addressInfo ? (
                    <AddressValidationStatus status="valid">
                      <ConfirmIcon size={12} weight="fill" />
                      Información de ubicación obtenida
                    </AddressValidationStatus>
                  ) : (
                    <AddressValidationStatus status="invalid">
                      <CrosshairIcon size={12} weight="fill" />
                      Obteniendo información de ubicación...
                    </AddressValidationStatus>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: '8px', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
                {showSetDefaultButton && !isDefaultLocation && (
                  <Box>
                    <AddressSetDefaultButton
                      onClick={handleSetAsDefault}
                      startIcon={settingAsDefault ? <CircularProgress size={16} color="inherit" /> : <StarIcon size={16} />}
                      disabled={!canSetAsDefault}
                    >
                      {settingAsDefault ? 'Estableciendo...' : 'Establecer como Predeterminada'}
                    </AddressSetDefaultButton>
                    {!canSetAsDefault && (
                      <AddressButtonStatus>
                        <CrosshairIcon size={10} />
                        {!currentLocation ? 'Selecciona ubicación' : !userId ? 'ID de usuario requerido' : 'Procesando...'}
                      </AddressButtonStatus>
                    )}
                  </Box>
                )}
                
                <Box>
                  <AddressConfirmButton
                    onClick={handleConfirmLocation}
                    startIcon={<ConfirmIcon size={16} />}
                    disabled={!canConfirmLocation}
                  >
                    Confirmar Ubicación
                  </AddressConfirmButton>
                  {!canConfirmLocation && (
                    <AddressButtonStatus>
                      <CrosshairIcon size={10} />
                      {!currentLocation ? 'Selecciona ubicación en el mapa' : 'Mapa deshabilitado'}
                    </AddressButtonStatus>
                  )}
                </Box>
              </Box>
            </AddressCoordinatesInfo>
          </AddressMapFooter>
        )}

        {/* Crosshair en el centro del mapa */}
        {crosshairMode && (
          <AddressCrosshair>
            <CrosshairIcon size={32} weight="bold" />
          </AddressCrosshair>
        )}

        {/* Toast de confirmación de ubicación */}
        {showConfirmationToast && (
          <LocationConfirmationToast>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', mb: 1 }}>
              <ConfirmIcon size={20} color="#10B981" weight="fill" />
              <Typography variant="h6" sx={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#10B981',
                fontFamily: "'Mona Sans'"
              }}>
                ¡Ubicación Confirmada!
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ 
              color: '#6B7280',
              fontFamily: "'Mona Sans'",
              fontSize: '0.875rem'
            }}>
              La ubicación ha sido guardada exitosamente
            </Typography>
          </LocationConfirmationToast>
        )}
      </AddressMapOverlay>

      {/* Loading overlay */}
      {geocoding && (
        <AddressLoadingOverlay>
          <CircularProgress size={32} sx={{ color: '#1F64BF' }} />
          <Typography variant="body2" sx={{ color: '#032CA6', fontFamily: "'Mona Sans'" }}>
            Obteniendo información de ubicación...
          </Typography>
        </AddressLoadingOverlay>
      )}

      {/* Mapa de Leaflet */}
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={true}
        maxBounds={navigationBounds} // Límites expandidos - incluyen zonas fronterizas
        maxBoundsViscosity={0.1} // Muy baja viscosidad para navegación suave
        minZoom={isFullscreen ? 7 : 9}
        maxZoom={isFullscreen ? 19 : 17}
        bounceAtZoomLimits={false}
        zoomSnap={0.5}
        zoomDelta={0.5}
        whenReady={() => setMapReady(true)}
      >
        {/* TileLayer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Controlador de clicks */}
        <AddressMapClickHandler 
          onLocationSelect={handleLocationSelect}
          crosshairMode={crosshairMode}
        />

        {/* Controlador de zoom */}
        <AddressMapZoomHandler 
          onZoomChange={setCurrentZoom} 
        />

        {/* Controlador de interacción del usuario */}
        <AddressMapInteractionHandler 
          onUserInteraction={handleUserInteraction}
        />

        {/* Controlador de centrado */}
        <AddressMapCenterController 
          center={currentLocation}
          shouldCenter={shouldCenter}
          zoom={isFullscreen ? 12 : 15}
        />

        {/* Marcador de ubicación seleccionada */}
        {currentLocation && !crosshairMode && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={customIcon}
          />
        )}
      </MapContainer>
    </AddressMapPickerContainer>
  );
};

export default AddressMapPicker;