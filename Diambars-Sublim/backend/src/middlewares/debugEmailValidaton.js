import { validateEmail, isDisposableEmail } from "../utils/emailValidator.js";

export const debugEmailValidation = async (req, res, next) => {
  if (req.method === 'POST' && req.body.email) {
    const email = req.body.email;
    console.log('========== DEBUG EMAIL VALIDATION ==========');
    console.log(`Email a validar: ${email}`);
    
    try {
      const isValid = await validateEmail(email);
      console.log(`Resultado de validateEmail: ${isValid}`);
      
      const isDisposable = isDisposableEmail(email);
      console.log(`Resultado de isDisposableEmail: ${isDisposable}`);
    } catch (error) {
      console.error('Error en debug de validación:', error);
    }
    
    console.log('============================================');
  }
  next();
};