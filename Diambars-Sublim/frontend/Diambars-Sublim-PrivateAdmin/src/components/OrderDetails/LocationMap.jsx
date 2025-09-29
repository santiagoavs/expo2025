// components/OrderDetails/LocationMap.jsx - Componente de mapa para ubicación de punto de encuentro
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Alert, styled, alpha } from '@mui/material';
import { MapPin, Warning } from '@phosphor-icons/react';

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css';

// ================ ESTILOS ================
const MapContainerStyled = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '300px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 4px 12px rgba(31, 100, 191, 0.08)',
  position: 'relative',
  '& .leaflet-container': {
    height: '100%',
    width: '100%',
    borderRadius: '16px'
  }
}));

const MapHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px',
  padding: '12px 16px',
  backgroundColor: alpha('#1F64BF', 0.04),
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`
}));

const MapTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 700,
  fontSize: '0.95rem',
  color: '#010326',
  letterSpacing: '-0.01em'
}));

const LocationInfo = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  backgroundColor: alpha('#10B981', 0.04),
  borderRadius: '12px',
  border: `1px solid ${alpha('#10B981', 0.08)}`,
  marginTop: '12px'
}));

const LocationText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#065F46',
  lineHeight: 1.4
}));

// ================ COMPONENTE PRINCIPAL ================
const LocationMap = ({ meetupDetails, deliveryType }) => {
  const [mapKey, setMapKey] = useState(0);
  const [hasLocation, setHasLocation] = useState(false);

  // Verificar si hay información de ubicación
  useEffect(() => {
    if (deliveryType === 'meetup' && meetupDetails?.location) {
      const { coordinates, address, placeName } = meetupDetails.location;
      
      // Verificar si hay coordenadas válidas
      if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        const [lng, lat] = coordinates;
        if (lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat)) {
          setHasLocation(true);
        }
      }
      
      // Forzar re-render del mapa si cambian las coordenadas
      setMapKey(prev => prev + 1);
    }
  }, [meetupDetails, deliveryType]);

  // Crear icono personalizado para el marcador
  const createCustomIcon = (color = '#1F64BF') => {
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">📍</div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  };

  // Si no es punto de encuentro, no mostrar mapa
  if (deliveryType !== 'meetup') {
    return null;
  }

  // Si no hay información de ubicación
  if (!meetupDetails?.location || !hasLocation) {
    return (
      <Box>
        <MapHeader>
          <MapPin size={20} color="#1F64BF" weight="duotone" />
          <MapTitle>Ubicación del Punto de Encuentro</MapTitle>
        </MapHeader>
        
        <Alert 
          severity="warning" 
          sx={{ 
            borderRadius: '12px',
            border: `1px solid ${alpha('#F59E0B', 0.2)}`,
            '& .MuiAlert-icon': {
              color: '#F59E0B'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
            <Warning size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Ubicación no disponible
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", mt: 0.5, fontSize: '0.85rem' }}>
            No se encontraron coordenadas válidas para mostrar en el mapa.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const { coordinates, address, placeName } = meetupDetails.location;
  const [lng, lat] = coordinates;

  return (
    <Box>
      <MapHeader>
        <MapPin size={20} color="#1F64BF" weight="duotone" />
        <MapTitle>Ubicación del Punto de Encuentro</MapTitle>
      </MapHeader>

      <MapContainerStyled>
        <MapContainer
          key={mapKey}
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={[lat, lng]} 
            icon={createCustomIcon('#1F64BF')}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ 
                  fontFamily: "'Mona Sans'", 
                  fontWeight: 700,
                  color: '#010326',
                  mb: 0.5
                }}>
                  📍 Punto de Encuentro
                </Typography>
                {placeName && (
                  <Typography variant="body2" sx={{ 
                    fontFamily: "'Mona Sans'",
                    fontWeight: 600,
                    color: '#1F64BF',
                    mb: 0.5
                  }}>
                    {placeName}
                  </Typography>
                )}
                {address && (
                  <Typography variant="body2" sx={{ 
                    fontFamily: "'Mona Sans'",
                    color: '#6B7280',
                    fontSize: '0.8rem'
                  }}>
                    {address}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        </MapContainer>
      </MapContainerStyled>

      <LocationInfo>
        <LocationText>
          <strong>📍 Ubicación:</strong> {placeName || address || 'Ubicación del punto de encuentro'}
        </LocationText>
        {meetupDetails.notes && (
          <LocationText sx={{ mt: 1, color: '#6B7280' }}>
            <strong>📝 Notas:</strong> {meetupDetails.notes}
          </LocationText>
        )}
        {meetupDetails.date && (
          <LocationText sx={{ mt: 1, color: '#6B7280' }}>
            <strong>📅 Fecha:</strong> {new Date(meetupDetails.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </LocationText>
        )}
      </LocationInfo>
    </Box>
  );
};

export default LocationMap;
