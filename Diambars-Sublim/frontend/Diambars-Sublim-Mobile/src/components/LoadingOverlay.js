// src/components/LoadingOverlay.js
// 📌 Componente reutilizable para mostrar una pantalla de carga en forma de overlay (cubre toda la pantalla).

import React from 'react';
import {
  View,                // Contenedor genérico en React Native.
  Text,                // Para mostrar texto en pantalla.
  StyleSheet,          // Manejo de estilos CSS en React Native.
  Modal,               // Componente nativo que se renderiza sobre todo el contenido.
  ActivityIndicator,   // Spinner de carga que da feedback visual al usuario.
} from 'react-native';

/**
 * Componente LoadingOverlay
 * 
 * Props:
 * - visible: boolean → controla si el overlay se muestra o no.
 * - message: string → mensaje opcional que se muestra debajo del spinner (default: "Cargando...").
 * - type: string → reservado para cambiar estilos o variantes de overlay (default: "default").
 */
const LoadingOverlay = ({ 
  visible, 
  message = 'Cargando...', 
  type = 'default' 
}) => {
  // 🔍 Logs de depuración para saber cuándo y cómo se renderiza.
  console.log('🌀 [LoadingOverlay] Renderizando con visible:', visible);
  console.log('🌀 [LoadingOverlay] Message:', message);
  console.log('🌀 [LoadingOverlay] Type:', type);

  // ⚡ Si "visible" es falso, no mostramos nada → retornamos null.
  if (!visible) {
    console.log('🌀 [LoadingOverlay] No visible, no renderizar modal');
    return null;
  }

  console.log('🌀 [LoadingOverlay] MOSTRANDO MODAL');

  // 🎨 Modal transparente que cubre toda la pantalla
  return (
    <Modal
      transparent              // El fondo será transparente para aplicar overlay.
      visible={visible}        // Se muestra solo si la prop "visible" es true.
      animationType="fade"     // Animación de desvanecimiento.
      statusBarTranslucent     // Permite que el modal pase detrás de la barra de estado.
    >
      {/* Fondo semitransparente para oscurecer la pantalla */}
      <View style={styles.overlay}>
        {/* Caja central con spinner y texto */}
        <View style={styles.container}>
          {/* Spinner de carga (círculo animado) */}
          <ActivityIndicator 
            size="large"       // Tamaño grande para visibilidad.
            color="#040DBF"    // Color del spinner (azul corporativo).
          />
          {/* Texto del mensaje de carga */}
          <Text style={styles.message}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

// 🎨 Estilos del componente
const styles = StyleSheet.create({
  overlay: {
    flex: 1,                                // Ocupa toda la pantalla.
    backgroundColor: 'rgba(0, 0, 0, 0.8)',  // Fondo negro semitransparente.
    justifyContent: 'center',               // Centra verticalmente el contenido.
    alignItems: 'center',                   // Centra horizontalmente.
  },
  container: {
    backgroundColor: '#ffffff',             // Fondo blanco del cuadro central.
    borderRadius: 16,                       // Bordes redondeados.
    padding: 32,                            // Espaciado interno amplio.
    alignItems: 'center',                   // Centra los elementos dentro.
    minWidth: 200,                          // Ancho mínimo para consistencia.
    // 📌 Sombra para dar sensación de elevación.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,                           // Elevación en Android.
  },
  message: {
    fontSize: 16,                           // Tamaño de letra moderado.
    fontWeight: '600',                      // Texto seminegrita.
    color: '#040DBF',                       // Azul corporativo.
    textAlign: 'center',                    // Centrado.
    marginTop: 16,                          // Espaciado arriba del spinner.
    marginBottom: 8,                        // Espaciado inferior.
  },
  debug: {
    fontSize: 14,                           // Texto pequeño.
    color: '#10b981',                       // Verde para debug (opcional).
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// 📤 Exportamos el componente para que pueda ser usado en otras pantallas.
export default LoadingOverlay;
