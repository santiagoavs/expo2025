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
import KonvaFabricConverter from '../FabricDesignEditor/utils/KonvaFabricConverter';

const FabricDesignViewer = ({ 
  isOpen, 
  onClose, 
  design, 
  product, 
  enableDownload = true 
}) => {
  console.log('🎨 [FabricDesignViewer] Componente montado con props:', { isOpen, design, product });
  
  const canvasRef = useRef();
  const canvasInst = useRef(null);
  const initializationRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    console.log('🎨 [FabricDesignViewer] useEffect ejecutado:', { isOpen, design: !!design, product: !!product });
    
    if (!isOpen) {
      console.log('🎨 [FabricDesignViewer] Modal cerrado, limpiando canvas...');
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

    // Solo inicializar si tenemos los datos necesarios
    if (!design || !product) {
      console.log('🎨 [FabricDesignViewer] Esperando datos del diseño y producto...');
      return;
    }

    console.log('🎨 [FabricDesignViewer] Modal abierto, inicializando viewer...');
    
    // Esperar un poco para asegurar que el canvas esté disponible
    const timeoutId = setTimeout(() => {
      console.log('🎨 [FabricDesignViewer] Timeout ejecutado, canvasRef.current:', canvasRef.current);
      initializeViewer();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (canvasInst.current) {
        try {
          canvasInst.current.dispose();
          canvasInst.current = null;
        } catch (error) {
          console.warn('Error disposing canvas on cleanup:', error);
        }
      }
    };
  }, [isOpen, design?.id, product?.id]); // Solo re-ejecutar si cambian los IDs

  const initializeViewer = async () => {
    console.log('🎨 [FabricDesignViewer] initializeViewer llamado');
    console.log('🎨 [FabricDesignViewer] canvasRef.current:', canvasRef.current);
    
    // Evitar múltiples inicializaciones
    if (initializationRef.current) {
      console.log('🎨 [FabricDesignViewer] Inicialización ya en progreso, saltando...');
      return;
    }
    
    if (!canvasRef.current) {
      console.error('❌ [FabricDesignViewer] canvasRef.current no está disponible');
      setError('Canvas no disponible');
      return;
    }

    initializationRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🎨 [FabricDesignViewer] Inicializando viewer...');
      console.log('🎨 [FabricDesignViewer] Design recibido:', design);
      console.log('🎨 [FabricDesignViewer] Product recibido:', product);
      console.log('🎨 [FabricDesignViewer] Elementos del diseño:', design?.elements);

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

      console.log('🎨 [FabricDesignViewer] Canvas limpiado, creando nuevo canvas...');

      // Crear canvas estático para vista previa
      // Usar las mismas dimensiones que el editor para mantener consistencia
      const canvasWidth = product?.editorConfig?.stageWidth || 800;
      const canvasHeight = product?.editorConfig?.stageHeight || 600;
      
      console.log('📐 [FabricDesignViewer] Tamaño del canvas:', { width: canvasWidth, height: canvasHeight });
      
      const canvas = new fabric.StaticCanvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        renderOnAddRemove: false,
        skipTargetFind: true,
        selection: false,
        interactive: false,
        enableRetinaScaling: false, // Evitar problemas de escala
        imageSmoothingEnabled: true
      });
      
      // Verificar que el canvas se creó correctamente y tiene contexto
      if (!canvas || !canvas.lowerCanvasEl) {
        throw new Error('No se pudo crear el canvas');
      }
      
      const context = canvas.lowerCanvasEl.getContext('2d');
      if (!context || typeof context.clearRect !== 'function') {
        throw new Error('Contexto del canvas no disponible después de la creación');
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
      initializationRef.current = false;
    }
  };

  const loadContent = async (canvas) => {
    try {
      // 1. Cargar imagen del producto (fondo)
      await loadProductImage(canvas);

      // ✅ REMOVIDO: Las zonas customizables no se muestran en la vista previa
      // Solo son referencia visual para el editor, no para el cliente final
      console.log('ℹ️ [FabricDesignViewer] Saltando carga de zonas customizables en vista previa');

      // 3. Cargar elementos del diseño
      await loadDesignElements(canvas);

      // Renderizar todo con verificación de contexto
      try {
        // Esperar un poco para asegurar que el canvas esté completamente inicializado
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verificar que el contexto del canvas esté disponible antes de renderizar
        const context = canvas.lowerCanvasEl?.getContext('2d');
        if (context && typeof context.clearRect === 'function') {
          console.log('✅ [FabricDesignViewer] Contexto válido, renderizando...');
          canvas.requestRenderAll();
        } else {
          console.warn('⚠️ [FabricDesignViewer] Contexto perdido, reintentando render...');
          // Reintentar después de un delay más largo
          setTimeout(() => {
            const retryContext = canvas.lowerCanvasEl?.getContext('2d');
            if (retryContext && typeof retryContext.clearRect === 'function') {
              console.log('✅ [FabricDesignViewer] Contexto recuperado, renderizando...');
              canvas.requestRenderAll();
            } else {
              console.error('❌ [FabricDesignViewer] No se pudo recuperar el contexto del canvas');
              setRenderError('Error al renderizar el diseño - contexto perdido');
            }
          }, 200);
        }
      } catch (renderError) {
        console.error('❌ [FabricDesignViewer] Error en render:', renderError);
        setRenderError('Error al renderizar el diseño');
      }

    } catch (error) {
      console.error('Error cargando contenido:', error);
      throw error;
    }
  };

  // ✅ ELIMINADO: createElementWithDirectScaling ya no es necesario
  // Ahora usamos KonvaFabricConverter.backendToFabric para todo

  const addImageToCanvas = (img, canvas, design) => {
    // Verificar que el canvas esté disponible antes de agregar la imagen
    if (!canvas || !canvas.lowerCanvasEl || canvas.isDestroyed) {
      console.warn('⚠️ [FabricDesignViewer] Canvas no disponible para agregar imagen');
      return;
    }
    
    // Verificar que el contexto esté disponible
    const context = canvas.lowerCanvasEl.getContext('2d');
    if (!context || typeof context.clearRect !== 'function') {
      console.warn('⚠️ [FabricDesignViewer] Contexto no disponible para agregar imagen');
      return;
    }
    
    // Obtener dimensiones del canvas actual
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    // ✅ CORREGIDO: Escalar la imagen para ajustarse al canvas (no llenarlo)
    // Esto evita que la imagen se agrande demasiado y cause descolocación
    const scaleX = canvasWidth / (img.width || 1);
    const scaleY = canvasHeight / (img.height || 1);
    // Usar Math.min para que la imagen se ajuste sin exceder el canvas
    const scale = Math.min(scaleX, scaleY);
    
    // Calcular dimensiones escaladas para ajustarse al canvas
    const scaledWidth = (img.width || 1) * scale;
    const scaledHeight = (img.height || 1) * scale;
    
    // Centrar la imagen en el canvas
    const left = (canvasWidth - scaledWidth) / 2;
    const top = (canvasHeight - scaledHeight) / 2;
    
    console.log('🖼️ [FabricDesignViewer] Escalado de imagen:', {
      original: { width: img.width, height: img.height },
      canvas: { width: canvasWidth, height: canvasHeight },
      scale: scale,
      scaled: { width: scaledWidth, height: scaledHeight },
      position: { left: left, top: top }
    });

    img.set({
      left: left,
      top: top,
      selectable: false,
      evented: false,
      opacity: 0.8,
      data: { isProductImage: true }
    });

    img.scale(scale);
    canvas.add(img);
    canvas.sendToBack(img);

    // Aplicar filtro de color si existe - con delay para asegurar que la imagen esté lista
    if (design?.productColorFilter && design.productColorFilter !== '#ffffff') {
      setTimeout(() => {
        applyProductColorFilter(img, design.productColorFilter, canvas);
      }, 100);
    }

    console.log('Imagen del producto cargada exitosamente');
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
          // Verificar que el canvas esté disponible y no haya sido disposed
          if (!canvas || !canvas.lowerCanvasEl || canvas.isDestroyed) {
            console.warn('⚠️ [FabricDesignViewer] Canvas no disponible o destruido, saltando imagen');
            resolve();
            return;
          }
          
          // Verificar que el contexto del canvas esté disponible antes de agregar la imagen
          const context = canvas.lowerCanvasEl.getContext('2d');
          if (!context || typeof context.clearRect !== 'function') {
            console.warn('⚠️ [FabricDesignViewer] Contexto perdido durante carga de imagen, reintentando...');
            setTimeout(() => {
              // Verificar nuevamente que el canvas esté disponible
              if (!canvas || !canvas.lowerCanvasEl || canvas.isDestroyed) {
                console.warn('⚠️ [FabricDesignViewer] Canvas no disponible en reintento');
                resolve();
                return;
              }
              
              const retryContext = canvas.lowerCanvasEl.getContext('2d');
              if (retryContext && typeof retryContext.clearRect === 'function') {
                addImageToCanvas(img, canvas, design);
                resolve();
              } else {
                console.error('❌ [FabricDesignViewer] No se pudo recuperar el contexto para la imagen');
                resolve();
              }
            }, 100);
            return;
          }
          
          addImageToCanvas(img, canvas, design);
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
        // Las áreas vienen normalizadas (800x600) desde el backend
        // Necesitamos escalarlas al canvas actual de manera consistente con la imagen
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // Obtener coordenadas originales del área (en 800x600)
        const areaX = area.position?.x || area.x || 50;
        const areaY = area.position?.y || area.y || 50;
        const areaWidth = area.position?.width || area.width || 200;
        const areaHeight = area.position?.height || area.height || 100;
        
        // ✅ CORREGIDO: Calcular escala consistente con CoordinateConverter
        // Usar Math.min para mantener proporción como en CoordinateConverter
        const scaleX = canvasWidth / 800;
        const scaleY = canvasHeight / 600;
        // Usar la misma lógica que CoordinateConverter: Math.min
        const scale = Math.min(scaleX, scaleY);
        
        // Escalar coordenadas usando la misma escala que la imagen
        const scaledX = areaX * scale;
        const scaledY = areaY * scale;
        const scaledWidth = areaWidth * scale;
        const scaledHeight = areaHeight * scale;
        
        // Calcular offset para centrar las áreas igual que la imagen
        const scaledCanvasWidth = 800 * scale;
        const scaledCanvasHeight = 600 * scale;
        const imageOffsetX = (canvasWidth - scaledCanvasWidth) / 2;
        const imageOffsetY = (canvasHeight - scaledCanvasHeight) / 2;
        
        const finalX = scaledX + imageOffsetX;
        const finalY = scaledY + imageOffsetY;
        
        console.log(`📐 [FabricDesignViewer] Área ${index + 1} - Original: (${areaX}, ${areaY}) ${areaWidth}x${areaHeight}`);
        console.log(`📐 [FabricDesignViewer] Área ${index + 1} - Escalada: (${scaledX}, ${scaledY}) ${scaledWidth}x${scaledHeight}`);
        console.log(`📐 [FabricDesignViewer] Área ${index + 1} - Final: (${finalX}, ${finalY}) ${scaledWidth}x${scaledHeight}`);
        console.log(`📐 [FabricDesignViewer] Área ${index + 1} - Offset imagen: (${imageOffsetX}, ${imageOffsetY})`);

        const rect = new fabric.Rect({
          left: finalX,
          top: finalY,
          width: scaledWidth,
          height: scaledHeight,
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
        console.log('✅ Área agregada:', { x: finalX, y: finalY, width: scaledWidth, height: scaledHeight });

      } catch (error) {
        console.warn('Error cargando área de personalización:', area, error);
      }
    });
  };

  const loadDesignElements = async (canvas) => {
    const elements = design?.elements || [];
    
    if (elements.length === 0) {
      console.log('🎨 [FabricDesignViewer] No hay elementos de diseño para cargar');
      return;
    }

    console.log('🎨 [FabricDesignViewer] Cargando elementos del diseño:', elements.length);
    console.log('🎨 [FabricDesignViewer] Elementos detallados:', elements);

    let loadedCount = 0;

    // Cargar elementos usando el converter correcto
    for (const element of elements) {
      try {
        console.log('🎨 [FabricDesignViewer] Procesando elemento:', element);
        console.log('🎨 [FabricDesignViewer] Elemento konvaAttrs:', element.konvaAttrs);
        console.log('🎨 [FabricDesignViewer] Elemento type:', element.type);
        
        // Usar el converter para crear objetos Fabric
        // ✅ CORREGIDO: Calcular dimensiones escaladas de la imagen para conversión correcta
        // Las coordenadas deben escalarse según la imagen del producto, no el canvas completo
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // ✅ CORREGIDO: Usar dimensiones del canvas para conversión (no las de la imagen)
        // Las coordenadas se guardaron en formato estándar 800x600, deben desnormalizarse al canvas actual
        const scaledImageDimensions = { width: canvasWidth, height: canvasHeight };
        
        console.log('🔄 [FabricDesignViewer] Usando dimensiones del canvas para conversión:', scaledImageDimensions);
        
        console.log('🔄 [FabricDesignViewer] Dimensiones del canvas:', { width: canvasWidth, height: canvasHeight });
        console.log('🔄 [FabricDesignViewer] Dimensiones escaladas de la imagen:', scaledImageDimensions);
        console.log('🔄 [FabricDesignViewer] Coordenadas del elemento antes de conversión:', {
          x: element.konvaAttrs?.x,
          y: element.konvaAttrs?.y,
          width: element.konvaAttrs?.width,
          height: element.konvaAttrs?.height
        });
        
        // ✅ CORREGIDO: Usar dimensiones escaladas de la imagen para conversión
        // Esto asegura que los elementos se posicionen correctamente dentro de la imagen escalada
        console.log('🔄 [FabricDesignViewer] Usando KonvaFabricConverter con dimensiones escaladas');
        let fabricObject = await KonvaFabricConverter.backendToFabric(element, scaledImageDimensions);
        
        if (fabricObject) {
          // ✅ CORREGIDO: Aplicar offset de centrado de la imagen escalada
          const productImage = canvas.getObjects().find(obj => obj.data?.isProductImage);
          if (productImage && productImage._element) {
            const img = productImage._element;
            const originalWidth = img.width || 1;
            const originalHeight = img.height || 1;
            
            const scaleX = canvasWidth / originalWidth;
            const scaleY = canvasHeight / originalHeight;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;
            const offsetX = (canvasWidth - scaledWidth) / 2;
            const offsetY = (canvasHeight - scaledHeight) / 2;
            
            // Aplicar offset a las coordenadas del elemento
            fabricObject.set({
              left: fabricObject.left + offsetX,
              top: fabricObject.top + offsetY
            });
            
            console.log('🔄 [FabricDesignViewer] Offset aplicado:', { 
              offsetX, 
              offsetY,
              scaledWidth,
              scaledHeight,
              originalWidth,
              originalHeight,
              scale
            });
          }
          
          console.log('🔄 [FabricDesignViewer] Coordenadas del objeto Fabric después de conversión:', {
            left: fabricObject.left,
            top: fabricObject.top,
            width: fabricObject.getScaledWidth?.(),
            height: fabricObject.getScaledHeight?.()
          });
          
          // Verificar que el canvas esté disponible antes de agregar el elemento
          if (!canvas || !canvas.lowerCanvasEl || canvas.isDestroyed) {
            console.warn('⚠️ [FabricDesignViewer] Canvas no disponible para agregar elemento');
            continue;
          }
          
          // Verificar que el contexto esté disponible
          const context = canvas.lowerCanvasEl.getContext('2d');
          if (!context || typeof context.clearRect !== 'function') {
            console.warn('⚠️ [FabricDesignViewer] Contexto no disponible para agregar elemento');
            continue;
          }
          
          // Configurar para vista previa (no interactivo)
          fabricObject.set({
            selectable: false,
            evented: false,
            hoverCursor: 'default',
            moveCursor: 'default'
          });
          
          canvas.add(fabricObject);
          loadedCount++;
          console.log('✅ [FabricDesignViewer] Elemento cargado:', element.type || 'unknown');
        } else {
          console.warn('⚠️ [FabricDesignViewer] No se pudo cargar elemento con converter, intentando fallback:', element.type || 'unknown');
          // Fallback: crear elemento básico
          const fallbackObject = createFallbackElement(element);
          if (fallbackObject) {
            canvas.add(fallbackObject);
            loadedCount++;
            console.log('✅ [FabricDesignViewer] Elemento cargado con fallback:', element.type || 'unknown');
          }
        }
      } catch (error) {
        console.error('❌ [FabricDesignViewer] Error cargando elemento:', element, error);
        // Intentar fallback en caso de error
        try {
          const fallbackObject = createFallbackElement(element);
          if (fallbackObject) {
            canvas.add(fallbackObject);
            loadedCount++;
            console.log('✅ [FabricDesignViewer] Elemento cargado con fallback después de error:', element.type || 'unknown');
          }
        } catch (fallbackError) {
          console.error('❌ [FabricDesignViewer] Error en fallback también:', fallbackError);
        }
      }
    }
    
    // Renderizar todo
    canvas.requestRenderAll();
    console.log(`✅ [FabricDesignViewer] ${loadedCount}/${elements.length} elementos cargados exitosamente`);
  };

  // Función de respaldo para crear elementos básicos
  const createFallbackElement = (element) => {
    try {
      const attrs = element.konvaAttrs || {};
      
      if (element.type === 'text' || element.type === 'i-text') {
        return new fabric.IText(attrs.text || 'Texto', {
          left: attrs.x || 100,
          top: attrs.y || 100,
          fontSize: attrs.fontSize || 24,
          fontFamily: attrs.fontFamily || 'Arial',
          fill: attrs.fill || '#000000',
          selectable: false,
          evented: false
        });
      } else if (element.type === 'image') {
        // Para imágenes, crear un rectángulo placeholder
        return new fabric.Rect({
          left: attrs.x || 100,
          top: attrs.y || 100,
          width: attrs.width || 100,
          height: attrs.height || 100,
          fill: '#f0f0f0',
          stroke: '#ccc',
          strokeWidth: 2,
          selectable: false,
          evented: false
        });
      } else if (element.type === 'shape') {
        // Para formas, crear un rectángulo básico
        return new fabric.Rect({
          left: attrs.x || 100,
          top: attrs.y || 100,
          width: attrs.width || 100,
          height: attrs.height || 100,
          fill: attrs.fill || '#1F64BF',
          stroke: attrs.stroke || '#032CA6',
          strokeWidth: attrs.strokeWidth || 2,
          selectable: false,
          evented: false
        });
      }
      
      return null;
    } catch (error) {
      console.error('❌ [FabricDesignViewer] Error creando elemento fallback:', error);
      return null;
    }
  };


  const applyProductColorFilter = (imageObj, color, canvas) => {
    try {
      if (!imageObj || color === '#ffffff' || !canvas || canvas.isDestroyed) {
        console.log('⚠️ [FabricDesignViewer] No se puede aplicar filtro de color:', { 
          hasImage: !!imageObj, 
          color: color, 
          hasCanvas: !!canvas,
          canvasDestroyed: canvas?.isDestroyed 
        });
        return;
      }

      console.log('🎨 [FabricDesignViewer] Aplicando filtro de color al producto:', color);

      // Verificar que la imagen esté completamente cargada
      if (!imageObj._element || !imageObj._element.complete) {
        console.log('⏳ [FabricDesignViewer] Imagen no completamente cargada, reintentando...');
        setTimeout(() => applyProductColorFilter(imageObj, color, canvas), 200);
        return;
      }

      // ✅ MEJORADO: Usar múltiples filtros para mejor resultado
      const filters = [];
      
      // 1. Filtro de mezcla de color principal (más intenso)
      const blendFilter = new fabric.Image.filters.BlendColor({
        color: color,
        mode: 'multiply',
        alpha: 0.9 // ✅ AUMENTADO: Más intenso
      });
      filters.push(blendFilter);
      
      // 2. Filtro de saturación para hacer el color más vibrante
      const saturationFilter = new fabric.Image.filters.Saturation({
        saturation: 0.4 // ✅ AÑADIDO: Aumentar saturación
      });
      filters.push(saturationFilter);
      
      // 3. Filtro de contraste para mejorar la definición
      const contrastFilter = new fabric.Image.filters.Contrast({
        contrast: 0.3 // ✅ AÑADIDO: Aumentar contraste
      });
      filters.push(contrastFilter);
      
      // 4. Filtro de brillo para compensar la oscuridad del multiply
      const brightnessFilter = new fabric.Image.filters.Brightness({
        brightness: 0.15 // ✅ AÑADIDO: Aclarar ligeramente
      });
      filters.push(brightnessFilter);
      
      // Aplicar todos los filtros
      imageObj.filters = filters;
      imageObj.applyFilters();
      
      // ✅ FORZAR RE-RENDER para asegurar que se vean los cambios
      canvas.requestRenderAll();
      
      console.log('✅ [FabricDesignViewer] Filtro de color aplicado exitosamente:', color);

    } catch (error) {
      console.error('❌ [FabricDesignViewer] Error aplicando filtro de color:', error);
      
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

  console.log('🎨 [FabricDesignViewer] Renderizando componente:', { isOpen, isLoading, error, renderError });
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth={false} 
      fullWidth
      style={{ zIndex: 1600 }} // Z-index muy alto para estar por encima del modal de creación
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          borderRadius: '16px',
          overflow: 'hidden',
          zIndex: 1601 // Z-index adicional en el paper
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

          {!isLoading && !error && (!design?.elements || design.elements.length === 0) && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'text.secondary',
                p: 4
              }}
            >
              <Typography variant="h6" gutterBottom>
                No hay elementos en este diseño
              </Typography>
              <Typography variant="body2">
                Los elementos del diseño aparecerán aquí cuando estén disponibles
              </Typography>
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
                {design?.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Diseño: {design.name}
                  </Typography>
                )}
                {design?.user?.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Cliente: {design.user.name}
                  </Typography>
                )}
                {design?.status && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Estado: {design.status}
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
