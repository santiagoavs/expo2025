// components/OrderDetails/OrderTimelineModal.jsx - Modal para línea de tiempo de orden
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Portal,
  Tooltip
} from '@mui/material';
import {
  X,
  Clock,
  CheckCircle,
  Circle,
  Image as ImageIcon
} from '@phosphor-icons/react';
import { useOrderDetails } from '../../hooks/useOrderDetails';

const OrderTimelineModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber 
}) => {
  const { 
    loading, 
    timeline, 
    loadTimeline 
  } = useOrderDetails();
  
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showPhotosModal, setShowPhotosModal] = useState(false);

  // Definir todas las etapas posibles del sistema
  const allPossibleStages = [
    { 
      status: 'pending_approval', 
      label: 'Esperando Aprobación',
      description: 'Tu pedido ha sido recibido y está siendo revisado por nuestro equipo'
    },
    { 
      status: 'quoted', 
      label: 'Cotizado',
      description: 'Hemos preparado una cotización detallada para tu pedido'
    },
    { 
      status: 'approved', 
      label: 'Aprobado',
      description: 'Tu pedido ha sido aprobado y está listo para producción'
    },
    { 
      status: 'in_production', 
      label: 'En Producción',
      description: 'Estamos trabajando en la creación de tu producto personalizado'
    },
    { 
      status: 'quality_check', 
      label: 'Control de Calidad',
      description: 'Revisando la calidad del producto antes de continuar'
    },
    { 
      status: 'quality_approved', 
      label: 'Calidad Aprobada',
      description: 'El producto ha pasado todos los controles de calidad'
    },
    { 
      status: 'packaging', 
      label: 'Empacando',
      description: 'Preparando tu pedido para el envío con cuidado especial'
    },
    { 
      status: 'ready_for_delivery', 
      label: 'Listo para Entrega',
      description: 'Tu pedido está listo y esperando ser entregado'
    },
    { 
      status: 'out_for_delivery', 
      label: 'En Camino',
      description: 'Tu pedido está en camino hacia el punto de entrega'
    },
    { 
      status: 'delivered', 
      label: 'Entregado',
      description: 'Tu pedido ha sido entregado exitosamente'
    },
    { 
      status: 'completed', 
      label: 'Completado',
      description: 'El proceso de tu pedido ha sido completado'
    }
  ];

  // Calcular progreso real
  const calculateProgress = () => {
    const totalStages = allPossibleStages.length;
    
    if (!timeline?.events || timeline.events.length === 0) {
      // Si no hay eventos pero hay un status actual, contamos 1
      if (timeline?.currentStatus) {
        const currentStageIndex = allPossibleStages.findIndex(stage => stage.status === timeline.currentStatus);
        return { completed: currentStageIndex >= 0 ? currentStageIndex + 1 : 1, total: totalStages };
      }
      return { completed: 0, total: totalStages };
    }

    // Contar eventos completados + fase actual si no está en los eventos
    const completedStages = timeline.events.length;
    const currentStatus = timeline.currentStatus;
    
    // Si el status actual no está en los eventos, agregarlo
    const hasCurrentStatusInEvents = timeline.events.some(event => event.status === currentStatus);
    const finalCompleted = hasCurrentStatusInEvents ? completedStages : completedStages + 1;
    
    return { completed: finalCompleted, total: totalStages };
  };

  useEffect(() => {
    if (isOpen && orderId) {
      loadTimeline(orderId);
    }
  }, [isOpen, orderId, loadTimeline]);

  const getStepIcon = (event) => {
    if (event.status === 'completed') {
      return <CheckCircle size={20} color="#4caf50" />;
    } else if (event.status === 'current') {
      return <Clock size={20} color="#ff9800" />;
    } else {
      return <Circle size={20} color="#e0e0e0" />;
    }
  };

  // Componente para barra de progreso con puntos de referencia
  const ProgressBarWithMarkers = ({ progress, currentStatus }) => {
    const progressPercentage = (progress.completed / progress.total) * 100;
    
    return (
      <Box sx={{ position: 'relative', width: '100%', height: 8 }}>
        {/* Barra de progreso base */}
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#1F64BF'
            }
          }}
        />
        
        {/* Puntos de referencia - centrados verticalmente en la línea */}
        {allPossibleStages.map((stage, index) => {
          const isCompleted = index < progress.completed;
          const isCurrent = stage.status === currentStatus;
          // Calcular posición exacta basada en el progreso de la barra
          const position = (index / (allPossibleStages.length - 1)) * 100;
          
          return (
            <Box
              key={stage.status}
              sx={{
                position: 'absolute',
                left: `${position}%`,
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: isCompleted || isCurrent ? '#1F64BF' : '#e0e0e0',
                border: isCurrent ? '2px solid #ff9800' : '2px solid white',
                boxShadow: isCurrent ? '0 0 0 2px #ff9800' : '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 10,
                '&:hover': {
                  transform: 'translateX(-50%) translateY(-50%) scale(1.3)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                  zIndex: 11,
                  '& .custom-tooltip': {
                    opacity: 1,
                    visibility: 'visible'
                  }
                }
              }}
            >
              {/* Tooltip personalizado con CSS puro */}
              <Box
                className="custom-tooltip"
                sx={{
                  position: 'fixed',
                  bottom: 'auto',
                  top: 'auto',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-100%)',
                  backgroundColor: 'white',
                  color: '#333',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: 500,
                  whiteSpace: 'normal',
                  opacity: 0,
                  visibility: 'hidden',
                  transition: 'opacity 0.15s ease-in-out, visibility 0.15s ease-in-out',
                  zIndex: 99999,
                  minWidth: '140px',
                  maxWidth: '180px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: '3px solid transparent',
                    borderTopColor: 'white'
                  }
                }}
              >
                <Box sx={{ fontWeight: 600, fontSize: '10px', mb: 0.3 }}>
                  {stage.label}
                </Box>
                <Box sx={{ fontSize: '8px', opacity: 0.8, lineHeight: 1.2 }}>
                  {stage.description}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const handleViewPhotos = (photos) => {
    setSelectedPhotos(photos);
    setShowPhotosModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Portal>
        <Dialog
          open={isOpen}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          disablePortal={false}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              maxHeight: '90vh',
              zIndex: 1400
            }
          }}
          sx={{
            zIndex: 1400
          }}
        >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Línea de Tiempo del Pedido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pedido: {orderNumber}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Cargando línea de tiempo...
              </Typography>
            </Box>
          ) : timeline ? (
            <Box>
              {/* Resumen de Progreso */}
              <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                      Progreso General
                    </Typography>
                    <Chip
                      label={timeline.currentStatus}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  
                  {(() => {
                    const progress = calculateProgress();
                    return (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ flexGrow: 1, mr: 2 }}>
                            <ProgressBarWithMarkers 
                              progress={progress} 
                              currentStatus={timeline?.currentStatus} 
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {progress.completed}/{progress.total}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {progress.completed} de {progress.total} etapas completadas
                        </Typography>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Stepper orientation="vertical" sx={{ pl: 0 }}>
                {timeline.timeline?.map((event, index) => (
                  <Step key={event.event} active={true} completed={event.status === 'completed'}>
                    <StepLabel
                      icon={getStepIcon(event)}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontFamily: "'Mona Sans'",
                          fontWeight: event.status === 'current' ? 600 : 400,
                          color: event.status === 'current' ? '#032CA6' : 'inherit'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {event.icon} {event.title}
                        </Typography>
                        {event.status === 'current' && (
                          <Chip label="Actual" size="small" color="primary" />
                        )}
                      </Box>
                    </StepLabel>
                    
                    <StepContent>
                      <Box sx={{ pb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {event.description}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(event.timestamp)}
                        </Typography>

                        {/* Fotos de la etapa */}
                        {event.photos && event.photos.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <ImageIcon size={16} />
                              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>
                                Fotos de Producción ({event.photos.length})
                              </Typography>
                            </Box>
                            
                            <ImageList cols={3} rowHeight={80} sx={{ maxWidth: 300 }}>
                              {event.photos.slice(0, 3).map((photo, photoIndex) => (
                                <ImageListItem key={photoIndex}>
                                  <img
                                    src={photo.url}
                                    alt={`Foto de ${event.title}`}
                                    loading="lazy"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => handleViewPhotos(event.photos)}
                                  />
                                </ImageListItem>
                              ))}
                            </ImageList>
                            
                            {event.photos.length > 3 && (
                              <Button
                                size="small"
                                onClick={() => handleViewPhotos(event.photos)}
                                sx={{ mt: 1 }}
                              >
                                Ver todas las fotos ({event.photos.length})
                              </Button>
                            )}
                          </Box>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2">
                <strong>Funcionalidad de Timeline</strong><br/>
                Esta funcionalidad mostraría la línea de tiempo completa del pedido, incluyendo:
              </Typography>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li>Estados por los que ha pasado la orden</li>
                <li>Fechas y horas de cada cambio</li>
                <li>Fotos de las etapas de producción</li>
                <li>Progreso visual del pedido</li>
              </ul>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>ID de Orden:</strong> {orderId}<br/>
                <strong>Número de Orden:</strong> {orderNumber}
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
      </Portal>

      {/* Modal de Fotos */}
      <Portal>
        <Dialog
          open={showPhotosModal}
          onClose={() => setShowPhotosModal(false)}
          maxWidth="lg"
          fullWidth
          disablePortal={false}
          sx={{
            zIndex: 1500
          }}
        >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Fotos de Producción
          </Typography>
          <IconButton onClick={() => setShowPhotosModal(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <ImageList cols={2} gap={16}>
            {selectedPhotos.map((photo, index) => (
              <ImageListItem key={index}>
                <img
                  src={photo.url}
                  alt={`Foto de producción ${index + 1}`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px'
                  }}
                />
                <ImageListItemBar
                  title={formatDate(photo.uploadedAt)}
                  subtitle={photo.notes}
                  sx={{
                    borderRadius: '0 0 12px 12px',
                    '& .MuiImageListItemBar-title': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiImageListItemBar-subtitle': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowPhotosModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      </Portal>
    </>
  );
};

export default OrderTimelineModal;
