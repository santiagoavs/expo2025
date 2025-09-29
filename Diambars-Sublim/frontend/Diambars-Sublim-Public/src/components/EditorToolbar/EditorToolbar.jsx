// components/EditorToolbar/EditorToolbar.jsx - EDITOR TOOLBAR (CSS VERSION)
import React from 'react';
import { 
  PiTextT, 
  PiImage, 
  PiShapes, 
  PiArrowCounterClockwise, 
  PiArrowClockwise,
  PiMagnifyingGlassPlus,
  PiMagnifyingGlassMinus,
  PiFrameCorners,
  PiTarget,
  PiTrash,
  PiCopy,
  PiArrowUp,
  PiArrowDown
} from 'react-icons/pi';
import './EditorToolbar.css';

const EditorToolbar = ({
  onAddText,
  onAddImage,
  onAddShape,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onResetZoom,
  onDeleteSelected,
  onDuplicateSelected,
  onBringToFront,
  onSendToBack,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  zoom = 1
}) => {
  const toolbarSections = [
    {
      title: 'Elementos',
      tools: [
        {
          id: 'add-text',
          icon: <PiTextT />,
          label: 'Texto',
          onClick: onAddText,
          shortcut: 'T'
        },
        {
          id: 'add-image',
          icon: <PiImage />,
          label: 'Imagen',
          onClick: onAddImage,
          shortcut: 'I'
        },
        {
          id: 'add-shape',
          icon: <PiShapes />,
          label: 'Forma',
          onClick: onAddShape,
          shortcut: 'S'
        }
      ]
    },
    {
      title: 'Historial',
      tools: [
        {
          id: 'undo',
          icon: <PiArrowCounterClockwise />,
          label: 'Deshacer',
          onClick: onUndo,
          disabled: !canUndo,
          shortcut: 'Ctrl+Z'
        },
        {
          id: 'redo',
          icon: <PiArrowClockwise />,
          label: 'Rehacer',
          onClick: onRedo,
          disabled: !canRedo,
          shortcut: 'Ctrl+Y'
        }
      ]
    },
    {
      title: 'Vista',
      tools: [
        {
          id: 'zoom-in',
          icon: <PiMagnifyingGlassPlus />,
          label: 'Acercar',
          onClick: onZoomIn,
          shortcut: '+'
        },
        {
          id: 'zoom-out',
          icon: <PiMagnifyingGlassMinus />,
          label: 'Alejar',
          onClick: onZoomOut,
          shortcut: '-'
        },
        {
          id: 'zoom-fit',
          icon: <PiFrameCorners />,
          label: 'Ajustar',
          onClick: onZoomToFit,
          shortcut: '0'
        },
        {
          id: 'zoom-reset',
          icon: <PiTarget />,
          label: 'Restablecer',
          onClick: onResetZoom,
          shortcut: '1'
        }
      ]
    },
    {
      title: 'Selección',
      tools: [
        {
          id: 'delete',
          icon: <PiTrash />,
          label: 'Eliminar',
          onClick: onDeleteSelected,
          disabled: !hasSelection,
          shortcut: 'Del',
          variant: 'danger'
        },
        {
          id: 'duplicate',
          icon: <PiCopy />,
          label: 'Duplicar',
          onClick: onDuplicateSelected,
          disabled: !hasSelection,
          shortcut: 'Ctrl+D'
        },
        {
          id: 'bring-front',
          icon: <PiArrowUp />,
          label: 'Al frente',
          onClick: onBringToFront,
          disabled: !hasSelection,
          shortcut: 'Ctrl+]'
        },
        {
          id: 'send-back',
          icon: <PiArrowDown />,
          label: 'Atrás',
          onClick: onSendToBack,
          disabled: !hasSelection,
          shortcut: 'Ctrl+['
        }
      ]
    }
  ];

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-content">
        {toolbarSections.map((section, sectionIndex) => (
          <div key={section.title} className="toolbar-section">
            <div className="toolbar-section-title">{section.title}</div>
            <div className="toolbar-tools">
              {section.tools.map((tool) => (
                <button
                  key={tool.id}
                  className={`toolbar-tool ${tool.variant || ''} ${tool.disabled ? 'disabled' : ''}`}
                  onClick={tool.onClick}
                  disabled={tool.disabled}
                  title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span className="tool-label">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {/* Zoom indicator */}
        <div className="toolbar-section">
          <div className="toolbar-section-title">Zoom</div>
          <div className="zoom-indicator">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
