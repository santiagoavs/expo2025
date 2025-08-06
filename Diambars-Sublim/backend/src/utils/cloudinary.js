import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import fs from "fs";
import multer from "multer";
import path from "path";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
  secure: true // Asegurar conexión HTTPS
});

// Configuración mejorada de Multer con nombres dinámicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads";
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Determinar prefijo basado en la ruta o fieldname
    let prefix = "file";
    if (req.route?.path?.includes("products")) {
      prefix = "product";
    } else if (req.route?.path?.includes("categories")) {
      prefix = "category";
    } else if (req.route?.path?.includes("designs")) {
      prefix = "design";
    } else if (file.fieldname) {
      prefix = file.fieldname; // mainImage, additionalImages, etc.
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${fileExtension}`);
  },
});

// Filtro de archivos mejorado con mejor validación
const fileFilter = (req, file, cb) => {
  // MIME types permitidos
  const allowedMimes = [
    "image/jpeg", 
    "image/jpg", 
    "image/png", 
    "image/gif", 
    "image/webp",
    "image/svg+xml" // Agregado SVG para logos/iconos
  ];
  
  // Extensiones permitidas como validación adicional
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    const error = new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan: JPG, PNG, GIF, WEBP y SVG.`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configuración base de multer
const multerConfig = {
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 10 // máximo 10 archivos por request
  },
  fileFilter
};

// Crear instancias específicas de multer para diferentes usos
cloudinary.upload = multer(multerConfig);

// Upload específico para productos (imagen principal + adicionales)
cloudinary.uploadProduct = multer({
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 6 // 1 principal + 5 adicionales
  }
});

// Upload para categorías (solo una imagen)
cloudinary.uploadCategory = multer({
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 1
  }
});

// Upload para diseños (múltiples archivos)
cloudinary.uploadDesign = multer({
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 15 // Más archivos para diseños complejos
  }
});

// ===== FUNCIONES DE CLOUDINARY MEJORADAS =====

/**
 * Función mejorada para subir imágenes con más opciones
 * @param {string} filePath - Ruta del archivo local
 * @param {string} folder - Carpeta en Cloudinary
 * @param {object} options - Opciones adicionales de transformación
 * @returns {Promise<string>} - URL segura de la imagen
 */
cloudinary.uploadImage = async (filePath, folder, options = {}) => {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    // Configuración por defecto
    const defaultOptions = {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp", "gif", "svg"],
      resource_type: "image",
      quality: "auto:good", // Optimizar calidad automáticamente
      fetch_format: "auto", // Formato automático según el navegador
      flags: "progressive", // Carga progresiva
      ...options // Sobrescribir con opciones personalizadas
    };

    console.log(`📤 Subiendo imagen a Cloudinary: ${filePath} -> ${folder}`);
    
    const result = await cloudinary.uploader.upload(filePath, defaultOptions);

    // Eliminar archivo temporal después de subir
    cleanupFile(filePath);

    console.log(`✅ Imagen subida exitosamente: ${result.secure_url}`);
    return result.secure_url;
    
  } catch (error) {
    console.error(`❌ Error subiendo imagen ${filePath}:`, error);
    
    // Limpiar archivo temporal en caso de error
    cleanupFile(filePath);
    
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/**
 * Función para subir múltiples imágenes
 * @param {Array} filePaths - Array de rutas de archivos
 * @param {string} folder - Carpeta en Cloudinary
 * @param {object} options - Opciones adicionales
 * @returns {Promise<Array>} - Array de URLs seguras
 */
cloudinary.uploadMultipleImages = async (filePaths, folder, options = {}) => {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return [];
  }

  const uploadPromises = filePaths.map(filePath => 
    cloudinary.uploadImage(filePath, folder, options)
  );

  try {
    const results = await Promise.all(uploadPromises);
    console.log(`✅ ${results.length} imágenes subidas exitosamente`);
    return results;
  } catch (error) {
    console.error('❌ Error subiendo múltiples imágenes:', error);
    
    // Limpiar archivos temporales en caso de error
    filePaths.forEach(cleanupFile);
    
    throw error;
  }
};

/**
 * Función mejorada para eliminar imágenes con mejor extracción de public_id
 * @param {string} imageUrl - URL de la imagen en Cloudinary
 * @param {string} folder - Carpeta donde está la imagen (opcional)
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
cloudinary.deleteImage = async (imageUrl, folder = null) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.warn('⚠️ URL de imagen inválida para eliminar');
    return true; // No es un error crítico
  }

  try {
    // Extraer public_id de la URL de Cloudinary de forma más robusta
    let publicId = extractPublicIdFromUrl(imageUrl);
    
    // Si se especifica folder y no está en el public_id, agregarlo
    if (folder && !publicId.startsWith(folder)) {
      publicId = `${folder}/${publicId}`;
    }

    console.log(`🗑️ Eliminando imagen de Cloudinary: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`✅ Imagen eliminada exitosamente: ${publicId}`);
      return true;
    } else if (result.result === 'not found') {
      console.warn(`⚠️ Imagen no encontrada en Cloudinary: ${publicId}`);
      return true; // No es un error crítico si ya no existe
    } else {
      console.error(`❌ Error eliminando imagen: ${result.result}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error al eliminar imagen ${imageUrl}:`, error);
    return false;
  }
};

/**
 * Función para eliminar múltiples imágenes
 * @param {Array} imageUrls - Array de URLs de imágenes
 * @param {string} folder - Carpeta donde están las imágenes (opcional)
 * @returns {Promise<Object>} - Resultado con éxitos y fallos
 */
cloudinary.deleteMultipleImages = async (imageUrls, folder = null) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return { success: 0, failed: 0, results: [] };
  }

  const results = {
    success: 0,
    failed: 0,
    results: []
  };

  for (const imageUrl of imageUrls) {
    try {
      const deleted = await cloudinary.deleteImage(imageUrl, folder);
      if (deleted) {
        results.success++;
        results.results.push({ url: imageUrl, status: 'deleted' });
      } else {
        results.failed++;
        results.results.push({ url: imageUrl, status: 'failed' });
      }
    } catch (error) {
      results.failed++;
      results.results.push({ url: imageUrl, status: 'error', error: error.message });
    }
  }

  console.log(`🗑️ Eliminación múltiple completada: ${results.success} éxitos, ${results.failed} fallos`);
  return results;
};

/**
 * Función para obtener información de una imagen
 * @param {string} imageUrl - URL de la imagen
 * @returns {Promise<Object>} - Información de la imagen
 */
cloudinary.getImageInfo = async (imageUrl) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      url: result.secure_url,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('❌ Error obteniendo información de imagen:', error);
    throw error;
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param {string} url - URL de Cloudinary
 * @returns {string} - Public ID extraído
 */
function extractPublicIdFromUrl(url) {
  try {
    // Patrón para URLs de Cloudinary: 
    // https://res.cloudinary.com/cloud/image/upload/v123456/folder/filename.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL de Cloudinary inválida');
    }
    
    // Tomar todo después de 'upload' y antes de la extensión
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    // Remover versión si existe (v123456)
    if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
      pathAfterUpload.shift();
    }
    
    // Unir el path y remover extensión
    const fullPath = pathAfterUpload.join('/');
    const publicId = fullPath.replace(/\.[^/.]+$/, ''); // Remover extensión
    
    return publicId;
  } catch (error) {
    console.error('Error extrayendo public_id:', error);
    // Fallback: usar el método anterior
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}

/**
 * Limpia un archivo temporal de forma segura
 * @param {string} filePath - Ruta del archivo a eliminar
 */
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Archivo temporal eliminado: ${filePath}`);
    }
  } catch (error) {
    console.error(`⚠️ Error eliminando archivo temporal ${filePath}:`, error);
  }
}

/**
 * Limpia múltiples archivos temporales
 * @param {Array} filePaths - Array de rutas de archivos
 */
cloudinary.cleanupFiles = (filePaths) => {
  if (!Array.isArray(filePaths)) return;
  filePaths.forEach(cleanupFile);
};

/**
 * Función para transformar imagen (redimensionar, etc.)
 * @param {string} imageUrl - URL de la imagen original
 * @param {object} transformations - Transformaciones a aplicar
 * @returns {string} - URL de la imagen transformada
 */
cloudinary.transformImage = (imageUrl, transformations = {}) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    // Construir URL transformada
    const transformedUrl = cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
    
    return transformedUrl;
  } catch (error) {
    console.error('❌ Error transformando imagen:', error);
    return imageUrl; // Devolver URL original en caso de error
  }
};

export default cloudinary;