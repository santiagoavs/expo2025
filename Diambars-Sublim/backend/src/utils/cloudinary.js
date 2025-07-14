import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import fs from "fs";
import multer from "multer";
import path from "path";

/**
 * Configuración de Cloudinary para gestión de imágenes en la nube
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Configuración de multer para la subida de imágenes temporales
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `upload-${uniqueSuffix}${fileExtension}`);
  },
});

// Middleware de Multer configurado para imágenes
cloudinary.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de archivo no permitido. Solo se aceptan JPG, PNG, GIF y WEBP."
        ),
        false
      );
    }
  },
});

/**
 * Sube una imagen a Cloudinary
 * @param {string} filePath - Ruta del archivo a subir
 * @param {string} folder - Carpeta de destino en Cloudinary
 * @returns {Promise<string>} - URL de la imagen subida
 */
cloudinary.uploadImage = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    });
    
    // Eliminar archivo temporal
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result.secure_url;
  } catch (error) {
    // Limpiar archivo temporal en caso de error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @param {string} folder - Carpeta donde se encuentra la imagen
 * @returns {Promise<boolean>} - True si se eliminó correctamente
 */
cloudinary.deleteImage = async (imageUrl, folder) => {
  if (!imageUrl) return true;
  
  try {
    // Extraer el public_id de la URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `${folder}/${filename.split('.')[0]}`;
    
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return false;
  }
};

export default cloudinary;