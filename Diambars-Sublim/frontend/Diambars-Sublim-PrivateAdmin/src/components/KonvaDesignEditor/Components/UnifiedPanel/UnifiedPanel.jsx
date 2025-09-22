// UnifiedPanel.jsx - PANEL UNIFICADO RESPONSIVO CON DISEÑO 3D MODERNO
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Slider,
  TextField,
  Grid,
  Paper
} from '@mui/material';
import {
  X as CloseIcon,
  Gear as SettingsIcon,
  Stack as LayersIcon,
  Folder as AssetsIcon,
  Shapes as ShapesIcon,
  Download as ExportIcon,
  Palette as ColorIcon,
  Target as AreasIcon,
  CaretDown as ChevronDownIcon,
  CaretUp as ChevronUpIcon,
  List as MenuIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Square as TypeIcon
} from '@phosphor-icons/react';
import { styled } from '@mui/material/styles';
import { GRADIENTS_3D, SHADOWS_3D, FIXED_COLORS, BORDERS, TRANSITIONS, Z_INDEX } from '../../styles/responsiveTheme';
import TextEditor from '../TextEditor/TextEditor';

// ==================== COMPONENTES STYLED MODERNOS 3D ====================
const ModernPanelContainer = styled(Box, {
  name: 'ModernPanel-Container',
  slot: 'Root'
})(({ theme, isOpen, isMobile, isTablet }) => ({
  position: isMobile ? 'fixed' : isTablet ? 'fixed' : 'relative',
  top: isMobile ? 'auto' : isTablet ? 0 : 'auto',
  bottom: isMobile ? 0 : isTablet ? 'auto' : 'auto',
  left: isMobile ? 0 : isTablet ? 'auto' : 'auto',
  right: isMobile ? 0 : isTablet ? 0 : 'auto',
  width: isMobile ? '100%' : isTablet ? '340px' : '380px',
  height: isMobile ? '70vh' : isTablet ? '100%' : '100%',
  maxHeight: isMobile ? '500px' : 'none',
  background: GRADIENTS_3D.panel,
  borderRadius: isMobile 
    ? `${BORDERS.radius.xlarge} ${BORDERS.radius.xlarge} 0 0`
    : BORDERS.radius.xlarge,
  boxShadow: '0 12px 50px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  border: `1px solid ${FIXED_COLORS.border}`,
  zIndex: Z_INDEX.panel,
  transform: isMobile 
    ? (isOpen ? 'translateY(0)' : 'translateY(100%)')
    : isTablet 
      ? (isOpen ? 'translateX(0)' : 'translateX(100%)')
      : 'none',
  transition: TRANSITIONS.normal,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    boxShadow: '0 16px 60px rgba(0,0,0,0.6), 0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
  }
}));

const PanelContainer = styled(Box, {
  name: 'UnifiedPanel-Container',
  slot: 'Root'
})(({ theme, isOpen, isMobile, isTablet }) => ({
  position: isMobile ? 'fixed' : isTablet ? 'fixed' : 'relative',
  top: isMobile ? 'auto' : isTablet ? 0 : 'auto',
  bottom: isMobile ? 0 : isTablet ? 'auto' : 'auto',
  left: isMobile ? 0 : isTablet ? 'auto' : 'auto',
  right: isMobile ? 0 : isTablet ? 0 : 'auto',
  width: isMobile ? '100%' : isTablet ? '320px' : '360px',
  height: isMobile ? '60vh' : isTablet ? '100%' : '100%',
  maxHeight: isMobile ? '400px' : 'none',
  background: GRADIENTS_3D.panel,
  borderRadius: isMobile 
    ? `${BORDERS.radius.large} ${BORDERS.radius.large} 0 0`
    : BORDERS.radius.large,
  boxShadow: SHADOWS_3D.panel,
  border: `1px solid ${FIXED_COLORS.border}`,
  zIndex: Z_INDEX.panel,
  transform: isMobile 
    ? (isOpen ? 'translateY(0)' : 'translateY(100%)')
    : isTablet 
      ? (isOpen ? 'translateX(0)' : 'translateX(100%)')
      : 'none',
  transition: TRANSITIONS.normal,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const ModernPanelHeader = styled(Box, {
  name: 'ModernPanel-Header',
  slot: 'Header'
})(({ theme }) => ({
  background: GRADIENTS_3D.toolbar,
  borderBottom: `1px solid ${FIXED_COLORS.border}`,
  borderRadius: `${BORDERS.radius.xlarge} ${BORDERS.radius.xlarge} 0 0`,
  padding: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '72px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${FIXED_COLORS.border}, transparent)`
  }
}));

const PanelHeader = styled(Box, {
  name: 'UnifiedPanel-Header',
  slot: 'Header'
})(({ theme }) => ({
  background: GRADIENTS_3D.toolbar,
  borderBottom: `1px solid ${FIXED_COLORS.border}`,
  borderRadius: `${BORDERS.radius.large} ${BORDERS.radius.large} 0 0`,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '64px'
}));

const FloatingPanelToggle = styled(Fab, {
  name: 'FloatingPanelToggle',
  slot: 'Root'
})(({ theme, isMobile, isTablet }) => ({
  position: 'fixed',
  bottom: isMobile ? '20px' : isTablet ? '24px' : '28px',
  right: isMobile ? '20px' : isTablet ? '24px' : '28px',
  width: isMobile ? '56px' : '64px',
  height: isMobile ? '56px' : '64px',
  background: GRADIENTS_3D.primary,
  boxShadow: '0 8px 32px rgba(31, 100, 191, 0.4), 0 4px 16px rgba(0,0,0,0.2)',
  border: `1px solid rgba(255,255,255,0.1)`,
  zIndex: Z_INDEX.panel + 10,
  transition: TRANSITIONS.normal,
  '&:hover': {
    background: GRADIENTS_3D.primaryHover,
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 12px 40px rgba(31, 100, 191, 0.5), 0 6px 20px rgba(0,0,0,0.3)'
  },
  '&:active': {
    transform: 'translateY(0) scale(1)'
  }
}));

const ModernPanelTabs = styled(Tabs, {
  name: 'ModernPanel-Tabs',
  slot: 'Tabs'
})(({ theme }) => ({
  minHeight: 'auto',
  padding: theme.spacing(1),
  '& .MuiTabs-indicator': {
    background: GRADIENTS_3D.primary,
    height: '3px',
    borderRadius: '2px',
    boxShadow: '0 2px 8px rgba(31, 100, 191, 0.3)'
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(0.5)
  }
}));

const ModernPanelTab = styled(Tab, {
  name: 'ModernPanel-Tab',
  slot: 'Tab'
})(({ theme }) => ({
  minHeight: '48px',
  minWidth: 'auto',
  padding: theme.spacing(1, 1.5),
  borderRadius: BORDERS.radius.medium,
  color: FIXED_COLORS.textSecondary,
  fontWeight: 600,
  transition: TRANSITIONS.fast,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: GRADIENTS_3D.glass,
    color: FIXED_COLORS.text,
    transform: 'translateY(-1px)',
    boxShadow: SHADOWS_3D.light
  },
  '&.Mui-selected': {
    color: FIXED_COLORS.primary,
    background: GRADIENTS_3D.glass,
    boxShadow: SHADOWS_3D.light
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 1
  },
  '&:hover::before': {
    left: '100%'
  }
}));

const PanelTabs = styled(Tabs, {
  name: 'UnifiedPanel-Tabs',
  slot: 'Tabs'
})(({ theme }) => ({
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    background: GRADIENTS_3D.primary,
    height: '3px',
    borderRadius: '2px'
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1)
  }
}));

const PanelTab = styled(Tab, {
  name: 'UnifiedPanel-Tab',
  slot: 'Tab'
})(({ theme }) => ({
  minHeight: '48px',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: BORDERS.radius.medium,
  color: FIXED_COLORS.textSecondary,
  fontWeight: 500,
  transition: TRANSITIONS.fast,
  '&.Mui-selected': {
    color: FIXED_COLORS.primary,
    background: 'rgba(31, 100, 191, 0.1)',
    fontWeight: 600
  },
  '&:hover': {
    background: 'rgba(31, 100, 191, 0.05)',
    color: FIXED_COLORS.primary
  }
}));

const PanelContent = styled(Box, {
  name: 'UnifiedPanel-Content',
  slot: 'Content'
})(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '&::-webkit-scrollbar-thumb': {
    background: FIXED_COLORS.border,
    borderRadius: '3px',
    '&:hover': {
      background: FIXED_COLORS.borderLight
    }
  }
}));

const SectionHeader = styled(Box, {
  name: 'UnifiedPanel-SectionHeader',
  slot: 'SectionHeader'
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  cursor: 'pointer',
  borderRadius: BORDERS.radius.small,
  transition: TRANSITIONS.fast,
  '&:hover': {
    background: 'rgba(31, 100, 191, 0.05)'
  }
}));

const SectionContent = styled(Collapse, {
  name: 'UnifiedPanel-SectionContent',
  slot: 'SectionContent'
})(({ theme }) => ({
  marginTop: theme.spacing(1)
}));

const PanelToggleButton = styled(IconButton, {
  name: 'UnifiedPanel-ToggleButton',
  slot: 'ToggleButton'
})(({ theme, isMobile, isTablet }) => ({
  position: 'fixed',
  bottom: isMobile ? '16px' : 'auto',
  right: isMobile ? '16px' : isTablet ? '16px' : 'auto',
  top: isMobile ? 'auto' : isTablet ? '50%' : 'auto',
  transform: isMobile ? 'none' : isTablet ? 'translateY(-50%)' : 'none',
  width: isMobile ? '56px' : '48px',
  height: isMobile ? '56px' : '48px',
  background: GRADIENTS_3D.primary,
  color: 'white',
  boxShadow: SHADOWS_3D.button,
  zIndex: Z_INDEX.panel + 1,
  transition: TRANSITIONS.normal,
  '&:hover': {
    background: GRADIENTS_3D.primaryHover,
    boxShadow: SHADOWS_3D.buttonHover,
    transform: isMobile ? 'scale(1.05)' : isTablet ? 'translateY(-50%) scale(1.05)' : 'scale(1.05)'
  }
}));

// ==================== CONFIGURACIÓN DE PESTAÑAS ====================
const TAB_CONFIG = [
  {
    id: 'properties',
    label: 'Propiedades',
    icon: <SettingsIcon size={20} />,
    component: 'PropertiesSection',
    disabled: false // Se habilita dinámicamente
  },
  {
    id: 'layers',
    label: 'Capas',
    icon: <LayersIcon size={20} />,
    component: 'LayersSection'
  },
  {
    id: 'assets',
    label: 'Recursos',
    icon: <AssetsIcon size={20} />,
    component: 'AssetsSection'
  },
  {
    id: 'areas',
    label: 'Áreas',
    icon: <AreasIcon size={20} />,
    component: 'AreasSection'
  },
  {
    id: 'colors',
    label: 'Colores',
    icon: <ColorIcon size={20} />,
    component: 'ColorsSection'
  },
  {
    id: 'shapes',
    label: 'Formas',
    icon: <ShapesIcon size={20} />,
    component: 'ShapesSection'
  },
  {
    id: 'text',
    label: 'Texto',
    icon: <TypeIcon size={20} />,
    component: 'TextSection'
  },
  {
    id: 'export',
    label: 'Exportar',
    icon: <ExportIcon size={20} />,
    component: 'ExportSection'
  }
];

// ==================== COMPONENTE PRINCIPAL ====================
const UnifiedPanel = ({
  isOpen,
  onToggle,
  activePanel,
  onPanelChange,
  selectedElements = [],
  elements = [],
  customizationAreas = [],
  selectedAreaId,
  onAreaSelect,
  productColorFilter,
  onColorChange,
  onColorApply,
  onResetColor,
  onImageDrop,
  onLoadGoogleFonts,
  onExport,
  onAddText,
  onAddShape,
  onImageDrop: onImageDropProp,
  onLoadGoogleFonts: onLoadGoogleFontsProp,
  onExport: onExportProp,
  onAddText: onAddTextProp,
  onAddShape: onAddShapeProp,
  onSelectElement,
  onSelectMultiple,
  onReorderElements,
  onToggleVisibility,
  onToggleLock,
  onUpdateElement,
  onOpenShapeCreator,
  fontService,
  availableFonts = [],
  onFontLoad,
  isMobile,
  isTablet,
  isDesktop
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    properties: true,
    layers: true,
    assets: true,
    areas: true,
    colors: true,
    shapes: true,
    text: true,
    export: true
  });

  // Función para alternar sección expandida
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Función para manejar cambio de pestaña
  const handleTabChange = useCallback((event, newValue) => {
    onPanelChange(newValue);
  }, [onPanelChange]);

  // Función para renderizar el contenido de la pestaña activa
  const renderTabContent = useCallback(() => {
    const activeTab = TAB_CONFIG.find(tab => tab.id === activePanel);
    if (!activeTab) return null;

    switch (activeTab.id) {
      case 'properties':
        return (
          <PropertiesSection
            selectedElements={selectedElements}
            onUpdateElement={onUpdateElement}
            onLoadGoogleFonts={onLoadGoogleFontsProp}
            availableFonts={fontService?.getAvailableFonts() || []}
            expanded={expandedSections.properties}
            onToggle={() => toggleSection('properties')}
          />
        );
      
      case 'layers':
        return (
          <LayersSection
            elements={elements}
            selectedElements={selectedElements}
            onSelectElement={onSelectElement}
            onSelectMultiple={onSelectMultiple}
            onReorderElements={onReorderElements}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
            expanded={expandedSections.layers}
            onToggle={() => toggleSection('layers')}
          />
        );
      
      case 'assets':
        return (
          <AssetsSection
            onImageDrop={onImageDropProp}
            onLoadGoogleFonts={onLoadGoogleFontsProp}
            fontService={fontService}
            expanded={expandedSections.assets}
            onToggle={() => toggleSection('assets')}
          />
        );
      
      case 'areas':
        return (
          <AreasSection
            customizationAreas={customizationAreas}
            selectedAreaId={selectedAreaId}
            onAreaSelect={onAreaSelect}
            expanded={expandedSections.areas}
            onToggle={() => toggleSection('areas')}
          />
        );
      
      case 'colors':
        return (
          <ColorsSection
            productColorFilter={productColorFilter}
            onColorChange={onColorChange}
            onColorApply={onColorApply}
            onResetColor={onResetColor}
            expanded={expandedSections.colors}
            onToggle={() => toggleSection('colors')}
          />
        );
      
      case 'shapes':
        return (
          <ShapesSection
            onOpenShapeCreator={onOpenShapeCreator}
            expanded={expandedSections.shapes}
            onToggle={() => toggleSection('shapes')}
          />
        );
      
      case 'text':
        return (
          <TextSection
            onAddText={onAddText}
            availableFonts={availableFonts}
            expanded={expandedSections.text}
            onToggle={() => toggleSection('text')}
          />
        );
      
      case 'export':
        return (
          <ExportSection
            onExport={onExportProp}
            elements={elements}
            expanded={expandedSections.export}
            onToggle={() => toggleSection('export')}
          />
        );
      
      default:
        return null;
    }
  }, [
    activePanel,
    selectedElements,
    elements,
    customizationAreas,
    selectedAreaId,
    productColorFilter,
    expandedSections,
    onAddTextProp,
    onAddShapeProp,
    onImageDropProp,
    onLoadGoogleFontsProp,
    onExportProp,
    onAreaSelect,
    onColorChange,
    onColorApply,
    onResetColor,
    onSelectElement,
    onSelectMultiple,
    onReorderElements,
    onToggleVisibility,
    onToggleLock,
    onUpdateElement,
    fontService,
    toggleSection
  ]);

  // Si no es móvil ni tablet, mostrar el panel siempre visible con diseño moderno
  if (isDesktop) {
    return (
      <ModernPanelContainer isOpen={true} isMobile={false} isTablet={false}>
        <ModernPanelHeader>
          <Typography variant="h6" sx={{ 
            color: FIXED_COLORS.text, 
            fontWeight: 700,
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <SettingsIcon size={20} />
            Panel de Herramientas
          </Typography>
          <Badge 
            badgeContent={selectedElements.length} 
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                background: GRADIENTS_3D.primary,
                color: 'white',
                fontWeight: 600
              }
            }}
          >
            <Chip 
              label={`${elements.length} elementos`}
              size="small"
              sx={{
                background: GRADIENTS_3D.glass,
                color: FIXED_COLORS.text,
                border: `1px solid rgba(255,255,255,0.1)`,
                fontWeight: 600
              }}
            />
          </Badge>
        </ModernPanelHeader>
        
        <ModernPanelTabs
          value={activePanel}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TAB_CONFIG.map(tab => (
            <ModernPanelTab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
              disabled={tab.disabled}
            />
          ))}
        </ModernPanelTabs>
        
        <PanelContent>
          {renderTabContent()}
        </PanelContent>
      </ModernPanelContainer>
    );
  }

  // Para móvil y tablet, mostrar panel deslizable con diseño moderno
  return (
    <>
      <ModernPanelContainer isOpen={isOpen} isMobile={isMobile} isTablet={isTablet}>
        <ModernPanelHeader>
          <Typography variant="h6" sx={{ 
            color: FIXED_COLORS.text, 
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <SettingsIcon size={18} />
            {TAB_CONFIG.find(tab => tab.id === activePanel)?.label || 'Panel'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge 
              badgeContent={selectedElements.length} 
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  background: GRADIENTS_3D.primary,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }
              }}
            >
              <Chip 
                label={`${elements.length}`}
                size="small"
                sx={{
                  background: GRADIENTS_3D.glass,
                  color: FIXED_COLORS.text,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
            </Badge>
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: FIXED_COLORS.textSecondary,
                background: GRADIENTS_3D.glass,
                border: `1px solid rgba(255,255,255,0.1)`,
                '&:hover': {
                  color: FIXED_COLORS.primary,
                  background: GRADIENTS_3D.glassHover,
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CloseIcon size={18} />
            </IconButton>
          </Box>
        </ModernPanelHeader>
        
        <ModernPanelTabs
          value={activePanel}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TAB_CONFIG.map(tab => (
            <ModernPanelTab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
              disabled={tab.disabled}
            />
          ))}
        </ModernPanelTabs>
        
        <PanelContent>
          {renderTabContent()}
        </PanelContent>
      </ModernPanelContainer>
      
      {/* Botón flotante moderno para móvil y tablet */}
      <FloatingPanelToggle
        onClick={onToggle}
        isMobile={isMobile}
        isTablet={isTablet}
        sx={{
          display: isDesktop ? 'none' : 'flex'
        }}
      >
        <SettingsIcon size={isMobile ? 20 : 24} />
      </FloatingPanelToggle>
    </>
  );
};

// ==================== COMPONENTES DE SECCIÓN ====================

// Sección de Herramientas
const ToolsSection = ({ 
  onAddText, 
  onAddShape, 
  onImageDrop, 
  selectedCount,
  customizationAreas,
  selectedAreaId,
  onAreaSelect,
  expanded,
  onToggle 
}) => (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        🛠️ Herramientas de Diseño
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onAddText}
          sx={{
            background: GRADIENTS_3D.button,
            '&:hover': { background: GRADIENTS_3D.buttonHover }
          }}
        >
          Agregar Texto
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => onAddShape('rect')}
          sx={{
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.text,
            '&:hover': {
              borderColor: FIXED_COLORS.primary,
              backgroundColor: 'rgba(31, 100, 191, 0.1)'
            }
          }}
        >
          Agregar Rectángulo
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => onAddShape('circle')}
          sx={{
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.text,
            '&:hover': {
              borderColor: FIXED_COLORS.primary,
              backgroundColor: 'rgba(31, 100, 191, 0.1)'
            }
          }}
        >
          Agregar Círculo
        </Button>
        
        {selectedCount > 0 && (
          <Box sx={{ mt: 2, p: 2, background: 'rgba(31, 100, 191, 0.1)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: FIXED_COLORS.text }}>
              {selectedCount} elemento(s) seleccionado(s)
            </Typography>
          </Box>
        )}
      </Box>
    </SectionContent>
  </Box>
);

// Sección de Propiedades
const PropertiesSection = ({ 
  selectedElements, 
  onUpdateElement, 
  onLoadGoogleFonts, 
  availableFonts,
  expanded,
  onToggle 
}) => {
  // Estado para los controles de color
  const [fillColor, setFillColor] = useState('#1F64BF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  // Actualizar estado cuando cambia la selección
  useEffect(() => {
    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      setFillColor(element.fill || '#1F64BF');
      setStrokeColor(element.stroke || '#000000');
      setStrokeWidth(element.strokeWidth || 2);
    }
  }, [selectedElements]);

  // Función para actualizar propiedades
  const handlePropertyChange = (property, value) => {
    selectedElements.forEach(element => {
      onUpdateElement(element.id, { [property]: value });
    });
  };

  return (
    <Box>
      <SectionHeader onClick={onToggle}>
        <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
          ⚙️ Propiedades
        </Typography>
        {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
      </SectionHeader>
      
      <SectionContent in={expanded}>
        {selectedElements.length === 0 ? (
          <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary, textAlign: 'center', py: 4 }}>
            Selecciona un elemento para ver sus propiedades
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedElements.map(element => (
              <Box key={element.id} sx={{ p: 2, background: 'rgba(31, 100, 191, 0.05)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: FIXED_COLORS.text, fontWeight: 600, mb: 2 }}>
                  {element.type} - {element.id}
                </Typography>
                
                {/* Controles de color para formas geométricas */}
                {['rect', 'circle', 'triangle', 'star', 'custom', 'square', 'ellipse', 'heart', 'diamond', 'hexagon', 'octagon', 'pentagon', 'polygon', 'shape', 'path'].includes(element.type) && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, fontWeight: 600 }}>
                      🎨 Colores
                    </Typography>
                    
                    {/* Color de Relleno */}
                    <Box>
                      <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, mb: 1, display: 'block' }}>
                        Color de Relleno
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: element.fill || fillColor,
                            borderRadius: BORDERS.radius.small,
                            border: `2px solid ${FIXED_COLORS.border}`,
                            cursor: 'pointer',
                            transition: TRANSITIONS.fast,
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: SHADOWS_3D.medium
                            }
                          }}
                        />
                        <TextField
                          size="small"
                          value={element.fill || fillColor}
                          onChange={(e) => {
                            setFillColor(e.target.value);
                            handlePropertyChange('fill', e.target.value);
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: 32,
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Color de Borde */}
                    <Box>
                      <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, mb: 1, display: 'block' }}>
                        Color de Borde
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: element.stroke || strokeColor,
                            borderRadius: BORDERS.radius.small,
                            border: `2px solid ${FIXED_COLORS.border}`,
                            cursor: 'pointer',
                            transition: TRANSITIONS.fast,
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: SHADOWS_3D.medium
                            }
                          }}
                        />
                        <TextField
                          size="small"
                          value={element.stroke || strokeColor}
                          onChange={(e) => {
                            setStrokeColor(e.target.value);
                            handlePropertyChange('stroke', e.target.value);
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: 32,
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Grosor del Borde */}
                    <Box>
                      <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, mb: 1, display: 'block' }}>
                        Grosor del Borde: {element.strokeWidth || strokeWidth}px
                      </Typography>
                      <Slider
                        value={element.strokeWidth || strokeWidth}
                        onChange={(e, value) => {
                          setStrokeWidth(value);
                          handlePropertyChange('strokeWidth', value);
                        }}
                        min={0}
                        max={10}
                        step={1}
                        sx={{
                          color: FIXED_COLORS.primary,
                          '& .MuiSlider-thumb': {
                            background: GRADIENTS_3D.primary,
                            boxShadow: SHADOWS_3D.button
                          },
                          '& .MuiSlider-track': {
                            background: GRADIENTS_3D.primary
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* Controles para texto */}
                {element.type === 'text' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, fontWeight: 600 }}>
                      📝 Texto
                    </Typography>
                    <TextField
                      label="Texto"
                      value={element.text || ''}
                      onChange={(e) => onUpdateElement(element.id, { text: e.target.value })}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Tamaño de fuente"
                      type="number"
                      value={element.fontSize || 24}
                      onChange={(e) => onUpdateElement(element.id, { fontSize: parseInt(e.target.value) })}
                      size="small"
                      fullWidth
                    />
                  </Box>
                )}

                {/* Información básica */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary }}>
                    📍 Posición: x: {element.x || 0}, y: {element.y || 0}
                  </Typography>
                  {element.width && (
                    <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary }}>
                      📏 Tamaño: {element.width} x {element.height}
                    </Typography>
                  )}
                  {element.radius && (
                    <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary }}>
                      📏 Radio: {element.radius}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </SectionContent>
    </Box>
  );
};

// Sección de Capas
const LayersSection = ({ 
  elements, 
  selectedElements, 
  onSelectElement, 
  onSelectMultiple, 
  onReorderElements, 
  onToggleVisibility, 
  onToggleLock,
  expanded,
  onToggle 
}) => (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        📋 Capas ({elements.length})
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {elements.map((element, index) => (
          <Box
            key={element.id}
            onClick={() => onSelectElement(element.id)}
            sx={{
              p: 2,
              background: selectedElements.some(el => el.id === element.id) 
                ? 'rgba(31, 100, 191, 0.2)' 
                : 'rgba(31, 100, 191, 0.05)',
              borderRadius: 1,
              cursor: 'pointer',
              transition: TRANSITIONS.fast,
              '&:hover': {
                background: 'rgba(31, 100, 191, 0.1)'
              }
            }}
          >
            <Typography variant="body2" sx={{ color: FIXED_COLORS.text }}>
              {element.type} - {index + 1}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionContent>
  </Box>
);

// Sección de Recursos
const AssetsSection = ({ 
  onImageDrop, 
  onLoadGoogleFonts, 
  fontService,
  expanded,
  onToggle 
}) => (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        📁 Recursos
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          sx={{
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.text,
            '&:hover': {
              borderColor: FIXED_COLORS.primary,
              backgroundColor: 'rgba(31, 100, 191, 0.1)'
            }
          }}
        >
          Subir Imágenes
          <input
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => onImageDrop(Array.from(e.target.files))}
          />
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => onLoadGoogleFonts(['Roboto', 'Open Sans', 'Lato'])}
          sx={{
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.text,
            '&:hover': {
              borderColor: FIXED_COLORS.primary,
              backgroundColor: 'rgba(31, 100, 191, 0.1)'
            }
          }}
        >
          Cargar Fuentes
        </Button>
      </Box>
    </SectionContent>
  </Box>
);

// Sección de Áreas
const AreasSection = ({ 
  customizationAreas, 
  selectedAreaId, 
  onAreaSelect,
  expanded,
  onToggle 
}) => (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        🎯 Áreas ({customizationAreas.length})
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {customizationAreas.map(area => (
          <Box
            key={area.id}
            onClick={() => onAreaSelect(area.id)}
            sx={{
              p: 2,
              background: selectedAreaId === area.id 
                ? 'rgba(31, 100, 191, 0.2)' 
                : 'rgba(31, 100, 191, 0.05)',
              borderRadius: 1,
              cursor: 'pointer',
              transition: TRANSITIONS.fast,
              '&:hover': {
                background: 'rgba(31, 100, 191, 0.1)'
              }
            }}
          >
            <Typography variant="body2" sx={{ color: FIXED_COLORS.text }}>
              {area.name || area.id}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionContent>
  </Box>
);

// Sección de Colores
const ColorsSection = ({ 
  productColorFilter, 
  onColorChange, 
  onColorApply, 
  onResetColor,
  expanded,
  onToggle 
}) => {
  
  return (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        🎨 Colores
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary }}>
          Color de fondo del producto
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
            <Box
              key={color}
              onClick={() => onColorChange(color)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: color,
                borderRadius: 1,
                cursor: 'pointer',
                border: productColorFilter === color ? `2px solid ${FIXED_COLORS.primary}` : '1px solid rgba(0,0,0,0.2)',
                transition: TRANSITIONS.fast,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: SHADOWS_3D.medium
                }
              }}
            />
          ))}
        </Box>
        
        <Button
          variant="outlined"
          onClick={onResetColor}
          disabled={!productColorFilter}
          sx={{
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.text,
            '&:hover': {
              borderColor: FIXED_COLORS.primary,
              backgroundColor: 'rgba(31, 100, 191, 0.1)'
            }
          }}
        >
          Restablecer Color
        </Button>
      </Box>
    </SectionContent>
  </Box>
  );
};

// Sección de Formas
const ShapesSection = ({ 
  onOpenShapeCreator,
  expanded,
  onToggle 
}) => {
  return (
    <Box>
      <SectionHeader onClick={onToggle}>
        <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
          🔷 Formas
        </Typography>
        {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
      </SectionHeader>
      
      <SectionContent in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary, textAlign: 'center', py: 2 }}>
            Crea formas personalizadas con el editor avanzado
          </Typography>
          
          <Button
            variant="contained"
            onClick={onOpenShapeCreator}
            fullWidth
            size="large"
            sx={{
              background: GRADIENTS_3D.primary,
              boxShadow: SHADOWS_3D.button,
              '&:hover': {
                boxShadow: SHADOWS_3D.strong,
                transform: 'translateY(-2px)'
              },
              py: 2
            }}
          >
            <ShapesIcon size={20} style={{ marginRight: 8 }} />
            Abrir Editor de Formas
          </Button>
          
          <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, textAlign: 'center' }}>
            • Formas básicas (cuadrado, círculo, estrella, triángulo, corazón)
            <br />
            • Formas personalizadas con puntos
            <br />
            • Líneas curvas y dibujo libre
            <br />
            • Redondeado de esquinas
          </Typography>
        </Box>
      </SectionContent>
    </Box>
  );
};

// Sección de Texto
const TextSection = ({ 
  onAddText,
  availableFonts,
  expanded,
  onToggle 
}) => (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        📝 Texto
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <TextEditor
        onAddText={onAddText}
        availableFonts={availableFonts}
      />
    </SectionContent>
  </Box>
);

// Sección de Exportación
const ExportSection = ({ 
  onExport, 
  elements,
  expanded,
  onToggle 
}) => (
  <Box>
    <SectionHeader onClick={onToggle}>
      <Typography variant="subtitle1" sx={{ color: FIXED_COLORS.text, fontWeight: 600 }}>
        💾 Exportar
      </Typography>
      {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
    </SectionHeader>
    
    <SectionContent in={expanded}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => onExport('png')}
          sx={{
            background: GRADIENTS_3D.button,
            '&:hover': { background: GRADIENTS_3D.buttonHover }
          }}
        >
          Exportar PNG
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => onExport('jpg')}
          sx={{
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.text,
            '&:hover': {
              borderColor: FIXED_COLORS.primary,
              backgroundColor: 'rgba(31, 100, 191, 0.1)'
            }
          }}
        >
          Exportar JPG
        </Button>
        
        <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary }}>
          {elements.length} elementos en el diseño
        </Typography>
      </Box>
    </SectionContent>
  </Box>
);

export default UnifiedPanel;
