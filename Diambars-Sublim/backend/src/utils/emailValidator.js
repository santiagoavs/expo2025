import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolve = promisify(dns.resolve);

/**
 * Valida un correo electrónico verificando su formato y si el dominio existe
 * @param {string} email - El correo electrónico a validar
 * @returns {Promise<boolean>} - True si el correo es válido, false si no
 */
export async function validateEmail(email) {
  // Validación básica de formato
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    console.log(`Email inválido por formato: ${email}`);
    return false;
  }

  try {
    // Extraer el dominio del correo
    const domain = email.split('@')[1];
    
    // Lista de dominios populares que sabemos que son válidos
    const commonDomains = [
      'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com',
      'aol.com', 'protonmail.com', 'mail.com', 'zoho.com', 'gmx.com',
      'yandex.com', 'live.com', 'msn.com', 'me.com', 'mac.com',
      'googlemail.com', 'yahoo.es', 'yahoo.co.uk', 'yahoo.fr',
      'hotmail.es', 'hotmail.co.uk', 'hotmail.fr',
      'outlook.es', 'outlook.fr', 'outlook.de',
      'gmail.es', 'gmail.fr', 'gmail.de'
    ];
    
    // Si es un dominio común, asumimos que es válido
    if (commonDomains.includes(domain.toLowerCase())) {
      console.log(`Email válido (dominio común): ${email}`);
      return true;
    }
    
    // Intentamos verificar los registros MX (mail exchanger)
    try {
      const mxRecords = await resolveMx(domain);
      if (Array.isArray(mxRecords) && mxRecords.length > 0) {
        console.log(`Email válido (MX): ${email}`);
        return true;
      }
    } catch (mxError) {
      console.log(`No se encontraron registros MX para: ${domain}`);
      // Continuamos con otras verificaciones
    }
    
    // Intentamos verificar los registros NS (name server)
    try {
      const nsRecords = await resolveNs(domain);
      if (Array.isArray(nsRecords) && nsRecords.length > 0) {
        console.log(`Email válido (NS): ${email}`);
        return true;
      }
    } catch (nsError) {
      console.log(`No se encontraron registros NS para: ${domain}`);
      // Continuamos con otras verificaciones
    }
    
    // Intentamos verificar cualquier registro
    try {
      const records = await resolve(domain);
      if (Array.isArray(records) && records.length > 0) {
        console.log(`Email válido (A/AAAA): ${email}`);
        return true;
      }
    } catch (resolveError) {
      console.log(`No se encontraron registros para: ${domain}`);
    }
    
    // Si llegamos aquí, no pudimos verificar que el dominio existe
    console.log(`Email inválido (dominio parece no existir): ${email}`);
    return false;
  } catch (error) {
    console.error('Error crítico al validar dominio de correo:', error);
    // En caso de error crítico, permitimos el registro como respaldo
    // pero registramos el error para investigación
    return true;
  }
}

/**
 * Lista ampliada de dominios de correo temporales o desechables
 */
const disposableEmailDomains = [
  'tempmail.com', 'temp-mail.org', 'fakeinbox.com', 'guerrillamail.com', 
  'yopmail.com', 'mailinator.com', 'trashmail.com', 'mailnesia.com',
  'maildrop.cc', '10minutemail.com', 'getnada.com', 'dispostable.com',
  'throwawaymail.com', 'getairmail.com', 'emailondeck.com', 'tempr.email',
  'spamgourmet.com', 'mintemail.com', 'mohmal.com', 'disposable-email.com',
  'sharklasers.com', 'guerrillamail.info', 'grr.la', 'maildrop.xyz',
  'mailforspam.com', 'mytrashmail.com', 'mt2015.com', 'mt2014.com',
  'spamherelots.com', 'tempemail.net', 'safetymail.info', 'mailcatch.com',
  'jetable.org', 'nospam.ze.tc', 'hulapla.de', 'mailexpire.com', 
  'emailsensei.com', 'emailtemporario.com.br', 'disposableinbox.com',
  'spambox.us', 'spambox.me', 'spambox.xyz', 'illitopuria.com' // Añadido el dominio que mencionaste
];

/**
 * Verifica si un correo es de un dominio temporal o desechable
 * @param {string} email - El correo electrónico a verificar
 * @returns {boolean} - True si es un correo desechable
 */
export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const domain = email.split('@')[1].toLowerCase();
  
  return disposableEmailDomains.some(d => domain.includes(d.toLowerCase()));
}

export default {
  validateEmail,
  isDisposableEmail
};