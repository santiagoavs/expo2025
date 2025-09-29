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
  Tooltip,
  styled,
  alpha
} from '@mui/material';
import {
  X,
  Clock,
  CheckCircle,
  Circle,
  Image as ImageIcon
} from '@phosphor-icons/react';
import { useOrderDetails } from '../../hooks/useOrderDetails';

// ================ ESTILOS MODERNOS SUTILES ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)',
    background: 'white',
    border: '1px solid rgba(31, 100, 191, 0.08)',
    maxWidth: '900px',
    width: '95%',
    maxHeight: '90vh',
    overflow: 'hidden'
  }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  background: 'white',
  color: '#010326',
  padding: '24px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 1px 4px rgba(31, 100, 191, 0.04)',
  background: 'white',
  marginBottom: '20px'
}));

const ProgressCard = styled(ModernCard)(({ theme }) => ({
  marginBottom: '24px'
}));

const TimelineMarker = styled(Box)(({ theme, active, completed }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: completed || active ? '#1F64BF' : '#E0E0E0',
  border: active ? '3px solid #FF9800' : '2px solid white',
  boxShadow: active ? '0 0 0 2px #FF9800' : '0 1px 3px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 10,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}));

const TooltipContent = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#333',
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: 500,
  whiteSpace: 'normal',
  minWidth: '160px',
  maxWidth: '200px',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  border: '1px solid #e0e0e0',
  fontFamily: "'Mona Sans'"
}));

const StageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.85rem',
  marginBottom: '4px',
  fontFamily: "'Mona Sans'"
}));

const StageDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  opacity: 0.8,
  lineHeight: 1.3,
  fontFamily: "'Mona Sans'"
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '10px 20px',
  borderColor: '#1F64BF',
  color: '#1F64BF',
  border: '2px solid',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#032CA6',
    background: alpha('#1F64BF', 0.05)
  }
}));

// ================ COMPONENTE PRINCIPAL ================
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
      description: 'Tu pedido ha sido recibido y está siendo revisado'
    },
    { 
      status: 'quoted', 
      label: 'Cotizado',
      description: 'Hemos preparado una cotización detallada'
    },
    { 
      status: 'approved', 
      label: 'Aprobado',
      description: 'Tu pedido ha sido aprobado para producción'
    },
    { 
      status: 'in_production', 
      label: 'En Producción',
      description: 'Estamos creando tu producto personalizado'
    },
    { 
      status: 'quality_check', 
      label: 'Control de Calidad',
      description: 'Revisando la calidad del producto'
    },
    { 
      status: 'quality_approved', 
      label: 'Calidad Aprobada',
      description: 'El producto ha pasado todos los controles'
    },
    { 
      status: 'packaging', 
      label: 'Empacando',
      description: 'Preparando tu pedido para el envío'
    },
    { 
      status: 'ready_for_delivery', 
      label: 'Listo para Entrega',
      description: 'Tu pedido está listo y esperando'
    },
    { 
      status: 'out_for_delivery', 
      label: 'En Camino',
      description: 'Tu pedido está en camino hacia ti'
    },
    { 
      status: 'delivered', 
      label: 'Entregado',
      description: 'Tu pedido ha sido entregado exitosamente'
    },
    { 
      status: 'completed', 
      label: 'Completado',
      description: 'El proceso ha sido completado'
    }
  ];

  // Calcular progreso real
  const calculateProgress = () => {
    const totalStages = allPossibleStages.length;
    
    if (!timeline?.events || timeline.events.length === 0) {
      if (timeline?.currentStatus) {
        const currentStageIndex = allPossibleStages.findIndex(stage => stage.status === timeline.currentStatus);
        return { completed: currentStageIndex >= 0 ? currentStageIndex + 1 : 1, total: totalStages };
      }
      return { completed: 0, total: totalStages };
    }

    const completedStages = timeline.events.length;
    const currentStatus = timeline.currentStatus;
    
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
      return <CheckCircle size={20} color="#4caf50" weight="duotone" />;
    } else if (event.status === 'current') {
      return <Clock size={20} color="#ff9800" weight="duotone" />;
    } else {
      return <Circle size={20} color="#e0e0e0" weight="duotone" />;
    }
  };

  // Componente para barra de progreso con puntos de referencia
  const ProgressBarWithMarkers = ({ progress, currentStatus }) => {
    const progressPercentage = (progress.completed / progress.total) * 100;
    
    return (
      <Box sx={{ position: 'relative', width: '100%', height: 8, mb: 2 }}>
        {/* Barra de progreso base */}
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #1F64BF 0%, #032CA6 100%)',
              borderRadius: 4
            }
          }}
        />
        
        {/* Puntos de referencia */}
        {allPossibleStages.map((stage, index) => {
          const isCompleted = index < progress.completed;
          const isCurrent = stage.status === currentStatus;
          const position = (index / (allPossibleStages.length - 1)) * 100;
          
          return (
            <Tooltip
              key={stage.status}
              title={
                <TooltipContent>
                  <StageTitle>{stage.label}</StageTitle>
                  <StageDescription>{stage.description}</StageDescription>
                </TooltipContent>
              }
              placement="top"
              arrow
            >
              <TimelineMarker
                active={isCurrent}
                completed={isCompleted}
                sx={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </Tooltip>
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
        <StyledDialog
          open={isOpen}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          disablePortal={false}
          sx={{ zIndex: 1400 }}
        >
          <DialogTitleStyled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: alpha('#3B82F6', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6'
              }}>
                <Clock size={22} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                  fontFamily: "'Mona Sans'", 
                  fontWeight: 700,
                  color: '#010326'
                }}>
                  Línea de Tiempo del Pedido
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                  Pedido: {orderNumber}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: alpha('#1F64BF', 0.08),
                  color: '#1F64BF',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <X size={22} />
            </IconButton>
          </DialogTitleStyled>

          <DialogContent sx={{ 
            p: 3,
            overflow: 'auto',
            background: 'white',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: alpha('#1F64BF', 0.03)
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha('#1F64BF', 0.2),
              borderRadius: '3px',
              '&:hover': {
                background: alpha('#1F64BF', 0.3)
              }
            }
          }}>
            {loading ? (
              <Box sx={{ py: 4 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontFamily: "'Mona Sans'" }}>
                  Cargando línea de tiempo...
                </Typography>
              </Box>
            ) : timeline ? (
              <Box>
                {/* Resumen de Progreso */}
                <ProgressCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontFamily: "'Mona Sans'", 
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: '#010326'
                      }}>
                        Progreso General
                      </Typography>
                      <Chip
                        label={timeline.currentStatus}
                        color="primary"
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontFamily: "'Mona Sans'"
                        }}
                      />
                    </Box>
                    
                    {(() => {
                      const progress = calculateProgress();
                      return (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ flexGrow: 1, mr: 2 }}>
                              <ProgressBarWithMarkers 
                                progress={progress} 
                                currentStatus={timeline?.currentStatus} 
                              />
                            </Box>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 700,
                              fontFamily: "'Mona Sans'",
                              color: '#1F64BF',
                              fontSize: '0.9rem'
                            }}>
                              {progress.completed}/{progress.total}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            color: '#6B7280',
                            fontFamily: "'Mona Sans'",
                            fontSize: '0.85rem'
                          }}>
                            {progress.completed} de {progress.total} etapas completadas
                          </Typography>
                        </>
                      );
                    })()}
                  </CardContent>
                </ProgressCard>

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
                          <Typography variant="body1" sx={{ fontFamily: "'Mona Sans'" }}>
                            {event.icon} {event.title}
                          </Typography>
                          {event.status === 'current' && (
                            <Chip 
                              label="Actual" 
                              size="small" 
                              color="primary"
                              sx={{
                                height: '22px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                fontFamily: "'Mona Sans'"
                              }}
                            />
                          )}
                        </Box>
                      </StepLabel>
                      
                      <StepContent>
                        <Box sx={{ pb: 2 }}>
                          <Typography variant="body2" sx={{ 
                            color: '#6B7280', 
                            mb: 1,
                            fontFamily: "'Mona Sans'",
                            fontSize: '0.85rem'
                          }}>
                            {event.description}
                          </Typography>
                          
                          <Typography variant="caption" sx={{ 
                            color: '#9CA3AF',
                            fontFamily: "'Mona Sans'"
                          }}>
                            {formatDate(event.timestamp)}
                          </Typography>

                          {/* Fotos de la etapa */}
                          {event.photos && event.photos.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ImageIcon size={16} />
                                <Typography variant="body2" sx={{ 
                                  ml: 0.5, 
                                  fontWeight: 600,
                                  fontFamily: "'Mona Sans'"
                                }}>
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
                                  sx={{ 
                                    mt: 1,
                                    textTransform: 'none',
                                    fontFamily: "'Mona Sans'",
                                    fontWeight: 600
                                  }}
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
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: '16px',
                  border: `1px solid ${alpha('#3B82F6', 0.2)}`
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                  <strong>Funcionalidad de Timeline</strong><br/>
                  Esta funcionalidad mostraría la línea de tiempo completa del pedido, incluyendo:
                </Typography>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', fontFamily: "'Mona Sans'" }}>
                  <li>Estados por los que ha pasado la orden</li>
                  <li>Fechas y horas de cada cambio</li>
                  <li>Fotos de las etapas de producción</li>
                  <li>Progreso visual del pedido</li>
                </ul>
                <Typography variant="body2" sx={{ mt: 1, fontFamily: "'Mona Sans'" }}>
                  <strong>ID de Orden:</strong> {orderId}<br/>
                  <strong>Número de Orden:</strong> {orderNumber}
                </Typography>
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
            background: 'white'
          }}>
            <ModernButton onClick={onClose}>
              Cerrar
            </ModernButton>
          </DialogActions>
        </StyledDialog>
      </Portal>

      {/* Modal de Fotos */}
      <Portal>
        <Dialog
          open={showPhotosModal}
          onClose={() => setShowPhotosModal(false)}
          maxWidth="lg"
          fullWidth
          disablePortal={false}
          sx={{ zIndex: 1500 }}
          PaperProps={{
            sx: {
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`
          }}>
            <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 700 }}>
              Fotos de Producción
            </Typography>
            <IconButton 
              onClick={() => setShowPhotosModal(false)} 
              sx={{ 
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: alpha('#1F64BF', 0.08),
                  color: '#1F64BF'
                }
              }}
            >
              <X size={20} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
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
                      fontFamily: "'Mona Sans'",
                      '& .MuiImageListItemBar-title': {
                        fontSize: '0.875rem',
                        fontFamily: "'Mona Sans'"
                      },
                      '& .MuiImageListItemBar-subtitle': {
                        fontSize: '0.75rem',
                        fontFamily: "'Mona Sans'"
                      }
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha('#1F64BF', 0.08)}` }}>
            <ModernButton onClick={() => setShowPhotosModal(false)}>
              Cerrar
            </ModernButton>
          </DialogActions>
        </Dialog>
      </Portal>
    </>
  );
};

export default OrderTimelineModal;