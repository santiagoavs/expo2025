import React, { useEffect, useRef, useState } from 'react';
// Importa React y hooks: 
// useEffect → para efectos secundarios (ej. animaciones y temporizadores)
// useRef → para referencias persistentes a valores mutables (animaciones)
// useState → para manejar estados locales del componente

import { View, Text, StyleSheet, Animated } from 'react-native';
// Importa componentes de React Native:
// View → contenedor de UI
// Text → para mostrar texto
// StyleSheet → para definir estilos
// Animated → para animaciones de valor y estilo

import { useNavigation } from '@react-navigation/native';
// Hook para navegación, permite redirigir a otras pantallas

const LoadingScreen = () => {
  const navigation = useNavigation();
  // Hook de navegación para redirigir al login cuando finalice la carga

  const [loadingText, setLoadingText] = useState('Cargando...');
  // Estado para mostrar el texto actual de carga en pantalla
  const [progress, setProgress] = useState(0);
  // Estado que representa el porcentaje de progreso de la barra

  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Referencia a un valor animado para opacidad (fade-in)
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Referencia a un valor animado para ancho de la barra de progreso

  useEffect(() => {
    console.log('[LoadingScreen] Iniciando proceso de carga');

    // Array de pasos de carga con texto y duración de cada paso
    const loadingSteps = [
      { text: 'Inicializando aplicación...', duration: 1200 },
      { text: 'Cargando componentes...', duration: 1200 },
      { text: 'Configurando navegación...', duration: 1200 },
      { text: 'Conectando servicios...', duration: 1200 },
      { text: 'Preparando interfaz...', duration: 1200 },
      { text: 'Optimizando rendimiento...', duration: 1200 },
      { text: 'Verificando recursos...', duration: 1200 },
      { text: 'Finalizando carga...', duration: 1200 },
    ];

    let currentStep = 0; 
    // Contador para iterar sobre los pasos de carga

    // Función recursiva que ejecuta cada paso de carga
    const runStep = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingText(step.text); // Actualiza el texto de carga

        // Calcula el porcentaje de progreso según el paso actual
        const targetProgress = Math.round(((currentStep + 1) / loadingSteps.length) * 100);
        setProgress(targetProgress);

        // Animación del progreso (ancho de barra) usando Animated.timing
        Animated.timing(progressAnim, {
          toValue: targetProgress, // Meta del valor animado
          duration: step.duration, // Duración de la animación
          useNativeDriver: false, // Se usa falso para animar ancho (no soporta native driver)
        }).start();

        // Espera la duración del paso y luego llama al siguiente paso
        setTimeout(() => {
          currentStep++;
          runStep(); // Llamada recursiva para siguiente paso
        }, step.duration);
      } else {
        // Cuando todos los pasos se completan
        setTimeout(() => {
          console.log('[LoadingScreen] Carga completada, navegando al Login');
          navigation.replace('Login'); 
          // Reemplaza pantalla actual por Login
        }, 800); // Pequeño delay final antes de navegar
      }
    };

    // Animación de fade-in al iniciar la pantalla
    Animated.timing(fadeAnim, {
      toValue: 1, // Opacidad final 1
      duration: 800, // 0.8 segundos
      useNativeDriver: true, // Animación nativa para mejor performance
    }).start();

    // Retardo inicial antes de iniciar los pasos de carga
    const startDelay = setTimeout(runStep, 500);

    // Cleanup al desmontar el componente
    return () => clearTimeout(startDelay);
  }, [navigation, fadeAnim, progressAnim]);
  // useEffect depende de navigation y referencias de animación

  return (
    <View style={styles.background}>
      {/* Fondo sólido azul */}
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Contenedor principal con animación de opacidad */}
        <Text style={styles.loadingText}>{loadingText}</Text>
        {/* Texto que muestra el paso de carga actual */}

        <View style={styles.progressBar}>
          {/* Barra de progreso */}
          <Animated.View
            style={[
              styles.progress,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {/* Barra interna que crece según progressAnim */}
        </View>

        <Text style={styles.progressText}>{progress}%</Text>
        {/* Texto que muestra porcentaje numérico */}
      </Animated.View>
    </View>
  );
};

// Estilos de la pantalla
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB', // Fondo azul sólido
  },
  container: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
  },
  loadingText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#fff', // Texto blanco sobre azul
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    width: 250,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default LoadingScreen;
// Exporta el componente para ser usado en la app
