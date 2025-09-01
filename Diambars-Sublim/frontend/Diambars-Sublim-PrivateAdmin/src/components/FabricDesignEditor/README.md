# 🎨 Editor de Diseño Diambars Sublim - Sistema Simplificado

## 📋 Descripción

Este es el nuevo editor de diseño simplificado que reemplaza el sistema complejo anterior. Está diseñado específicamente para productos de sublimación y utiliza **Fabric.js v5.3.0** con una arquitectura modular y fácil de mantener.

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Archivos

```
FabricDesignEditor/
├── config/                 # Configuraciones del sistema
│   ├── products.js        # Plantillas de productos
│   ├── tools.js           # Herramientas adaptativas
│   ├── colors.js          # Sistema de colores
│   └── editor.js          # Configuración del editor
├── hooks/                  # Hooks personalizados
│   ├── useFabricCanvas.js # Hook principal del canvas
│   └── useProductDetection.js # Detección de productos
├── editorTools.js          # Herramientas del editor
├── FabricDesignEditorSimple.jsx # Editor principal simplificado
└── index.js               # Archivo de exportaciones
```

## 🚀 Características Principales

### ✨ **Detección Automática de Productos**
- **Productos Planos**: Camisetas, gorras, llaveros, gafetes
- **Productos Cilíndricos**: Tazas, termos, vasos, botellas
- **Productos Pequeños**: Stickers, etiquetas, insignias

### 🎯 **Herramientas Adaptativas**
- **Texto**: Tamaño automático según el producto
- **Imágenes**: Escalado inteligente según restricciones
- **Formas**: Dimensiones adaptativas por producto
- **Efectos**: Disponibilidad según tipo de producto

### 🎨 **Sistema de Colores Inteligente**
- Paletas organizadas por categorías
- Colores específicos para sublimación
- Gradientes predefinidos
- Generación automática de colores

## 🔧 Cómo Usar

### 1. **Importar el Editor**

```jsx
import { FabricDesignEditorSimple } from '../FabricDesignEditor';

// O importar componentes específicos
import { useFabricCanvas, useProductDetection } from '../FabricDesignEditor';
```

### 2. **Usar en un Componente**

```jsx
const MyComponent = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [product, setProduct] = useState(null);

  const handleSaveDesign = (canvasData) => {
    console.log('Diseño guardado:', canvasData);
    // canvasData contiene:
    // - canvas: datos del canvas Fabric.js
    // - productType: tipo de producto detectado
    // - productConfig: configuración del producto
    // - timestamp: momento de guardado
  };

  return (
    <FabricDesignEditorSimple
      isOpen={showEditor}
      product={product}
      onSave={handleSaveDesign}
      onClose={() => setShowEditor(false)}
    />
  );
};
```

### 3. **Usar los Hooks Directamente**

```jsx
const MyCustomEditor = () => {
  const {
    canvas,
    canvasInitialized,
    addText,
    addImage,
    addShape
  } = useFabricCanvas({ isOpen: true, product });

  const {
    productType,
    productConfig,
    detectionStatus,
    getDesignSuggestions
  } = useProductDetection(product);

  // Usar las funciones del editor
  const handleAddText = () => {
    addText('Mi texto personalizado');
  };

  return (
    <div>
      <button onClick={handleAddText}>Agregar Texto</button>
      <div>Producto: {productType}</div>
      <div>Estado: {detectionStatus}</div>
    </div>
  );
};
```

## 📊 Configuración de Productos

### **Producto Plano (Camisetas, Gorras)**
```javascript
flat: {
  name: 'Producto Plano',
  canvas: { width: 800, height: 600 },
  safeZone: { x: 50, y: 50, width: 700, height: 500 },
  constraints: { maxElements: 50 }
}
```

### **Producto Cilíndrico (Tazas, Termos)**
```javascript
cylindrical: {
  name: 'Producto Cilíndrico',
  canvas: { width: 600, height: 400 },
  safeZone: { x: 30, y: 30, width: 540, height: 340 },
  constraints: { maxElements: 30 },
  wrap: true // Para envolver alrededor del cilindro
}
```

### **Producto Pequeño (Stickers, Gafetes)**
```javascript
small: {
  name: 'Producto Pequeño',
  canvas: { width: 300, height: 300 },
  safeZone: { x: 20, y: 20, width: 260, height: 260 },
  constraints: { maxElements: 20 }
}
```

## 🛠️ Herramientas Disponibles

### **Herramientas de Contenido**
- **Texto**: Agregar y editar texto
- **Imagen**: Cargar y manipular imágenes
- **Formas**: Rectángulos, círculos, triángulos, líneas, polígonos

### **Herramientas de Manipulación**
- **Seleccionar**: Mover y editar elementos
- **Duplicar**: Copiar elementos seleccionados
- **Eliminar**: Borrar elementos
- **Capas**: Traer al frente/enviar atrás

### **Herramientas de Efectos**
- **Sombras**: Aplicar sombras a elementos
- **Brillo**: Efectos de resplandor
- **Desenfoque**: Efectos de desenfoque

## 🎨 Sistema de Colores

### **Categorías de Colores**
```javascript
// Colores básicos
basic: ['#000000', '#ffffff', '#808080', '#c0c0c0']

// Colores primarios
primary: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']

// Colores de sublimación (vibrantes)
sublimation: ['#ff1493', '#00ff7f', '#00bfff', '#ff8c00', '#8a2be2']
```

### **Funciones de Utilidad**
```javascript
import { getRandomColor, getContrastColor } from '../FabricDesignEditor';

const randomColor = getRandomColor('primary');
const contrastColor = getContrastColor('#000000'); // Retorna '#ffffff'
```

## 🔍 Detección Automática de Productos

El sistema detecta automáticamente el tipo de producto basándose en:

1. **Nombre del producto**: "taza", "camiseta", "llavero"
2. **URL de imagen**: Análisis de la imagen del producto
3. **Configuración manual**: Selección manual del tipo

### **Ejemplo de Detección**
```javascript
// El sistema detecta automáticamente:
"Taza de café personalizada" → cylindrical
"Camiseta deportiva" → flat
"Llavero pequeño" → small
```

## 📱 Responsive y Adaptativo

- **Canvas adaptativo**: Se ajusta al tipo de producto
- **Herramientas inteligentes**: Se adaptan a las restricciones del producto
- **Zonas seguras**: Visualización de áreas de personalización
- **Zoom inteligente**: Límites según el tipo de producto

## 🚀 Ventajas del Nuevo Sistema

### ✅ **Simplicidad**
- 4 archivos de configuración vs 11 archivos complejos
- Código más legible y mantenible
- Menos dependencias externas

### ✅ **Inteligencia**
- Detección automática de productos
- Herramientas que se adaptan al contexto
- Validaciones automáticas

### ✅ **Flexibilidad**
- Fácil de extender y modificar
- Configuración por producto
- Hooks reutilizables

### ✅ **Rendimiento**
- Optimizado para Fabric.js v5.3.0
- Lazy loading de recursos
- Manejo eficiente de memoria

## 🔧 Personalización

### **Agregar Nuevos Tipos de Producto**
```javascript
// En config/products.js
export const PRODUCT_TEMPLATES = {
  // ... productos existentes ...
  
  custom: {
    name: 'Mi Producto Personalizado',
    canvas: { width: 1000, height: 800 },
    safeZone: { x: 100, y: 100, width: 800, height: 600 },
    constraints: { maxElements: 100 }
  }
};
```

### **Agregar Nuevas Herramientas**
```javascript
// En editorTools.js
export const EDITOR_TOOLS = {
  // ... herramientas existentes ...
  
  customTool: {
    name: 'Mi Herramienta',
    icon: 'custom',
    execute: (canvas, productType, options) => {
      // Lógica de la herramienta
    }
  }
};
```

## 🐛 Solución de Problemas

### **Error: "Canvas no se inicializa"**
- Verificar que `isOpen` sea `true`
- Verificar que `product` tenga datos válidos
- Revisar la consola para errores específicos

### **Error: "Producto no detectado"**
- Verificar que `product.name` o `product.imageUrl` existan
- Agregar más palabras clave en `detectProductType()`

### **Error: "Herramienta no disponible"**
- Verificar restricciones en `isToolAvailable()`
- Agregar la herramienta a la lista de disponibles

## 📚 Recursos Adicionales

- **Fabric.js Documentation**: https://fabricjs.com/
- **Material-UI v7**: https://mui.com/
- **Phosphor Icons**: https://phosphoricons.com/

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear una rama para tu feature
2. Implementar los cambios
3. Agregar tests si es necesario
4. Crear un pull request

## 📄 Licencia

Este proyecto es parte de Diambars Sublim y está bajo licencia privada.

---

**¿Necesitas ayuda?** Revisa la consola del navegador para logs detallados o contacta al equipo de desarrollo.


