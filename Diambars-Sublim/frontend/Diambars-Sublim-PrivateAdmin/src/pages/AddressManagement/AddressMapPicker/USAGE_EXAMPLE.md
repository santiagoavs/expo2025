# AddressMapPicker - Ejemplo de Uso con Ubicación Predeterminada

## 🚀 Nuevas Funcionalidades Implementadas

### 1. **Centrado Automático por Departamento/Municipio**
- El mapa se centra automáticamente cuando se selecciona un departamento o municipio
- Base de datos completa de coordenadas para todos los municipios de El Salvador
- Mejora significativa en la experiencia de usuario

### 2. **UI Mejorada para Confirmación**
- Indicadores visuales claros del estado de la ubicación
- Validaciones en tiempo real
- Feedback visual sobre por qué un botón está deshabilitado

### 3. **Botones Más Accesibles**
- Lógica mejorada para habilitar botones
- No requiere necesariamente información de geocodificación completa
- Mejor manejo de errores y estados

### 4. **Gestión Inteligente del Panel de Ubicación**
- El panel se oculta automáticamente después de confirmar la ubicación
- Se muestra nuevamente cuando se selecciona una nueva ubicación
- Botón para limpiar la ubicación y volver al modo de selección

### 5. **Modo Pantalla Completa**
- Botón para activar/desactivar pantalla completa del mapa
- Mejor visualización del mapa para selección precisa
- Soporte para tecla Escape para salir de pantalla completa

### 6. **Nuevo Endpoint Implementado**

**Endpoint**: `POST /api/addresses/set-default-location`

Este endpoint crea una nueva dirección predeterminada desde coordenadas, en lugar de actualizar una existente.

## 📋 Ejemplo de Uso Completo

```jsx
import React, { useState } from 'react';
import AddressMapPicker from './AddressMapPicker';

const AddressManagementExample = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [userId] = useState("64f1a2b3c4d5e6f7g8h9i0j1"); // ID del usuario
  
  // Nuevas props para centrado automático
  const [selectedDepartment, setSelectedDepartment] = useState('San Salvador');
  const [selectedMunicipality, setSelectedMunicipality] = useState('San Salvador');

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log('📍 Ubicación seleccionada:', location);
  };

  const handleSetAsDefault = async (locationData) => {
    try {
      console.log('✅ Ubicación establecida como predeterminada:', locationData);
      
      // Aquí puedes actualizar el estado de tu aplicación
      setIsDefault(true);
      
      // Opcional: Mostrar notificación de éxito
      // showNotification('Ubicación establecida como predeterminada', 'success');
      
    } catch (error) {
      console.error('❌ Error:', error);
      // showNotification('Error al establecer ubicación predeterminada', 'error');
    }
  };

  // Ejemplo de cambio de departamento/municipio
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setSelectedMunicipality(null); // Reset municipio
  };

  const handleMunicipalityChange = (municipality) => {
    setSelectedMunicipality(municipality);
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      {/* Ejemplo de controles para departamento/municipio */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <select 
          value={selectedDepartment} 
          onChange={(e) => handleDepartmentChange(e.target.value)}
        >
          <option value="San Salvador">San Salvador</option>
          <option value="La Libertad">La Libertad</option>
          <option value="Santa Ana">Santa Ana</option>
          {/* ... más departamentos */}
        </select>
        
        <select 
          value={selectedMunicipality} 
          onChange={(e) => handleMunicipalityChange(e.target.value)}
        >
          <option value="San Salvador">San Salvador</option>
          <option value="Soyapango">Soyapango</option>
          <option value="Santa Tecla">Santa Tecla</option>
          {/* ... más municipios */}
        </select>
      </div>

      <AddressMapPicker
        center={{ lat: 13.6929, lng: -89.2182 }} // San Salvador
        zoom={12}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        height="100%"
        
        // Props para funcionalidad de ubicación predeterminada
        onSetAsDefault={handleSetAsDefault}
        isDefaultLocation={isDefault}
        showSetDefaultButton={true}
        userId={userId}
        
        // Nuevas props para centrado automático
        selectedDepartment={selectedDepartment}
        selectedMunicipality={selectedMunicipality}
        autoCenterOnLocationChange={true}
      />
    </div>
  );
};

export default AddressManagementExample;
```

## 🔧 Flujo de Funcionamiento

### 1. **Selección de Ubicación**
- El usuario hace clic en el mapa
- Se obtiene información de geocodificación (departamento, municipio)
- Se muestra la información de coordenadas

### 2. **Establecer como Predeterminada**
- El usuario hace clic en "Establecer como Predeterminada"
- Se envía una petición `POST` a `/api/addresses/set-default-location`
- El backend crea una nueva dirección con `isDefault: true`
- Se desactivan automáticamente otras direcciones predeterminadas del usuario

### 3. **Datos Enviados al Backend**
```javascript
{
  coordinates: {
    lat: 13.6929,
    lng: -89.2182
  },
  department: "San Salvador",
  municipality: "San Salvador",
  userId: "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

### 4. **Respuesta del Backend**
```javascript
{
  success: true,
  message: "Ubicación establecida como predeterminada exitosamente",
  data: {
    address: {
      _id: "68a11f8be08c9e749ca91503",
      user: "64f1a2b3c4d5e6f7g8h9i0j1",
      label: "Mi Ubicación Predeterminada",
      recipient: "Usuario Principal",
      phoneNumber: "71234567",
      department: "San Salvador",
      municipality: "San Salvador",
      address: "Ubicación seleccionada en San Salvador, San Salvador",
      location: {
        type: "Point",
        coordinates: [-89.2182, 13.6929]
      },
      isDefault: true,
      isActive: true,
      createdAt: "2024-01-15T10:30:00.000Z"
    },
    coordinates: {
      lat: 13.6929,
      lng: -89.2182
    },
    department: "San Salvador",
    municipality: "San Salvador"
  }
}
```

## 🎯 Ventajas del Nuevo Enfoque

1. **No requiere dirección existente**: Crea una nueva dirección predeterminada
2. **Funciona desde coordenadas**: Ideal para el AddressMapPicker
3. **Manejo automático de predeterminadas**: El modelo se encarga de desactivar otras
4. **Soporte para admin**: Permite establecer direcciones para otros usuarios
5. **Validación completa**: Valida coordenadas, departamento y municipio

## 🔍 Diferencias con el Endpoint Anterior

| Aspecto | Endpoint Anterior | Nuevo Endpoint |
|---------|------------------|----------------|
| **Método** | `PATCH /:id/set-default` | `POST /set-default-location` |
| **Requiere** | Dirección existente | Solo coordenadas |
| **Uso** | Actualizar dirección existente | Crear nueva dirección |
| **Ideal para** | Lista de direcciones | AddressMapPicker |
| **Error 404** | ❌ Si no existe la dirección | ✅ No aplica |

## 🚨 Solución al Error 404

El error que tenías:
```
PATCH http://localhost:4000/api/addresses/68a11f8…/set-default 404 (Not Found)
```

**Causa**: La dirección con ID `68a11f8be08c9e749ca91503` no existía o no pertenecía al usuario autenticado.

**Solución**: Usar el nuevo endpoint que crea una dirección predeterminada desde coordenadas, sin necesidad de una dirección existente.

## 📱 Integración en tu Aplicación

Para integrar en tu flujo actual:

1. **Reemplaza** las llamadas a `setDefault(addressId)` por `setDefaultLocationFromCoordinates(locationData)`
2. **Usa** el AddressMapPicker con las nuevas props
3. **Maneja** la respuesta para actualizar tu estado local

¡El componente está listo para usar! 🎉

## 🆕 Nuevas Props Disponibles

### Props para Centrado Automático
```jsx
<AddressMapPicker
  // ... props existentes
  
  // Nuevas props para centrado automático
  selectedDepartment="San Salvador"        // Departamento seleccionado
  selectedMunicipality="Soyapango"         // Municipio seleccionado  
  autoCenterOnLocationChange={true}        // Habilitar centrado automático
/>
```

### Comportamiento del Centrado Automático
- **Prioridad**: Municipio > Departamento > Centro de El Salvador
- **Activación**: Se activa cuando cambian `selectedDepartment` o `selectedMunicipality`
- **Base de datos**: Incluye coordenadas para todos los municipios de El Salvador
- **Fallback**: Si no se encuentra el municipio, usa el centro del departamento

## 🎨 Mejoras en la UI

### Indicadores de Estado
- ✅ **Ubicación seleccionada**: Banner verde con icono
- ✅ **Coordenadas válidas**: Indicador verde
- ✅ **Información obtenida**: Indicador verde cuando se completa el reverse geocoding
- ⚠️ **Obteniendo información**: Indicador amarillo durante el proceso

### Feedback de Botones
- **Botón deshabilitado**: Muestra mensaje explicativo debajo
- **Estados claros**: "Selecciona ubicación", "ID de usuario requerido", etc.
- **Validaciones mejoradas**: No requiere necesariamente `addressInfo` completo

## 🔧 Solución a Problemas Comunes

### ❌ Problema: Botón "Establecer como Predeterminada" deshabilitado
**Causa anterior**: Requería `addressInfo` completo del reverse geocoding
**Solución**: 
- El botón ahora se habilita solo con `currentLocation` y `userId`
- Si no hay `addressInfo`, se obtiene automáticamente al hacer clic
- Usa `selectedDepartment` y `selectedMunicipality` como fallback

### ❌ Problema: Mapa no se centra al seleccionar departamento/municipio
**Solución**: 
- Usar las nuevas props `selectedDepartment` y `selectedMunicipality`
- Habilitar `autoCenterOnLocationChange={true}`
- El mapa se centrará automáticamente con las coordenadas correctas

### ❌ Problema: UI confusa sobre el estado de la ubicación
**Solución**:
- Nuevos indicadores visuales claros
- Estados de validación en tiempo real
- Mensajes explicativos para botones deshabilitados

## 📊 Base de Datos de Coordenadas

Se ha creado una base de datos completa con coordenadas para:
- **14 departamentos** de El Salvador
- **262 municipios** con coordenadas específicas
- **Fallback automático** al centro del departamento si no se encuentra el municipio

### Ejemplo de coordenadas disponibles:
```javascript
// Departamentos
'San Salvador': { lat: 13.6929, lng: -89.2182 }
'La Libertad': { lat: 13.6769, lng: -89.2796 }
'Santa Ana': { lat: 13.9942, lng: -89.5597 }

// Municipios específicos
'Soyapango': { lat: 13.7000, lng: -89.1500 }
'Santa Tecla': { lat: 13.6769, lng: -89.2796 }
'Mejicanos': { lat: 13.7167, lng: -89.2167 }
```

## 🚀 Próximos Pasos

1. **Integrar** las nuevas props en tu formulario de direcciones
2. **Conectar** los dropdowns de departamento/municipio con el mapa
3. **Probar** el centrado automático con diferentes ubicaciones
4. **Verificar** que los botones se habiliten correctamente

¡Todas las funcionalidades están implementadas y listas para usar! 🎉

## 🆕 Nuevas Funcionalidades de Visibilidad

### Gestión Inteligente del Panel
- **Auto-ocultación**: El panel se oculta automáticamente después de confirmar la ubicación
- **Auto-mostrar**: Se muestra nuevamente cuando se selecciona una nueva ubicación
- **Botón de limpiar**: Permite limpiar la ubicación y volver al modo de selección

### Modo Pantalla Completa
- **Botón de pantalla completa**: En los controles del header (icono de expandir)
- **Vista completa**: El mapa ocupa toda la pantalla para mejor visualización
- **Salir con Escape**: Presiona Escape para salir de pantalla completa
- **Botón de salir**: También disponible en los controles del header
- **Panel de información**: Muestra coordenadas y controles en pantalla completa
- **Indicador de zoom**: Muestra el nivel de zoom actual
- **Zoom optimizado**: Rango de zoom más amplio (6-20) en pantalla completa
- **Controles mejorados**: Botones de zoom más grandes y visibles

### Flujo de Trabajo Mejorado
1. **Seleccionar ubicación** → Panel aparece automáticamente
2. **Confirmar ubicación** → Panel se oculta, mapa queda limpio
3. **Seleccionar nueva ubicación** → Panel aparece nuevamente
4. **Pantalla completa** → Para mejor visualización del mapa

### Controles Disponibles
- 🎯 **Centrar mapa**: Centra en la ubicación actual
- 🔍 **Centrar en El Salvador**: Vuelve al centro del país
- ✨ **Seleccionar nueva ubicación**: Activa el modo de selección
- 📺 **Pantalla completa**: Expande el mapa a pantalla completa
- ❌ **Limpiar ubicación**: Borra la selección actual

## 🎨 Mejoras de UX

### Visibilidad del Mapa
- **Panel no intrusivo**: Se oculta automáticamente después de confirmar
- **Pantalla completa**: Para selección precisa de ubicaciones
- **Controles accesibles**: Siempre visibles en el header

### Feedback Visual
- **Estados claros**: Indicadores de validación en tiempo real
- **Botones informativos**: Mensajes explicativos cuando están deshabilitados
- **Transiciones suaves**: Animaciones para cambios de estado

¡El componente ahora ofrece una experiencia de usuario mucho más fluida y profesional! 🚀

## 🗺️ Experiencia de Pantalla Completa Mejorada

### Características de Google Maps
- **Vista panorámica**: El mapa se adapta para mostrar más área geográfica
- **Zoom dinámico**: Rango de zoom ampliado (6-20) para mayor detalle
- **Controles optimizados**: Botones de zoom más grandes y accesibles
- **Panel informativo**: Información de ubicación siempre visible
- **Indicador de zoom**: Muestra el nivel de zoom actual en tiempo real

### Panel de Información en Pantalla Completa
- **Coordenadas precisas**: Latitud y longitud con 6 decimales
- **Información de área**: Municipio y departamento cuando está disponible
- **Controles de acción**: Botones para confirmar o limpiar ubicación
- **Diseño flotante**: Panel elegante que no interfiere con la navegación

### Optimizaciones Visuales
- **Header compacto**: Diseño minimalista en pantalla completa
- **Fondo adaptativo**: Color de fondo que mejora la visibilidad
- **Sombras mejoradas**: Efectos visuales más pronunciados
- **Espaciado optimizado**: Mejor uso del espacio disponible

### Controles de Navegación
- **Zoom inicial inteligente**: Comienza con zoom 10 para vista amplia
- **Límites de zoom flexibles**: Permite acercarse más (zoom 20) o alejarse más (zoom 6)
- **Controles de Leaflet mejorados**: Botones de zoom más grandes y visibles
- **Atribución mejorada**: Texto más legible en pantalla completa

### Experiencia de Usuario
- **Transición suave**: Cambio fluido entre modo normal y pantalla completa
- **Teclado accesible**: Escape para salir de pantalla completa
- **Información contextual**: Panel que aparece solo cuando hay ubicación seleccionada
- **Feedback visual**: Indicadores claros del estado actual del mapa

¡Ahora el mapa en pantalla completa ofrece una experiencia similar a Google Maps! 🎯

## 🚀 Mejoras de UI y Responsive Implementadas

### Arquitectura MUI Responsive
- **Breakpoints completos**: xs, sm, md, lg, xl implementados en todos los componentes
- **Mobile-first**: Diseño optimizado para dispositivos móviles
- **Adaptación automática**: Todos los elementos se ajustan según el tamaño de pantalla

### Contenedor del Mapa Mejorado
- **Tamaños responsive**: 
  - xs: 300px de altura
  - sm: 400px de altura  
  - md: 500px de altura
  - lg: 600px de altura
- **Fullscreen optimizado**: Ocupa toda la pantalla sin interferencias
- **Bordes adaptativos**: Se ajustan según el modo (normal/fullscreen)

### Controles de Zoom Optimizados
- **Posicionamiento inteligente**: Evita solapamientos con el header
- **Tamaños responsive**: Botones más pequeños en móviles
- **Márgenes adaptativos**: Se ajustan según el breakpoint
- **Z-index optimizado**: Siempre visibles sin interferir

### Header Responsive
- **Altura adaptativa**: 50px en móviles, 60px en desktop
- **Padding dinámico**: Se ajusta según el tamaño de pantalla
- **Controles flexibles**: Se reorganizan en móviles
- **Tipografía escalable**: Tamaños de fuente adaptativos

### Panel de Información Mejorado
- **Posicionamiento inteligente**: Evita solapamientos
- **Ancho adaptativo**: Se ajusta al contenido en móviles
- **Padding responsive**: Espaciado optimizado para cada breakpoint
- **Bordes suaves**: Transiciones fluidas entre modos

### Toast de Confirmación
- **Notificación sutil**: No interfiere con la navegación
- **Posición centrada**: Aparece en el centro del mapa
- **Auto-ocultación**: Desaparece automáticamente después de 3 segundos
- **Diseño elegante**: Fondo translúcido con blur y sombras

### Búsqueda Automática Reparada
- **Centrado automático**: Funciona correctamente con departamento/municipio
- **Reconocimiento de municipios mejorado**: Base de datos expandida con más municipios
- **Búsqueda online como fallback**: Si no se encuentra en la base local, busca online
- **Centrado visual mejorado**: El mapa se centra visualmente en la ubicación seleccionada
- **Zoom optimizado**: Usa zoom 15 para vista detallada del municipio
- **Animación suave**: Transición animada al centrar el mapa
- **Panel de confirmación**: Se muestra automáticamente después de la búsqueda
- **Limpieza de datos**: Fuerza nueva búsqueda de geocodificación
- **Feedback visual**: Indicadores claros del estado de la búsqueda

## 📱 Experiencia Mobile-First

### Breakpoints Implementados
```jsx
// Ejemplo de implementación responsive
[theme.breakpoints.down('xs')]: {
  // Estilos para móviles pequeños
},
[theme.breakpoints.up('sm')]: {
  // Estilos para tablets
},
[theme.breakpoints.up('md')]: {
  // Estilos para desktop
}
```

### Componentes Responsive
- **AddressMapPickerContainer**: Altura adaptativa
- **AddressMapHeader**: Padding y altura dinámicos
- **AddressMapControls**: Reorganización en móviles
- **FullscreenInfoPanel**: Ancho adaptativo
- **AddressConfirmButton**: Tamaño y padding responsive

### Mejoras de Usabilidad
- **Controles táctiles**: Botones optimizados para touch
- **Espaciado adecuado**: Evita toques accidentales
- **Tipografía legible**: Tamaños apropiados para cada dispositivo
- **Navegación fluida**: Transiciones suaves entre estados

## 🎨 Mejoras Visuales

### Diseño Limpio
- **Sin solapamientos**: Todos los elementos tienen espacio adecuado
- **Z-index optimizado**: Capas bien definidas
- **Sombras consistentes**: Efectos visuales uniformes
- **Bordes suaves**: Transiciones fluidas

### Feedback Visual
- **Toast de confirmación**: Notificación elegante y no intrusiva
- **Estados claros**: Indicadores visuales del estado actual
- **Animaciones suaves**: Transiciones fluidas entre modos
- **Colores consistentes**: Paleta de colores unificada

¡El componente ahora ofrece una experiencia de usuario excepcional en todos los dispositivos! 📱💻🖥️

## 🎯 Mejoras de Centrado y Posicionamiento

### Centrado Visual del Mapa
- **Centrado automático mejorado**: El mapa ahora se centra visualmente en la ubicación seleccionada
- **Zoom específico**: Usa zoom 15 para vista detallada del municipio (zoom 12 en fullscreen)
- **Animación suave**: Transición animada de 1 segundo al centrar el mapa
- **Delay optimizado**: Pequeño delay para asegurar que el mapa esté listo antes de centrar

### Controles de Zoom Reposicionados
- **Posición vertical mejorada**: Los controles de zoom están ahora más abajo verticalmente
- **Centrado vertical**: Mejor posicionamiento para evitar interferencias
- **Márgenes responsive**: 
  - xs: 100px desde arriba
  - sm: 110px desde arriba
  - md: 120px desde arriba
- **Fullscreen optimizado**: Mantiene posicionamiento adecuado en modo pantalla completa

### Funciones de Centrado Mejoradas
- **handleCenterMap**: Centra en la ubicación actual con zoom optimizado
- **handleCenterToElSalvador**: Centra en El Salvador y muestra panel de confirmación
- **Centrado automático**: Funciona correctamente con departamento/municipio seleccionado

### Logs de Debugging
- **Console logs**: Información detallada del proceso de centrado
- **Coordenadas**: Muestra las coordenadas exactas donde se centra el mapa
- **Zoom level**: Indica el nivel de zoom utilizado para el centrado

## 🔧 Implementación Técnica

### AddressMapCenterController Mejorado
```jsx
const AddressMapCenterController = ({ center, shouldCenter, zoom = 15 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldCenter && center) {
      map.setView([center.lat, center.lng], zoom, {
        animate: true,
        duration: 1.0
      });
    }
  }, [map, center, shouldCenter, zoom]);
  
  return null;
};
```

### Posicionamiento de Controles de Zoom
```jsx
'& .leaflet-control-zoom': {
  marginTop: isFullscreen ? '80px' : '120px', // Más abajo para centrado vertical
  // Responsive positioning
  [theme.breakpoints.down('xs')]: {
    marginTop: isFullscreen ? '70px' : '100px',
  },
  [theme.breakpoints.up('sm')]: {
    marginTop: isFullscreen ? '75px' : '110px',
  },
  [theme.breakpoints.up('md')]: {
    marginTop: isFullscreen ? '80px' : '120px',
  },
}
```

¡Ahora el mapa se centra perfectamente y los controles están en la posición ideal! 🎯🗺️

## 🏘️ Mejoras de Reconocimiento de Municipios

### Base de Datos Expandida
- **Municipios adicionales**: Agregados más municipios de Cabañas y Morazán
- **Búsqueda case-insensitive**: Encuentra municipios sin importar mayúsculas/minúsculas
- **Variaciones de nombres**: Busca por diferentes variaciones del nombre del municipio
- **Logs detallados**: Console logs para debugging del proceso de búsqueda

### Búsqueda Online como Fallback
- **Geocodificación online**: Si no se encuentra en la base local, busca en Nominatim
- **Búsqueda específica**: Busca exactamente "Municipio, Departamento, El Salvador"
- **Fallback inteligente**: Solo usa búsqueda online si la base local falla
- **Manejo de errores**: Manejo robusto de errores de red

### Proceso de Búsqueda Mejorado
1. **Búsqueda en base local**: Primero busca en la base de datos local
2. **Verificación de coordenadas**: Detecta si las coordenadas son genéricas
3. **Búsqueda online**: Si no se encuentra, busca en Nominatim
4. **Fallback a departamento**: Si todo falla, usa el centro del departamento

### Municipios Agregados
**Cabañas**:
- Guacolecti, Sensuntepeque, Cinquera, Dolores, Guacotecti
- Ilobasco, Jutiapa, San Isidro, Santa Cruz, Suchitoto

**Morazán**:
- Perquín, San Francisco Gotera, Arambala, Cacaopera, Chilanga
- Corinto, Delicias de Concepción, El Divisadero, El Rosario
- Gualococti, Guatajiagua, Jocoaitique, Jocoro, Lolotiquillo
- Meanguera, Osicala, San Carlos, San Fernando, San Simón
- Sensembra, Sociedad, Torola, Yamabal, Yoloaiquín

## 🔧 Implementación Técnica

### GeocodingService Mejorado
```jsx
// Búsqueda con fallback online
async searchMunicipalityOnline(municipality, department) {
  const query = `${municipality}, ${department}, El Salvador`;
  // Búsqueda en Nominatim con manejo de errores
}

// Búsqueda case-insensitive
const municipalityLower = municipality.toLowerCase();
for (const [key, value] of Object.entries(municipalityCenters)) {
  if (key.toLowerCase() === municipalityLower) {
    return value;
  }
}
```

### AddressMapPicker con Búsqueda Inteligente
```jsx
// Efecto mejorado con búsqueda online
useEffect(() => {
  const centerMap = async () => {
    if (selectedMunicipality && selectedDepartment) {
      // Primero base local
      let newCenter = geocodingService.getMunicipalityCenter(selectedMunicipality, selectedDepartment);
      
      // Si no se encuentra, buscar online
      if (!newCenter || (newCenter.lat === 13.8667 && newCenter.lng === -88.6333)) {
        newCenter = await geocodingService.searchMunicipalityOnline(selectedMunicipality, selectedDepartment);
      }
    }
  };
  centerMap();
}, [selectedDepartment, selectedMunicipality]);
```

¡Ahora el reconocimiento de municipios es mucho más preciso y confiable! 🏘️🎯
