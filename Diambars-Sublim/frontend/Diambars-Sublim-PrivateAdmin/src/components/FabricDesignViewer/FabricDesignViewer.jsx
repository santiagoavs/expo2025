// src/components/FabricDesignViewer/FabricDesignViewer.jsx - VIEWER CORREGIDO PARA FABRIC V5.3.0
import React, { useEffect, useRef, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Box, 
  Button, 
  Typography,
  CircularProgress
} from '@mui/material';
import { X as CloseIcon, Download } from '@phosphor-icons/react';

// IMPORTACIÓN CORRECTA PARA FABRIC V5.3.0
import { fabric } from 'fabric';
import CoordinateTransformer from '../../utils/CoordinateTransformer';

const FabricDesignViewer = ({ 
  isOpen, 
  onClose, 
  design, 
  product, 
  enableDownload = true 
}) => {
  const canvasRef = useRef();
  const canvasInst = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Limpiar canvas cuando se cierra el dialog
      if (canvasInst.current) {
        try {
          canvasInst.current.dispose();
          canvasInst.current = null;
        } catch (error) {
          console.warn('Error disposing canvas:', error);
        }
      }
      return;
    }

    initializeViewer();

    return () => {
      if (canvasInst.current) {
        try {
          canvasInst.current.dispose();
          canvasInst.current = null;
        } catch (error) {
          console.warn('Error disposing canvas on cleanup:', error);
        }
      }
    };
  }, [isOpen, design, product]);

  const initializeViewer = async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Limpiar canvas anterior si existe
      if (canvasInst.current) {
        canvasInst.current.dispose();
        canvasInst.current = null;
      }

      // Limpiar elemento canvas
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        canvasElement.removeAttribute('data-fabric');
        canvasElement.className = '';
      }

      console.log('Inicializando viewer de Fabric...');

      // Crear canvas estático para vista previa
      const canvas = new fabric.StaticCanvas(canvasRef.current, {
        width: 900,
        height: 600,
        backgroundColor: 'transparent',
        renderOnAddRemove: false,
        skipTargetFind: true,
        selection: false,
        interactive: false,
      });

      if (!canvas) {
        throw new Error('No se pudo crear el canvas');
      }

      canvasInst.current = canvas;

      // Cargar contenido
      await loadContent(canvas);

      console.log('Viewer inicializado exitosamente');

    } catch (error) {
      console.error('Error inicializando viewer:', error);
      setError('Error al cargar la vista previa del diseño');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContent = async (canvas) => {
    try {
      // 1. Cargar imagen del producto (fondo)
      await loadProductImage(canvas);

      // 2. Cargar áreas de personalización
      loadCustomizationAreas(canvas);

      // 3. Cargar elementos del diseño
      await loadDesignElements(canvas);

      // Renderizar todo
      canvas.requestRenderAll();

    } catch (error) {
      console.error('Error cargando contenido:', error);
      throw error;
    }
  };

  const loadProductImage = (canvas) => {
    return new Promise((resolve) => {
      const productSrc = product?.images?.main || product?.mainImage || product?.image;
      
      if (!productSrc) {
        console.log('No hay imagen de producto para cargar');
        resolve();
        return;
      }

      console.log('Cargando imagen del producto:', productSrc);

      fabric.Image.fromURL(productSrc, (img) => {
        try {
          const scaleX = canvas.getWidth() / (img.width || 1);
          const scaleY = canvas.getHeight() / (img.height || 1);
          const scale = Math.min(scaleX, scaleY, 1);

          img.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            opacity: 0.8,
            data: { isProductImage: true }
          });

          img.scale(scale);
          canvas.add(img);
          canvas.sendToBack(img);

          // Aplicar filtro de color si existe
          if (design?.productColorFilter && design.productColorFilter !== '#ffffff') {
            applyProductColorFilter(img, design.productColorFilter, canvas);
          }

          console.log('Imagen del producto cargada exitosamente');
          canvas.requestRenderAll();
          resolve();

        } catch (error) {
          console.error('Error configurando imagen del producto:', error);
          resolve(); // No fallar si hay error con la imagen
        }
      }, { 
        crossOrigin: 'anonymous',
        // Manejar errores de carga
        onerror: () => {
          console.warn('No se pudo cargar la imagen del producto');
          resolve();
        }
      });
    });
  };

  const loadCustomizationAreas = (canvas) => {
    if (!product?.customizationAreas) {
      console.log('No hay áreas de personalización para mostrar');
      return;
    }

    console.log('Cargando áreas de personalización:', product.customizationAreas.length);

    product.customizationAreas.forEach((area, index) => {
      try {
        // ✅ CORRECCIÓN: Usar coordenadas directas en lugar de CoordinateTransformer
        // Las áreas vienen con estructura { position: { x, y, width, height } }
        const areaX = area.position?.x || area.x || 50;
        const areaY = area.position?.y || area.y || 50;
        const areaWidth = area.position?.width || area.width || 200;
        const areaHeight = area.position?.height || area.height || 100;

        const rect = new fabric.Rect({
          left: areaX,
          top: areaY,
          width: areaWidth,
          height: areaHeight,
          fill: 'transparent',
          stroke: '#10B981',
          strokeWidth: 2,
          strokeDashArray: [6, 6],
          selectable: false,
          evented: false,
          data: { 
            isArea: true, 
            areaId: area._id || area.id,
            areaName: area.name || area.displayName
          }
        });

        canvas.add(rect);
        console.log('Área agregada:', { x: areaX, y: areaY, width: areaWidth, height: areaHeight });

      } catch (error) {
        console.warn('Error cargando área de personalización:', area, error);
      }
    });
  };

  const loadDesignElements = async (canvas) => {
    const elements = design?.elements || [];
    
    if (elements.length === 0) {
      console.log('No hay elementos de diseño para cargar');
      return;
    }

    console.log('Cargando elementos del diseño:', elements.length);

    // Cargar elementos uno por uno para manejar async correctamente
    for (const element of elements) {
      await loadSingleElement(canvas, element);
    }
  };

  const loadSingleElement = (canvas, element) => {
    return new Promise((resolve) => {
      try {
        const fabricConfig = CoordinateTransformer.konvaElementToFabric(element);
        
        if (!fabricConfig) {
          console.warn('No se pudo convertir elemento:', element);
          resolve();
          return;
        }

        if (fabricConfig.__fabricType === 'i-text') {
          // Elemento de texto
          const textObj = new fabric.IText(fabricConfig.options.text || '', {
            ...fabricConfig.options,
            selectable: false,
            evented: false,
            data: { 
              type: 'text',
              elementId: element.id || element._id
            }
          });

          canvas.add(textObj);
          console.log('Texto agregado:', fabricConfig.options.text);
          resolve();

        } else if (fabricConfig.__fabricType === 'image' && fabricConfig.options.src) {
          // Elemento de imagen
          fabric.Image.fromURL(fabricConfig.options.src, (img) => {
            img.set({
              ...fabricConfig.options,
              selectable: false,
              evented: false,
              data: { 
                type: 'image',
                elementId: element.id || element._id
              }
            });

            canvas.add(img);
            console.log('Imagen agregada');
            canvas.requestRenderAll();
            resolve();

          }, { 
            crossOrigin: 'anonymous',
            onerror: () => {
              console.warn('Error cargando imagen del elemento:', fabricConfig.options.src);
              resolve();
            }
          });

        } else if (fabricConfig.__fabricType === 'rect') {
          // Elemento de forma rectangular
          const rect = new fabric.Rect({
            ...fabricConfig.options,
            selectable: false,
            evented: false,
            data: { 
              type: 'shape',
              elementId: element.id || element._id
            }
          });

          canvas.add(rect);
          console.log('Rectángulo agregado');
          resolve();

        } else {
          console.warn('Tipo de elemento no soportado:', fabricConfig.__fabricType);
          resolve();
        }

      } catch (error) {
        console.error('Error cargando elemento individual:', element, error);
        resolve(); // Continuar con otros elementos
      }
    });
  };

  const applyProductColorFilter = (imageObj, color, canvas) => {
    try {
      if (!imageObj || color === '#ffffff') return;

      console.log('Aplicando filtro de color al producto:', color);

      // ✅ MEJORADO: Usar múltiples filtros para mejor resultado
      const filters = [];
      
      // 1. Filtro de mezcla de color principal (más intenso)
      const blendFilter = new fabric.Image.filters.BlendColor({
        color: color,
        mode: 'multiply',
        alpha: 0.8 // ✅ AUMENTADO: Más intenso que antes
      });
      filters.push(blendFilter);
      
      // 2. Filtro de saturación para hacer el color más vibrante
      const saturationFilter = new fabric.Image.filters.Saturation({
        saturation: 0.3 // ✅ AÑADIDO: Aumentar saturación
      });
      filters.push(saturationFilter);
      
      // 3. Filtro de contraste para mejorar la definición
      const contrastFilter = new fabric.Image.filters.Contrast({
        contrast: 0.2 // ✅ AÑADIDO: Aumentar contraste
      });
      filters.push(contrastFilter);
      
      // 4. Filtro de brillo para compensar la oscuridad del multiply
      const brightnessFilter = new fabric.Image.filters.Brightness({
        brightness: 0.1 // ✅ AÑADIDO: Aclarar ligeramente
      });
      filters.push(brightnessFilter);
      
      // Aplicar todos los filtros
      imageObj.filters = filters;
      imageObj.applyFilters();
      
      // ✅ FORZAR RE-RENDER para asegurar que se vean los cambios
      canvas.requestRenderAll();
      
      console.log('Filtro de color aplicado exitosamente:', color);

    } catch (error) {
      console.error('Error aplicando filtro de color:', error);
      
      // ✅ FALLBACK: Si fallan los filtros avanzados, usar método simple
      try {
        imageObj.filters = [];
        const simpleFilter = new fabric.Image.filters.BlendColor({
          color: color,
          mode: 'multiply',
          alpha: 0.6
        });
        imageObj.filters.push(simpleFilter);
        imageObj.applyFilters();
        canvas.requestRenderAll();
        
        console.log('Filtro de color fallback aplicado:', color);
      } catch (fallbackError) {
        console.error('Fallback color filter also failed:', fallbackError);
      }
    }
  };

  const handleDownload = () => {
    if (!canvasInst.current) {
      console.error('Canvas no disponible para descarga');
      return;
    }

    try {
      console.log('Iniciando descarga...');
      
      // Generar imagen en alta resolución
      const dataURL = canvasInst.current.toDataURL({ 
        format: 'png', 
        multiplier: 2,
        quality: 1.0
      });
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `diseno-${design?.name || design?.id || 'preview'}-${Date.now()}.png`;
      
      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Descarga completada');

    } catch (error) {
      console.error('Error en descarga:', error);
      alert('Error al descargar la imagen');
    }
  };

  const handleClose = () => {
    // Limpiar canvas antes de cerrar
    if (canvasInst.current) {
      try {
        canvasInst.current.dispose();
        canvasInst.current = null;
      } catch (error) {
        console.warn('Error disposing canvas on close:', error);
      }
    }
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth={false} 
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
          color: 'white',
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Vista Previa del Diseño
          </Typography>
          {design?.name && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {design.name}
            </Typography>
          )}
        </Box>
        
        <IconButton 
          onClick={handleClose}
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8F9FA'
        }}
      >
        {/* Área del canvas */}
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 3,
            position: 'relative',
            minHeight: '500px'
          }}
        >
          {isLoading && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                zIndex: 10
              }}
            >
              <CircularProgress size={40} sx={{ color: '#1F64BF' }} />
              <Typography variant="body2" color="text.secondary">
                Cargando vista previa...
              </Typography>
            </Box>
          )}

          {error && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'error.main'
              }}
            >
              <Typography variant="body1" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={initializeViewer}
                sx={{ mt: 2 }}
              >
                Reintentar
              </Button>
            </Box>
          )}

          <canvas 
            ref={canvasRef}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 0.3s ease'
            }}
          />
        </Box>

        {/* Información del diseño */}
        {(design?.elements?.length > 0 || product?.name) && (
          <Box 
            sx={{ 
              borderTop: '1px solid #e0e0e0',
              backgroundColor: 'white',
              p: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {product?.name && (
                  <Typography variant="body2" color="text.secondary">
                    Producto: {product.name}
                  </Typography>
                )}
                {design?.elements && (
                  <Typography variant="caption" color="text.secondary">
                    {design.elements.length} elemento(s) de diseño
                  </Typography>
                )}
              </Box>

              {enableDownload && (
                <Button 
                  variant="contained"
                  startIcon={<Download size={16} />}
                  onClick={handleDownload}
                  disabled={isLoading || error || !canvasInst.current}
                  sx={{ 
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    }
                  }}
                >
                  Descargar PNG
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FabricDesignViewer;
