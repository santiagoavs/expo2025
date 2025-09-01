// src/utils/CoordinateTransformer.js - Utilidad para mapear entre Konva y Fabric

export const CoordinateTransformer = {
  // Convierte un área de Konva (con base en producto) a límites en Fabric
  // Espera un objeto de área tipo { id, x, y, width, height, rotation?, scaleX?, scaleY?, stroke?, fill?, name? }
  konvaAreaToFabric(konvaArea) {
    if (!konvaArea) return null;

    const left = Number(konvaArea.x || 0);
    const top = Number(konvaArea.y || 0);
    const width = Number(konvaArea.width || 0);
    const height = Number(konvaArea.height || 0);
    const rotation = Number(konvaArea.rotation || 0);

    return {
      id: konvaArea.id || konvaArea._id || String(Date.now()),
      boundaries: {
        left,
        top,
        width,
        height,
        rotation
      },
      visualConfig: {
        fill: 'rgba(31, 100, 191, 0.06)',
        stroke: '#1F64BF',
        strokeWidth: 1,
        rx: 8,
        ry: 8,
        strokeDashArray: [6, 6]
      }
    };
  },

  // Convierte un objeto Fabric a formato compatible con BD (similar a esquema actual de elementos)
  // fabricObject: instancia de fabric.Object (IText, Image, Rect, Path, etc.)
  fabricElementToKonva(fabricObject) {
    if (!fabricObject) return null;

    const base = {
      type: this._mapFabricTypeToGeneric(fabricObject.type),
      areaId: fabricObject?.data?.areaId || null,
      konvaAttrs: {
        x: Math.round(fabricObject.left || 0),
        y: Math.round(fabricObject.top || 0),
        width: Math.round(fabricObject.width || fabricObject.getScaledWidth?.() || 0),
        height: Math.round(fabricObject.height || fabricObject.getScaledHeight?.() || 0),
        rotation: Math.round(fabricObject.angle || 0),
        scaleX: fabricObject.scaleX || 1,
        scaleY: fabricObject.scaleY || 1,
        opacity: fabricObject.opacity ?? 1,
        visible: fabricObject.visible ?? true,
        draggable: true,
        name: fabricObject.name || undefined,
      },
      metadata: {
        tags: fabricObject?.data?.tags || [],
      },
      zIndex: typeof fabricObject.zIndex === 'number' ? fabricObject.zIndex : undefined,
    };

    if (fabricObject.type === 'i-text' || fabricObject.type === 'textbox' || fabricObject.type === 'text') {
      return {
        ...base,
        type: 'text',
        konvaAttrs: {
          ...base.konvaAttrs,
          text: fabricObject.text || '',
          fontFamily: fabricObject.fontFamily || 'Arial',
          fontSize: fabricObject.fontSize || 24,
          fill: fabricObject.fill || '#000000',
          fontWeight: fabricObject.fontWeight || 'normal',
          fontStyle: fabricObject.fontStyle || 'normal',
          textAlign: fabricObject.textAlign || 'left',
          underline: !!fabricObject.underline,
          linethrough: !!fabricObject.linethrough,
          overline: !!fabricObject.overline,
        }
      };
    }

    if (fabricObject.type === 'image') {
      return {
        ...base,
        type: 'image',
        konvaAttrs: {
          ...base.konvaAttrs,
          imageUrl: fabricObject.getSrc?.() || fabricObject?.data?.originalSrc || '',
          opacity: fabricObject.opacity ?? 1,
        }
      };
    }

    // fallback para formas
    return base;
  },

  // Convierte un elemento almacenado (formato BD/konvaAttrs) a objeto Fabric correspondiente
  konvaElementToFabric(element) {
    if (!element || !element.konvaAttrs) return null;

    const attrs = element.konvaAttrs;
    const common = {
      left: attrs.x || 0,
      top: attrs.y || 0,
      angle: attrs.rotation || 0,
      opacity: attrs.opacity ?? 1,
      selectable: true,
      hasControls: true,
      transparentCorners: true,
      cornerColor: '#1F64BF',
      cornerStyle: 'circle',
      data: { areaId: element.areaId, type: element.type }
    };

    if (element.type === 'text') {
      // No instanciamos aquí fabric.IText directamente para evitar dependencias globales; el editor lo hará
      return {
        __fabricType: 'i-text',
        options: {
          ...common,
          text: attrs.text || '',
          fontFamily: attrs.fontFamily || 'Arial',
          fontSize: attrs.fontSize || 24,
          fill: attrs.fill || '#000000',
          fontWeight: attrs.fontWeight || 'normal',
          fontStyle: attrs.fontStyle || 'normal',
          textAlign: attrs.textAlign || 'left',
          underline: !!attrs.underline,
          linethrough: !!attrs.linethrough,
          overline: !!attrs.overline,
        }
      };
    }

    if (element.type === 'image') {
      return {
        __fabricType: 'image',
        options: {
          ...common,
          src: attrs.imageUrl || attrs.src || ''
        }
      };
    }

    // fallback
    return { __fabricType: 'rect', options: { ...common, width: attrs.width || 100, height: attrs.height || 100, fill: '#e5eefb' } };
  },

  // Validar que un objeto (x,y,width,height) quede dentro de un área (left,top,width,height)
  validateElementBounds(elementRect, areaRect) {
    if (!elementRect || !areaRect) return false;
    const withinX = elementRect.left >= areaRect.left && (elementRect.left + elementRect.width) <= (areaRect.left + areaRect.width);
    const withinY = elementRect.top >= areaRect.top && (elementRect.top + elementRect.height) <= (areaRect.top + areaRect.height);
    return withinX && withinY;
  },

  // Sincroniza posiciones entre sistemas, devolviendo un objeto normalizado
  syncCoordinates(source, target) {
    // Normaliza coordenadas y tamaños (simple merge con prioridad del source)
    return {
      left: Math.round(source.left ?? target.left ?? 0),
      top: Math.round(source.top ?? target.top ?? 0),
      width: Math.round(source.width ?? target.width ?? 0),
      height: Math.round(source.height ?? target.height ?? 0),
      angle: Math.round(source.angle ?? target.angle ?? 0),
      scaleX: source.scaleX ?? target.scaleX ?? 1,
      scaleY: source.scaleY ?? target.scaleY ?? 1,
    };
  },

  _mapFabricTypeToGeneric(fabricType) {
    if (!fabricType) return 'group';
    if (fabricType === 'i-text' || fabricType === 'textbox' || fabricType === 'text') return 'text';
    if (fabricType === 'image') return 'image';
    if (fabricType === 'rect' || fabricType === 'circle' || fabricType === 'triangle' || fabricType === 'path') return 'shape';
    return 'group';
  }
};

export default CoordinateTransformer;



