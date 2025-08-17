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
  secure: true
});

// Configuración simplificada de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Prefijo simple basado en fieldname
    const prefix = file.fieldname || "file";
    
    cb(null, `${prefix}-${uniqueSuffix}${fileExtension}`);
  },
});

// Filtro de archivos simplificado
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg", 
    "image/jpg", 
    "image/png", 
    "image/gif", 
    "image/webp"
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    const error = new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo JPG, PNG, GIF y WEBP.`);
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

// Crear instancias específicas de multer
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

// Upload para diseños
cloudinary.uploadDesign = multer({
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 15
  }
});

// ===== FUNCIONES SIMPLIFICADAS =====

/**
 * Función principal simplificada para subir imágenes
 * CORREGIDA: Ahora devuelve un objeto con secure_url y public_id
 */
cloudinary.uploadImage = async (filePath, folder, options = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const defaultOptions = {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
      flags: "progressive",
      ...options
    };

    console.log(`📤 Subiendo imagen a Cloudinary: ${filePath} -> ${folder}`);
    
    const result = await cloudinary.uploader.upload(filePath, defaultOptions);

    // Limpiar archivo temporal después de subir exitosamente
    cleanupFile(filePath);

    console.log(`✅ Imagen subida exitosamente: ${result.secure_url}`);
    
    // CORREGIDO: Devolver objeto completo con public_id
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
    
  } catch (error) {
    console.error(`❌ Error subiendo imagen ${filePath}:`, error);
    
    // Limpiar archivo temporal en caso de error
    cleanupFile(filePath);
    
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/**
 * Función para subir múltiples imágenes
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
 * Función simplificada para eliminar imágenes
 */
cloudinary.deleteImage = async (imageUrl, folder = null) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.warn('⚠️ URL de imagen inválida para eliminar');
    return true;
  }

  try {
    let publicId = extractPublicIdFromUrl(imageUrl);
    
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
      return true;
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
 */
cloudinary.deleteMultipleImages = async (imageUrls, folder = null) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return { success: 0, failed: 0, results: [] };
  }

  const results = { success: 0, failed: 0, results: [] };

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

// ===== FUNCIONES AUXILIARES SIMPLIFICADAS =====

/**
 * Extrae el public_id de una URL de Cloudinary - SIMPLIFICADO Y ROBUSTO
 */
function extractPublicIdFromUrl(url) {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('URL inválida');
    }

    // Buscar el patrón /upload/ en la URL
    const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    
    if (uploadMatch && uploadMatch[1]) {
      return uploadMatch[1];
    }
    
    // Fallback: método tradicional
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL de Cloudinary inválida');
    }
    
    let pathParts = parts.slice(uploadIndex + 1);
    
    // Remover versión si existe (v123456)
    if (pathParts[0] && pathParts[0].startsWith('v') && /^v\d+$/.test(pathParts[0])) {
      pathParts = pathParts.slice(1);
    }
    
    // Unir el path y remover extensión
    const fullPath = pathParts.join('/');
    const publicId = fullPath.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('⚠️ Error extrayendo public_id:', error);
    // Fallback final: usar el nombre del archivo sin extensión
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}

/**
 * Limpia un archivo temporal de forma segura
 */
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Archivo temporal eliminado: ${filePath}`);
    }
  } catch (error) {
    console.error(`⚠️ Error eliminando archivo temporal ${filePath}:`, error.message);
  }
}

/**
 * Limpia múltiples archivos temporales
 */
cloudinary.cleanupFiles = (filePaths) => {
  if (!Array.isArray(filePaths)) return;
  filePaths.forEach(cleanupFile);
};

/**
 * Función para transformar imagen (redimensionar, etc.)
 */
cloudinary.transformImage = (imageUrl, transformations = {}) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    const transformedUrl = cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
    
    return transformedUrl;
  } catch (error) {
    console.error('❌ Error transformando imagen:', error);
    return imageUrl;
  }
};

export default cloudinary;