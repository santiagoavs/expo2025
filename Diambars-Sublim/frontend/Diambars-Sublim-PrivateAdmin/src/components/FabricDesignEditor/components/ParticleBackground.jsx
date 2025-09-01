import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Fondo animado estilo NotFound404 pero infinito y con más partículas
const AnimatedBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  overflow: 'hidden',
  background: '#FFFFFF',
  
  // Primera capa de gradientes radiales (como NotFound404)
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at 25% 15%, rgba(31, 100, 191, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 75% 25%, rgba(3, 44, 166, 0.10) 0%, transparent 65%),
      radial-gradient(ellipse at 20% 75%, rgba(4, 13, 191, 0.08) 0%, transparent 70%),
      radial-gradient(ellipse at 80% 80%, rgba(1, 3, 38, 0.06) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 40%, rgba(31, 100, 191, 0.05) 0%, transparent 75%),
      radial-gradient(ellipse at 10% 50%, rgba(64, 123, 255, 0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 45%, rgba(0, 84, 164, 0.07) 0%, transparent 60%),
      radial-gradient(ellipse at 35% 85%, rgba(78, 205, 196, 0.06) 0%, transparent 45%),
      radial-gradient(ellipse at 65% 15%, rgba(150, 206, 180, 0.05) 0%, transparent 55%),
      radial-gradient(ellipse at 15% 25%, rgba(255, 107, 53, 0.04) 0%, transparent 40%)
    `,
    backgroundSize: `
      200% 200%, 
      180% 180%, 
      220% 220%, 
      170% 170%, 
      240% 240%, 
      160% 160%,
      150% 150%,
      190% 190%,
      210% 210%,
      140% 140%
    `,
    animation: 'backgroundFlow 8s ease-in-out infinite alternate',
    zIndex: 1
  },
  
  // Segunda capa de partículas brillantes (estrellas)
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 30% 20%, rgba(255, 183, 77, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 70% 60%, rgba(255, 206, 84, 0.06) 0%, transparent 45%),
      radial-gradient(circle at 15% 80%, rgba(255, 159, 67, 0.05) 0%, transparent 35%),
      radial-gradient(circle at 85% 30%, rgba(255, 218, 121, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 50% 70%, rgba(255, 195, 113, 0.07) 0%, transparent 38%),
      radial-gradient(circle at 25% 40%, rgba(255, 255, 255, 0.09) 0%, transparent 30%),
      radial-gradient(circle at 75% 70%, rgba(255, 215, 0, 0.06) 0%, transparent 35%),
      radial-gradient(circle at 40% 90%, rgba(173, 216, 230, 0.05) 0%, transparent 25%),
      radial-gradient(circle at 90% 80%, rgba(255, 182, 193, 0.04) 0%, transparent 30%),
      radial-gradient(circle at 10% 60%, rgba(221, 160, 221, 0.05) 0%, transparent 35%),
      radial-gradient(circle at 60% 10%, rgba(135, 206, 250, 0.06) 0%, transparent 40%),
      radial-gradient(circle at 80% 90%, rgba(255, 218, 185, 0.04) 0%, transparent 28%)
    `,
    backgroundSize: `
      150% 150%,
      140% 140%,
      130% 130%,
      160% 160%,
      120% 120%,
      145% 145%,
      155% 155%,
      135% 135%,
      165% 165%,
      125% 125%,
      170% 170%,
      140% 140%
    `,
    animation: 'flashColors 6s ease-in-out infinite, colorAppear 3s ease-in-out infinite',
    zIndex: 2
  },
  
  // Tercera capa de overlay con destellos adicionales
  '& .overlay-layer': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 40% 30%, rgba(100, 149, 237, 0.06) 0%, transparent 70%),
      radial-gradient(circle at 60% 70%, rgba(70, 130, 180, 0.04) 0%, transparent 75%),
      radial-gradient(circle at 80% 20%, rgba(30, 144, 255, 0.03) 0%, transparent 65%),
      radial-gradient(circle at 20% 40%, rgba(255, 105, 180, 0.05) 0%, transparent 60%),
      radial-gradient(circle at 70% 85%, rgba(173, 216, 230, 0.04) 0%, transparent 55%),
      radial-gradient(circle at 45% 15%, rgba(255, 218, 185, 0.03) 0%, transparent 45%)
    `,
    animation: 'overlayAppear 4s ease-in-out infinite, overlayPulse 5s ease-in-out infinite',
    zIndex: 3
  },
  
  // Animaciones del fondo principal
  '@keyframes backgroundFlow': {
    '0%': {
      backgroundPosition: `
        25% 15%,
        75% 25%,
        20% 75%,
        80% 80%,
        50% 40%,
        10% 50%,
        90% 45%,
        35% 85%,
        65% 15%,
        15% 25%
      `
    },
    '25%': {
      backgroundPosition: `
        30% 20%,
        70% 30%,
        25% 70%,
        75% 75%,
        45% 45%,
        15% 45%,
        85% 50%,
        40% 80%,
        60% 20%,
        20% 30%
      `
    },
    '50%': {
      backgroundPosition: `
        35% 25%,
        65% 35%,
        30% 65%,
        70% 70%,
        40% 50%,
        20% 40%,
        80% 55%,
        45% 75%,
        55% 25%,
        25% 35%
      `
    },
    '75%': {
      backgroundPosition: `
        40% 30%,
        60% 40%,
        35% 60%,
        65% 65%,
        35% 55%,
        25% 35%,
        75% 60%,
        50% 70%,
        50% 30%,
        30% 40%
      `
    },
    '100%': {
      backgroundPosition: `
        45% 35%,
        55% 45%,
        40% 55%,
        60% 60%,
        30% 60%,
        30% 30%,
        70% 65%,
        55% 65%,
        45% 35%,
        35% 45%
      `
    }
  },
  
  // Animación de destellos de colores
  '@keyframes flashColors': {
    '0%': {
      backgroundPosition: `
        30% 20%,
        70% 60%,
        15% 80%,
        85% 30%,
        50% 70%,
        25% 40%,
        75% 70%,
        40% 90%,
        90% 80%,
        10% 60%,
        60% 10%,
        80% 90%
      `,
      opacity: 0.3
    },
    '25%': {
      backgroundPosition: `
        35% 25%,
        65% 55%,
        20% 75%,
        80% 35%,
        45% 65%,
        30% 45%,
        70% 65%,
        45% 85%,
        85% 75%,
        15% 55%,
        55% 15%,
        75% 85%
      `,
      opacity: 0.8
    },
    '50%': {
      backgroundPosition: `
        40% 30%,
        60% 50%,
        25% 70%,
        75% 40%,
        40% 60%,
        35% 50%,
        65% 60%,
        50% 80%,
        80% 70%,
        20% 50%,
        50% 20%,
        70% 80%
      `,
      opacity: 1
    },
    '75%': {
      backgroundPosition: `
        45% 35%,
        55% 45%,
        30% 65%,
        70% 45%,
        35% 55%,
        40% 55%,
        60% 55%,
        55% 75%,
        75% 65%,
        25% 45%,
        45% 25%,
        65% 75%
      `,
      opacity: 0.6
    },
    '100%': {
      backgroundPosition: `
        50% 40%,
        50% 40%,
        35% 60%,
        65% 50%,
        30% 50%,
        45% 60%,
        55% 50%,
        60% 70%,
        70% 60%,
        30% 40%,
        40% 30%,
        60% 70%
      `,
      opacity: 0.2
    }
  },
  
  // Animación de aparición de colores
  '@keyframes colorAppear': {
    '0%, 100%': { 
      opacity: 0.3,
      transform: 'scale(1)'
    },
    '50%': { 
      opacity: 1,
      transform: 'scale(1.02)'
    }
  },
  
  // Animación de overlay
  '@keyframes overlayAppear': {
    '0%, 100%': { 
      opacity: 0.3,
      transform: 'scale(1)'
    },
    '50%': { 
      opacity: 0.8,
      transform: 'scale(1.01)'
    }
  },
  
  // Animación de pulso del overlay
  '@keyframes overlayPulse': {
    '0%, 100%': { 
      opacity: 0.3,
      transform: 'scale(1) rotate(0deg)'
    },
    '50%': { 
      opacity: 0.6,
      transform: 'scale(1.03) rotate(0.5deg)'
    }
  }
}));

const ParticleBackground = () => {
  return (
    <AnimatedBackground>
      <Box className="overlay-layer" />
    </AnimatedBackground>
  );
};

export default ParticleBackground;
