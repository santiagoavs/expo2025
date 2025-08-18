import { useState, useEffect, useRef } from 'react';
import './contact.css';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';

// Iconos SVG simples
const LocationIcon = () => (
  <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

// Lista de palabras spam comunes (expandible)
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here',
  'buy now', 'free money', 'make money', 'work from home', 'investment',
  'bitcoin', 'crypto', 'loan', 'debt', 'mortgage', 'insurance',
  'sex', 'dating', 'singles', 'porn', 'xxx'
];

// URLs sospechosas (patrones)
const SUSPICIOUS_URL_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /[a-zA-Z0-9-]+\.(com|net|org|info|biz)/gi
];

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Estados para protección anti-spam
  const [formStartTime, setFormStartTime] = useState(null);
  const [isHoneypotFilled, setIsHoneypotFilled] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState({ message: [], email: [], fullName: [] });
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  const lastSubmissionRef = useRef(null);
  const typingStartRef = useRef({});

  // Inicializar tiempo cuando se monta el componente
  useEffect(() => {
    setFormStartTime(Date.now());
    
    // Verificar si hay un cooldown activo en localStorage
    const lastSubmission = localStorage.getItem('lastContactSubmission');
    if (lastSubmission) {
      const timeDiff = Date.now() - parseInt(lastSubmission);
      const cooldownPeriod = 5 * 60 * 1000; // 5 minutos
      
      if (timeDiff < cooldownPeriod) {
        setCooldownActive(true);
        setCooldownTime(Math.ceil((cooldownPeriod - timeDiff) / 1000));
        
        // Contador regresivo
        const interval = setInterval(() => {
          setCooldownTime(prev => {
            if (prev <= 1) {
              setCooldownActive(false);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, []);

  // Detectar spam por contenido
  const detectSpamContent = (text) => {
    const lowerText = text.toLowerCase();
    
    // Verificar palabras spam
    const spamWordsFound = SPAM_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    // Verificar URLs sospechosas
    const urlsFound = SUSPICIOUS_URL_PATTERNS.some(pattern => 
      pattern.test(text)
    );
    
    // Verificar texto repetitivo (más del 50% de caracteres repetidos)
    const repetitivePattern = /(.)\1{3,}/g;
    const isRepetitive = repetitivePattern.test(text);
    
    // Verificar exceso de mayúsculas (más del 70%)
    const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
    const isExcessiveCaps = upperCaseCount > text.length * 0.7;
    
    return {
      isSpam: spamWordsFound.length > 0 || urlsFound || isRepetitive || isExcessiveCaps,
      reasons: [
        ...(spamWordsFound.length > 0 ? [`Palabras sospechosas: ${spamWordsFound.join(', ')}`] : []),
        ...(urlsFound ? ['Contiene URLs'] : []),
        ...(isRepetitive ? ['Texto repetitivo'] : []),
        ...(isExcessiveCaps ? ['Exceso de mayúsculas'] : [])
      ]
    };
  };

  // Detectar velocidad de escritura sospechosa
  const detectSuspiciousTyping = () => {
    // Si escribió muy rápido (más de 10 caracteres por segundo en promedio)
    const avgSpeed = Object.values(typingSpeed).flat().reduce((acc, speed) => acc + speed, 0) / 
                    Object.values(typingSpeed).flat().length;
    
    return avgSpeed > 10; // más de 10 caracteres por segundo es sospechoso
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const now = Date.now();
    
    // Calcular velocidad de escritura
    if (!typingStartRef.current[name]) {
      typingStartRef.current[name] = now;
    } else {
      const timeDiff = (now - typingStartRef.current[name]) / 1000; // segundos
      const charDiff = value.length - formData[name].length;
      
      if (timeDiff > 0 && charDiff > 0) {
        const speed = charDiff / timeDiff;
        setTypingSpeed(prev => ({
          ...prev,
          [name]: [...prev[name].slice(-9), speed] // mantener últimas 10 mediciones
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar el estado de envío si el usuario está editando
    if (submitStatus) {
      setSubmitStatus(null);
      setStatusMessage('');
    }
  };

  // Manejar campo honeypot (invisible para usuarios, visible para bots)
  const handleHoneypotChange = (e) => {
    if (e.target.value.trim() !== '') {
      setIsHoneypotFilled(true);
    }
  };

  // Validaciones anti-spam
  const validateAntiSpam = () => {
    const now = Date.now();
    
    // 1. Verificar honeypot
    if (isHoneypotFilled) {
      return { isValid: false, message: 'Actividad sospechosa detectada.' };
    }
    
    // 2. Verificar tiempo mínimo (al menos 10 segundos para llenar el formulario)
    const timeTaken = (now - formStartTime) / 1000;
    if (timeTaken < 10) {
      return { isValid: false, message: 'Por favor, tómate tu tiempo para completar el formulario.' };
    }
    
    // 3. Verificar contenido spam
    const messageSpamCheck = detectSpamContent(formData.message);
    const nameSpamCheck = detectSpamContent(formData.fullName);
    
    if (messageSpamCheck.isSpam || nameSpamCheck.isSpam) {
      return { 
        isValid: false, 
        message: 'El contenido del mensaje no cumple con nuestras políticas. Por favor, revisa tu mensaje.' 
      };
    }
    
    // 4. Verificar velocidad de escritura
    if (detectSuspiciousTyping()) {
      return { isValid: false, message: 'Velocidad de escritura sospechosa detectada.' };
    }
    
    // 5. Verificar cooldown
    if (cooldownActive) {
      return { 
        isValid: false, 
        message: `Debes esperar ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, '0')} antes de enviar otro mensaje.` 
      };
    }
    
    return { isValid: true };
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validaciones básicas del frontend
  if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
    setSubmitStatus('error');
    setStatusMessage('Todos los campos son obligatorios.');
    return;
  }

  if (formData.message.trim().length < 10) {
    setSubmitStatus('error');
    setStatusMessage('El mensaje debe tener al menos 10 caracteres.');
    return;
  }

  // Validaciones anti-spam
  const spamValidation = validateAntiSpam();
  if (!spamValidation.isValid) {
    setSubmitStatus('error');
    setStatusMessage(spamValidation.message);
    return;
  }

  setIsSubmitting(true);
  setSubmitStatus(null);
  setStatusMessage('');

  try {
    const response = await fetch('http://localhost:4000/api/contact/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Asegura que esperas JSON
      },
      body: JSON.stringify({
        ...formData,
        _metadata: {
          formStartTime,
          submitTime: Date.now(),
          userAgent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Respuesta no es JSON');
    }

    // Verificar si la respuesta es OK (status 200-299)
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Intentar parsear JSON solo si hay contenido
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (data.success) {
      setSubmitStatus('success');
      setStatusMessage(data.message || 'Mensaje enviado con éxito');
      
      localStorage.setItem('lastContactSubmission', Date.now().toString());
      setCooldownActive(true);
      setCooldownTime(300);
      
      setFormData({
        fullName: '',
        email: '',
        message: ''
      });
      
      setFormStartTime(Date.now());
      setTypingSpeed({ message: [], email: [], fullName: [] });
      typingStartRef.current = {};
      
    } else {
      setSubmitStatus('error');
      setStatusMessage(data.message || 'Error al enviar el mensaje.');
    }
  } catch (error) {
    console.error('Error al enviar formulario:', error);
    setSubmitStatus('error');
    setStatusMessage('Error al enviar el formulario. Por favor, intenta nuevamente.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <main className="contact-page">
        <div className="contact-container">
            <div className="contact-info-card">
              <div className='contact-info-container'>
              <div className="contact-info-item">
                <LocationIcon />
                <div className="contact-info-content">
                  <h3>Ubicación</h3>
                  <p>Avenida Aguilares 218<br />San Salvador CP, San Salvador 1101</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <PhoneIcon />
                <div className="contact-info-content">
                  <h3>Teléfono</h3>
                  <p>+503 0000-0000</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <ClockIcon />
                <div className="contact-info-content">
                  <h3>Horarios</h3>
                  <p>Lun - Vie: 7:00 AM - 3:45 PM</p>
                </div>
              </div>
              </div>
            </div>

            <div className="contact-form-container">
              <div className="form-header">
                <h1 className="contact-title">¿Dudas o consultas?</h1>
                <h4 className="contact-subtitle">¡Contáctanos!</h4>
              </div>
              
              {/* Mensaje de estado */}
              {submitStatus && (
                <div className={`status-message ${submitStatus}`}>
                  {statusMessage}
                </div>
              )}
              
              {/* Indicador de cooldown */}
              {cooldownActive && (
                <div className="cooldown-message">
                  Siguiente mensaje disponible en: {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')}
                </div>
              )}
              
              <form className="contact-form" onSubmit={handleSubmit}>
                {/* Campo honeypot - invisible para usuarios, visible para bots */}
                <input
                  type="text"
                  name="website"
                  style={{ display: 'none' }}
                  onChange={handleHoneypotChange}
                  tabIndex="-1"
                  autoComplete="off"
                />
                
                <h2 className='contact-label'>Nombre completo</h2>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required 
                  disabled={isSubmitting || cooldownActive}
                  placeholder="Ingresa tu nombre completo"
                />
                
                <h2 className='contact-label'>Correo electrónico</h2>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  disabled={isSubmitting || cooldownActive}
                  placeholder="tu.email@ejemplo.com"
                />
                
                <h2 className='contact-label'>Comentario o mensaje</h2>
                <textarea 
                  name="message" 
                  rows="4" 
                  value={formData.message}
                  onChange={handleInputChange}
                  required 
                  disabled={isSubmitting || cooldownActive}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                />

                <button 
                  type="submit" 
                  className="send-button"
                  disabled={isSubmitting || cooldownActive}
                >
                  {isSubmitting ? 'Enviando...' : cooldownActive ? 'En espera...' : 'Enviar'}
                </button>
              </form>
            </div>
        </div>
      </main>

      <ContactButton />
      <Footer />
    </>
  );
};

export default Contact;