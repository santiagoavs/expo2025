import { sendContactEmail, sendSublimationRequestEmail } from "../services/email.service.js";

const contactController = {};

// Cache para tracking de IPs (en producción usar Redis)
const ipSubmissions = new Map();

// Palabras spam ampliada
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here',
  'buy now', 'free money', 'make money', 'work from home', 'investment',
  'bitcoin', 'crypto', 'loan', 'debt', 'mortgage', 'insurance',
  'sex', 'dating', 'singles', 'porn', 'xxx', 'enlargement', 'pills',
  'discount', 'deal', 'offer', 'limited time', 'act now', 'urgent',
  'mlm', 'pyramid', 'get rich', 'guaranteed', 'no risk', 'miracle'
];

// Dominios de email temporales conocidos
const TEMP_EMAIL_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com'
];

/**
 * Valida si el contenido contiene spam
 */
const detectSpamContent = (text) => {
  const lowerText = text.toLowerCase();
  
  // Verificar palabras spam
  const spamWordsFound = SPAM_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword)
  );
  
  // Verificar URLs (múltiples URLs son sospechosas)
  const urlMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
  
  // Verificar patrones repetitivos
  const repetitivePattern = /(.)\1{4,}/g;
  const isRepetitive = repetitivePattern.test(text);
  
  // Verificar exceso de mayúsculas
  const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
  const isExcessiveCaps = text.length > 10 && upperCaseCount > text.length * 0.7;
  
  // Verificar exceso de signos de exclamación
  const exclamationCount = (text.match(/!/g) || []).length;
  const isExcessiveExclamation = exclamationCount > 3;
  
  return {
    isSpam: spamWordsFound.length > 0 || urlMatches.length > 2 || isRepetitive || 
            isExcessiveCaps || isExcessiveExclamation,
    spamScore: spamWordsFound.length + urlMatches.length + 
               (isRepetitive ? 2 : 0) + (isExcessiveCaps ? 2 : 0) + 
               (isExcessiveExclamation ? 1 : 0),
    reasons: [
      ...(spamWordsFound.length > 0 ? [`Palabras sospechosas detectadas`] : []),
      ...(urlMatches.length > 2 ? [`Múltiples URLs detectadas`] : []),
      ...(isRepetitive ? ['Texto repetitivo'] : []),
      ...(isExcessiveCaps ? ['Exceso de mayúsculas'] : []),
      ...(isExcessiveExclamation ? ['Exceso de signos de exclamación'] : [])
    ]
  };
};

/**
 * Valida el email del usuario
 */
const validateEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Verificar dominios temporales
  const isTempEmail = TEMP_EMAIL_DOMAINS.includes(domain);
  
  // Verificar patrones sospechosos en el email
  const suspiciousPatterns = [
    /^[a-z]+\d+@/i, // solo letras seguidas de números
    /^\d+@/i,       // solo números antes del @
    /^.{1,3}@/i     // muy corto antes del @
  ];
  
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
    pattern.test(email)
  );
  
  return {
    isValid: !isTempEmail && !hasSuspiciousPattern,
    isTempEmail,
    hasSuspiciousPattern
  };
};

/**
 * Valida el comportamiento temporal del usuario
 */
const validateTimingBehavior = (metadata) => {
  if (!metadata || !metadata.formStartTime || !metadata.submitTime) {
    return { isValid: true }; // Si no hay metadata, permitir (compatibilidad)
  }
  
  const timeTaken = (metadata.submitTime - metadata.formStartTime) / 1000; // segundos
  
  // Muy rápido (menos de 5 segundos) o muy lento (más de 1 hora)
  const tooFast = timeTaken < 5;
  const tooSlow = timeTaken > 3600;
  
  return {
    isValid: !tooFast && !tooSlow,
    timeTaken,
    tooFast,
    tooSlow
  };
};

/**
 * Rate limiting por IP
 */
const checkRateLimit = (ip) => {
  const now = Date.now();
  const submissions = ipSubmissions.get(ip) || [];
  
  // Limpiar envíos antiguos (más de 1 hora)
  const recentSubmissions = submissions.filter(time => now - time < 3600000);
  
  // Límites:
  // - Máximo 3 envíos por hora
  // - Mínimo 5 minutos entre envíos
  const hourlyLimit = recentSubmissions.length >= 3;
  const lastSubmission = recentSubmissions[recentSubmissions.length - 1];
  const tooRecent = lastSubmission && (now - lastSubmission) < 300000; // 5 minutos
  
  if (!hourlyLimit && !tooRecent) {
    recentSubmissions.push(now);
    ipSubmissions.set(ip, recentSubmissions);
  }
  
  return {
    allowed: !hourlyLimit && !tooRecent,
    reason: hourlyLimit ? 'HOURLY_LIMIT' : tooRecent ? 'TOO_RECENT' : null,
    remainingTime: tooRecent ? Math.ceil((300000 - (now - lastSubmission)) / 1000) : 0
  };
};

/**
 * Procesa el formulario de contacto con validaciones anti-spam
 */
contactController.sendContactForm = async (req, res) => {
  try {
    // 1. Verificar que el body se parseó correctamente
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Error: Body no parseado correctamente');
      return res.status(400).json({ 
        success: false,
        message: "Error en el formato de la solicitud",
        error: 'INVALID_REQUEST_FORMAT'
      });
    }

    const { fullName, email, message, projectType, description, _metadata } = req.body;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Detect if this is a product proposal (sublimation request) or regular contact
    const isProductProposal = projectType && description;

    // 2. Validaciones básicas mejoradas
    if (isProductProposal) {
      // For product proposals, validate projectType, email, and description
      if (!projectType?.trim() || !email?.trim() || !description?.trim()) {
        console.log('⚠️ Campos faltantes en propuesta de producto:', { projectType, email, description });
        return res.status(400).json({ 
          success: false,
          message: "Todos los campos son obligatorios.",
          error: 'MISSING_FIELDS'
        });
      }
    } else {
      // For regular contact, validate fullName, email, and message
      if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
        console.log('⚠️ Campos faltantes en contacto regular:', { fullName, email, message });
        return res.status(400).json({ 
          success: false,
          message: "Todos los campos son obligatorios.",
          error: 'MISSING_FIELDS'
        });
      }
    }

    // 3. Validación de email estricta
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('⚠️ Email inválido:', email);
      return res.status(400).json({ 
        success: false,
        message: "Por favor, ingresa un correo electrónico válido.",
        error: 'INVALID_EMAIL'
      });
    }

    // 4. Validaciones anti-spam (se mantienen las existentes pero con mejor manejo de errores)
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.log('🚫 Spam detectado (email):', emailValidation);
      return res.status(400).json({
        success: false,
        message: emailValidation.isTempEmail 
          ? "Por favor, usa un correo electrónico permanente."
          : "El formato del correo electrónico parece sospechoso.",
        error: 'SUSPICIOUS_EMAIL'
      });
    }

    // 5. Validación de contenido spam
    let spamCheck;
    if (isProductProposal) {
      spamCheck = {
        description: detectSpamContent(description)
      };
      if (spamCheck.description.isSpam) {
        console.log('🚫 Spam detectado (propuesta de producto):', spamCheck);
        return res.status(400).json({
          success: false,
          message: "El contenido de la descripción no cumple con nuestras políticas.",
          error: 'SPAM_CONTENT',
          details: {
            descriptionReasons: spamCheck.description.reasons
          }
        });
      }
    } else {
      spamCheck = {
        name: detectSpamContent(fullName),
        message: detectSpamContent(message)
      };
      if (spamCheck.name.isSpam || spamCheck.message.isSpam) {
        console.log('🚫 Spam detectado (contacto regular):', spamCheck);
        return res.status(400).json({
          success: false,
          message: "El contenido del mensaje no cumple con nuestras políticas.",
          error: 'SPAM_CONTENT',
          details: {
            nameReasons: spamCheck.name.reasons,
            messageReasons: spamCheck.message.reasons
          }
        });
      }
    }

    // 6. Validación de timing
    const timingValidation = validateTimingBehavior(_metadata);
    if (!timingValidation.isValid) {
      console.log('⚠️ Comportamiento temporal sospechoso:', timingValidation);
      return res.status(400).json({
        success: false,
        message: timingValidation.tooFast 
          ? "Por favor, tómate tu tiempo para completar el formulario."
          : "La sesión ha expirado. Por favor, recarga la página.",
        error: 'SUSPICIOUS_TIMING'
      });
    }

    // 7. Procesamiento seguro de los datos
    let cleanData;
    if (isProductProposal) {
      cleanData = {
        projectType: projectType.trim(),
        email: email.trim().toLowerCase(),
        description: description.trim(),
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      };
      console.log('📋 Propuesta de producto recibida:', { 
        email: cleanData.email, 
        projectType: cleanData.projectType,
        descriptionLength: cleanData.description.length 
      });
    } else {
      cleanData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      };
      console.log('📩 Mensaje de contacto recibido:', { 
        email: cleanData.email, 
        nameLength: cleanData.fullName.length,
        messageLength: cleanData.message.length 
      });
    }

    // 8. Envío de email con manejo explícito de errores
    try {
      if (isProductProposal) {
        await sendSublimationRequestEmail(cleanData);
        console.log('✅ Email de propuesta de producto enviado exitosamente');
      } else {
        await sendContactEmail(cleanData);
        console.log('✅ Email de contacto enviado exitosamente');
      }
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      throw new Error("Error al procesar tu mensaje. Por favor, intenta nuevamente.");
    }

    // 9. Respuesta exitosa
    const successMessage = isProductProposal 
      ? "¡Gracias por tu propuesta de producto! Te contactaremos pronto para discutir tu proyecto."
      : "¡Gracias por contactarnos! Te responderemos pronto.";
      
    return res.status(200).json({
      success: true,
      message: successMessage,
      data: {
        receivedAt: cleanData.timestamp.toISOString(),
        type: isProductProposal ? 'product_proposal' : 'contact',
        ...(isProductProposal && { projectType: cleanData.projectType })
      }
    });

  } catch (error) {
    console.error('💥 Error crítico en el controlador:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
      error: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Función para limpiar cache de IPs (llamar periódicamente)
contactController.cleanupIPCache = () => {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  for (const [ip, submissions] of ipSubmissions.entries()) {
    const recentSubmissions = submissions.filter(time => time > oneHourAgo);
    
    if (recentSubmissions.length === 0) {
      ipSubmissions.delete(ip);
    } else {
      ipSubmissions.set(ip, recentSubmissions);
    }
  }
  
  console.log(`🧹 Cache de IPs limpiado. IPs activas: ${ipSubmissions.size}`);
};

// Limpiar cache cada hora
setInterval(contactController.cleanupIPCache, 3600000);

export default contactController;