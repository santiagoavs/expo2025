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

// Configuración mejorada de Multer
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
    cb(null, `category-${uniqueSuffix}${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se aceptan JPG, PNG, GIF y WEBP."), false);
  }
};

cloudinary.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter
});

// Función mejorada para subir imágenes
cloudinary.uploadImage = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      resource_type: "image",
      quality: "auto:good" // Optimizar calidad
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

// Función mejorada para eliminar imágenes
cloudinary.deleteImage = async (imageUrl, folder) => {
  if (!imageUrl) return true;

  try {
    // Extraer el public_id de la URL
    const publicId = `${folder}/${imageUrl.split('/').pop().split('.')[0]}`;
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return false;
  }
};

export default cloudinary;