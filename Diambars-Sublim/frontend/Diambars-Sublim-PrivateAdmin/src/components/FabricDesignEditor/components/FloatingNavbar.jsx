import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Badge,
  Chip,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Stack, 
  ArrowClockwise, 
  FloppyDisk, 
  TextAa, 
  Image, 
  Shapes, 
  Palette, 
  MagicWand, 
  Eye, 
  EyeSlash, 
  Download, 
  Share, 
  Gear as Settings, 
  Question,
  ArrowCounterClockwise,
  Crop,
  Sparkle,
  ArrowsOut,
  ArrowCounterClockwise as Redo,
  ArrowClockwise as Undo,
  Lock,
  LockOpen as Unlock,
  SquaresFour,
  Ruler,
  Camera
} from '@phosphor-icons/react';
import Swal from 'sweetalert2';

// Navbar flotante con glassmorphism
const FloatingNavbarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '25px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1)
  `,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateX(-50%) translateY(-2px)',
    boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `
  }
}));

// Botones con glassmorphism y animaciones
const GlassButton = styled(IconButton)(({ theme, variant = 'default' }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.2), rgba(3, 44, 166, 0.15))'
    : 'rgba(255, 255, 255, 0.1)',
  border: variant === 'primary'
    ? '1px solid rgba(31, 100, 191, 0.3)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  color: variant === 'primary' ? '#1F64BF' : '#010326',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: variant === 'primary'
      ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.3), rgba(3, 44, 166, 0.25))'
      : 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: variant === 'primary'
      ? '0 8px 25px rgba(31, 100, 191, 0.3)'
      : '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  
  '&:active': {
    transform: 'translateY(0px) scale(0.95)'
  }
}));

// Separador visual
const Separator = styled(Box)({
  width: '1px',
  height: '32px',
  background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
  margin: '0 4px'
});

// Indicador de estado
const StatusIndicator = styled(Chip)(({ status }) => ({
  height: '24px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: status === 'saved' 
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))'
    : 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1))',
  color: status === 'saved' ? '#4CAF50' : '#FF9800',
  border: `1px solid ${status === 'saved' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  animation: status === 'saving' ? 'pulse 2s ease-in-out infinite' : 'none',
  
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.6 }
  }
}));

const FloatingNavbar = ({ 
  onToolSelect, 
  selectedTool, 
  onSave, 
  onUndo, 
  onRedo,
  canUndo = false,
  canRedo = false,
  isModified = false,
  onToggleGrid,
  onToggleRulers,
  onToggleSnap,
  onExport,
  onShare,
  onSettings
}) => {
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, modified

  // Función para mostrar SweetAlert
  const showAlert = (title, message, icon = 'info') => {
    Swal.fire({
      title,
      text: message,
      icon,
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      confirmButtonColor: '#1F64BF',
      borderRadius: '20px',
      customClass: {
        popup: 'glassmorphism-popup'
      }
    });
  };

  // Función para guardar con feedback
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onSave();
      setSaveStatus('saved');
      showAlert('¡Guardado!', 'El diseño se ha guardado exitosamente', 'success');
    } catch (error) {
      setSaveStatus('modified');
      showAlert('Error', 'No se pudo guardar el diseño', 'error');
    }
  };

  // Función para deshacer
  const handleUndo = () => {
    if (canUndo) {
      onUndo();
      showAlert('Deshacer', 'Acción deshecha', 'info');
    } else {
      showAlert('No disponible', 'No hay acciones para deshacer', 'warning');
    }
  };

  // Función para rehacer
  const handleRedo = () => {
    if (canRedo) {
      onRedo();
      showAlert('Rehacer', 'Acción rehecha', 'info');
    } else {
      showAlert('No disponible', 'No hay acciones para rehacer', 'warning');
    }
  };

  // Función para exportar
  const handleExport = () => {
    Swal.fire({
      title: 'Exportar Diseño',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Formato:</label>
            <select id="exportFormat" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
              <option value="png">PNG (Imagen)</option>
              <option value="jpg">JPG (Imagen)</option>
              <option value="svg">SVG (Vectorial)</option>
              <option value="pdf">PDF (Documento)</option>
            </select>
          </div>
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Calidad:</label>
            <select id="exportQuality" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
              <option value="high">Alta (300 DPI)</option>
              <option value="medium">Media (150 DPI)</option>
              <option value="low">Baja (72 DPI)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1F64BF',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        const format = document.getElementById('exportFormat').value;
        const quality = document.getElementById('exportQuality').value;
        onExport(format, quality);
        showAlert('Exportando...', `Diseño exportado en formato ${format.toUpperCase()}`, 'success');
      }
    });
  };

  // Función para compartir
  const handleShare = () => {
    Swal.fire({
      title: 'Compartir Diseño',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Enlace público:</label>
            <input type="text" id="shareLink" value="https://diambars.com/design/abc123" readonly 
                   style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd; background: #f5f5f5;">
          </div>
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Permisos:</label>
            <select id="sharePermissions" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
              <option value="view">Solo visualización</option>
              <option value="edit">Edición permitida</option>
              <option value="full">Control total</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Copiar Enlace',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#1F64BF',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText('https://diambars.com/design/abc123');
        showAlert('¡Copiado!', 'Enlace copiado al portapapeles', 'success');
      }
    });
  };

  // Función para configuración
  const handleSettings = () => {
    Swal.fire({
      title: 'Configuración del Editor',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tema:</label>
            <select id="themeSelect" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Idioma:</label>
            <select id="languageSelect" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Auto-guardado:</label>
            <select id="autosaveSelect" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
              <option value="30">Cada 30 segundos</option>
              <option value="60">Cada minuto</option>
              <option value="300">Cada 5 minutos</option>
              <option value="0">Desactivado</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1F64BF',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        const theme = document.getElementById('themeSelect').value;
        const language = document.getElementById('languageSelect').value;
        const autosave = document.getElementById('autosaveSelect').value;
        onSettings({ theme, language, autosave });
        showAlert('Configuración', 'Configuración guardada exitosamente', 'success');
      }
    });
  };

  return (
    <FloatingNavbarContainer>
      {/* Herramientas básicas */}
      <Grow in timeout={300}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Seleccionar (V)" arrow>
            <GlassButton
              variant={selectedTool === 'select' ? 'primary' : 'default'}
              onClick={() => onToolSelect('select')}
            >
              <Stack size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Texto (T)" arrow>
            <GlassButton
              variant={selectedTool === 'text' ? 'primary' : 'default'}
              onClick={() => onToolSelect('text')}
            >
              <TextAa size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Imagen (I)" arrow>
            <GlassButton
              variant={selectedTool === 'image' ? 'primary' : 'default'}
              onClick={() => onToolSelect('image')}
            >
              <Image size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Formas (S)" arrow>
            <GlassButton
              variant={selectedTool === 'shapes' ? 'primary' : 'default'}
              onClick={() => onToolSelect('shapes')}
            >
              <Shapes size={20} />
            </GlassButton>
          </Tooltip>
        </Box>
      </Grow>

      <Separator />

      {/* Herramientas de edición */}
      <Grow in timeout={400}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Deshacer (Ctrl+Z)" arrow>
            <GlassButton
              disabled={!canUndo}
              onClick={handleUndo}
            >
              <ArrowClockwise size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Rehacer (Ctrl+Y)" arrow>
            <GlassButton
              disabled={!canRedo}
              onClick={handleRedo}
            >
              <ArrowCounterClockwise size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Capas" arrow>
            <GlassButton onClick={() => showAlert('Capas', 'Gestor de capas - Próximamente', 'info')}>
              <Stack size={20} />
            </GlassButton>
          </Tooltip>
        </Box>
      </Grow>

      <Separator />

      {/* Herramientas de transformación */}
      <Grow in timeout={500}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Recortar" arrow>
            <GlassButton onClick={() => showAlert('Recortar', 'Herramienta de recorte - Próximamente', 'info')}>
              <Crop size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Efectos" arrow>
            <GlassButton onClick={() => showAlert('Efectos', 'Biblioteca de efectos - Próximamente', 'info')}>
              <Sparkle size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Transformar" arrow>
            <GlassButton onClick={() => showAlert('Transformar', 'Herramientas de transformación - Próximamente', 'info')}>
              <ArrowsOut size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Rotar" arrow>
            <GlassButton onClick={() => showAlert('Rotar', 'Rotación de elementos - Próximamente', 'info')}>
              <ArrowCounterClockwise size={20} />
            </GlassButton>
          </Tooltip>
        </Box>
      </Grow>

      <Separator />

      {/* Herramientas de visualización */}
      <Grow in timeout={600}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Cuadrícula" arrow>
            <GlassButton onClick={onToggleGrid}>
              <SquaresFour size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Reglas" arrow>
            <GlassButton onClick={onToggleRulers}>
              <Ruler size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Captura" arrow>
            <GlassButton onClick={() => showAlert('Captura', 'Captura de pantalla - Próximamente', 'info')}>
              <Camera size={20} />
            </GlassButton>
          </Tooltip>
        </Box>
      </Grow>

      <Separator />

      {/* Acciones principales */}
      <Grow in timeout={700}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Guardar (Ctrl+S)" arrow>
            <GlassButton
              variant="primary"
              onClick={handleSave}
            >
              <FloppyDisk size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Exportar" arrow>
            <GlassButton onClick={handleExport}>
              <Download size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Compartir" arrow>
            <GlassButton onClick={handleShare}>
              <Share size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Configuración" arrow>
            <GlassButton onClick={handleSettings}>
              <Settings size={20} />
            </GlassButton>
          </Tooltip>
          
          <Tooltip title="Ayuda" arrow>
            <GlassButton onClick={() => showAlert('Ayuda', 'Centro de ayuda - Próximamente', 'info')}>
              <Question size={20} />
            </GlassButton>
          </Tooltip>
        </Box>
      </Grow>

      {/* Indicador de estado */}
      <Separator />
      
      <Zoom in timeout={800}>
        <StatusIndicator
          label={saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? 'Guardado' : 'Modificado'}
          status={saveStatus}
          size="small"
        />
      </Zoom>
    </FloatingNavbarContainer>
  );
};

export default FloatingNavbar;

