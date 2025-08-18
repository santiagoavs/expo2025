// src/utils/SplashManager.js - VERSIÓN SIMPLE SIN expo-splash-screen
console.log('[SplashManager] Versión simplificada cargada');

class SplashManager {
  constructor() {
    this.isReady = false;
    this.splashHidden = false;
  }

  // Versión simplificada sin expo-splash-screen
  async preventAutoHide() {
    try {
      console.log('[SplashManager] preventAutoHide - modo simplificado');
      return true;
    } catch (error) {
      console.warn('[SplashManager] Error (simplificado):', error);
      return false;
    }
  }

  async hideSplash() {
    try {
      if (!this.splashHidden) {
        console.log('[SplashManager] hideSplash - modo simplificado');
        this.splashHidden = true;
      }
      return true;
    } catch (error) {
      console.warn('[SplashManager] Error (simplificado):', error);
      return false;
    }
  }

  async setReady() {
    if (!this.isReady) {
      this.isReady = true;
      console.log('[SplashManager] App marcada como lista');
      
      setTimeout(async () => {
        await this.hideSplash();
      }, 100);
    }
  }

  isAppReady() {
    return this.isReady;
  }

  reset() {
    this.isReady = false;
    this.splashHidden = false;
  }
}

// Exportar instancia singleton
const splashManager = new SplashManager();
export default splashManager;

// Exportar también funciones directas para compatibilidad
export const preventAutoHide = () => splashManager.preventAutoHide();
export const hideSplash = () => splashManager.hideSplash();
export const setReady = () => splashManager.setReady();
export const isAppReady = () => splashManager.isAppReady();