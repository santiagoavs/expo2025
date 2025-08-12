// src/components/KonvaAreaEditor/KonvaAreaEditor.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from 'react-konva';
import Swal from 'sweetalert2';
import './KonvaAreaEditor.css';

// Iconos simples como reemplazo
const AddIcon = () => <span style={{ fontSize: '16px' }}>➕</span>;
const EditIcon = () => <span style={{ fontSize: '16px' }}>✏️</span>;
const TrashIcon = () => <span style={{ fontSize: '16px' }}>🗑️</span>;
const ZoomInIcon = () => <span style={{ fontSize: '16px' }}>🔍</span>;
const ZoomOutIcon = () => <span style={{ fontSize: '16px' }}>🔍</span>;
const ResetIcon = () => <span style={{ fontSize: '16px' }}>🔄</span>;
const GridIcon = () => <span style={{ fontSize: '16px' }}>⚏</span>;
const SaveIcon = () => <span style={{ fontSize: '16px' }}>💾</span>;

const KonvaAreaEditor = ({ 
  backgroundImage, 
  initialAreas = [], 
  onAreasChange, 
  onSave,
  editorWidth = 800,
  editorHeight = 600,
  readOnly = false 
}) => {
  const stageRef = useRef();
  const transformerRef = useRef();
  const containerRef = useRef();
  
  const [areas, setAreas] = useState(initialAreas);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [backgroundImageElement, setBackgroundImageElement] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Configuración del editor
  const STAGE_WIDTH = editorWidth;
  const STAGE_HEIGHT = editorHeight;
  const MIN_AREA_SIZE = 20;
  const GRID_SIZE = 10;

  // Cargar imagen de fondo
  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImageElement(img);
      };
      img.onerror = () => {
        console.warn('Error cargando imagen de fondo');
        setBackgroundImageElement(null);
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  // Actualizar transformer cuando cambia la selección
  useEffect(() => {
    if (selectedAreaId && transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#area-${selectedAreaId}`);
      
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedAreaId]);

  // Notificar cambios
  useEffect(() => {
    if (onAreasChange) {
      onAreasChange(areas);
    }
  }, [areas, onAreasChange]);

  // Función para generar ID único
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Crear nueva área
  const handleCreateArea = useCallback(async () => {
    const { value: areaName } = await Swal.fire({
      title: 'Nueva Área de Personalización',
      input: 'text',
      inputLabel: 'Nombre del área',
      inputPlaceholder: 'Ej: Frente, Espalda, Logo',
      inputValue: `Área ${areas.length + 1}`,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1F64BF',
      inputValidator: (value) => {
        if (!value || value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        if (areas.some(area => area.name.toLowerCase() === value.toLowerCase())) {
          return 'Ya existe un área con ese nombre';
        }
      }
    });

    if (areaName) {
      const newArea = {
        id: generateId(),
        name: areaName.trim(),
        displayName: areaName.trim(),
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0,
        accepts: { text: true, image: true },
        maxElements: 5,
        strokeColor: '#1F64BF',
        strokeWidth: 2,
        fillOpacity: 0.1
      };

      setAreas(prev => [...prev, newArea]);
      setSelectedAreaId(newArea.id);
      setHasChanges(true);
    }
  }, [areas]);

  // Eliminar área seleccionada
  const handleDeleteArea = useCallback(async () => {
    if (!selectedAreaId) return;

    const areaToDelete = areas.find(area => area.id === selectedAreaId);
    if (!areaToDelete) return;

    const result = await Swal.fire({
      title: '¿Eliminar área?',
      text: `Se eliminará el área "${areaToDelete.name}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#040DBF',
      cancelButtonColor: '#032CA6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#010326'
    });

    if (result.isConfirmed) {
      setAreas(prev => prev.filter(area => area.id !== selectedAreaId));
      setSelectedAreaId(null);
      setHasChanges(true);
      
      Swal.fire({
        title: 'Eliminado',
        text: 'El área ha sido eliminada',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: '#1F64BF'
      });
    }
  }, [selectedAreaId, areas]);

  // Editar nombre del área
  const handleEditAreaName = useCallback(async () => {
    if (!selectedAreaId) return;

    const area = areas.find(area => area.id === selectedAreaId);
    if (!area) return;

    const { value: newName } = await Swal.fire({
      title: 'Editar Área',
      input: 'text',
      inputLabel: 'Nombre del área',
      inputValue: area.name,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1F64BF',
      inputValidator: (value) => {
        if (!value || value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        if (areas.some(a => a.id !== selectedAreaId && a.name.toLowerCase() === value.toLowerCase())) {
          return 'Ya existe un área con ese nombre';
        }
      }
    });

    if (newName) {
      setAreas(prev => prev.map(area => 
        area.id === selectedAreaId 
          ? { ...area, name: newName.trim(), displayName: newName.trim() }
          : area
      ));
      setHasChanges(true);
    }
  }, [selectedAreaId, areas]);

  // Manejar transformaciones del área
  const handleAreaTransform = useCallback((areaId) => {
    const stage = stageRef.current;
    const areaNode = stage.findOne(`#area-${areaId}`);
    
    if (areaNode) {
      const newAttrs = {
        x: Math.max(0, Math.round(areaNode.x())),
        y: Math.max(0, Math.round(areaNode.y())),
        width: Math.max(MIN_AREA_SIZE, Math.round(areaNode.width() * areaNode.scaleX())),
        height: Math.max(MIN_AREA_SIZE, Math.round(areaNode.height() * areaNode.scaleY())),
        rotation: Math.round(areaNode.rotation())
      };

      // Resetear scale después de aplicar al tamaño
      areaNode.scaleX(1);
      areaNode.scaleY(1);

      setAreas(prev => prev.map(area => 
        area.id === areaId ? { ...area, ...newAttrs } : area
      ));
      setHasChanges(true);
    }
  }, []);

  // Manejar clic en área
  const handleAreaClick = useCallback((areaId, e) => {
    e.cancelBubble = true;
    setSelectedAreaId(areaId);
  }, []);

  // Manejar clic en stage (deseleccionar)
  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      setSelectedAreaId(null);
    }
  }, []);

  // Zoom del stage
  const handleZoom = useCallback((direction) => {
    const newScale = direction === 'in' 
      ? Math.min(stageScale * 1.2, 3) 
      : Math.max(stageScale / 1.2, 0.3);
    
    setStageScale(newScale);
  }, [stageScale]);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    setStageScale(1);
  }, []);

  // Guardar cambios
  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(areas);
        setHasChanges(false);
        
        Swal.fire({
          title: 'Guardado',
          text: 'Las áreas han sido guardadas exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: '#1F64BF'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron guardar los cambios',
          icon: 'error',
          confirmButtonColor: '#040DBF'
        });
      }
    }
  }, [areas, onSave]);

  // Renderizar grid
  const renderGrid = () => {
    if (!showGrid) return null;

    const lines = [];
    const stage = stageRef.current;
    if (!stage) return null;

    // Líneas verticales
    for (let i = 0; i < STAGE_WIDTH / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i * GRID_SIZE, 0, i * GRID_SIZE, STAGE_HEIGHT]}
          stroke="rgba(31, 100, 191, 0.1)"
          strokeWidth={0.5}
        />
      );
    }

    // Líneas horizontales
    for (let i = 0; i < STAGE_HEIGHT / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`h${i}`}
          points={[0, i * GRID_SIZE, STAGE_WIDTH, i * GRID_SIZE]}
          stroke="rgba(31, 100, 191, 0.1)"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  return (
    <div className="konva-editor-container">
      {/* Toolbar */}
      <div className="konva-editor-toolbar">
        <div className="konva-toolbar-section">
          <h4 className="konva-toolbar-title">Editor de Áreas</h4>
          <span className="konva-areas-count">({areas.length} áreas)</span>
        </div>

        <div className="konva-toolbar-section">
          <div className="konva-toolbar-group">
            <button
              className="konva-toolbar-btn konva-btn-primary"
              onClick={handleCreateArea}
              disabled={readOnly}
              title="Crear nueva área"
            >
              <AddIcon />
              <span>Nueva Área</span>
            </button>

            <button
              className="konva-toolbar-btn"
              onClick={handleEditAreaName}
              disabled={readOnly || !selectedAreaId}
              title="Editar área seleccionada"
            >
              <EditIcon />
            </button>

            <button
              className="konva-toolbar-btn konva-btn-danger"
              onClick={handleDeleteArea}
              disabled={readOnly || !selectedAreaId || areas.length <= 1}
              title="Eliminar área seleccionada"
            >
              <TrashIcon />
            </button>
          </div>

          <div className="konva-toolbar-group">
            <button
              className="konva-toolbar-btn"
              onClick={() => handleZoom('in')}
              title="Zoom in"
            >
              <ZoomInIcon />
            </button>

            <button
              className="konva-toolbar-btn"
              onClick={() => handleZoom('out')}
              title="Zoom out"
            >
              <ZoomOutIcon />
            </button>

            <button
              className="konva-toolbar-btn"
              onClick={handleResetZoom}
              title="Reset zoom"
            >
              <ResetIcon />
            </button>

            <button
              className={`konva-toolbar-btn ${showGrid ? 'active' : ''}`}
              onClick={() => setShowGrid(!showGrid)}
              title="Mostrar/ocultar grid"
            >
              <GridIcon />
            </button>
          </div>

          {hasChanges && onSave && (
            <div className="konva-toolbar-group">
              <button
                className="konva-toolbar-btn konva-btn-success"
                onClick={handleSave}
                title="Guardar cambios"
              >
                <SaveIcon />
                <span>Guardar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="konva-editor-canvas" ref={containerRef}>
        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          scaleX={stageScale}
          scaleY={stageScale}
          ref={stageRef}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Grid de fondo */}
            {showGrid && renderGrid()}
            
            {/* Imagen de fondo */}
            {backgroundImageElement && (
              <KonvaImage
                image={backgroundImageElement}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                listening={false}
                opacity={0.8}
              />
            )}

            {/* Áreas de personalización */}
            {areas.map((area) => (
              <React.Fragment key={area.id}>
                <Rect
                  id={`area-${area.id}`}
                  x={area.x}
                  y={area.y}
                  width={area.width}
                  height={area.height}
                  rotation={area.rotation || 0}
                  fill={area.strokeColor || '#1F64BF'}
                  opacity={area.fillOpacity || 0.1}
                  stroke={area.strokeColor || '#1F64BF'}
                  strokeWidth={area.strokeWidth || 2}
                  dash={selectedAreaId === area.id ? [5, 5] : []}
                  draggable={!readOnly}
                  onClick={(e) => handleAreaClick(area.id, e)}
                  onTap={(e) => handleAreaClick(area.id, e)}
                  onTransformEnd={() => handleAreaTransform(area.id)}
                  onDragEnd={() => handleAreaTransform(area.id)}
                />
                
                {/* Etiqueta del área */}
                <Text
                  x={area.x + 5}
                  y={area.y - 20}
                  text={area.name}
                  fontSize={12}
                  fill={area.strokeColor || '#1F64BF'}
                  fontStyle="bold"
                  listening={false}
                />
              </React.Fragment>
            ))}

            {/* Transformer para áreas seleccionadas */}
            {!readOnly && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limitar tamaño mínimo
                  newBox.width = Math.max(MIN_AREA_SIZE, newBox.width);
                  newBox.height = Math.max(MIN_AREA_SIZE, newBox.height);
                  return newBox;
                }}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                rotateEnabled={true}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Panel de propiedades del área seleccionada */}
      {selectedAreaId && (
        <div className="konva-area-properties">
          {(() => {
            const selectedArea = areas.find(area => area.id === selectedAreaId);
            if (!selectedArea) return null;

            return (
              <div className="konva-properties-content">
                <h5 className="konva-properties-title">
                  Propiedades: {selectedArea.name}
                </h5>
                
                <div className="konva-properties-grid">
                  <div className="konva-property-group">
                    <label>Posición</label>
                    <div className="konva-property-row">
                      <span>X: {selectedArea.x}px</span>
                      <span>Y: {selectedArea.y}px</span>
                    </div>
                  </div>

                  <div className="konva-property-group">
                    <label>Tamaño</label>
                    <div className="konva-property-row">
                      <span>W: {selectedArea.width}px</span>
                      <span>H: {selectedArea.height}px</span>
                    </div>
                  </div>

                  {selectedArea.rotation !== 0 && (
                    <div className="konva-property-group">
                      <label>Rotación</label>
                      <span>{selectedArea.rotation}°</span>
                    </div>
                  )}

                  <div className="konva-property-group">
                    <label>Acepta</label>
                    <div className="konva-accepts-tags">
                      {selectedArea.accepts?.text && (
                        <span className="konva-accept-tag">Texto</span>
                      )}
                      {selectedArea.accepts?.image && (
                        <span className="konva-accept-tag">Imagen</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Lista de áreas */}
      <div className="konva-areas-list">
        <h5 className="konva-list-title">Áreas Definidas</h5>
        <div className="konva-areas-items">
          {areas.map((area) => (
            <div
              key={area.id}
              className={`konva-area-item ${selectedAreaId === area.id ? 'selected' : ''}`}
              onClick={() => setSelectedAreaId(area.id)}
            >
              <div className="konva-area-info">
                <span className="konva-area-name">{area.name}</span>
                <span className="konva-area-dimensions">
                  {area.width}×{area.height}px
                </span>
              </div>
              <div className="konva-area-color" 
                style={{ backgroundColor: area.strokeColor || '#1F64BF' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KonvaAreaEditor;