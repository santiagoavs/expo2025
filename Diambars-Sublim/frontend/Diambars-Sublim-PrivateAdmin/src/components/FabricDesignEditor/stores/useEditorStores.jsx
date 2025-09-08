// src/stores/useEditorStore.js - STORE PRINCIPAL DEL EDITOR CON ZUSTAND
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { fabric } from 'fabric';
import { debounce, throttle } from 'lodash';
import Swal from 'sweetalert2';
import KonvaFabricConverter from '../utils/KonvaFabricConverter';

/**
 * Store principal del editor que maneja:
 * - Estado del canvas de Fabric.js
 * - Herramientas activas
 * - Objetos seleccionados
 * - Historial de cambios
 * - Configuraciones de diseño
 * - Estados de carga y errores
 */
const useEditorStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      // ==================== ESTADO DEL CANVAS ====================
      canvas: null,
      isCanvasInitialized: false,
      canvasConfig: {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true
      },

      // ==================== PRODUCTO Y ZONAS ====================
      product: null,
      productType: 'flat',
      customizationAreas: [],
      selectedArea: null,
      selectedAreaData: null,
      showAreaLabels: true,

      // ==================== HERRAMIENTAS Y ESTADO ====================
      activeTool: 'select',
      toolProperties: {
        text: {
          fontFamily: 'Arial',
          fontSize: 24,
          fill: '#010326',
          fontWeight: 'normal',
          fontStyle: 'normal'
        },
        shape: {
          fill: '#1F64BF',
          stroke: '#032CA6',
          strokeWidth: 2,
          opacity: 1
        },
        image: {
          opacity: 1,
          filters: []
        }
      },

      // ==================== OBJETOS Y SELECCIÓN ====================
      selectedObjects: [],
      allObjects: [],
      objectHistory: [],
      currentHistoryIndex: -1,
      maxHistorySteps: 50,

      // ==================== FORMAS VECTORIALES ====================
      vectorShapes: [],
      selectedVectorShape: null,
      vectorEditMode: false,
      konvaShapesModalOpen: false,

      // ==================== ESTADOS DE UI ====================
      isLoading: false,
      isSaving: false,
      error: null,
      notifications: [],
      panelsState: {
        tools: true,
        layers: true,
        properties: true
      },

      // ==================== CONFIGURACIONES DE EXPORTACIÓN ====================
      exportConfig: {
        format: 'png',
        quality: 0.9,
        multiplier: 2,
        includeWatermark: false
      },

      // ==================== ACCIONES DEL CANVAS ====================
      
      /**
       * Inicializa el canvas de Fabric.js
       * @param {HTMLCanvasElement} canvasElement - Elemento canvas del DOM
       * @param {Object} config - Configuración del canvas
       */
      initializeCanvas: (canvasElement, config = {}) => {
        set((state) => {
          try {
            if (state.canvas) {
              state.canvas.dispose();
            }

            const newCanvas = new fabric.Canvas(canvasElement, {
              ...state.canvasConfig,
              ...config,
              // Configuraciones adicionales para evitar errores de contexto
              enableRetinaScaling: false,
              skipTargetFind: false,
              preserveObjectStacking: true,
              // Configuración de texto para evitar errores de TextBaseline
              textBaseline: 'alphabetic',
              // Configuraciones para edición de texto
              selection: true,
              selectionColor: 'rgba(31, 100, 191, 0.3)',
              selectionBorderColor: '#1F64BF',
              selectionLineWidth: 2,
              // Configuración de cursor
              defaultCursor: 'default',
              moveCursor: 'move',
              // Configuración de texto
              textAlign: 'left',
              textDecoration: 'none'
            });

            // Configurar eventos del canvas
            newCanvas.on('selection:created', (e) => {
              get().setSelectedObjects(e.selected || []);
            });

            newCanvas.on('selection:updated', (e) => {
              get().setSelectedObjects(e.selected || []);
            });

            newCanvas.on('selection:cleared', () => {
              get().setSelectedObjects([]);
            });

            newCanvas.on('object:added', (e) => {
              const target = e?.target;
              // Evitar registrar en historial elementos internos (imagen de producto / áreas / etiquetas)
              const skipHistory = target?.data?.isProductImage || target?.data?.isArea || target?.data?.type === 'areaLabel' || target?.data?.skipHistory;
              if (!skipHistory) {
                get().saveToHistory('Objeto agregado');
              }
              get().updateObjectsList();
            });

            newCanvas.on('object:removed', (e) => {
              const target = e?.target;
              const skipHistory = target?.data?.isProductImage || target?.data?.isArea || target?.data?.type === 'areaLabel' || target?.data?.skipHistory;
              if (!skipHistory) {
                get().saveToHistory('Objeto eliminado');
              }
              get().updateObjectsList();
            });

            newCanvas.on('object:modified', (e) => {
              get().saveToHistory('Objeto modificado');
              get().updateObjectsList();
            });

            // Asegurar actualización visual durante transformaciones
            newCanvas.on('object:moving', () => {
              newCanvas.requestRenderAll();
            });
            newCanvas.on('object:scaling', () => {
              newCanvas.requestRenderAll();
            });
            newCanvas.on('object:rotating', () => {
              newCanvas.requestRenderAll();
            });

            // Eventos específicos para edición de texto
            newCanvas.on('text:editing:entered', (e) => {
              console.log('📝 [EditorStore] Texto entrando en modo edición');
              // Deshabilitar selección de otros objetos mientras se edita texto
              newCanvas.selection = false;
            });

            newCanvas.on('text:editing:exited', (e) => {
              console.log('📝 [EditorStore] Texto saliendo del modo edición');
              // Rehabilitar selección
              newCanvas.selection = true;
              // Guardar en historial
              get().saveToHistory('Texto editado');
            });

            // Evento de doble clic para editar texto
            newCanvas.on('mouse:dblclick', (e) => {
              const target = e.target;
              if (target && target.type === 'i-text') {
                console.log('📝 [EditorStore] Doble clic en texto, entrando en modo edición');
                // Usar setTimeout para asegurar que el evento se procese correctamente
                setTimeout(() => {
                  target.enterEditing();
                  newCanvas.setActiveObject(target);
                }, 50);
              }
            });

            // Verificar que el canvas esté completamente inicializado
            if (newCanvas && newCanvas.lowerCanvasEl && typeof newCanvas.lowerCanvasEl.getContext === 'function') {
              // Verificar contexto de manera más robusta
              const context = newCanvas.lowerCanvasEl.getContext('2d');
              if (context && typeof context.clearRect === 'function') {
                state.canvas = newCanvas;
                state.isCanvasInitialized = true;
                state.error = null;
                
                console.log('✅ [EditorStore] Canvas inicializado correctamente');
                
                // Forzar un render inicial para estabilizar el contexto
                setTimeout(() => {
                  if (newCanvas && newCanvas.lowerCanvasEl) {
                    try {
                      // Verificar que el contexto sigue siendo válido antes de renderizar
                      const currentContext = newCanvas.lowerCanvasEl.getContext('2d');
                      if (currentContext && typeof currentContext.clearRect === 'function') {
                        newCanvas.renderAll();
                      } else {
                        console.warn('⚠️ [EditorStore] Contexto perdido, reintentando...');
                        // Reintentar la inicialización
                        setTimeout(() => {
                          if (newCanvas && newCanvas.lowerCanvasEl) {
                            const retryContext = newCanvas.lowerCanvasEl.getContext('2d');
                            if (retryContext && typeof retryContext.clearRect === 'function') {
                              newCanvas.renderAll();
                            }
                          }
                        }, 100);
                      }
                    } catch (renderError) {
                      console.warn('⚠️ [EditorStore] Error en render inicial:', renderError);
                    }
                  }
                }, 100);
              } else {
                throw new Error('Contexto del canvas no disponible o inválido');
              }
            } else {
              throw new Error('Canvas no se pudo inicializar correctamente');
            }
          } catch (error) {
            state.error = `Error inicializando canvas: ${error.message}`;
            console.error('❌ [EditorStore] Error:', error);
          }
        });
      },

      /**
       * Destruye el canvas y limpia recursos
       */
      destroyCanvas: () => {
        set((state) => {
          if (state.canvas) {
            state.canvas.dispose();
          }
          return {
            ...state,
            canvas: null,
            isCanvasInitialized: false,
            selectedObjects: [],
            allObjects: []
          };
        });
        console.log('🧹 [EditorStore] Canvas destruido');
      },

      // ==================== GESTIÓN DE OBJETOS ====================

      /**
       * Establece los objetos seleccionados
       * @param {Array} objects - Array de objetos seleccionados
       */
      setSelectedObjects: (objects) => {
        set((state) => ({
          ...state,
          selectedObjects: objects
        }));
      },

      /**
       * Actualiza la lista de todos los objetos en el canvas
       */
      updateObjectsList: () => {
        set((state) => {
          if (state.canvas) {
            const allObjects = state.canvas.getObjects().map(obj => ({
              id: obj.data?.id || obj.__uid || Date.now(),
              type: obj.type,
              name: obj.data?.name || `${obj.type} ${obj.data?.id || ''}`,
              visible: obj.visible !== false,
              locked: !obj.selectable,
              opacity: obj.opacity || 1,
              object: obj
            }));
            return { ...state, allObjects };
          }
          return state;
        });
      },

      /**
       * Elimina los objetos seleccionados
       */
      deleteSelectedObjects: () => {
        const { canvas, selectedObjects } = get();
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach(obj => {
          // No eliminar imagen del producto o áreas de personalización
          if (!obj.data?.isProductImage && !obj.data?.isArea) {
            canvas.remove(obj);
          }
        });

        canvas.discardActiveObject();
        canvas.requestRenderAll();
      },

      /**
       * Duplica los objetos seleccionados
       */
      duplicateSelectedObjects: () => {
        const { canvas, selectedObjects } = get();
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach(obj => {
          if (!obj.data?.isProductImage && !obj.data?.isArea) {
            obj.clone((cloned) => {
              cloned.set({
                left: obj.left + 20,
                top: obj.top + 20,
                data: { ...obj.data, id: Date.now() + Math.random() }
              });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
            });
          }
        });

        canvas.requestRenderAll();
      },

      // ==================== HERRAMIENTAS ====================

      /**
       * Cambia la herramienta activa
       * @param {string} tool - Nombre de la herramienta
       */
      setActiveTool: (tool) => {
        set((state) => {
          state.activeTool = tool;
          console.log(`🔧 [EditorStore] Herramienta activa: ${tool}`);
        });
      },

      /**
       * Actualiza las propiedades de una herramienta
       * @param {string} tool - Nombre de la herramienta
       * @param {Object} properties - Propiedades a actualizar
       */
      updateToolProperties: (tool, properties) => {
        set((state) => {
          if (state.toolProperties[tool]) {
            Object.assign(state.toolProperties[tool], properties);
          }
        });
      },

      // ==================== GESTIÓN DE ÁREAS ====================

      /**
       * Establece las áreas de personalización
       * @param {Array} areas - Array de áreas de personalización
       */
      setCustomizationAreas: (areas) => {
        set((state) => {
          state.customizationAreas = areas;
        });
      },

      /**
       * Selecciona un área de personalización
       * @param {string} areaId - ID del área
       * @param {Object} areaData - Datos del área
       */
      selectArea: (areaId, areaData) => {
        set((state) => {
          state.selectedArea = areaId;
          state.selectedAreaData = areaData;
        });
      },

      /**
       * Renderiza el canvas de forma segura verificando el contexto
       */
      safeRender: () => {
        set((state) => {
          if (!state.canvas) return;
          
          try {
            // Verificar que el canvas tenga el elemento DOM
            if (!state.canvas.lowerCanvasEl) {
              console.warn('[EditorStore] Canvas DOM no disponible para renderizado');
              return;
            }
            
            // Verificar que el contexto 2D esté disponible
            const context = state.canvas.lowerCanvasEl.getContext('2d');
            if (!context || typeof context.clearRect !== 'function') {
              console.warn('[EditorStore] Contexto 2D no disponible, reintentando...');
              
              // Reintentar después de un breve delay
              setTimeout(() => {
                if (state.canvas && state.canvas.lowerCanvasEl) {
                  const retryContext = state.canvas.lowerCanvasEl.getContext('2d');
                  if (retryContext && typeof retryContext.clearRect === 'function') {
                    state.canvas.requestRenderAll();
                    console.log('[EditorStore] Renderizado exitoso en reintento');
                  } else {
                    console.error('[EditorStore] No se pudo recuperar el contexto 2D');
                  }
                }
              }, 100);
              return;
            }
            
            // Renderizar de forma segura
            state.canvas.requestRenderAll();
            console.log('[EditorStore] Canvas renderizado correctamente');
          } catch (error) {
            console.error('[EditorStore] Error en renderizado seguro:', error);
          }
        });
      },

      /**
       * Alterna la visibilidad de las etiquetas de áreas
       */
      toggleAreaLabels: () => {
        set((state) => {
          state.showAreaLabels = !state.showAreaLabels;
          
          if (state.canvas) {
            const labels = state.canvas.getObjects().filter(obj => 
              obj.data?.type === 'areaLabel'
            );
            labels.forEach(label => {
              label.set({ visible: state.showAreaLabels });
            });
            // Usar renderizado seguro
            state.safeRender();
          }
        });
      },

      // ==================== HISTORIAL Y UNDO/REDO ====================

      /**
       * Guarda el estado actual en el historial
       * @param {string} description - Descripción del cambio
       */
      saveToHistory: debounce((description = 'Cambio') => {
        set((state) => {
          if (!state.canvas) return;

          try {
            const canvasState = state.canvas.toJSON(['data']);
            const newHistoryItem = {
              id: Date.now(),
              state: canvasState,
              description,
              timestamp: new Date().toISOString()
            };

            // Remover estados futuros si estamos en medio del historial
            state.objectHistory = state.objectHistory.slice(0, state.currentHistoryIndex + 1);
            
            // Agregar nuevo estado
            state.objectHistory.push(newHistoryItem);
            
            // Mantener límite de historial
            if (state.objectHistory.length > state.maxHistorySteps) {
              state.objectHistory.shift();
            } else {
              state.currentHistoryIndex++;
            }

            console.log(`📚 [EditorStore] Estado guardado: ${description}`);
          } catch (error) {
            console.error('❌ [EditorStore] Error guardando historial:', error);
          }
        });
      }, 300),

      /**
       * Deshace la última acción
       */
      undo: () => {
        const { canvas, objectHistory, currentHistoryIndex } = get();
        if (!canvas || currentHistoryIndex <= 0) return;

        set((state) => {
          const previousState = state.objectHistory[state.currentHistoryIndex - 1];
          if (previousState) {
            state.canvas.loadFromJSON(previousState.state, () => {
              state.canvas.requestRenderAll();
              get().updateObjectsList();
            });
            state.currentHistoryIndex--;
            console.log(`↶ [EditorStore] Deshecho: ${previousState.description}`);
          }
        });
      },

      /**
       * Rehace la siguiente acción
       */
      redo: () => {
        const { canvas, objectHistory, currentHistoryIndex } = get();
        if (!canvas || currentHistoryIndex >= objectHistory.length - 1) return;

        set((state) => {
          const nextState = state.objectHistory[state.currentHistoryIndex + 1];
          if (nextState) {
            state.canvas.loadFromJSON(nextState.state, () => {
              state.canvas.requestRenderAll();
              get().updateObjectsList();
            });
            state.currentHistoryIndex++;
            console.log(`↷ [EditorStore] Rehecho: ${nextState.description}`);
          }
        });
      },

      // ==================== GESTIÓN DE ESTADO UI ====================

      /**
       * Establece el estado de carga
       * @param {boolean} loading - Estado de carga
       */
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      /**
       * Establece el estado de guardado
       * @param {boolean} saving - Estado de guardado
       */
      setSaving: (saving) => {
        set((state) => {
          state.isSaving = saving;
        });
      },

      /**
       * Establece un error
       * @param {string} error - Mensaje de error
       */
      setError: (error) => {
        set((state) => {
          state.error = error;
          if (error) {
            console.error('❌ [EditorStore] Error:', error);
            // Mostrar error con SweetAlert
            Swal.fire({
              title: '❌ Error en el Editor',
              text: error,
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#EF4444'
            });
          }
        });
      },

      /**
       * Limpia el error actual
       */
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      /**
       * Agrega una notificación
       * @param {Object} notification - Objeto de notificación
       */
      addNotification: (notification) => {
        set((state) => {
          const newNotification = {
            id: Date.now(),
            type: 'info',
            duration: 5000,
            ...notification,
            timestamp: Date.now()
          };
          state.notifications.push(newNotification);
        });
      },

      /**
       * Remueve una notificación
       * @param {number} notificationId - ID de la notificación
       */
      removeNotification: (notificationId) => {
        set((state) => {
          state.notifications = state.notifications.filter(
            n => n.id !== notificationId
          );
        });
      },

      /**
       * Alterna el estado de un panel
       * @param {string} panel - Nombre del panel
       */
      togglePanel: (panel) => {
        set((state) => {
          if (state.panelsState[panel] !== undefined) {
            state.panelsState[panel] = !state.panelsState[panel];
          }
        });
      },

      // ==================== UTILIDADES ====================

      /**
       * Limpia todo el estado del editor
       */
      resetEditor: () => {
        set((state) => {
          if (state.canvas) {
            state.canvas.clear();
          }
          state.selectedObjects = [];
          state.allObjects = [];
          state.objectHistory = [];
          state.currentHistoryIndex = -1;
          state.selectedArea = null;
          state.selectedAreaData = null;
          state.activeTool = 'select';
          state.error = null;
          state.notifications = [];
          console.log('🔄 [EditorStore] Editor reiniciado');
        });
      },

      /**
       * Obtiene estadísticas del editor
       */
      getEditorStats: () => {
        const state = get();
        return {
          objectsCount: state.allObjects.length,
          selectedCount: state.selectedObjects.length,
          historySize: state.objectHistory.length,
          currentHistoryIndex: state.currentHistoryIndex,
          canUndo: state.currentHistoryIndex > 0,
          canRedo: state.currentHistoryIndex < state.objectHistory.length - 1,
          areasCount: state.customizationAreas.length,
          hasSelectedArea: !!state.selectedArea,
          vectorShapesCount: state.vectorShapes.length,
          hasVectorContent: state.vectorShapes.length > 0
        };
      },

      // ==================== GESTIÓN DE FORMAS VECTORIALES ====================

      /**
       * Abre el modal de formas vectoriales
       */
      openKonvaShapesModal: () => {
        console.log('🎨 [EditorStore] openKonvaShapesModal ejecutándose...');
        set((state) => {
          console.log('🎨 [EditorStore] Cambiando konvaShapesModalOpen de', state.konvaShapesModalOpen, 'a true');
          state.konvaShapesModalOpen = true;
          console.log('🎨 [EditorStore] Estado actualizado:', state.konvaShapesModalOpen);
        });
        console.log('🎨 [EditorStore] openKonvaShapesModal completado');
      },

      /**
       * Cierra el modal de formas vectoriales
       */
      closeKonvaShapesModal: () => {
        set((state) => {
          state.konvaShapesModalOpen = false;
        });
      },

      /**
       * Agrega una forma vectorial al canvas
       * @param {fabric.Path} vectorShape - Forma vectorial de Fabric.js
       */
      addVectorShape: (vectorShape) => {
        set((state) => {
          if (state.canvas && vectorShape) {
            state.canvas.add(vectorShape);
            state.canvas.setActiveObject(vectorShape);
            state.canvas.requestRenderAll();
            
            // Actualizar lista de formas vectoriales
            state.vectorShapes.push({
              id: vectorShape.data?.id,
              type: vectorShape.data?.konvaAttrs?.shapeType,
              object: vectorShape
            });
            
            // Guardar en historial
            get().saveToHistory(`Forma vectorial ${vectorShape.data?.konvaAttrs?.shapeType} agregada`);
          }
        });
      },

      /**
       * Actualiza la lista de formas vectoriales
       */
      updateVectorShapesList: () => {
        set((state) => {
          if (state.canvas) {
            const vectorObjects = state.canvas.getObjects().filter(obj => 
              obj.data?.konvaAttrs?.isVectorShape
            );
            
            const newVectorShapes = vectorObjects.map(obj => ({
              id: obj.data?.id,
              type: obj.data?.konvaAttrs?.shapeType,
              object: obj
            }));
            
            // Solo actualizar si hay cambios
            if (JSON.stringify(newVectorShapes) !== JSON.stringify(state.vectorShapes)) {
              state.vectorShapes = newVectorShapes;
            }
          }
        });
      },

      /**
       * Selecciona una forma vectorial
       * @param {string} shapeId - ID de la forma vectorial
       */
      selectVectorShape: (shapeId) => {
        set((state) => {
          const shape = state.vectorShapes.find(s => s.id === shapeId);
          if (shape) {
            state.selectedVectorShape = shape;
            state.vectorEditMode = true;
            
            if (state.canvas) {
              state.canvas.setActiveObject(shape.object);
              state.canvas.requestRenderAll();
            }
          }
        });
      },

      /**
       * Sale del modo de edición vectorial
       */
      exitVectorEditMode: () => {
        set((state) => {
          state.vectorEditMode = false;
          state.selectedVectorShape = null;
          
          if (state.canvas) {
            state.canvas.discardActiveObject();
            state.canvas.requestRenderAll();
          }
        });
      },

      /**
       * Convierte datos del canvas a formato compatible con backend
       * @param {string} areaId - ID del área de personalización
       * @returns {Array} Array de elementos para el backend
       */
      getCanvasDataForBackend: (areaId = null) => {
        const { canvas } = get();
        if (!canvas) return [];

        const objects = canvas.getObjects().filter(obj => 
          !obj.data?.isProductImage && 
          !obj.data?.isArea && 
          obj.data?.type !== 'areaLabel'
        );

        return objects.map(obj => {
          if (obj.data?.konvaAttrs?.isVectorShape) {
            return KonvaFabricConverter.fabricToBackend(obj, areaId);
          } else {
            // Para objetos no vectoriales, crear estructura básica
            const bounds = obj.getBoundingRect();
            return {
              type: obj.type,
              areaId: areaId,
              konvaAttrs: {
                x: obj.left || 0,
                y: obj.top || 0,
                width: bounds.width,
                height: bounds.height,
                rotation: obj.angle || 0,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
                opacity: obj.opacity || 1,
                fill: obj.fill || '#1F64BF',
                stroke: obj.stroke || '#032CA6',
                strokeWidth: obj.strokeWidth || 2
              },
              metadata: {
                originalFileName: `fabric_${obj.type}_${Date.now()}`,
                fileSize: 0,
                source: 'fabric-basic',
                tags: ['basic', obj.type]
              }
            };
          }
        }).filter(Boolean);
      },

      /**
       * Carga elementos desde el backend al canvas
       * @param {Array} elements - Array de elementos del backend
       */
      loadElementsFromBackend: async (elements) => {
        const { canvas } = get();
        if (!canvas || !Array.isArray(elements)) return;

        try {
          // Limpiar objetos existentes (excepto imagen de producto y áreas)
          const objectsToRemove = canvas.getObjects().filter(obj => 
            !obj.data?.isProductImage && 
            !obj.data?.isArea && 
            obj.data?.type !== 'areaLabel'
          );
          objectsToRemove.forEach(obj => canvas.remove(obj));

          // Cargar elementos del backend
          for (const element of elements) {
            console.log('🔄 [EditorStore] Cargando elemento:', element);
            console.log('🔄 [EditorStore] Es forma vectorial:', element.konvaAttrs?.isVectorShape);
            console.log('🔄 [EditorStore] Tipo:', element.type);
            
            // Usar el converter unificado que maneja todos los tipos
            const canvasDimensions = {
              width: canvas.getWidth(),
              height: canvas.getHeight()
            };
            const fabricObject = await KonvaFabricConverter.backendToFabric(element, canvasDimensions);
            if (fabricObject) {
              canvas.add(fabricObject);
              console.log('✅ [EditorStore] Elemento cargado:', element.type);
            } else {
              console.warn('⚠️ [EditorStore] No se pudo cargar elemento:', element.type);
            }
          }

          canvas.requestRenderAll();
          get().updateObjectsList();
          get().updateVectorShapesList();
          
          console.log(`✅ [EditorStore] Cargados ${elements.length} elementos desde backend`);
        } catch (error) {
          console.error('❌ [EditorStore] Error cargando elementos:', error);
          get().setError(`Error cargando elementos: ${error.message}`);
        }
      },

      /**
       * Migra una forma básica a vectorial
       * @param {fabric.Object} fabricObject - Objeto a migrar
       * @param {string} shapeType - Tipo de forma vectorial
       * @param {Object} vectorParams - Parámetros de la forma
       */
      migrateToVector: async (fabricObject, shapeType, vectorParams = {}) => {
        const { canvas } = get();
        if (!canvas || !fabricObject) return;

        try {
          const vectorShape = await KonvaFabricConverter.migrateToVector(
            fabricObject, 
            shapeType, 
            vectorParams
          );

          if (vectorShape) {
            // Reemplazar objeto original
            canvas.remove(fabricObject);
            canvas.add(vectorShape);
            canvas.setActiveObject(vectorShape);
            canvas.requestRenderAll();

            get().updateVectorShapesList();
            get().saveToHistory(`Forma migrada a vectorial: ${shapeType}`);
            
            get().addNotification({
              type: 'success',
              title: 'Migración exitosa',
              message: `Forma convertida a ${shapeType} vectorial`
            });
          }
        } catch (error) {
          console.error('❌ [EditorStore] Error migrando a vector:', error);
          get().setError(`Error migrando forma: ${error.message}`);
        }
      }
    }))
  )
);

// ==================== SELECTORES OPTIMIZADOS ====================

/**
 * Selectores para optimizar re-renders
 */
export const useCanvasState = () => useEditorStore((state) => ({
  canvas: state.canvas,
  isInitialized: state.isCanvasInitialized,
  config: state.canvasConfig
}));

export const useToolsState = () => useEditorStore((state) => ({
  activeTool: state.activeTool,
  properties: state.toolProperties,
  setActiveTool: state.setActiveTool,
  updateToolProperties: state.updateToolProperties
}));

export const useSelectionState = () => useEditorStore((state) => ({
  selectedObjects: state.selectedObjects,
  allObjects: state.allObjects,
  deleteSelected: state.deleteSelectedObjects,
  duplicateSelected: state.duplicateSelectedObjects
}));

export const useHistoryState = () => useEditorStore((state) => ({
  canUndo: state.currentHistoryIndex > 0,
  canRedo: state.currentHistoryIndex < state.objectHistory.length - 1,
  undo: state.undo,
  redo: state.redo
}));

export const useAreasState = () => useEditorStore((state) => ({
  areas: state.customizationAreas,
  selectedArea: state.selectedArea,
  selectedAreaData: state.selectedAreaData,
  showLabels: state.showAreaLabels,
  selectArea: state.selectArea,
  toggleLabels: state.toggleAreaLabels
}));

export const useUIState = () => useEditorStore((state) => ({
  isLoading: state.isLoading,
  isSaving: state.isSaving,
  error: state.error,
  notifications: state.notifications,
  panelsState: state.panelsState,
  setLoading: state.setLoading,
  setSaving: state.setSaving,
  setError: state.setError,
  clearError: state.clearError,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  togglePanel: state.togglePanel
}));

export const useVectorShapesState = () => useEditorStore((state) => ({
  vectorShapes: state.vectorShapes,
  selectedVectorShape: state.selectedVectorShape,
  vectorEditMode: state.vectorEditMode,
  konvaShapesModalOpen: state.konvaShapesModalOpen,
  openKonvaShapesModal: state.openKonvaShapesModal,
  closeKonvaShapesModal: state.closeKonvaShapesModal,
  addVectorShape: state.addVectorShape,
  updateVectorShapesList: state.updateVectorShapesList,
  selectVectorShape: state.selectVectorShape,
  exitVectorEditMode: state.exitVectorEditMode,
  migrateToVector: state.migrateToVector
}));

export const useBackendIntegration = () => useEditorStore((state) => ({
  getCanvasDataForBackend: state.getCanvasDataForBackend,
  loadElementsFromBackend: state.loadElementsFromBackend
}));

export default useEditorStore;