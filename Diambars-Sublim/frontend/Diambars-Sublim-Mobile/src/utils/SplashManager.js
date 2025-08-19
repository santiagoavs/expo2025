// src/utils/SplashManager.js - VERSIÓN SIMPLE SIN expo-splash-screen

// Mensaje de consola para indicar que se ha cargado la versión simplificada
console.log('[SplashManager] Versión simplificada cargada');

// ------------------------------
// Clase SplashManager
// ------------------------------
class SplashManager {
  constructor() {
    // Estado interno que indica si la app está lista
    this.isReady = false;

    // Estado interno que indica si el splash ha sido ocultado
    this.splashHidden = false;
  }

  // ------------------------------
  // Método preventAutoHide
  // Simula la prevención del ocultamiento automático del splash
  // ------------------------------
  async preventAutoHide() {
    try {
      console.log('[SplashManager] preventAutoHide - modo simplificado');
      // En la versión simplificada siempre retorna true
      return true;
    } catch (error) {
      // Captura cualquier error y lo reporta en consola
      console.warn('[SplashManager] Error (simplificado):', error);
      return false;
    }
  }

  // ------------------------------
  // Método hideSplash
  // Simula ocultar el splash screen
  // ------------------------------
  async hideSplash() {
    try {
      // Solo oculta el splash si no se ha ocultado antes
      if (!this.splashHidden) {
        console.log('[SplashManager] hideSplash - modo simplificado');
        this.splashHidden = true; // Marca como ocultado
      }
      return true; // Retorna éxito
    } catch (error) {
      console.warn('[SplashManager] Error (simplificado):', error);
      return false; // Retorna fallo
    }
  }

  // ------------------------------
  // Método setReady
  // Marca la app como lista para ser usada
  // ------------------------------
  async setReady() {
    if (!this.isReady) {
      this.isReady = true; // Cambia el estado a listo
      console.log('[SplashManager] App marcada como lista');
      
      // Pequeño delay antes de ocultar el splash
      setTimeout(async () => {
        await this.hideSplash(); // Llama a hideSplash
      }, 100); // 100ms de retraso
    }
  }

  // ------------------------------
  // Método isAppReady
  // Retorna si la app está lista
  // ------------------------------
  isAppReady() {
    return this.isReady;
  }

  // ------------------------------
  // Método reset
  // Reinicia los estados internos
  // ------------------------------
  reset() {
    this.isReady = false;
    this.splashHidden = false;
  }
}

// ------------------------------
// Instancia singleton
// ------------------------------
const splashManager = new SplashManager();
export default splashManager; // Exporta la instancia única para toda la app

// ------------------------------
// Exportar funciones directas
// Permite usar los métodos sin acceder directamente al singleton
// ------------------------------
export const preventAutoHide = () => splashManager.preventAutoHide();
export const hideSplash = () => splashManager.hideSplash();
export const setReady = () => splashManager.setReady();
export const isAppReady = () => splashManager.isAppReady();
