// src/components/FabricDesignEditor/editorTools.js
import { fabric } from 'fabric';
import { ADAPTIVE_TOOLS } from './config/tools.js';
import { getRandomColor } from './config/colors.js';

// ================ HERRAMIENTAS PRINCIPALES DEL EDITOR ================
export const EDITOR_TOOLS = {
  // Herramienta de texto inteligente
  text: {
    name: 'Texto',
    icon: 'text',
    shortcut: 'T',
    description: 'Agregar texto al diseño',
    category: 'content',

    execute: (canvas, productType, options = {}) => {
      if (!canvas) return null;

      try {
        const defaultSize = ADAPTIVE_TOOLS.text.getDefaultSize(productType);
        const maxSize = ADAPTIVE_TOOLS.text.getMaxSize(productType);

        const textObject = new fabric.Text(options.text || 'Texto de ejemplo', {
          fontSize: Math.min(options.fontSize || defaultSize, maxSize),
          fill: options.fill || '#000000',
          left: options.left || 100,
          top: options.top || 100,
          fontFamily: options.fontFamily || 'Arial',
          fontWeight: options.fontWeight || 'normal',
          fontStyle: options.fontStyle || 'normal',
          textAlign: options.textAlign || 'left',
          underline: options.underline || false,
          linethrough: options.linethrough || false,
          letterSpacing: options.letterSpacing || 0,
          lineHeight: options.lineHeight || 1.2
        });

        canvas.add(textObject);
        canvas.setActiveObject(textObject);
        canvas.requestRenderAll();

        return textObject;
      } catch (error) {
        console.error('Error adding text:', error);
        return null;
      }
    },

    // Propiedades editables del texto
    properties: {
      text: { type: 'string', label: 'Texto', default: 'Texto de ejemplo' },
      fontSize: { type: 'number', label: 'Tamaño', min: 8, max: 200, default: 24 },
      fontFamily: {
        type: 'select',
        label: 'Fuente',
        options: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana'],
        default: 'Arial'
      },
      fill: { type: 'color', label: 'Color', default: '#000000' },
      fontWeight: {
        type: 'select',
        label: 'Peso',
        options: ['normal', 'bold'],
        default: 'normal'
      },
      fontStyle: {
        type: 'select',
        label: 'Estilo',
        options: ['normal', 'italic'],
        default: 'normal'
      }
    }
  },

  // Herramienta de imagen con fondo removible
  image: {
    name: 'Imagen',
    icon: 'image',
    shortcut: 'I',
    description: 'Agregar imagen al diseño',
    category: 'content',

    execute: async (canvas, productType, options = {}) => {
      if (!canvas) return null;

      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        return new Promise((resolve) => {
          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                  // Aplicar configuración según el producto
                  const maxDims = ADAPTIVE_TOOLS.image.getMaxDimensions(productType, {
                    width: canvas.getWidth(),
                    height: canvas.getHeight()
                  });

                  // Escalar la imagen si es necesario
                  const scaleX = Math.min(1, maxDims.width / img.width);
                  const scaleY = Math.min(1, maxDims.height / img.height);
                  const scale = Math.min(scaleX, scaleY);

                  img.set({
                    scaleX: scale,
                    scaleY: scale,
                    left: options.left || 100,
                    top: options.top || 100,
                    data: {
                      type: 'image',
                      fileName: file.name,
                      originalWidth: img.width,
                      originalHeight: img.height
                    }
                  });

                  canvas.add(img);
                  canvas.setActiveObject(img);
                  canvas.requestRenderAll();

                  resolve(img);
                });
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };

          input.click();
        });
      } catch (error) {
        console.error('Error adding image:', error);
        return null;
      }
    },

    // Propiedades editables de la imagen
    properties: {
      opacity: { type: 'range', label: 'Opacidad', min: 0, max: 1, step: 0.1, default: 1 },
      brightness: { type: 'range', label: 'Brillo', min: -1, max: 1, step: 0.1, default: 0 },
      contrast: { type: 'range', label: 'Contraste', min: -1, max: 1, step: 0.1, default: 0 },
      saturation: { type: 'range', label: 'Saturación', min: -1, max: 1, step: 0.1, default: 0 }
    }
  },

  // Herramienta de formas básicas
  shapes: {
    name: 'Formas',
    icon: 'shapes',
    shortcut: 'S',
    description: 'Agregar formas geométricas',
    category: 'content',

    execute: (canvas, productType, options = {}) => {
      if (!canvas) return null;

      try {
        const shapeType = options.shapeType || 'rectangle';
        const maxStrokeWidth = ADAPTIVE_TOOLS.shapes.getMaxStrokeWidth(productType);
        const minSize = ADAPTIVE_TOOLS.shapes.getMinSize(productType);

        let shape;
        const baseOptions = {
          left: options.left || 100,
          top: options.top || 100,
          fill: options.fill || getRandomColor('primary'),
          stroke: options.stroke || '#000000',
          strokeWidth: Math.min(options.strokeWidth || 2, maxStrokeWidth),
          opacity: options.opacity || 1
        };

        switch (shapeType) {
          case 'rectangle':
            shape = new fabric.Rect({
              width: Math.max(options.width || 100, minSize),
              height: Math.max(options.height || 100, minSize),
              rx: options.cornerRadius || 0,
              ry: options.cornerRadius || 0,
              ...baseOptions
            });
            break;

          case 'circle':
            shape = new fabric.Circle({
              radius: Math.max(options.radius || 50, minSize / 2),
              ...baseOptions
            });
            break;

          case 'triangle':
            shape = new fabric.Triangle({
              width: Math.max(options.width || 100, minSize),
              height: Math.max(options.height || 100, minSize),
              ...baseOptions
            });
            break;

          case 'line':
            shape = new fabric.Line([
              options.x1 || 0,
              options.y1 || 0,
              options.x2 || 100,
              options.y2 || 0
            ], {
              stroke: baseOptions.stroke,
              strokeWidth: baseOptions.strokeWidth,
              left: baseOptions.left,
              top: baseOptions.top
            });
            break;

          case 'polygon':
            const sides = options.sides || 6;
            const radius = Math.max(options.radius || 50, minSize / 2);
            const points = [];

            for (let i = 0; i < sides; i++) {
              const angle = (i * 2 * Math.PI) / sides;
              points.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
              });
            }

            shape = new fabric.Polygon(points, baseOptions);
            break;

          default:
            shape = new fabric.Rect({
              width: 100,
              height: 100,
              ...baseOptions
            });
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.requestRenderAll();

        return shape;
      } catch (error) {
        console.error('Error adding shape:', error);
        return null;
      }
    },

    // Propiedades editables de las formas
    properties: {
      fill: { type: 'color', label: 'Relleno', default: '#ffffff' },
      stroke: { type: 'color', label: 'Borde', default: '#000000' },
      strokeWidth: { type: 'range', label: 'Grosor del borde', min: 0, max: 20, step: 1, default: 2 },
      opacity: { type: 'range', label: 'Opacidad', min: 0, max: 1, step: 0.1, default: 1 }
    },

    // Tipos de formas disponibles
    availableShapes: ['rectangle', 'circle', 'triangle', 'line', 'polygon']
  },

  // Herramienta de efectos
  effects: {
    name: 'Efectos',
    icon: 'sparkles',
    shortcut: 'E',
    description: 'Aplicar efectos visuales',
    category: 'enhancement',

    execute: (canvas, productType, options = {}) => {
      if (!canvas) return null;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) {
        console.warn('No hay objeto seleccionado para aplicar efectos');
        return null;
      }

      try {
        const effectType = options.effectType || 'shadow';

        switch (effectType) {
          case 'shadow':
            activeObject.set({
              shadow: new fabric.Shadow({
                color: options.shadowColor || 'rgba(0,0,0,0.3)',
                blur: options.shadowBlur || 10,
                offsetX: options.shadowOffsetX || 5,
                offsetY: options.shadowOffsetY || 5
              })
            });
            break;

          case 'glow':
            activeObject.set({
              shadow: new fabric.Shadow({
                color: options.glowColor || 'rgba(255,255,255,0.8)',
                blur: options.glowBlur || 20,
                offsetX: 0,
                offsetY: 0
              })
            });
            break;

          case 'blur':
            // Aplicar filtro de desenfoque
            if (activeObject.filters) {
              activeObject.filters.push(new fabric.Image.filters.Blur({
                blur: options.blurAmount || 0.5
              }));
            }
            break;
        }

        canvas.requestRenderAll();
        return activeObject;
      } catch (error) {
        console.error('Error applying effect:', error);
        return null;
      }
    },

    // Propiedades editables de los efectos
    properties: {
      effectType: {
        type: 'select',
        label: 'Tipo de efecto',
        options: ['shadow', 'glow', 'blur'],
        default: 'shadow'
      },
      shadowColor: { type: 'color', label: 'Color de sombra', default: 'rgba(0,0,0,0.3)' },
      shadowBlur: { type: 'range', label: 'Desenfoque', min: 0, max: 50, step: 1, default: 10 },
      shadowOffsetX: { type: 'range', label: 'Offset X', min: -20, max: 20, step: 1, default: 5 },
      shadowOffsetY: { type: 'range', label: 'Offset Y', min: -20, max: 20, step: 1, default: 5 }
    }
  }
};

// ================ FUNCIONES DE UTILIDAD ================
export const getToolByName = (toolName) => {
  return EDITOR_TOOLS[toolName] || null;
};

export const getToolsByCategory = (category) => {
  return Object.values(EDITOR_TOOLS).filter(tool => tool.category === category);
};

export const getAllTools = () => {
  return Object.values(EDITOR_TOOLS);
};

export const isToolAvailable = (toolName, productType) => {
  const tool = EDITOR_TOOLS[toolName];
  if (!tool) return false;

  // Algunas herramientas pueden no estar disponibles para ciertos productos
  const restrictions = {
    small: ['effects'], // Productos pequeños no soportan efectos complejos
    cylindrical: ['effects'] // Productos cilíndricos tienen limitaciones de efectos
  };

  return !restrictions[productType]?.includes(toolName);
};

// ================ FUNCIONES DE MANIPULACIÓN ================
export const duplicateObject = (canvas) => {
  if (!canvas) return null;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return null;

  try {
    activeObject.clone((cloned) => {
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20
      });

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });

    return true;
  } catch (error) {
    console.error('Error duplicating object:', error);
    return false;
  }
};

export const deleteSelectedObjects = (canvas) => {
  if (!canvas) return false;

  try {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return false;

    activeObjects.forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    return true;
  } catch (error) {
    console.error('Error deleting objects:', error);
    return false;
  }
};

export const bringToFront = (canvas) => {
  if (!canvas) return false;

  try {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return false;

    canvas.bringToFront(activeObject);
    canvas.requestRenderAll();

    return true;
  } catch (error) {
    console.error('Error bringing to front:', error);
    return false;
  }
};

export const sendToBack = (canvas) => {
  if (!canvas) return false;

  try {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return false;

    canvas.sendToBack(activeObject);
    canvas.requestRenderAll();

    return true;
  } catch (error) {
    console.error('Error sending to back:', error);
    return false;
  }
};
