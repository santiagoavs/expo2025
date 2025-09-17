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
  ArrowsOut as FullscreenIcon
} from '@phosphor-icons/react';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import useGeolocation from '../../../hooks/useGeolocation';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ================ ESTILOS STYLED COMPONENTS ================
const AddressMapPickerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  fontFamily: "'Mona Sans'",
  '& .leaflet-container': {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
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
    borderRadius: '0',
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'center',
    fontFamily: "'Mona Sans'",
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
    fontSize: '10px',
    backgroundColor: alpha('white', 0.8),
    fontFamily: "'Mona Sans'",
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

const AddressMapHeader = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  left: '12px',
  right: '12px',
  padding: '12px 16px',
  backgroundColor: alpha('white', 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'auto',
  zIndex: 1001,
  [theme.breakpoints.down('sm')]: {
    top: '8px',
    left: '8px',
    right: '8px',
    padding: '10px 12px',
  }
}));

const AddressMapHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  }
}));

const AddressMapControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  [theme.breakpoints.down('sm')]: {
    gap: '6px',
    alignSelf: 'flex-end',
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
  [theme.breakpoints.down('sm')]: {
    width: '28px',
    height: '28px',
  }
}));

const AddressMapFooter = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: '12px',
  left: '12px',
  right: '12px',
  padding: '16px',
  backgroundColor: alpha('white', 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'auto',
  zIndex: 1001,
  [theme.breakpoints.down('sm')]: {
    bottom: '8px',
    left: '8px',
    right: '8px',
    padding: '12px',
  }
}));

const AddressCoordinatesInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '12px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  }
}));

const AddressCoordinatesText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: '#032CA6',
  fontWeight: 500,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
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
  backgroundColor: alpha('white', 0.8),
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

// Componente para centrar el mapa
const AddressMapCenterController = ({ center, shouldCenter }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldCenter && center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [map, center, shouldCenter]);
  
  return null;
};

// ================ COMPONENTE PRINCIPAL ================
const AddressMapPicker = ({
  center = { lat: 13.6929, lng: -89.2182 }, // San Salvador
  zoom = 12,
  onLocationSelect,
  selectedLocation = null,
  disabled = false,
  height = '100%'
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

  const mapRef = useRef(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (selectedLocation) {
      setCurrentLocation(selectedLocation);
      setCrosshairMode(false);
    }
  }, [selectedLocation]);

  // Auto reverse geocoding cuando se selecciona una ubicación
  useEffect(() => {
    const performReverseGeocode = async () => {
      if (currentLocation && !crosshairMode) {
        try {
          const result = await reverseGeocode(currentLocation.lat, currentLocation.lng);
          if (result) {
            setAddressInfo(result.addressComponents);
          }
        } catch (error) {
          console.log('Reverse geocoding failed:', error);
        }
      }
    };

    const timeoutId = setTimeout(performReverseGeocode, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentLocation, crosshairMode, reverseGeocode]);

  // ==================== MANEJADORES ====================
  const handleLocationSelect = useCallback((location) => {
    // Validar que esté dentro de El Salvador
    if (!isWithinElSalvador(location.lat, location.lng)) {
      setError('La ubicación debe estar dentro de El Salvador');
      return;
    }

    setCurrentLocation(location);
    setCrosshairMode(false);
    setError(null);
  }, [isWithinElSalvador]);

  const handleConfirmLocation = () => {
    if (currentLocation && onLocationSelect) {
      onLocationSelect(currentLocation);
    }
  };

  const handleCenterMap = () => {
    setShouldCenter(true);
    setTimeout(() => setShouldCenter(false), 100);
  };

  const handleEnableCrosshair = () => {
    setCrosshairMode(true);
    setError(null);
  };

  const handleCenterToElSalvador = () => {
    const center = getElSalvadorCenter();
    setCurrentLocation({
      lat: center[1],
      lng: center[0]
    });
    setShouldCenter(true);
    setTimeout(() => setShouldCenter(false), 100);
  };

  // ==================== DATOS CALCULADOS ====================
  const mapCenter = currentLocation ? [currentLocation.lat, currentLocation.lng] : [center.lat, center.lng];
  const bounds = getElSalvadorBounds();

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
    <AddressMapPickerContainer style={{ height }}>
      {/* Overlay con controles */}
      <AddressMapOverlay>
        {/* Header */}
        <AddressMapHeader>
          <AddressMapHeaderContent>
            <AddressMapTitle>
              <LocationIcon size={16} />
              {crosshairMode ? 'Haz clic para seleccionar ubicación' : 'Ubicación seleccionada'}
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
            </AddressMapControls>
          </AddressMapHeaderContent>
        </AddressMapHeader>

        {/* Error Alert */}
        {error && (
          <AddressErrorAlert severity="error" onClose={() => setError(null)}>
            {error}
          </AddressErrorAlert>
        )}

        {/* Footer con información de coordenadas */}
        {currentLocation && !crosshairMode && (
          <AddressMapFooter>
            <AddressCoordinatesInfo>
              <Box>
                <AddressCoordinatesText>
                  <strong>Coordenadas:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </AddressCoordinatesText>
                {addressInfo && (
                  <AddressCoordinatesText>
                    <strong>Área:</strong> {addressInfo.municipality || 'Desconocida'}, {addressInfo.department || 'Desconocido'}
                  </AddressCoordinatesText>
                )}
              </Box>
              
              <AddressConfirmButton
                onClick={handleConfirmLocation}
                startIcon={<ConfirmIcon size={16} />}
                disabled={disabled || !currentLocation}
              >
                Confirmar Ubicación
              </AddressConfirmButton>
            </AddressCoordinatesInfo>
          </AddressMapFooter>
        )}

        {/* Crosshair en el centro del mapa */}
        {crosshairMode && (
          <AddressCrosshair>
            <CrosshairIcon size={32} weight="bold" />
          </AddressCrosshair>
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
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={true}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        minZoom={8}
        maxZoom={18}
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

        {/* Controlador de centrado */}
        <AddressMapCenterController 
          center={currentLocation}
          shouldCenter={shouldCenter}
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