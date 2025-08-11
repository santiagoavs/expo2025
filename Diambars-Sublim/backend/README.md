# Diambars Sublim - Backend API

## 🚀 Backend optimizado para producción con sistema de pagos híbrido

Este backend está **100% listo para ser fetcheado desde tu frontend** con las siguientes características:

### ✅ Características principales

- **Sistema de pagos híbrido**: Detecta automáticamente si Wompi está configurado
  - ✅ **Modo real**: Cuando las credenciales de Wompi están configuradas
  - 🎭 **Modo ficticio**: Cuando Wompi no está configurado (perfecto para desarrollo)
- **Flujo completo de órdenes**: Desde diseño hasta entrega
- **Gestión de direcciones**: Para El Salvador con validación completa
- **Sistema de notificaciones**: Email automático para todos los estados
- **Subida de imágenes**: Cloudinary integrado
- **Validaciones robustas**: Para todos los endpoints
- **Documentación de API**: Responses consistentes y bien estructurados

## 🔧 Configuración rápida

### 1. Variables de entorno (.env)

Tu archivo `.env` actual está perfecto. El sistema detecta automáticamente si Wompi está configurado:

```env
# Wompi en modo FICTICIO (actual)
WOMPI_PUBLIC_KEY=pub_sandbox_placeholder
WOMPI_PRIVATE_KEY=prv_sandbox_placeholder
WOMPI_INTEGRITY_SECRET=integrity_placeholder
WOMPI_WEBHOOK_SECRET=webhook_placeholder
```

### 2. Cuando quieras activar Wompi REAL, simplemente cambia:

```env
# Wompi en modo REAL (futuro)
WOMPI_PUBLIC_KEY=pub_sandbox_TU_CLAVE_REAL
WOMPI_PRIVATE_KEY=prv_sandbox_TU_CLAVE_REAL
WOMPI_INTEGRITY_SECRET=TU_SECRET_REAL
WOMPI_WEBHOOK_SECRET=TU_SECRET_REAL
```

## 📡 Endpoints principales para tu frontend

### 🏥 Health Check
```bash
GET /api/health
# Respuesta incluye estado de Wompi
```

### 🛒 Flujo de pedidos completo

1. **Crear pedido**:
```bash
POST /api/orders
{
  "designId": "mongoId",
  "quantity": 1,
  "deliveryType": "delivery", // o "meetup"
  "paymentMethod": "cash", // "wompi", "card", "transfer"
  "paymentTiming": "on_delivery", // o "advance"
  "addressId": "mongoId", // o usar address object
  "clientNotes": "string"
}
```

2. **Simular pago** (cuando Wompi no está configurado):
```bash
POST /api/orders/:id/simulate-payment
{
  "status": "approved" // "declined", "error"
}
```

3. **Confirmar pago manual** (admin):
```bash
POST /api/orders/:id/confirm-payment
{
  "amount": 100.50,
  "receiptNumber": "CASH-123",
  "notes": "Pago recibido en efectivo"
}
```

### 🎨 Diseños
```bash
POST /api/designs              # Crear diseño
GET /api/designs/:id           # Obtener diseño
POST /api/designs/:id/respond  # Responder cotización
```

### 📦 Productos
```bash
GET /api/products              # Listar productos
GET /api/products/:id          # Producto específico
GET /api/products/:id/konva-config  # Configuración para editor
```

### 🏠 Direcciones
```bash
GET /api/addresses             # Direcciones del usuario
POST /api/addresses            # Crear dirección
PUT /api/addresses/:id         # Actualizar dirección
```

### ⚙️ Configuración del sistema
```bash
GET /api/config                # Configuración completa
GET /api/config/wompi          # Solo configuración Wompi
GET /api/config/locations      # Departamentos y municipios SV
GET /api/config/payment-status # Estado de métodos de pago
```

## 🎭 Sistema de pagos híbrido

### Modo FICTICIO (actual)
- ✅ **Flujo completo funcional**
- 🎭 **Pagos simulados** con `/simulate-payment`
- 💰 **Pagos en efectivo** totalmente funcionales
- 📧 **Notificaciones reales** por email
- 📊 **Tracking completo** de pedidos

### Modo REAL (cuando configures Wompi)
- 💳 **Pagos reales** con Wompi
- 🔗 **Links de pago** automáticos
- 🔔 **Webhooks** de confirmación
- 💰 **Pagos en efectivo** también disponibles

## 📋 Responses de la API

### Formato estándar
```json
{
  "success": true,
  "message": "Descripción de la operación",
  "data": {
    // Datos específicos del endpoint
  },
  "_links": {
    // Links relacionados (opcional)
  }
}
```

### Errores
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "ERROR_CODE",
  "details": [] // Detalles adicionales si aplica
}
```

## 🔄 Estados de pedidos

1. **pending_approval** → Pedido creado, esperando aprobación
2. **approved** → Pedido aprobado, listo para producción
3. **in_production** → En proceso de producción
4. **ready_for_delivery** → Listo para entrega
5. **delivered** → Entregado al cliente
6. **completed** → Completado (cliente puede reseñar)
7. **cancelled** → Cancelado

## 🎨 Estados de diseños

1. **draft** → Borrador (editable)
2. **pending** → Enviado para cotización
3. **quoted** → Cotizado, esperando respuesta
4. **approved** → Aprobado, se puede crear pedido
5. **rejected** → Rechazado por el cliente

## 🚀 Para hacer fetch desde tu frontend

### Ejemplo con fetch nativo:
```javascript
// Crear pedido
const response = await fetch('http://localhost:4000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // o usar cookies
  },
  credentials: 'include', // Para cookies
  body: JSON.stringify({
    designId: "65abc123...",
    quantity: 1,
    deliveryType: "delivery",
    paymentMethod: "cash",
    addressId: "65def456..."
  })
});

const result = await response.json();
if (result.success) {
  console.log('Pedido creado:', result.data.order);
}
```

### Ejemplo con axios:
```javascript
// Configurar axios
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Crear pedido
try {
  const { data } = await api.post('/orders', orderData);
  console.log('Pedido creado:', data.data.order);
} catch (error) {
  console.error('Error:', error.response.data);
}
```

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register
```bash
POST /api/users/register
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "71234567"
}
```

## 📧 Sistema de notificaciones

El backend envía automáticamente emails para:
- ✅ Nuevos pedidos (a admin)
- ✅ Cambios de estado (a cliente)
- ✅ Pagos confirmados
- ✅ Actualizaciones de producción
- ✅ Pedidos entregados

## 🛠️ Para desarrollo

### Endpoints útiles para testing:
```bash
# Simular pago (solo en desarrollo o modo ficticio)
POST /api/orders/:id/simulate-payment

# Crear productos de ejemplo (solo desarrollo)
POST /api/products/dev/create-samples

# Ver estado del sistema
GET /api/health
```

## 🚨 Notas importantes

1. **CORS configurado** para localhost:5173 (tu frontend)
2. **Rate limiting** activado (100 requests/15min)
3. **Validaciones completas** en todos los endpoints
4. **Logs detallados** para debugging
5. **Manejo de errores robusto**
6. **Archivos temporales** se limpian automáticamente

## 📝 TODO futuro (cuando tengas Wompi)

1. Actualizar variables de entorno con credenciales reales
2. Configurar webhook URL en dashboard de Wompi
3. Cambiar URLs a dominio real en producción
4. El sistema detectará automáticamente y cambiará a modo real

---

**¡Tu backend está 100% listo para ser usado desde el frontend!** 🎉

Todos los endpoints están funcionales, las validaciones están en su lugar, y el sistema de pagos funciona tanto en modo ficticio como real.