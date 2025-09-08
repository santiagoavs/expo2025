# 🎨 Integración Híbrida Konva + Fabric.js

## 📋 Resumen

Esta implementación híbrida combina **Konva.js** para formas vectoriales avanzadas con **Fabric.js** para funcionalidades existentes, creando un editor de diseños potente y flexible.

## 🏗️ Arquitectura

### Componentes Principales

1. **KonvaShapesModal.jsx** - Modal para crear formas vectoriales personalizadas
2. **KonvaFabricConverter.js** - Conversor híbrido entre Konva y Fabric
3. **useEditorStores.jsx** - Store actualizado con soporte vectorial
4. **AdvancedToolsPanel.jsx** - Panel con integración de formas vectoriales
5. **EnhancedFabricEditor.jsx** - Editor principal con indicadores visuales

### Flujo de Trabajo

```
Usuario → Modal Konva → Genera Path SVG → Convierte a Fabric.Path → Canvas
```

## 🎯 Formas Vectoriales Disponibles

| Forma | Parámetros | Uso Recomendado |
|-------|------------|-----------------|
| ⭐ **Estrella** | Puntas (3-20), Radio interno/externo | Logos, decoraciones |
| 💖 **Corazón** | Tamaño, Curvatura matemática | San Valentín, amor |
| ➡️ **Flecha** | Longitud, Grosor, Tamaño punta | Direcciones, CTAs |
| 💭 **Burbuja** | Ancho, Alto, Posición cola | Diálogos, globos |
| ⚡ **Rayo** | Altura, Zigzag, Ancho | Energía, poder |
| 🔷 **Polígono** | Lados (3-20), Radio | Formas geométricas |

## 🔧 Uso del Sistema

### 1. Crear Forma Vectorial

```javascript
// Abrir modal de formas vectoriales
const { openKonvaShapesModal } = useVectorShapesState();
openKonvaShapesModal();
```

### 2. Agregar al Canvas

```javascript
// La forma se agrega automáticamente usando el store
const { addVectorShape } = useVectorShapesState();
addVectorShape(fabricPathObject);
```

### 3. Conversión con Backend

```javascript
// Obtener datos para backend
const { getCanvasDataForBackend } = useBackendIntegration();
const elements = getCanvasDataForBackend(areaId);

// Cargar desde backend
const { loadElementsFromBackend } = useBackendIntegration();
await loadElementsFromBackend(elements);
```

## 📊 Estructura de Datos

### Formato Backend (MongoDB)

```javascript
{
  type: 'shape',
  areaId: 'area_id_here',
  konvaAttrs: {
    // Posición y transformaciones estándar
    x: 100, y: 150, width: 200, height: 180,
    rotation: 0, scaleX: 1, scaleY: 1, opacity: 1,
    
    // Propiedades visuales
    fill: '#1F64BF', stroke: '#032CA6', strokeWidth: 2,
    
    // Datos vectoriales específicos
    shapeType: 'star',
    pathData: 'M 0,15 C 0,5...',
    vectorParams: {
      points: 5,
      innerRadius: 0.5,
      outerRadius: 100
    },
    isVectorShape: true,
    konvaOrigin: true
  }
}
```

## 🎨 Características Destacadas

### ✅ Ventajas de la Implementación

- **No Invasiva**: Mantiene 100% de funcionalidad existente
- **Híbrida Inteligente**: Konva para vectores, Fabric para texto/imágenes
- **Backend Compatible**: Funciona con estructura MongoDB actual
- **Edición Avanzada**: Parámetros en tiempo real como Figma
- **Escalable**: Fácil agregar nuevas formas vectoriales
- **Performance**: Optimizado para cientos de objetos
- **Responsive**: Funciona en desktop y móvil

### 🔄 Indicadores Visuales

- **Contador de Vectores**: Muestra cantidad de formas vectoriales en navbar
- **Modo Edición**: Indica cuando se está editando una forma vectorial
- **Chips de Formas**: Lista de formas disponibles en panel de herramientas

## 🛠️ API del Store

### Hooks Disponibles

```javascript
// Formas vectoriales
const {
  vectorShapes,
  vectorEditMode,
  konvaShapesModalOpen,
  openKonvaShapesModal,
  closeKonvaShapesModal,
  addVectorShape,
  updateVectorShapesList,
  selectVectorShape,
  exitVectorEditMode,
  migrateToVector
} = useVectorShapesState();

// Integración con backend
const {
  getCanvasDataForBackend,
  loadElementsFromBackend
} = useBackendIntegration();
```

### Funciones Principales

```javascript
// Abrir modal de formas
openKonvaShapesModal();

// Agregar forma vectorial
addVectorShape(fabricPathObject);

// Migrar forma básica a vectorial
migrateToVector(fabricObject, 'star', { points: 5 });

// Obtener datos para backend
const elements = getCanvasDataForBackend(areaId);

// Cargar desde backend
await loadElementsFromBackend(elements);
```

## 🔧 Configuración

### Dependencias Requeridas

```json
{
  "react-konva": "^19.0.7",
  "fabric": "^5.3.0",
  "@phosphor-icons/react": "^2.1.10"
}
```

### Importaciones

```javascript
import KonvaShapesModal from './components/KonvaShapesModal';
import KonvaFabricConverter from './utils/KonvaFabricConverter';
import { useVectorShapesState, useBackendIntegration } from './stores/useEditorStores';
```

## 🚀 Próximas Mejoras

- [ ] Editor de puntos para formas vectoriales
- [ ] Herramienta de pluma para crear formas desde cero
- [ ] Animaciones de formas vectoriales
- [ ] Exportación a SVG optimizada
- [ ] Biblioteca de formas predefinidas
- [ ] Colaboración en tiempo real para vectores

## 🐛 Solución de Problemas

### Error: "Canvas no inicializado"
- Verificar que el canvas esté completamente cargado antes de usar formas vectoriales
- Usar `isCanvasInitialized` del store para verificar estado

### Error: "Path SVG inválido"
- Verificar que los parámetros de la forma estén dentro de los rangos permitidos
- Usar `KonvaFabricConverter.validatePath()` para validar paths

### Error: "Forma no se agrega al canvas"
- Verificar que `addVectorShape` esté siendo llamado correctamente
- Revisar que el objeto Fabric.js tenga la estructura correcta

## 📝 Notas de Desarrollo

- Las formas vectoriales se almacenan como `fabric.Path` con metadatos especiales
- El conversor maneja automáticamente la compatibilidad con el backend
- El sistema es completamente híbrido: no interfiere con funcionalidades existentes
- Todas las formas vectoriales son editables y escalables como objetos Fabric normales

---

**Desarrollado con ❤️ para Diambars Sublim**
