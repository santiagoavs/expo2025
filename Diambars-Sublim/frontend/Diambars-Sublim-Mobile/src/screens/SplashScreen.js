// src/screens/SplashScreen.js - ANIMACIONES SUAVES Y MINIMALISTAS

import React, { useEffect } from 'react';
// Importa React y el hook useEffect, que permite ejecutar efectos secundarios al montar el componente

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Animated
} from 'react-native';
// Importa componentes de React Native:
// View → contenedor principal
// Text → para mostrar texto
// StyleSheet → para estilos organizados
// Dimensions → para obtener dimensiones de la pantalla
// StatusBar → control de la barra superior
// Image → mostrar imágenes
// Animated → para animaciones declarativas

import { SafeAreaView } from 'react-native-safe-area-context';
// SafeAreaView evita que el contenido choque con notch, barra superior o inferior

import { useNavigation } from '@react-navigation/native';
// Hook para manejar navegación entre pantallas

// ------------------------------
// Dimensiones de pantalla
// ------------------------------
const { width, height } = Dimensions.get('window');
// width y height contienen el tamaño actual de la pantalla

// ------------------------------
// Componente principal SplashScreen
// ------------------------------
const SplashScreen = () => {
  const navigation = useNavigation();
  // Hook para controlar navegación

  // ------------------------------
  // Valores animados iniciales
  // ------------------------------
  const fadeAnim = new Animated.Value(0);            // Fade-in del fondo
  const logoScaleAnim = new Animated.Value(0.8);    // Escala inicial del logo
  const logoOpacityAnim = new Animated.Value(0);    // Opacidad inicial del logo
  const titleOpacityAnim = new Animated.Value(0);   // Opacidad del título
  const titleTranslateAnim = new Animated.Value(20);// Movimiento vertical del título
  const subtitleOpacityAnim = new Animated.Value(0);// Opacidad del subtítulo
  const dotsOpacityAnim = new Animated.Value(0);    // Opacidad de los puntos de carga

  // ------------------------------
  // useEffect para animaciones y navegación
  // ------------------------------
  useEffect(() => {
    console.log('[SplashScreen] Iniciando animaciones suaves y minimalistas');

    // Secuencia principal de animaciones
    Animated.sequence([
      // 1. Fade in del fondo
      Animated.timing(fadeAnim, {
        toValue: 1,           // Valor final de opacidad
        duration: 800,        // 800ms de duración
        useNativeDriver: true,// Usar driver nativo para mejor rendimiento
      }),
      
      // 2. Logo aparece suavemente
      Animated.parallel([
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,      // Escala final normal
          tension: 20,     // Suaviza rebote
          friction: 8,     // Controla resistencia
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Pausa breve
      Animated.delay(300),
      
      // 4. Título aparece con movimiento sutil
      Animated.parallel([
        Animated.timing(titleOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateAnim, {
          toValue: 0,   // Se mueve hacia su posición original
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      // 5. Subtítulo con delay mínimo
      Animated.delay(200),
      Animated.timing(subtitleOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      
      // 6. Puntos de carga
      Animated.delay(400),
      Animated.timing(dotsOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // ------------------------------
    // Animación de "breathing" para el logo
    // ------------------------------
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScaleAnim, {
          toValue: 1.02,    // Pequeño agrandamiento
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScaleAnim, {
          toValue: 1,       // Vuelve al tamaño original
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Inicia la animación de breathing después de 2.5 segundos
    setTimeout(() => {
      breathingAnimation.start();
    }, 2500);

    // ------------------------------
    // Navegación automática a LoadingScreen después de 4s
    // ------------------------------
    const timer = setTimeout(() => {
      console.log('[SplashScreen] Navegando a LoadingScreen');
      navigation.replace('Loading'); // Reemplaza la pantalla actual
    }, 4000);

    // Cleanup: detener animaciones y timers
    return () => {
      clearTimeout(timer);
      breathingAnimation.stop();
    };
  }, [navigation]);

  // ------------------------------
  // Renderizado principal
  // ------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      
      {/* Fondo con opacidad animada */}
      <Animated.View 
        style={[
          styles.background,
          {
            opacity: fadeAnim,
          }
        ]}
      />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        
        {/* Logo con animación */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacityAnim,
              transform: [
                { scale: logoScaleAnim }
              ],
            }
          ]}
        >
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Título */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacityAnim,
              transform: [{ translateY: titleTranslateAnim }],
            }
          ]}
        >
          <Text style={styles.title}>DIAMBARS</Text>
        </Animated.View>

        {/* Subtítulo */}
        <Animated.View 
          style={[
            styles.subtitleContainer,
            { opacity: subtitleOpacityAnim }
          ]}
        >
          <Text style={styles.subtitle}>sublimado</Text>
        </Animated.View>

      </View>

      {/* Puntos de carga minimalistas */}
      <Animated.View 
        style={[
          styles.loadingContainer,
          { opacity: dotsOpacityAnim }
        ]}
      >
        <MinimalLoadingDots />
      </Animated.View>

    </SafeAreaView>
  );
};

// ------------------------------
// Componente para puntos de carga minimalistas
// ------------------------------
const MinimalLoadingDots = () => {
  const dot1Anim = new Animated.Value(0.4);
  const dot2Anim = new Animated.Value(0.4);
  const dot3Anim = new Animated.Value(0.4);

  useEffect(() => {
    // Función para animar un punto
    const createDotAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay), // Delay inicial
          Animated.timing(animValue, {
            toValue: 1,        // Aumenta opacidad
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.4,      // Vuelve a opacidad mínima
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Ejecuta animaciones paralelas para los 3 puntos con delays distintos
    Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 300),
      createDotAnimation(dot3Anim, 600),
    ]).start();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
    </View>
  );
};

// ------------------------------
// Estilos del SplashScreen
// ------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563EB', // Fondo azul
  },
  background: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#2563EB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 130,
    height: 130,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 44,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 6,
    textAlign: 'center',
  },
  subtitleContainer: {
    marginBottom: 100,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0, right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

// Exporta el componente
export default SplashScreen;
