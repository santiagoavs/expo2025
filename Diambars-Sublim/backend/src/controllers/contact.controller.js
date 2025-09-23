import { sendContactEmail, sendSublimationRequestEmail } from "../services/email/email.service.js";

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
 * Procesa formularios de contacto y solicitudes de sublimación con validaciones anti-spam
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

    const { fullName, email, message, subject, _metadata } = req.body;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Detectar tipo de formulario basado en los campos presentes
    const isSublimatioRequest = subject && !fullName;
    const isContactForm = fullName && !subject;
    
    console.log('📝 Tipo de formulario detectado:', {
      isSublimatioRequest,
      isContactForm,
      fields: { fullName: !!fullName, subject: !!subject, email: !!email, message: !!message }
    });

    // 2. Validaciones básicas según el tipo de formulario
    if (isSublimatioRequest) {
      // Validación para solicitud de sublimación
      if (!subject?.trim() || !email?.trim() || !message?.trim()) {
        console.log('⚠️ Campos faltantes en solicitud:', { subject, email, message });
        return res.status(400).json({ 
          success: false,
          message: "Todos los campos son obligatorios.",
          error: 'MISSING_FIELDS'
        });
      }
    } else if (isContactForm) {
      // Validación para formulario de contacto
      if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
        console.log('⚠️ Campos faltantes en contacto:', { fullName, email, message });
        return res.status(400).json({ 
          success: false,
          message: "Todos los campos son obligatorios.",
          error: 'MISSING_FIELDS'
        });
      }
    } else {
      // No se puede determinar el tipo de formulario
      console.log('⚠️ Tipo de formulario no reconocido:', req.body);
      return res.status(400).json({ 
        success: false,
        message: "Formato de formulario no reconocido.",
        error: 'UNKNOWN_FORM_TYPE'
      });
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

    // 4. Validaciones anti-spam
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
    if (isSublimatioRequest) {
      spamCheck = {
        message: detectSpamContent(message)
      };
      if (spamCheck.message.isSpam) {
        console.log('🚫 Spam detectado (solicitud):', spamCheck);
        return res.status(400).json({
          success: false,
          message: "El contenido de la descripción no cumple con nuestras políticas.",
          error: 'SPAM_CONTENT',
          details: {
            messageReasons: spamCheck.message.reasons
          }
        });
      }
    } else {
      spamCheck = {
        name: detectSpamContent(fullName),
        message: detectSpamContent(message)
      };
      if (spamCheck.name.isSpam || spamCheck.message.isSpam) {
        console.log('🚫 Spam detectado (contacto):', spamCheck);
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
    if (isSublimatioRequest) {
      cleanData = {
        subject: subject.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      };
      
      console.log('📋 Solicitud de sublimación recibida:', { 
        email: cleanData.email, 
        subject: cleanData.subject,
        messageLength: cleanData.message.length 
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
      if (isSublimatioRequest) {
        await sendSublimationRequestEmail(cleanData);
        console.log('✅ Email de solicitud de sublimación enviado exitosamente');
      } else {
        await sendContactEmail(cleanData);
        console.log('✅ Email de contacto enviado exitosamente');
      }
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      throw new Error("Error al procesar tu mensaje. Por favor, intenta nuevamente.");
    }

    // 9. Respuesta exitosa
    const successMessage = isSublimatioRequest 
      ? "¡Gracias por tu solicitud! Te contactaremos pronto para discutir tu proyecto."
      : "¡Gracias por contactarnos! Te responderemos pronto.";
      
    return res.status(200).json({
      success: true,
      message: successMessage,
      data: {
        receivedAt: cleanData.timestamp.toISOString(),
        type: isSublimatioRequest ? 'sublimation_request' : 'contact',
        ...(isSublimatioRequest && { subject: cleanData.subject })
      }
    });

  } catch (error) {
    console.error('💥 Error crítico en el controlador:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
};

/**
 * Procesa el formulario de solicitud de sublimación con validaciones anti-spam
 */
contactController.sendSublimationRequest = async (req, res) => {
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

    const { subject, email, message, _metadata } = req.body;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 2. Validaciones básicas para solicitud de sublimación
    if (!subject?.trim() || !email?.trim() || !message?.trim()) {
      console.log('⚠️ Campos faltantes en solicitud:', { subject, email, message });
      return res.status(400).json({ 
        success: false,
        message: "Todos los campos son obligatorios.",
        error: 'MISSING_FIELDS'
      });
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

    // 4. Validaciones anti-spam
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
    const spamCheck = {
      message: detectSpamContent(message)
    };
    if (spamCheck.message.isSpam) {
      console.log('🚫 Spam detectado (solicitud):', spamCheck);
      return res.status(400).json({
        success: false,
        message: "El contenido de la descripción no cumple con nuestras políticas.",
        error: 'SPAM_CONTENT',
        details: {
          messageReasons: spamCheck.message.reasons
        }
      });
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
    const cleanData = {
      subject: subject.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    };
    
    console.log('📋 Solicitud de sublimación recibida:', { 
      email: cleanData.email, 
      subject: cleanData.subject,
      messageLength: cleanData.message.length 
    });

    // 8. Envío de email con manejo explícito de errores
    try {
      await sendSublimationRequestEmail(cleanData);
      console.log('✅ Email de solicitud de sublimación enviado exitosamente');
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      throw new Error("Error al procesar tu solicitud. Por favor, intenta nuevamente.");
    }

    // 9. Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: "¡Gracias por tu solicitud! Te contactaremos pronto para discutir tu proyecto.",
      data: {
        receivedAt: cleanData.timestamp.toISOString(),
        type: 'sublimation_request',
        subject: cleanData.subject
      }
    });

  } catch (error) {
    console.error('💥 Error crítico en el controlador:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
      error: 'INTERNAL_SERVER_ERROR'
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