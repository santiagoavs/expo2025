// src/components/FabricDesignEditor/hooks/useFontManager.js
import { useState, useEffect, useCallback } from 'react';
import WebFont from 'webfontloader';
import fontService from '../../../services/FontService';

export const useFontManager = () => {
  const [fonts, setFonts] = useState({
    system: [],
    google: [],
    custom: [],
    all: []
  });
  const [googleFontsLoaded, setGoogleFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================ INICIALIZACIÓN ================
  useEffect(() => {
    initializeFonts();
  }, []);

  const initializeFonts = useCallback(async () => {
    try {
      // Cargar fuentes del sistema
      const systemFonts = fontService.getSystemFonts();
      
      // Cargar fuentes personalizadas si existen
      const customFonts = await loadCustomFonts();
      
      setFonts({
        system: systemFonts,
        google: [],
        custom: customFonts,
        all: [...systemFonts, ...customFonts]
      });

      console.log('✅ [FontManager] Fuentes del sistema cargadas:', systemFonts.length);
    } catch (error) {
      console.error('Error inicializando fuentes:', error);
      setError('Error cargando fuentes del sistema');
    }
  }, []);

  // ================ CARGA DE FUENTES DE GOOGLE ================
  const loadGoogleFonts = useCallback(async () => {
    if (googleFontsLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const googleFontsList = fontService.getGoogleFonts();
      
      // Cargar usando el FontService
      const loadedFonts = await fontService.loadGoogleFonts(googleFontsList);

      // Actualizar estado
      setGoogleFontsLoaded(true);
      setFonts(prev => ({
        ...prev,
        google: loadedFonts,
        all: [...prev.system, ...prev.custom, ...loadedFonts]
      }));

      console.log('✅ Google Fonts cargadas y estado actualizado:', loadedFonts.length);
    } catch (error) {
      console.error('❌ Error cargando Google Fonts:', error);
      setError('Error cargando fuentes de Google');
    } finally {
      setIsLoading(false);
    }
  }, [googleFontsLoaded, isLoading]);

  // ================ CARGA DE FUENTES PERSONALIZADAS ================
  const loadCustomFonts = useCallback(async () => {
    try {
      // Verificar si hay fuentes guardadas en localStorage
      const savedFonts = localStorage.getItem('customFonts');
      if (savedFonts) {
        const customFonts = JSON.parse(savedFonts);
        console.log('📁 Fuentes personalizadas cargadas desde localStorage:', customFonts.length);
        return customFonts;
      }
      return [];
    } catch (error) {
      console.error('Error cargando fuentes personalizadas:', error);
      return [];
    }
  }, []);

  // ================ CARGA DE FUENTE PERSONALIZADA ================
  const loadCustomFont = useCallback(async (fontFile, fontName) => {
    if (!fontFile) {
      throw new Error('No se proporcionó archivo de fuente');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usar el servicio de fuentes
      const loadedFontName = await fontService.loadCustomFont(fontFile, fontName);
      
      // Guardar en localStorage
      const savedFonts = JSON.parse(localStorage.getItem('customFonts') || '[]');
      const newFont = {
        name: loadedFontName,
        originalFileName: fontFile.name,
        loadedAt: new Date().toISOString(),
        size: fontFile.size
      };
      
      const updatedFonts = [...savedFonts, newFont];
      localStorage.setItem('customFonts', JSON.stringify(updatedFonts));
      
      // Actualizar estado
      setFonts(prev => ({
        ...prev,
        custom: [...prev.custom, loadedFontName],
        all: [...prev.system, ...prev.google, ...prev.custom, loadedFontName]
      }));

      console.log('✅ Fuente personalizada cargada:', loadedFontName);
      return loadedFontName;
    } catch (error) {
      console.error('❌ Error cargando fuente personalizada:', error);
      setError(`Error cargando fuente: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================ REMOCIÓN DE FUENTE PERSONALIZADA ================
  const removeCustomFont = useCallback(async (fontName) => {
    try {
      // Remover usando el servicio
      const success = fontService.removeCustomFont(fontName);
      
      if (success) {
        // Remover de localStorage
        const savedFonts = JSON.parse(localStorage.getItem('customFonts') || '[]');
        const updatedFonts = savedFonts.filter(font => font.name !== fontName);
        localStorage.setItem('customFonts', JSON.stringify(updatedFonts));
        
        // Actualizar estado
        setFonts(prev => ({
          ...prev,
          custom: prev.custom.filter(font => font !== fontName),
          all: prev.all.filter(font => font !== fontName)
        }));

        console.log('🗑️ Fuente personalizada removida:', fontName);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removiendo fuente personalizada:', error);
      setError(`Error removiendo fuente: ${error.message}`);
      return false;
    }
  }, []);

  // ================ VERIFICACIÓN DE FUENTES ================
  const isFontAvailable = useCallback((fontName) => {
    return fonts.all.includes(fontName) || fontService.isFontAvailable(fontName);
  }, [fonts.all]);

  // ================ OBTENER INFORMACIÓN DE FUENTE ================
  const getFontInfo = useCallback((fontName) => {
    return fontService.getFontInfo(fontName);
  }, []);

  // ================ OBTENER FUENTES POR CATEGORÍA ================
  const getFontsByCategory = useCallback((category) => {
    return fonts[category] || [];
  }, [fonts]);

  // ================ FILTRAR FUENTES ================
  const filterFonts = useCallback((searchTerm, category = 'all') => {
    const fontsToSearch = category === 'all' ? fonts.all : fonts[category] || [];
    
    if (!searchTerm) return fontsToSearch;
    
    return fontsToSearch.filter(font => 
      font.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fonts]);

  // ================ ESTADÍSTICAS DE FUENTES ================
  const getFontStats = useCallback(() => {
    return {
      total: fonts.all.length,
      system: fonts.system.length,
      google: fonts.google.length,
      custom: fonts.custom.length,
      loaded: googleFontsLoaded,
      isLoading
    };
  }, [fonts, googleFontsLoaded, isLoading]);

  // ================ LIMPIAR FUENTES PERSONALIZADAS ================
  const clearCustomFonts = useCallback(async () => {
    try {
      // Limpiar usando el servicio
      fontService.clearCustomFonts();
      
      // Limpiar localStorage
      localStorage.removeItem('customFonts');
      
      // Actualizar estado
      setFonts(prev => ({
        ...prev,
        custom: [],
        all: [...prev.system, ...prev.google]
      }));

      console.log('🧹 Todas las fuentes personalizadas removidas');
      return true;
    } catch (error) {
      console.error('Error limpiando fuentes personalizadas:', error);
      setError(`Error limpiando fuentes: ${error.message}`);
      return false;
    }
  }, []);

  // ================ EXPORTAR/IMPORTAR CONFIGURACIÓN ================
  const exportFontConfig = useCallback(() => {
    try {
      const config = {
        customFonts: fonts.custom,
        googleFonts: fonts.google,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'font-config.json';
      a.click();
      
      URL.revokeObjectURL(url);
      console.log('📤 Configuración de fuentes exportada');
    } catch (error) {
      console.error('Error exportando configuración:', error);
      setError('Error exportando configuración');
    }
  }, [fonts]);

  const importFontConfig = useCallback(async (configFile) => {
    if (!configFile) {
      throw new Error('No se proporcionó archivo de configuración');
    }

    try {
      const configText = await configFile.text();
      const config = JSON.parse(configText);
      
      // Validar configuración
      if (!config.customFonts || !Array.isArray(config.customFonts)) {
        throw new Error('Formato de configuración inválido');
      }
      
      // Aplicar configuración
      setFonts(prev => ({
        ...prev,
        custom: config.customFonts,
        all: [...prev.system, ...prev.google, ...config.customFonts]
      }));
      
      // Guardar en localStorage
      localStorage.setItem('customFonts', JSON.stringify(config.customFonts));
      
      console.log('📥 Configuración de fuentes importada:', config.customFonts.length);
      return true;
    } catch (error) {
      console.error('Error importando configuración:', error);
      setError(`Error importando configuración: ${error.message}`);
      throw error;
    }
  }, []);

  return {
    // Estado
    fonts,
    googleFontsLoaded,
    isLoading,
    error,
    
    // Acciones principales
    loadGoogleFonts,
    loadCustomFont,
    removeCustomFont,
    clearCustomFonts,
    
    // Utilidades
    isFontAvailable,
    getFontInfo,
    getFontsByCategory,
    filterFonts,
    getFontStats,
    
    // Importar/Exportar
    exportFontConfig,
    importFontConfig,
    
    // Reinicializar
    reinitialize: initializeFonts
  };
};

