# Migración a Render - Panel Administrativo

## 🚀 Configuración Segura para Render

Este proyecto ha sido configurado para usar **Render** como backend de manera segura y sin romper las rutas existentes.

### 📋 Cambios Realizados

#### 1. **Vite Config (vite.config.js)**
- ✅ Proxy actualizado a `https://expo2025-8bjn.onrender.com`
- ✅ `secure: true` para HTTPS
- ✅ `changeOrigin: true` para CORS

#### 2. **Configuración Centralizada (config.js)**
- ✅ URLs centralizadas por entorno
- ✅ Desarrollo: Proxy de Vite → Render
- ✅ Producción: URL directa a Render
- ✅ Timeout configurado (30s)

#### 3. **ApiClient Optimizado**
- ✅ Usa configuración centralizada
- ✅ Logging de configuración
- ✅ Manejo seguro de URLs

### 🔧 Cómo Funciona

#### **Desarrollo Local:**
```
Frontend (localhost:5173) → Proxy Vite → Render (expo2025-8bjn.onrender.com)
```

#### **Producción:**
```
Frontend (Render) → Render Backend (expo2025-8bjn.onrender.com)
```

### 🧪 Verificación

Ejecuta el script de verificación:
```bash
node verify-migration.js
```

### 📁 Archivos Modificados

- `vite.config.js` - Proxy actualizado
- `src/api/ApiClient.jsx` - Configuración centralizada
- `config.js` - Configuración centralizada (NUEVO)
- `verify-migration.js` - Script de verificación (NUEVO)

### 🚀 Despliegue

#### **Para Desarrollo:**
```bash
npm run dev
# Usa proxy automáticamente
```

#### **Para Producción:**
```bash
npm run build
# Usa URL directa a Render
```

### 🔒 Seguridad

- ✅ No se expone la URL de Render en el código
- ✅ Configuración centralizada
- ✅ Variables de entorno respetadas
- ✅ HTTPS obligatorio

### 📞 Soporte

Si hay problemas:
1. Verifica que Render esté funcionando
2. Ejecuta `node verify-migration.js`
3. Revisa la consola del navegador
4. Verifica los logs de Render

### 🎯 Beneficios

- **Sin cambios en el código**: Las rutas siguen siendo `/api/*`
- **Configuración centralizada**: Fácil mantenimiento
- **Desarrollo y producción**: Funciona en ambos entornos
- **Seguridad**: URLs no expuestas en el código
