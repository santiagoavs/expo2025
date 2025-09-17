// components/Areas/AreaSelector.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MapPin,
  Plus,
  Check,
  Warning
} from '@phosphor-icons/react';

const AreaSelectorContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(2)
}));

const AreaItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(1),
  backgroundColor: selected ? 'rgba(31, 100, 191, 0.1)' : 'transparent',
  border: selected ? '2px solid #1F64BF' : '1px solid rgba(31, 100, 191, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: selected ? 'rgba(31, 100, 191, 0.15)' : 'rgba(31, 100, 191, 0.05)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.2)'
  }
}));

const AreaChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(31, 100, 191, 0.1)',
  color: '#1F64BF',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: '#1F64BF'
  }
}));

export const AreaSelector = ({ 
  customizationAreas = [], 
  selectedAreaId, 
  onAreaSelect,
  elements = [],
  product 
}) => {
  const [hoveredArea, setHoveredArea] = useState(null);

  // Si no hay áreas seleccionadas y hay áreas disponibles, seleccionar la primera
  useEffect(() => {
    if (!selectedAreaId && customizationAreas.length > 0) {
      onAreaSelect(customizationAreas[0].id);
    }
  }, [selectedAreaId, customizationAreas, onAreaSelect]);

  // Contar elementos por área
  const getElementsInArea = (areaId) => {
    return elements.filter(el => el.areaId === areaId).length;
  };

  // Obtener área seleccionada
  const selectedArea = customizationAreas.find(area => area.id === selectedAreaId);

  // Verificar si hay elementos sin área asignada
  const elementsWithoutArea = elements.filter(el => !el.areaId || el.areaId === 'default-area');

  return (
    <AreaSelectorContainer elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <MapPin size={24} color="#1F64BF" />
        <Typography variant="h6" color="primary" sx={{ ml: 1, fontWeight: 600 }}>
          Zonas de Personalización
        </Typography>
      </Box>

      {/* Información del producto */}
      {product && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(31, 100, 191, 0.05)', borderRadius: '12px' }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Producto: {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customizationAreas.length} zona(s) de personalización disponible(s)
          </Typography>
        </Box>
      )}

      {/* Alerta si hay elementos sin área */}
      {elementsWithoutArea.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          icon={<Warning size={20} />}
        >
          {elementsWithoutArea.length} elemento(s) sin zona asignada. 
          Se asignarán automáticamente a la zona seleccionada.
        </Alert>
      )}

      {/* Lista de áreas */}
      {customizationAreas.length > 0 ? (
        <List sx={{ p: 0 }}>
          {customizationAreas.map((area, index) => {
            const isSelected = selectedAreaId === area.id;
            const elementCount = getElementsInArea(area.id);
            const isHovered = hoveredArea === area.id;

            return (
              <AreaItem
                key={area.id}
                selected={isSelected}
                onClick={() => onAreaSelect(area.id)}
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#1F64BF' : 'rgba(31, 100, 191, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isSelected ? (
                      <Check size={20} color="white" />
                    ) : (
                      <MapPin size={20} color="#1F64BF" />
                    )}
                  </Box>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={isSelected ? 600 : 500}>
                        {area.displayName || area.name}
                      </Typography>
                      {isSelected && (
                        <AreaChip 
                          size="small" 
                          label="Activa" 
                          icon={<Check size={16} />}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {area.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={`${elementCount} elemento(s)`}
                          variant="outlined"
                          color={elementCount > 0 ? 'primary' : 'default'}
                        />
                        <Chip 
                          size="small" 
                          label={`${Math.round(area.width)}×${Math.round(area.height)}px`}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />
              </AreaItem>
            );
          })}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <MapPin size={48} color="#ccc" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No hay zonas de personalización
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Este producto no tiene zonas de personalización configuradas.
          </Typography>
        </Box>
      )}

      {/* Información de la zona seleccionada */}
      {selectedArea && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ p: 2, backgroundColor: 'rgba(31, 100, 191, 0.05)', borderRadius: '12px' }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Zona Seleccionada: {selectedArea.displayName || selectedArea.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Posición: ({Math.round(selectedArea.x)}, {Math.round(selectedArea.y)})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Dimensiones: {Math.round(selectedArea.width)} × {Math.round(selectedArea.height)} píxeles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Elementos permitidos: {selectedArea.accepts?.text ? 'Texto' : ''} 
              {selectedArea.accepts?.text && selectedArea.accepts?.image ? ', ' : ''}
              {selectedArea.accepts?.image ? 'Imágenes' : ''}
              {selectedArea.accepts?.shapes ? ', Formas' : ''}
            </Typography>
          </Box>
        </>
      )}

      {/* Botón para asignar elementos sin área */}
      {elementsWithoutArea.length > 0 && selectedAreaId && (
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<Plus size={20} />}
            onClick={() => {
              // Esta función se pasará desde el componente padre
              console.log('Asignar elementos sin área a:', selectedAreaId);
            }}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5
            }}
          >
            Asignar {elementsWithoutArea.length} elemento(s) a esta zona
          </Button>
        </Box>
      )}
    </AreaSelectorContainer>
  );
};

export default AreaSelector;
