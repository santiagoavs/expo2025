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
  X as CloseIcon
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

// Componente para centrar el mapa
const AddressMapCenterController = ({ center, shouldCenter, zoom = 15 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldCenter && center && map) {
      console.log('🗺️ [AddressMapCenterController] Centrando mapa en:', center, 'con zoom:', zoom);
      
      // Verificar que el mapa esté listo
      if (map.getContainer()) {
        map.setView([center.lat, center.lng], zoom, {
          animate: true,
          duration: 1.0,
          easeLinearity: 0.1
        });
        
        // Forzar invalidación del tamaño del mapa
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
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
  enableAutoFormPopulation = true
}) => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    reverseGeocode,
    isWithinElSalvador,
    getElSalvadorCenter,
    getElSalvadorBounds,
    loading: geocoding
  } = useGeolocation();

  // ==================== ESTADOS LOCALES ====================
  const [currentLocation, setCurrentLocation] = useState(selectedLocation || center);
  const [crosshairMode, setCrosshairMode] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);
  const [settingAsDefault, setSettingAsDefault] = useState(false);
  const [showLocationPanel, setShowLocationPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [showConfirmationToast, setShowConfirmationToast] = useState(false);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false); // Bandera para evitar bucles
  const [lastAutoCenter, setLastAutoCenter] = useState(null); // Último auto-centrado

  const mapRef = useRef(null);
  const reverseGeocodingTimeoutRef = useRef(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (selectedLocation) {
      setCurrentLocation(selectedLocation);
      setCrosshairMode(false);
    }
  }, [selectedLocation]);

  // Efecto para centrar automáticamente el mapa cuando cambien departamento/municipio
  useEffect(() => {
    const centerMap = async () => {
      // Evitar auto-centrado si estamos en proceso de auto-población
      if (isAutoPopulating) {
        console.log('🗺️ [AddressMapPicker] Saltando auto-centrado - en proceso de auto-población');
        return;
      }
      
      if (autoCenterOnLocationChange && (selectedDepartment || selectedMunicipality)) {
        let newCenter = null;
        
        // Priorizar municipio si está disponible
        if (selectedMunicipality && selectedDepartment) {
          // Primero intentar con la base de datos local
          newCenter = geocodingService.getMunicipalityCenter(selectedMunicipality, selectedDepartment);
          
          // Si no se encuentra en la base local, intentar búsqueda online
          if (!newCenter || (newCenter.lat === 13.8667 && newCenter.lng === -88.6333)) {
            console.log('🗺️ [AddressMapPicker] Municipio no encontrado en base local, buscando online...');
            newCenter = await geocodingService.searchMunicipalityOnline(selectedMunicipality, selectedDepartment);
          }
        } else if (selectedDepartment) {
          newCenter = geocodingService.getDepartmentCenter(selectedDepartment);
        }
        
        if (newCenter) {
          // Verificar si ya estamos cerca de esta ubicación (tolerancia de ~1km)
          const tolerance = 0.01; // Aproximadamente 1km
          const isNearby = currentLocation && 
            Math.abs(currentLocation.lat - newCenter.lat) < tolerance &&
            Math.abs(currentLocation.lng - newCenter.lng) < tolerance;
            
          // Verificar si es el mismo auto-centrado que el anterior
          const isSameAsLast = lastAutoCenter &&
            Math.abs(lastAutoCenter.lat - newCenter.lat) < tolerance &&
            Math.abs(lastAutoCenter.lng - newCenter.lng) < tolerance;
          
          if (isNearby || isSameAsLast) {
            console.log('🗺️ [AddressMapPicker] Saltando auto-centrado - ya estamos cerca o es el mismo que antes');
            return;
          }
          
          console.log('🗺️ [AddressMapPicker] Centrando mapa en:', { 
            department: selectedDepartment, 
            municipality: selectedMunicipality, 
            coordinates: newCenter 
          });
          
          // Marcar que estamos haciendo auto-centrado
          setLastAutoCenter(newCenter);
          setIsAutoPopulating(true);
          
          setCurrentLocation(newCenter);
          setCrosshairMode(false);
          setShowLocationPanel(true); // Mostrar panel para confirmar ubicación
          
          // Forzar centrado del mapa con un pequeño delay
          setTimeout(() => {
            setShouldCenter(true);
            setTimeout(() => setShouldCenter(false), 100);
          }, 100);
          
          // Limpiar información anterior para forzar nueva búsqueda
          setAddressInfo(null);
          
          // Desmarcar auto-población después de un tiempo
          setTimeout(() => {
            setIsAutoPopulating(false);
          }, 2000);
        }
      }
    };

    // Agregar un debounce para evitar múltiples ejecuciones rápidas
    const timeoutId = setTimeout(centerMap, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedDepartment, selectedMunicipality, autoCenterOnLocationChange, currentLocation, isAutoPopulating, lastAutoCenter]);

  // Efecto para centrar automáticamente cuando cambie currentLocation
  useEffect(() => {
    if (currentLocation && !crosshairMode) {
      console.log('🗺️ [AddressMapPicker] Centrando automáticamente en nueva ubicación:', currentLocation);
      setShouldCenter(true);
      setTimeout(() => setShouldCenter(false), 100);
    }
  }, [currentLocation, crosshairMode]);

  // Auto reverse geocoding con auto-población de formulario
  useEffect(() => {
    const performReverseGeocode = async () => {
      console.log('🗺️ [useEffect] Evaluando condiciones para reverse geocoding:', {
        currentLocation: !!currentLocation,
        crosshairMode,
        enableAutoFormPopulation,
        hasCallback: !!onAddressDataChange,
        isAutoPopulating
      });
      
      if (currentLocation && !crosshairMode && enableAutoFormPopulation) {
        try {
          console.log('🗺️ [AddressMapPicker] Iniciando reverse geocoding para:', currentLocation);
          
          // Usar el servicio de geocodificación
          const result = await reverseGeocode(currentLocation.lat, currentLocation.lng);
          
          if (result && result.addressComponents) {
            console.log('🗺️ [AddressMapPicker] Resultado de reverse geocoding:', result);
            
            // Actualizar addressInfo
            setAddressInfo(result.addressComponents);
            
            // Auto-poblar formulario si hay callback y NO estamos en auto-población
            if (onAddressDataChange && !isAutoPopulating) {
              console.log('🗺️ [AddressMapPicker] Auto-poblando formulario con:', result.addressComponents);
              
              // Marcar temporalmente que estamos auto-poblando para evitar bucles
              setIsAutoPopulating(true);
              
              const formData = {
                department: result.addressComponents.department || '',
                municipality: result.addressComponents.municipality || '',
                suggestedAddress: result.addressComponents.formattedAddress || '',
                coordinates: {
                  lat: currentLocation.lat,
                  lng: currentLocation.lng
                },
                confidence: 'medium',
                isAutoPopulated: true,
                source: 'geocoding_service',
                timestamp: new Date().toISOString() // Añadir timestamp para forzar actualización
              };
              
              console.log('🗺️ [AddressMapPicker] Enviando datos al formulario:', formData);
              onAddressDataChange(formData);
              
              // Desmarcar auto-población después de un delay
              setTimeout(() => {
                setIsAutoPopulating(false);
              }, 1500);
            } else if (isAutoPopulating) {
              console.log('🗺️ [AddressMapPicker] Saltando auto-población - ya en proceso');
            } else {
              console.warn('⚠️ [AddressMapPicker] No hay callback onAddressDataChange disponible');
            }
          } else {
            console.warn('⚠️ [AddressMapPicker] No se obtuvo resultado válido del reverse geocoding');
          }
        } catch (error) {
          console.error('❌ [AddressMapPicker] Reverse geocoding failed:', error);
          setError('Error al obtener información de la ubicación');
        }
      } else {
        console.log('🗺️ [AddressMapPicker] Saltando reverse geocoding - condiciones no cumplidas');
      }
    };

    // Limpiar timeout anterior si existe
    if (reverseGeocodingTimeoutRef.current) {
      clearTimeout(reverseGeocodingTimeoutRef.current);
    }

    // Usar un delay más largo para evitar llamadas excesivas
    reverseGeocodingTimeoutRef.current = setTimeout(performReverseGeocode, 1000);
    
    return () => {
      if (reverseGeocodingTimeoutRef.current) {
        clearTimeout(reverseGeocodingTimeoutRef.current);
        console.log('🗺️ [AddressMapPicker] Limpiando timeout de reverse geocoding');
      }
    };
  }, [currentLocation, crosshairMode, reverseGeocode, enableAutoFormPopulation, onAddressDataChange, isAutoPopulating]);

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
    
    // Validar que esté dentro de El Salvador
    if (!isWithinElSalvador(location.lat, location.lng)) {
      setError('La ubicación debe estar dentro de El Salvador');
      return;
    }

    // Limpiar estado anterior ANTES de establecer la nueva ubicación
    setAddressInfo(null);
    setError(null);
    setIsAutoPopulating(false); // Resetear bandera de auto-población
    setLastAutoCenter(null); // Resetear último auto-centrado
    
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

  const handleCenterMap = () => {
    if (currentLocation) {
      console.log('🗺️ [handleCenterMap] Centrando mapa en ubicación actual:', currentLocation);
      setShouldCenter(true);
      setTimeout(() => setShouldCenter(false), 100);
    }
  };

  const handleEnableCrosshair = () => {
    console.log('🗺️ [handleEnableCrosshair] Habilitando modo crosshair');
    setCrosshairMode(true);
    setError(null);
    // Limpiar información anterior cuando se habilita el crosshair
    setAddressInfo(null);
    setShowLocationPanel(false);
    // Resetear banderas de auto-población
    setIsAutoPopulating(false);
    setLastAutoCenter(null);
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
    setTimeout(() => setShouldCenter(false), 100);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClearLocation = () => {
    console.log('🗺️ [handleClearLocation] Limpiando ubicación y reseteando estado');
    setCurrentLocation(null);
    setCrosshairMode(true);
    setAddressInfo(null);
    setShowLocationPanel(false);
    setError(null);
    // Resetear banderas de auto-población
    setIsAutoPopulating(false);
    setLastAutoCenter(null);
    
    // Limpiar timeout de reverse geocoding si existe
    if (reverseGeocodingTimeoutRef.current) {
      clearTimeout(reverseGeocodingTimeoutRef.current);
      reverseGeocodingTimeoutRef.current = null;
    }
    
    // Notificar al componente padre que se limpió la ubicación
    if (onAddressDataChange) {
      onAddressDataChange({
        department: '',
        municipality: '',
        suggestedAddress: '',
        coordinates: null,
        confidence: null,
        isAutoPopulated: false,
        source: 'manual_clear',
        timestamp: new Date().toISOString()
      });
    }
  };

  // ==================== DATOS CALCULADOS ====================
  const mapCenter = currentLocation ? [currentLocation.lat, currentLocation.lng] : [center.lat, center.lng];
  const bounds = getElSalvadorBounds();
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

        {/* Panel de información en pantalla completa */}
        {isFullscreen && currentLocation && (
          <FullscreenInfoPanel>
            <Typography variant="h6" sx={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#1F2937',
              marginBottom: '12px',
              fontFamily: "'Mona Sans'"
            }}>
              Información de Ubicación
            </Typography>
            
            <FullscreenCoordinates>
              <FullscreenCoordinateItem>
                <span style={{ fontWeight: '500' }}>Latitud:</span>
                <span style={{ fontFamily: 'monospace', color: '#1F64BF' }}>
                  {currentLocation.lat.toFixed(6)}
                </span>
              </FullscreenCoordinateItem>
              <FullscreenCoordinateItem>
                <span style={{ fontWeight: '500' }}>Longitud:</span>
                <span style={{ fontFamily: 'monospace', color: '#1F64BF' }}>
                  {currentLocation.lng.toFixed(6)}
                </span>
              </FullscreenCoordinateItem>
              {addressInfo && (
                <FullscreenCoordinateItem>
                  <span style={{ fontWeight: '500' }}>Área:</span>
                  <span style={{ color: '#059669' }}>
                    {addressInfo.municipality}, {addressInfo.department}
                  </span>
                </FullscreenCoordinateItem>
              )}
            </FullscreenCoordinates>

            <FullscreenControls>
              <FullscreenControlButton
                variant="contained"
                color="primary"
                onClick={handleConfirmLocation}
                disabled={!canConfirmLocation}
                startIcon={<ConfirmIcon size={16} />}
                sx={{ 
                  backgroundColor: '#1F64BF',
                  '&:hover': { backgroundColor: '#1E5BA8' },
                  '&:disabled': { backgroundColor: '#9CA3AF' }
                }}
              >
                Confirmar Ubicación
              </FullscreenControlButton>
              
              <FullscreenControlButton
                variant="outlined"
                onClick={handleClearLocation}
                startIcon={<CloseIcon size={16} />}
                sx={{ 
                  borderColor: '#6B7280',
                  color: '#6B7280',
                  '&:hover': { 
                    borderColor: '#EF4444',
                    color: '#EF4444',
                    backgroundColor: alpha('#EF4444', 0.05)
                  }
                }}
              >
                Limpiar Ubicación
              </FullscreenControlButton>
            </FullscreenControls>
          </FullscreenInfoPanel>
        )}

        {/* Indicador de zoom en pantalla completa */}
        {isFullscreen && (
          <FullscreenZoomIndicator>
            Zoom: {currentZoom}
          </FullscreenZoomIndicator>
        )}

        {/* Error Alert */}
        {error && (
          <AddressErrorAlert severity="error" onClose={() => setError(null)}>
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
                {isDefaultLocation && (
                  <AddressCoordinatesText sx={{ color: '#F59E0B', fontWeight: 600 }}>
                    ⭐ Ubicación predeterminada
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
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        minZoom={isFullscreen ? 6 : 8}
        maxZoom={isFullscreen ? 20 : 18}
        whenReady={() => setMapReady(true)}
      >
        {/* TileLayer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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