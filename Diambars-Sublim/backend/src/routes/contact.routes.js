import express from "express";
import contactController from "../controllers/contact.controller.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting específico para formularios de contacto
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados mensajes. Espera 1 hora antes de enviar otro.'
    });
  }
});

// Endpoint para enviar formulario de contacto
router.post("/send", 
  express.json(), // Asegura el parseo del JSON
  contactLimiter,
  (req, res, next) => {
    console.log('Middleware de ruta ejecutado'); // Para debug
    next();
  },
  contactController.sendContactForm
);

export default router;