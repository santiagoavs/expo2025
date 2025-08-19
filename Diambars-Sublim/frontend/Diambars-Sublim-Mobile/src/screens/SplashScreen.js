// src/screens/SplashScreen.js - VERSIÓN SIMPLIFICADA SIN ERRORES
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  // Función para navegar al login después de 3 segundos
  useEffect(() => {
    console.log('[SplashScreen] Iniciando splash screen');
    
    const timer = setTimeout(() => {
      console.log('[SplashScreen] Navegando al Login');
      navigation.replace('Login');
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040DBF" />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          {/* Opción 1: Usar tu imagen (descomenta si tienes el archivo) */}
          {/* <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          /> */}
          
          {/* Opción 2: Logo temporal con icono */}
          <View style={styles.logoPlaceholder}>
            <Ionicons name="diamond" size={80} color="#ffffff" />
          </View>
        </View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>DIAMBARS</Text>
        </View>

        {/* Subtítulo */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>sublimado</Text>
        </View>

      </View>

      {/* Indicador de carga simple */}
      <View style={styles.loadingContainer}>
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Versión */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040DBF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
});

export default SplashScreen;