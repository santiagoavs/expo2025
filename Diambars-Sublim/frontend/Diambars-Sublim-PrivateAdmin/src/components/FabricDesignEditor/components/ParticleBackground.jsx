import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Fondo optimizado con menos capas de animación para mejor rendimiento
const OptimizedAnimatedBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  overflow: 'hidden',
  background: '#FFFFFF',
  
  // Optimización de renderizado
  willChange: 'transform',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  
  // Primera capa de gradientes principales (optimizada)
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at 25% 15%, rgba(31, 100, 191, 0.08) 0%, transparent 65%),
      radial-gradient(ellipse at 75% 25%, rgba(3, 44, 166, 0.06) 0%, transparent 70%),
      radial-gradient(ellipse at 20% 75%, rgba(4, 13, 191, 0.05) 0%, transparent 75%),
      radial-gradient(ellipse at 80% 80%, rgba(1, 3, 38, 0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 40%, rgba(31, 100, 191, 0.03) 0%, transparent 80%)
    `,
    backgroundSize: `
      250% 250%, 
      200% 200%, 
      280% 280%, 
      180% 180%, 
      300% 300%
    `,
    animation: 'optimizedBackgroundFlow 12s ease-in-out infinite alternate',
    zIndex: 1,
    
    // Optimización de performance
    willChange: 'transform',
    transform: 'translateZ(0)'
  },
  
  // Segunda capa de acentos brillantes (reducida)
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 30% 20%, rgba(255, 183, 77, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(255, 206, 84, 0.03) 0%, transparent 55%),
      radial-gradient(circle at 15% 80%, rgba(255, 159, 67, 0.03) 0%, transparent 45%),
      radial-gradient(circle at 85% 30%, rgba(255, 218, 121, 0.02) 0%, transparent 60%),
      radial-gradient(circle at 25% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 75% 70%, rgba(173, 216, 230, 0.03) 0%, transparent 35%)
    `,
    backgroundSize: `
      200% 200%,
      180% 180%,
      160% 160%,
      220% 220%,
      170% 170%,
      190% 190%
    `,
    animation: 'optimizedColorFlow 8s ease-in-out infinite, optimizedColorPulse 4s ease-in-out infinite',
    zIndex: 2,
    
    // Optimización
    willChange: 'transform',
    transform: 'translateZ(0)'
  },
  
  // Animaciones optimizadas con menos keyframes
  '@keyframes optimizedBackgroundFlow': {
    '0%': {
      backgroundPosition: `
        25% 15%,
        75% 25%,
        20% 75%,
        80% 80%,
        50% 40%
      `
    },
    '33%': {
      backgroundPosition: `
        35% 25%,
        65% 35%,
        30% 65%,
        70% 70%,
        40% 50%
      `
    },
    '67%': {
      backgroundPosition: `
        45% 35%,
        55% 45%,
        40% 55%,
        60% 60%,
        30% 60%
      `
    },
    '100%': {
      backgroundPosition: `
        55% 45%,
        45% 55%,
        50% 45%,
        50% 50%,
        20% 70%
      `
    }
  },
  
  // Animación de colores optimizada
  '@keyframes optimizedColorFlow': {
    '0%, 100%': {
      backgroundPosition: `
        30% 20%,
        70% 60%,
        15% 80%,
        85% 30%,
        25% 40%,
        75% 70%
      `,
      opacity: 0.4
    },
    '50%': {
      backgroundPosition: `
        40% 30%,
        60% 50%,
        25% 70%,
        75% 40%,
        35% 50%,
        65% 60%
      `,
      opacity: 0.8
    }
  },
  
  // Pulso suave optimizado
  '@keyframes optimizedColorPulse': {
    '0%, 100%': { 
      opacity: 0.3,
      transform: 'translateZ(0) scale(1)'
    },
    '50%': { 
      opacity: 0.6,
      transform: 'translateZ(0) scale(1.01)'
    }
  },
  
  // Media queries para optimización en dispositivos móviles
  '@media (max-width: 768px)': {
    '&::before, &::after': {
      animationDuration: '20s, 10s', // Animaciones más lentas en móvil
      backgroundSize: '300% 300%' // Menos detalle en móvil
    }
  },
  
  // Optimización para dispositivos con batería baja
  '@media (prefers-reduced-motion: reduce)': {
    '&::before, &::after': {
      animation: 'none'
    }
  }
}));

// Componente de overlay adicional para más profundidad (opcional)
const OverlayLayer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    radial-gradient(circle at 40% 30%, rgba(100, 149, 237, 0.03) 0%, transparent 80%),
    radial-gradient(circle at 60% 70%, rgba(70, 130, 180, 0.02) 0%, transparent 85%),
    radial-gradient(circle at 20% 40%, rgba(255, 105, 180, 0.02) 0%, transparent 70%)
  `,
  animation: 'overlayFloat 6s ease-in-out infinite',
  zIndex: 3,
  
  // Optimización
  willChange: 'transform',
  transform: 'translateZ(0)',
  
  '@keyframes overlayFloat': {
    '0%, 100%': { 
      opacity: 0.2,
      transform: 'translateZ(0) scale(1) rotate(0deg)'
    },
    '50%': { 
      opacity: 0.4,
      transform: 'translateZ(0) scale(1.02) rotate(0.5deg)'
    }
  }
});

const ParticleBackground = React.memo(() => {
  // Detectar si el usuario prefiere menos movimiento
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Detectar dispositivos móviles para optimización
  const isMobile = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  }, []);

  return (
    <OptimizedAnimatedBackground>
      {/* Solo mostrar overlay en desktop y si no se prefiere movimiento reducido */}
      {!isMobile && !prefersReducedMotion && <OverlayLayer />}
    </OptimizedAnimatedBackground>
  );
});

ParticleBackground.displayName = 'ParticleBackground';

export default ParticleBackground;