import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel, 
  IconButton, 
  Tooltip, 
  Chip,
  Fade,
  Grow,
  Zoom,
  Collapse,
  Divider,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Shapes as ShapesIcon,
  Eye,
  EyeSlash,
  Lock,
  Copy,
  Trash,
  Plus,
  Info,
  Warning,
  CheckCircle,
  XCircle,
  ArrowsOut,
  CopySimple
} from '@phosphor-icons/react';
import Swal from 'sweetalert2';

// Panel principal con glassmorphism mejorado
const GlassPanel = styled(Box)(({ theme }) => ({
  width: '280px',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: `
    0 12px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1)
  `,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    zIndex: 1
  }
}));

// Header del panel
const PanelHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  paddingBottom: '16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
});

// Título del panel
const PanelTitle = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});

// Lista de zonas con glassmorphism
const ZoneList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.5)'
    }
  }
});

// Item de zona individual
const ZoneItem = styled(Box)(({ selected, locked }) => ({
  background: selected 
    ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.15), rgba(3, 44, 166, 0.1))'
    : 'rgba(255, 255, 255, 0.05)',
  border: selected
    ? '1px solid rgba(31, 100, 191, 0.3)'
    : '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    background: selected
      ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.2), rgba(3, 44, 166, 0.15))'
      : 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: selected
      ? '0 8px 25px rgba(31, 100, 191, 0.2)'
      : '0 8px 25px rgba(0, 0, 0, 0.1)'
  },
  
  '&:active': {
    transform: 'translateY(0px) scale(0.98)'
  },
  
  // Indicador de estado
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: locked 
      ? 'linear-gradient(180deg, #FF9800, #F57C00)'
      : selected 
        ? 'linear-gradient(180deg, #1F64BF, #032CA6)'
        : 'linear-gradient(180deg, #4CAF50, #388E3C)',
    borderRadius: '0 2px 2px 0'
  }
}));

// Controles de zona
const ZoneControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
});

// Botón de control
const ControlButton = styled(IconButton)(({ variant = 'default' }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  background: variant === 'danger' 
    ? 'rgba(244, 67, 54, 0.1)'
    : variant === 'warning'
      ? 'rgba(255, 152, 0, 0.1)'
      : 'rgba(255, 255, 255, 0.1)',
  border: variant === 'danger'
    ? '1px solid rgba(244, 67, 54, 0.2)'
    : variant === 'warning'
      ? '1px solid rgba(255, 152, 0, 0.2)'
      : '1px solid rgba(255, 255, 255, 0.2)',
  color: variant === 'danger' 
    ? '#F44336' 
    : variant === 'warning'
      ? '#FF9800'
      : '#010326',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: variant === 'danger'
      ? 'rgba(244, 67, 54, 0.2)'
      : variant === 'warning'
        ? 'rgba(255, 152, 0, 0.2)'
        : 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.1)'
  }
}));

// Switch personalizado
const CustomSwitch = styled(Switch)({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#1F64BF',
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#1F64BF',
  },
  '& .MuiSwitch-track': {
    borderRadius: '12px',
    height: '24px'
  },
  '& .MuiSwitch-thumb': {
    width: '20px',
    height: '20px'
  }
});

const ZoneListPanel = ({ 
  zones, 
  selectedZone, 
  onSelectZone, 
  showLabels, 
  onToggleLabels,
  onLockZone,
  onUnlockZone,
  onEditZone,
  onDeleteZone,
  onDuplicateZone,
  onToggleZoneVisibility
}) => {
  const [expandedZone, setExpandedZone] = useState(null);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Función para mostrar SweetAlert
  const showAlert = (title, message, icon = 'info') => {
    Swal.fire({
      title,
      text: message,
      icon,
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      confirmButtonColor: '#1F64BF',
      borderRadius: '20px'
    });
  };

  // Función para confirmar eliminación
  const handleDeleteZone = (zoneId, zoneName) => {
    Swal.fire({
      title: '¿Eliminar zona?',
      text: `¿Estás seguro de que quieres eliminar la zona "${zoneName}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F44336',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteZone(zoneId);
        showAlert('Zona eliminada', 'La zona se ha eliminado exitosamente', 'success');
      }
    });
  };

  // Función para duplicar zona
  const handleDuplicateZone = (zone) => {
    onDuplicateZone(zone);
    showAlert('Zona duplicada', 'La zona se ha duplicado exitosamente', 'success');
  };

  // Función para editar zona
  const handleEditZone = (zone) => {
    onEditZone(zone);
    showAlert('Editando zona', 'Modo de edición activado', 'info');
  };

  return (
    <GlassPanel>
      {/* Header del panel */}
      <PanelHeader>
        <PanelTitle>
          <ShapesIcon size={24} />
          Zonas de Diseño
        </PanelTitle>
        
        <Tooltip title="Controles avanzados" arrow>
          <IconButton
            size="small"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
                            <ArrowsOut size={18} />
          </IconButton>
        </Tooltip>
      </PanelHeader>

      {/* Controles principales */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <CustomSwitch
              checked={showLabels}
              onChange={(e) => onToggleLabels(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#010326', fontWeight: 500 }}>
              Mostrar etiquetas
            </Typography>
          }
        />
        
        <Collapse in={showAdvancedControls}>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Auto-snap" 
              size="small" 
              variant="outlined"
              sx={{ 
                borderColor: 'rgba(31, 100, 191, 0.3)',
                color: '#1F64BF',
                fontSize: '0.75rem'
              }}
            />
            <Chip 
              label="Guías" 
              size="small" 
              variant="outlined"
              sx={{ 
                borderColor: 'rgba(31, 100, 191, 0.3)',
                color: '#1F64BF',
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Collapse>
      </Box>

      {/* Lista de zonas */}
      <ZoneList>
        {zones && zones.length > 0 ? (
          zones.map((zone, index) => (
            <Grow in timeout={100 * index} key={zone.id}>
              <ZoneItem
                selected={selectedZone === zone.id}
                locked={zone.locked}
                onClick={() => onSelectZone(zone.id)}
              >
                {/* Información principal de la zona */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flex: 1 
                  }}>
                    <ShapesIcon 
                      size={20} 
                      color={selectedZone === zone.id ? '#1F64BF' : '#010326'}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={selectedZone === zone.id ? 600 : 500}
                        sx={{ 
                          color: selectedZone === zone.id ? '#1F64BF' : '#010326',
                          mb: 0.5
                        }}
                      >
                        {zone.name || `Zona ${index + 1}`}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <span>{Math.round(zone.position?.width || 0)}×{Math.round(zone.position?.height || 0)}</span>
                        <span>•</span>
                        <span>x:{Math.round(zone.position?.x || 0)} y:{Math.round(zone.position?.y || 0)}</span>
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Estado de la zona */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {zone.locked && (
                      <Tooltip title="Zona bloqueada" arrow>
                        <Lock size={16} color="#FF9800" />
                      </Tooltip>
                    )}
                    {!zone.visible && (
                      <Tooltip title="Zona oculta" arrow>
                        <EyeSlash size={16} color="#666" />
                      </Tooltip>
                    )}
                    {zone.status === 'completed' && (
                      <Tooltip title="Zona completada" arrow>
                        <CheckCircle size={16} color="#4CAF50" />
                      </Tooltip>
                    )}
                    {zone.status === 'error' && (
                      <Tooltip title="Error en zona" arrow>
                        <XCircle size={16} color="#F44336" />
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Controles de la zona */}
                <Collapse in={expandedZone === zone.id}>
                  <ZoneControls>
                                         <Tooltip title="Editar zona" arrow>
                       <ControlButton onClick={(e) => {
                         e.stopPropagation();
                         handleEditZone(zone);
                       }}>
                         <Copy size={16} />
                       </ControlButton>
                     </Tooltip>
                    
                    <Tooltip title="Duplicar zona" arrow>
                      <ControlButton onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateZone(zone);
                      }}>
                        <CopySimple size={16} />
                      </ControlButton>
                    </Tooltip>
                    
                                         <Tooltip title={zone.locked ? "Desbloquear zona" : "Bloquear zona"} arrow>
                       <ControlButton 
                         variant={zone.locked ? "warning" : "default"}
                         onClick={(e) => {
                           e.stopPropagation();
                           zone.locked ? onUnlockZone(zone.id) : onLockZone(zone.id);
                         }}
                       >
                         {zone.locked ? <Copy size={16} /> : <Lock size={16} />}
                       </ControlButton>
                     </Tooltip>
                    
                    <Tooltip title={zone.visible ? "Ocultar zona" : "Mostrar zona"} arrow>
                      <ControlButton onClick={(e) => {
                        e.stopPropagation();
                        onToggleZoneVisibility(zone.id);
                      }}>
                        {zone.visible ? <Eye size={16} /> : <EyeSlash size={16} />}
                      </ControlButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar zona" arrow>
                      <ControlButton 
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id, zone.name);
                        }}
                      >
                        <Trash size={16} />
                      </ControlButton>
                    </Tooltip>
                  </ZoneControls>
                </Collapse>

                {/* Botón para expandir/contraer */}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedZone(expandedZone === zone.id ? null : zone.id);
                  }}
                  sx={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <ArrowsOut 
                    size={14} 
                    style={{ 
                      transform: expandedZone === zone.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </IconButton>
              </ZoneItem>
            </Grow>
          ))
        ) : (
          <Fade in timeout={500}>
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              color: '#666',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.2)'
            }}>
              <ShapesIcon size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <Typography variant="body2" sx={{ mb: 2 }}>
                No hay zonas configuradas
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Las zonas te permiten definir áreas específicas donde aplicar diseños
              </Typography>
            </Box>
          </Fade>
        )}
      </ZoneList>

      {/* Footer con estadísticas */}
      {zones && zones.length > 0 && (
        <Box sx={{ 
          mt: 3, 
          pt: 2, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {zones.length} zona{zones.length !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {zones.filter(z => z.status === 'completed').length} completada{zones.filter(z => z.status === 'completed').length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </GlassPanel>
  );
};

export default ZoneListPanel;
