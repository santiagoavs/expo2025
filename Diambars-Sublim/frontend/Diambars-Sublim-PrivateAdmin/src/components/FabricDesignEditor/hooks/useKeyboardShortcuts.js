// src/components/FabricDesignEditor/hooks/useKeyboardShortcuts.js
import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardShortcuts = () => {
  const shortcutsRef = useRef(new Map());
  const isEnabledRef = useRef(true);

  // ================ REGISTRAR ATAJO ================
  const registerShortcut = useCallback((key, callback, options = {}) => {
    const {
      description = '',
      category = 'general',
      preventDefault = true,
      enabled = true
    } = options;

    if (!key || typeof callback !== 'function') {
      console.warn('Shortcut inválido:', { key, callback });
      return false;
    }

    // Normalizar la tecla
    const normalizedKey = normalizeKey(key);
    
    // Verificar si ya existe
    if (shortcutsRef.current.has(normalizedKey)) {
      console.warn(`Shortcut ya registrado: ${normalizedKey}`);
      return false;
    }

    const shortcut = {
      key: normalizedKey,
      callback,
      description,
      category,
      preventDefault,
      enabled,
      registeredAt: new Date()
    };

    shortcutsRef.current.set(normalizedKey, shortcut);
    
    console.log(`⌨️ Shortcut registrado: ${normalizedKey}`, {
      description,
      category,
      enabled
    });

    return true;
  }, []);

  // ================ DESREGISTRAR ATAJO ================
  const unregisterShortcut = useCallback((key) => {
    const normalizedKey = normalizeKey(key);
    
    if (shortcutsRef.current.has(normalizedKey)) {
      const shortcut = shortcutsRef.current.get(normalizedKey);
      shortcutsRef.current.delete(normalizedKey);
      
      console.log(`🗑️ Shortcut removido: ${normalizedKey}`, {
        description: shortcut.description,
        category: shortcut.category
      });
      
      return true;
    }
    
    return false;
  }, []);

  // ================ HABILITAR/DESHABILITAR ATAJO ================
  const setShortcutEnabled = useCallback((key, enabled) => {
    const normalizedKey = normalizeKey(key);
    
    if (shortcutsRef.current.has(normalizedKey)) {
      const shortcut = shortcutsRef.current.get(normalizedKey);
      shortcut.enabled = enabled;
      
      console.log(`🔧 Shortcut ${enabled ? 'habilitado' : 'deshabilitado'}: ${normalizedKey}`);
      return true;
    }
    
    return false;
  }, []);

  // ================ HABILITAR/DESHABILITAR TODOS ================
  const setAllShortcutsEnabled = useCallback((enabled) => {
    isEnabledRef.current = enabled;
    
    shortcutsRef.current.forEach(shortcut => {
      shortcut.enabled = enabled;
    });
    
    console.log(`🔧 Todos los shortcuts ${enabled ? 'habilitados' : 'deshabilitados'}`);
  }, []);

  // ================ OBTENER ATAJOS ================
  const getShortcuts = useCallback((category = null) => {
    const shortcuts = Array.from(shortcutsRef.current.values());
    
    if (category) {
      return shortcuts.filter(shortcut => shortcut.category === category);
    }
    
    return shortcuts;
  }, []);

  // ================ BUSCAR ATAJOS ================
  const searchShortcuts = useCallback((searchTerm) => {
    const shortcuts = Array.from(shortcutsRef.current.values());
    
    if (!searchTerm) return shortcuts;
    
    return shortcuts.filter(shortcut => 
      shortcut.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, []);

  // ================ OBTENER ATAJOS POR CATEGORÍA ================
  const getShortcutsByCategory = useCallback(() => {
    const shortcuts = Array.from(shortcutsRef.current.values());
    const categories = {};
    
    shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });
    
    return categories;
  }, []);

  // ================ EXPORTAR CONFIGURACIÓN ================
  const exportShortcuts = useCallback(() => {
    try {
      const shortcuts = Array.from(shortcutsRef.current.values()).map(shortcut => ({
        key: shortcut.key,
        description: shortcut.description,
        category: shortcut.category,
        enabled: shortcut.enabled
      }));

      const exportData = {
        shortcuts,
        exportInfo: {
          exportedAt: new Date().toISOString(),
          totalShortcuts: shortcuts.length,
          version: '1.0.0'
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `keyboard-shortcuts-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      console.log('📤 Atajos de teclado exportados');
      
      return true;
    } catch (error) {
      console.error('Error exportando atajos:', error);
      return false;
    }
  }, []);

  // ================ IMPORTAR CONFIGURACIÓN ================
  const importShortcuts = useCallback(async (shortcutsFile) => {
    if (!shortcutsFile) {
      throw new Error('No se proporcionó archivo de atajos');
    }

    try {
      const shortcutsText = await shortcutsFile.text();
      const importData = JSON.parse(shortcutsText);
      
      // Validar formato
      if (!importData.shortcuts || !Array.isArray(importData.shortcuts)) {
        throw new Error('Formato de atajos inválido');
      }

      // Limpiar atajos existentes
      shortcutsRef.current.clear();
      
      // Importar nuevos atajos
      importData.shortcuts.forEach(shortcut => {
        // Solo importar la configuración, no los callbacks
        shortcutsRef.current.set(shortcut.key, {
          ...shortcut,
          callback: () => console.log(`Shortcut importado ejecutado: ${shortcut.key}`),
          registeredAt: new Date()
        });
      });
      
      console.log('📥 Atajos importados:', importData.shortcuts.length);
      return true;
    } catch (error) {
      console.error('Error importando atajos:', error);
      throw error;
    }
  }, []);

  // ================ MANEJADOR DE EVENTOS ================
  const handleKeyDown = useCallback((event) => {
    if (!isEnabledRef.current) return;

    // Ignorar si está en un input o textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // Construir la clave del shortcut
    const key = buildKeyFromEvent(event);
    
    // Buscar shortcut
    const shortcut = shortcutsRef.current.get(key);
    
    if (shortcut && shortcut.enabled) {
      try {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        
        shortcut.callback(event);
        
        console.log(`⌨️ Shortcut ejecutado: ${key}`, {
          description: shortcut.description,
          category: shortcut.category
        });
      } catch (error) {
        console.error(`Error ejecutando shortcut ${key}:`, error);
      }
    }
  }, []);

  // ================ UTILIDADES ================
  const normalizeKey = useCallback((key) => {
    return key.toLowerCase().replace(/\s+/g, '');
  }, []);

  const buildKeyFromEvent = useCallback((event) => {
    const parts = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    if (event.metaKey) parts.push('meta');
    
    // Agregar la tecla principal
    if (event.key) {
      let key = event.key.toLowerCase();
      
      // Normalizar teclas especiales
      const keyMap = {
        ' ': 'space',
        'escape': 'esc',
        'enter': 'enter',
        'tab': 'tab',
        'backspace': 'backspace',
        'delete': 'delete',
        'arrowup': 'up',
        'arrowdown': 'down',
        'arrowleft': 'left',
        'arrowright': 'right',
        'pageup': 'pageup',
        'pagedown': 'pagedown',
        'home': 'home',
        'end': 'end',
        'insert': 'insert',
        'f1': 'f1',
        'f2': 'f2',
        'f3': 'f3',
        'f4': 'f4',
        'f5': 'f5',
        'f6': 'f6',
        'f7': 'f7',
        'f8': 'f8',
        'f9': 'f9',
        'f10': 'f10',
        'f11': 'f11',
        'f12': 'f12'
      };
      
      key = keyMap[key] || key;
      parts.push(key);
    }
    
    return parts.join('+');
  }, []);

  // ================ ESTADÍSTICAS ================
  const getShortcutsStats = useCallback(() => {
    const shortcuts = Array.from(shortcutsRef.current.values());
    
    return {
      total: shortcuts.length,
      enabled: shortcuts.filter(s => s.enabled).length,
      disabled: shortcuts.filter(s => !s.enabled).length,
      categories: Object.keys(getShortcutsByCategory()),
      isEnabled: isEnabledRef.current
    };
  }, [getShortcutsByCategory]);

  // ================ LIMPIAR TODOS ================
  const clearAllShortcuts = useCallback(() => {
    const count = shortcutsRef.current.size;
    shortcutsRef.current.clear();
    
    console.log(`🧹 ${count} shortcuts removidos`);
    return count;
  }, []);

  // ================ EFFECT ================
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Registro
    registerShortcut,
    unregisterShortcut,
    
    // Control
    setShortcutEnabled,
    setAllShortcutsEnabled,
    
    // Consulta
    getShortcuts,
    searchShortcuts,
    getShortcutsByCategory,
    getShortcutsStats,
    
    // Importar/Exportar
    exportShortcuts,
    importShortcuts,
    
    // Mantenimiento
    clearAllShortcuts,
    
    // Estado
    isEnabled: isEnabledRef.current,
    totalShortcuts: shortcutsRef.current.size
  };
};

