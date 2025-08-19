// 📌 Importamos React, la librería principal para crear componentes en React Native
import React from 'react';
// 📌 Importamos componentes básicos de React Native
import {
  View,              // Contenedor genérico
  Text,              // Texto en pantalla
  TouchableOpacity,  // Botones táctiles
  StyleSheet,        // Definición de estilos
  Modal,             // Ventanas modales (alertas, popups)
  Animated,          // Animaciones nativas
  Dimensions,        // Para obtener dimensiones de la pantalla
} from 'react-native';
// 📌 Importamos íconos de la librería de Expo
import { Ionicons } from '@expo/vector-icons';

// 📌 Obtenemos el ancho de la pantalla del dispositivo
const { width } = Dimensions.get('window');

// 📌 Definimos el componente principal de la alerta
const CustomAlert = ({ 
  visible,               // ✅ Booleano que indica si la alerta está visible o no
  type = 'success',      // ✅ Tipo de alerta: "success", "error", "warning", "info"
  title,                 // ✅ Texto principal de la alerta (título)
  message,               // ✅ Texto opcional adicional
  onConfirm,             // ✅ Función que se ejecuta cuando se presiona "confirmar"
  onCancel,              // ✅ Función que se ejecuta cuando se presiona "cancelar"
  confirmText = 'Continuar', // ✅ Texto del botón de confirmación
  cancelText = 'Cancelar',   // ✅ Texto del botón de cancelar
  showCancel = false     // ✅ Si se debe mostrar el botón cancelar
}) => {
  // 📌 Creamos una referencia para la escala de animación (inicia en 0 → invisible)
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  // 📌 Creamos una referencia para la opacidad (inicia en 0 → transparente)
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  // 📌 Hook que detecta cambios en la visibilidad de la alerta
  React.useEffect(() => {
    if (visible) {
      // ✅ Si la alerta es visible → animamos entrada (escala y opacidad)
      Animated.parallel([ // Ejecuta varias animaciones en paralelo
        Animated.spring(scaleValue, { // Animación de rebote
          toValue: 1,    // Escala final (tamaño normal)
          tension: 50,   // Tensión de rebote
          friction: 7,   // Fricción → suaviza la animación
          useNativeDriver: true, // Usa motor nativo de animación
        }),
        Animated.timing(opacityValue, { // Animación de opacidad
          toValue: 1,    // Opacidad completa (visible)
          duration: 300, // Duración en ms
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // ❌ Si la alerta NO es visible → animamos salida (se oculta)
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,    // Se reduce a 0 (desaparece con escala)
          duration: 200, // Duración más rápida
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,    // Opacidad 0 (invisible)
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]); // 👀 Se ejecuta cada vez que cambia la prop `visible`

  // 📌 Función que devuelve configuración visual según el tipo de alerta
  const getAlertConfig = () => {
    switch (type) {
      case 'success': // ✅ Éxito
        return {
          icon: 'checkmark-circle',   // Icono de éxito
          iconColor: '#10b981',       // Verde esmeralda
          backgroundColor: '#f0fdf4', // Fondo verde muy claro
          borderColor: '#bbf7d0',     // Borde verde suave
          titleColor: '#065f46',      // Verde oscuro para el título
          messageColor: '#047857',    // Verde medio para el mensaje
          buttonColor: '#10b981',     // Botón verde
        };
      case 'error': // ❌ Error
        return {
          icon: 'close-circle',
          iconColor: '#ef4444',       // Rojo
          backgroundColor: '#fef2f2', // Fondo rojo claro
          borderColor: '#fecaca',
          titleColor: '#991b1b',      // Rojo oscuro
          messageColor: '#dc2626',
          buttonColor: '#ef4444',     // Botón rojo
        };
      case 'warning': // ⚠️ Advertencia
        return {
          icon: 'warning',
          iconColor: '#f59e0b',       // Naranja
          backgroundColor: '#fffbeb', // Fondo amarillo pálido
          borderColor: '#fed7aa',
          titleColor: '#92400e',      // Marrón oscuro
          messageColor: '#d97706',
          buttonColor: '#f59e0b',     // Botón naranja
        };
      case 'info': // ℹ️ Información
        return {
          icon: 'information-circle',
          iconColor: '#3b82f6',       // Azul
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          titleColor: '#1e40af',
          messageColor: '#2563eb',
          buttonColor: '#3b82f6',
        };
      default: // 📌 Configuración por defecto
        return {
          icon: 'information-circle',
          iconColor: '#040DBF',       // Azul oscuro personalizado
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0',
          titleColor: '#010326',
          messageColor: '#64748b',
          buttonColor: '#040DBF',
        };
    }
  };

  // 📌 Guardamos la configuración según el tipo de alerta recibido
  const config = getAlertConfig();

  // 📌 Renderizado del componente
  return (
    <Modal
      transparent   // ✅ Hace el modal transparente (solo muestra su contenido)
      visible={visible} // ✅ Controla si el modal está abierto o cerrado
      animationType="none" // 🚫 No usamos animación por defecto (usamos Animated manual)
      statusBarTranslucent // ✅ Permite que el modal cubra la barra de estado
    >
      {/* 📌 Fondo oscuro con opacidad animada */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityValue } // Se anima la opacidad
        ]}
      >
        {/* 📌 Caja principal de la alerta (con animación de escala) */}
        <Animated.View
          style={[
            styles.alertContainer,
            {
              backgroundColor: config.backgroundColor, // Fondo según tipo
              borderColor: config.borderColor,         // Borde según tipo
              transform: [{ scale: scaleValue }],      // Escala animada
            },
          ]}
        >
          {/* 📌 Ícono dentro de un círculo */}
          <View style={[styles.iconContainer, { backgroundColor: config.iconColor + '20' }]}>
            <Ionicons name={config.icon} size={40} color={config.iconColor} />
          </View>

          {/* 📌 Título de la alerta */}
          <Text style={[styles.title, { color: config.titleColor }]}>
            {title}
          </Text>

          {/* 📌 Mensaje opcional (solo si existe) */}
          {message && (
            <Text style={[styles.message, { color: config.messageColor }]}>
              {message}
            </Text>
          )}

          {/* 📌 Contenedor de botones */}
          <View style={styles.buttonsContainer}>
            {/* 📌 Botón de cancelar (opcional) */}
            {showCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            {/* 📌 Botón de confirmar */}
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: config.buttonColor }, // Color según tipo
                showCancel && styles.confirmButtonWithCancel // Ajuste si hay dos botones
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// 🎨 Estilos de la alerta
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: width - 40,      // Ancho dinámico
    maxWidth: 360,          // Máximo 360px
    backgroundColor: '#ffffff',
    borderRadius: 24,       // Bordes redondeados
    borderWidth: 1,
    padding: 32,            // Padding interno
    alignItems: 'center',
    shadowColor: '#000',    // Sombra
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,          // Sombra en Android
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,       // Círculo perfecto
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',      // Negrita
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,     // Espaciado entre letras
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,         // Altura de línea para mejor lectura
    marginBottom: 32,
    fontWeight: '400',
  },
  buttonsContainer: {
    flexDirection: 'row',   // Botones en fila
    width: '100%',
    gap: 12,                // Espacio entre botones
  },
  button: {
    flex: 1,                // Se adapta al ancho
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#040DBF', // Azul por defecto
    shadowColor: '#040DBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmButtonWithCancel: {
    flex: 1.2, // ✅ Botón "confirmar" un poco más ancho si hay botón "cancelar"
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e2e8f0', // Gris claro
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: '#64748b', // Gris oscuro
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

// 📌 Exportamos el componente para poder usarlo en la app
export default CustomAlert;
