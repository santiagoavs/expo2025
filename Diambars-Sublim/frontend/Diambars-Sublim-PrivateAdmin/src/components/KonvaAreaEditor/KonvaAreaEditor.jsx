import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import Swal from 'sweetalert2';
import './KonvaAreaEditor.css';

// Componentes de iconos
const XIcon = () => <span style={{ fontSize: '20px' }}>✖</span>;
const SaveIcon = () => <span style={{ fontSize: '16px' }}>💾</span>;
const PlusIcon = () => <span style={{ fontSize: '16px' }}>+</span>;
const TrashIcon = () => <span style={{ fontSize: '16px' }}>🗑️</span>;
const MoveIcon = () => <span style={{ fontSize: '16px' }}>✋</span>;
const EditIcon = () => <span style={{ fontSize: '16px' }}>✏️</span>;
const EyeIcon = () => <span style={{ fontSize: '16px' }}>👁️</span>;
const ZoomInIcon = () => <span style={{ fontSize: '16px' }}>🔍</span>;
const ZoomOutIcon = () => <span style={{ fontSize: '16px' }}>🔎</span>;
const GridIcon = () => <span style={{ fontSize: '16px' }}>⊞</span>;

// Componente para el área individual
const AreaRect = ({ 
  area, 
  isSelected, 
  onSelect, 
  onChange, 
  stageScale 
}) => {
  const shapeRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const node = e.target;
    onChange({
      ...area,
      position: {
        ...area.position,
        x: Math.round(node.x()),
        y: Math.round(node.y())
      }
    });
  };

  const handleTransformEnd = (e) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      ...area,
      position: {
        ...area.position,
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(Math.max(5, node.width() * scaleX)),
        height: Math.round(Math.max(5, node.height() * scaleY)),
        rotationDegree: Math.round(node.rotation())
      }
    });
  };

  return (
    <>
      <Rect
        ref={shapeRef}
        x={area.position.x}
        y={area.position.y}
        width={area.position.width}
        height={area.position.height}
        rotation={area.position.rotationDegree || 0}
        fill={area.konvaConfig?.strokeColor || '#1F64BF'}
        opacity={area.konvaConfig?.fillOpacity || 0.2}
        stroke={area.konvaConfig?.strokeColor || '#1F64BF'}
        strokeWidth={(area.konvaConfig?.strokeWidth || 2) / stageScale}
        dash={area.konvaConfig?.dash || [5, 5]}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      <Text
        x={area.position.x + 5}
        y={area.position.y + 5}
        text={area.displayName || area.name}
        fontSize={12 / stageScale}
        fill="#010326"
        fontStyle="bold"
        listening={false}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left', 'top-right', 'bottom-left', 'bottom-right',
            'top-center', 'bottom-center', 'middle-left', 'middle-right'
          ]}
        />
      )}
    </>
  );
};

// Componente principal del editor
const KonvaAreaEditor = ({ 
  isOpen, 
  onClose, 
  productImage, 
  initialAreas = [], 
  onSaveAreas 
}) => {
  // Estados principales
  const [areas, setAreas] = useState(initialAreas);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [mode, setMode] = useState('select'); // select, add, delete

  // Referencias
  const stageRef = useRef();
  const containerRef = useRef();
  
  // Cargar imagen
  const [image] = useImage(productImage, 'anonymous');

  // Calcular dimensiones cuando la imagen cargue
  useEffect(() => {
    if (image && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth - 40;
      const containerHeight = container.offsetHeight - 40;
      
      const imageRatio = image.width / image.height;
      const containerRatio = containerWidth / containerHeight;
      
      let newWidth, newHeight;
      
      if (imageRatio > containerRatio) {
        newWidth = containerWidth;
        newHeight = containerWidth / imageRatio;
      } else {
        newHeight = containerHeight;
        newWidth = containerHeight * imageRatio;
      }
      
      setStageDimensions({
        width: Math.min(newWidth, containerWidth),
        height: Math.min(newHeight, containerHeight)
      });
    }
  }, [image]);

  // Handlers para áreas
  const handleAreaSelect = (index) => {
    setSelectedAreaIndex(index);
    setMode('select');
  };

  const handleAreaChange = (index, newArea) => {
    setAreas(prev => prev.map((area, i) => i === index ? newArea : area));
  };

  const addNewArea = () => {
    const newArea = {
      name: `Área ${areas.length + 1}`,
      displayName: `Área ${areas.length + 1}`,
      position: {
        x: 50,
        y: 50,
        width: 150,
        height: 100,
        rotationDegree: 0
      },
      accepts: { text: true, image: true },
      maxElements: 5,
      konvaConfig: {
        strokeColor: '#1F64BF',
        strokeWidth: 2,
        fillOpacity: 0.2,
        cornerRadius: 0,
        dash: [5, 5]
      }
    };
    
    setAreas(prev => [...prev, newArea]);
    setSelectedAreaIndex(areas.length);
  };

  const deleteSelectedArea = () => {
    if (selectedAreaIndex !== null && areas.length > 1) {
      setAreas(prev => prev.filter((_, i) => i !== selectedAreaIndex));
      setSelectedAreaIndex(null);
    }
  };

  const duplicateSelectedArea = () => {
    if (selectedAreaIndex !== null) {
      const areaToClone = areas[selectedAreaIndex];
      const clonedArea = {
        ...areaToClone,
        name: `${areaToClone.name} (Copia)`,
        displayName: `${areaToClone.displayName} (Copia)`,
        position: {
          ...areaToClone.position,
          x: areaToClone.position.x + 20,
          y: areaToClone.position.y + 20
        }
      };
      
      setAreas(prev => [...prev, clonedArea]);
      setSelectedAreaIndex(areas.length);
    }
  };

  // Handlers de zoom y pan
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));
    
    setStageScale(clampedScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const zoomIn = () => {
    const newScale = Math.min(3, stageScale * 1.2);
    setStageScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(0.1, stageScale / 1.2);
    setStageScale(newScale);
  };

  const resetZoom = () => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  // Handlers del formulario
  const updateSelectedArea = (field, value) => {
    if (selectedAreaIndex !== null) {
      const updatedArea = { ...areas[selectedAreaIndex] };
      
      if (field.startsWith('position.')) {
        const posField = field.replace('position.', '');
        updatedArea.position[posField] = posField === 'rotationDegree' ? value : Number(value);
      } else if (field.startsWith('accepts.')) {
        const acceptField = field.replace('accepts.', '');
        updatedArea.accepts[acceptField] = value;
      } else if (field.startsWith('konvaConfig.')) {
        const configField = field.replace('konvaConfig.', '');
        updatedArea.konvaConfig[configField] = configField === 'strokeColor' ? value : Number(value);
      } else {
        updatedArea[field] = field === 'maxElements' ? Number(value) : value;
      }
      
      handleAreaChange(selectedAreaIndex, updatedArea);
    }
  };

  // Validar y guardar
  const validateAreas = () => {
    const errors = [];
    
    areas.forEach((area, index) => {
      if (!area.name.trim()) {
        errors.push(`Área ${index + 1}: Nombre requerido`);
      }
      
      if (area.position.width <= 0 || area.position.height <= 0) {
        errors.push(`Área ${index + 1}: Dimensiones inválidas`);
      }
      
      if (!area.accepts.text && !area.accepts.image) {
        errors.push(`Área ${index + 1}: Debe aceptar al menos un tipo de elemento`);
      }
    });
    
    // Verificar superposiciones
    for (let i = 0; i < areas.length; i++) {
      for (let j = i + 1; j < areas.length; j++) {
        const a1 = areas[i].position;
        const a2 = areas[j].position;
        
        if (!(a1.x + a1.width < a2.x || 
              a2.x + a2.width < a1.x || 
              a1.y + a1.height < a2.y || 
              a2.y + a2.height < a1.y)) {
          errors.push(`Las áreas ${i + 1} y ${j + 1} se superponen`);
        }
      }
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateAreas();
    
    if (errors.length > 0) {
      await Swal.fire({
        title: 'Errores de validación',
        text: errors.join('\n'),
        icon: 'error',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#040DBF'
      });
      return;
    }
    
    onSaveAreas(areas);
  };

  const handleStageClick = (e) => {
    // Deselect when clicking on stage
    if (e.target === e.target.getStage()) {
      setSelectedAreaIndex(null);
    }
  };

  if (!isOpen) return null;

  const selectedArea = selectedAreaIndex !== null ? areas[selectedAreaIndex] : null;

  return (
    <div className="konva-editor-overlay">
      <div className="konva-editor-container">
        
        {/* Header */}
        <div className="konva-editor-header">
          <div className="konva-editor-title">
            <EditIcon />
            <h2>Editor de Áreas de Personalización</h2>
          </div>
          <button onClick={onClose} className="konva-close-btn">
            <XIcon />
          </button>
        </div>

        {/* Toolbar */}
        <div className="konva-toolbar">
          <div className="konva-toolbar-group">
            <button 
              onClick={addNewArea}
              className="konva-tool-btn primary"
            >
              <PlusIcon />
              <span>Nueva Área</span>
            </button>
            
            <button 
              onClick={duplicateSelectedArea}
              className="konva-tool-btn"
              disabled={selectedAreaIndex === null}
            >
              <EditIcon />
              <span>Duplicar</span>
            </button>
            
            <button 
              onClick={deleteSelectedArea}
              className="konva-tool-btn danger"
              disabled={selectedAreaIndex === null || areas.length <= 1}
            >
              <TrashIcon />
              <span>Eliminar</span>
            </button>
          </div>

          <div className="konva-toolbar-group">
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`konva-tool-btn ${showGrid ? 'active' : ''}`}
            >
              <GridIcon />
              <span>Cuadrícula</span>
            </button>
            
            <button 
              onClick={() => setShowLabels(!showLabels)}
              className={`konva-tool-btn ${showLabels ? 'active' : ''}`}
            >
              <EyeIcon />
              <span>Etiquetas</span>
            </button>
          </div>

          <div className="konva-toolbar-group">
            <button onClick={zoomOut} className="konva-tool-btn">
              <ZoomOutIcon />
            </button>
            
            <span className="konva-zoom-indicator">
              {Math.round(stageScale * 100)}%
            </span>
            
            <button onClick={zoomIn} className="konva-tool-btn">
              <ZoomInIcon />
            </button>
            
            <button onClick={resetZoom} className="konva-tool-btn">
              Ajustar
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="konva-editor-content">
          
          {/* Canvas */}
          <div className="konva-canvas-container" ref={containerRef}>
            <Stage
              ref={stageRef}
              width={stageDimensions.width}
              height={stageDimensions.height}
              scaleX={stageScale}
              scaleY={stageScale}
              x={stagePosition.x}
              y={stagePosition.y}
              onWheel={handleWheel}
              onClick={handleStageClick}
              onTap={handleStageClick}
              draggable
            >
              <Layer>
                {/* Grid */}
                {showGrid && (
                  <>
                    {Array.from({ length: Math.ceil(stageDimensions.width / 20) + 1 }).map((_, i) => (
                      <React.Fragment key={`v-${i}`}>
                        <KonvaImage
                          x={i * 20}
                          y={0}
                          width={1}
                          height={stageDimensions.height}
                          fill="rgba(31, 100, 191, 0.1)"
                        />
                      </React.Fragment>
                    ))}
                    {Array.from({ length: Math.ceil(stageDimensions.height / 20) + 1 }).map((_, i) => (
                      <React.Fragment key={`h-${i}`}>
                        <KonvaImage
                          x={0}
                          y={i * 20}
                          width={stageDimensions.width}
                          height={1}
                          fill="rgba(31, 100, 191, 0.1)"
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}
                
                {/* Background image */}
                {image && (
                  <KonvaImage
                    image={image}
                    width={stageDimensions.width}
                    height={stageDimensions.height}
                    listening={false}
                  />
                )}
                
                {/* Areas */}
                {areas.map((area, index) => (
                  <AreaRect
                    key={index}
                    area={area}
                    isSelected={selectedAreaIndex === index}
                    onSelect={() => handleAreaSelect(index)}
                    onChange={(newArea) => handleAreaChange(index, newArea)}
                    stageScale={stageScale}
                  />
                ))}
              </Layer>
            </Stage>
          </div>

          {/* Properties panel */}
          <div className="konva-properties-panel">
            <div className="konva-panel-header">
              <h3>Propiedades</h3>
              {selectedArea && (
                <span className="konva-selected-indicator">
                  Área {selectedAreaIndex + 1} seleccionada
                </span>
              )}
            </div>

            {selectedArea ? (
              <div className="konva-properties-content">
                
                {/* Basic properties */}
                <div className="konva-property-group">
                  <h4>Información Básica</h4>
                  
                  <div className="konva-property">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={selectedArea.name}
                      onChange={(e) => updateSelectedArea('name', e.target.value)}
                      className="konva-input"
                    />
                  </div>
                  
                  <div className="konva-property">
                    <label>Nombre Visible</label>
                    <input
                      type="text"
                      value={selectedArea.displayName}
                      onChange={(e) => updateSelectedArea('displayName', e.target.value)}
                      className="konva-input"
                    />
                  </div>
                </div>

                {/* Position properties */}
                <div className="konva-property-group">
                  <h4>Posición y Tamaño</h4>
                  
                  <div className="konva-property-grid">
                    <div className="konva-property">
                      <label>X</label>
                      <input
                        type="number"
                        value={selectedArea.position.x}
                        onChange={(e) => updateSelectedArea('position.x', e.target.value)}
                        className="konva-input"
                      />
                    </div>
                    
                    <div className="konva-property">
                      <label>Y</label>
                      <input
                        type="number"
                        value={selectedArea.position.y}
                        onChange={(e) => updateSelectedArea('position.y', e.target.value)}
                        className="konva-input"
                      />
                    </div>
                    
                    <div className="konva-property">
                      <label>Ancho</label>
                      <input
                        type="number"
                        value={selectedArea.position.width}
                        onChange={(e) => updateSelectedArea('position.width', e.target.value)}
                        className="konva-input"
                        min="1"
                      />
                    </div>
                    
                    <div className="konva-property">
                      <label>Alto</label>
                      <input
                        type="number"
                        value={selectedArea.position.height}
                        onChange={(e) => updateSelectedArea('position.height', e.target.value)}
                        className="konva-input"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="konva-property">
                    <label>Rotación (grados)</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedArea.position.rotationDegree || 0}
                      onChange={(e) => updateSelectedArea('position.rotationDegree', e.target.value)}
                      className="konva-slider"
                    />
                    <span className="konva-slider-value">
                      {selectedArea.position.rotationDegree || 0}°
                    </span>
                  </div>
                </div>

                {/* Element settings */}
                <div className="konva-property-group">
                  <h4>Configuración de Elementos</h4>
                  
                  <div className="konva-property">
                    <label>Máximo de Elementos</label>
                    <input
                      type="number"
                      value={selectedArea.maxElements}
                      onChange={(e) => updateSelectedArea('maxElements', e.target.value)}
                      className="konva-input"
                      min="1"
                      max="20"
                    />
                  </div>
                  
                  <div className="konva-property">
                    <label>Tipos de Elementos Permitidos</label>
                    <div className="konva-checkbox-group">
                      <label className="konva-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedArea.accepts.text}
                          onChange={(e) => updateSelectedArea('accepts.text', e.target.checked)}
                        />
                        <span>Texto</span>
                      </label>
                      <label className="konva-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedArea.accepts.image}
                          onChange={(e) => updateSelectedArea('accepts.image', e.target.checked)}
                        />
                        <span>Imágenes</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Visual properties */}
                <div className="konva-property-group">
                  <h4>Apariencia</h4>
                  
                  <div className="konva-property">
                    <label>Color del Borde</label>
                    <input
                      type="color"
                      value={selectedArea.konvaConfig?.strokeColor || '#1F64BF'}
                      onChange={(e) => updateSelectedArea('konvaConfig.strokeColor', e.target.value)}
                      className="konva-color-input"
                    />
                  </div>
                  
                  <div className="konva-property">
                    <label>Grosor del Borde</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={selectedArea.konvaConfig?.strokeWidth || 2}
                      onChange={(e) => updateSelectedArea('konvaConfig.strokeWidth', e.target.value)}
                      className="konva-slider"
                    />
                    <span className="konva-slider-value">
                      {selectedArea.konvaConfig?.strokeWidth || 2}px
                    </span>
                  </div>
                  
                  <div className="konva-property">
                    <label>Opacidad del Relleno</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedArea.konvaConfig?.fillOpacity || 0.2}
                      onChange={(e) => updateSelectedArea('konvaConfig.fillOpacity', e.target.value)}
                      className="konva-slider"
                    />
                    <span className="konva-slider-value">
                      {Math.round((selectedArea.konvaConfig?.fillOpacity || 0.2) * 100)}%
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="konva-no-selection">
                <MoveIcon />
                <p>Selecciona un área para editar sus propiedades</p>
                <p className="konva-help-text">
                  Haz clic en un área del canvas o usa el botón "Nueva Área" para comenzar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="konva-editor-footer">
          <div className="konva-footer-info">
            <span>Áreas definidas: {areas.length}</span>
            {selectedArea && (
              <span>• Área seleccionada: {selectedArea.name}</span>
            )}
          </div>
          
          <div className="konva-footer-actions">
            <button onClick={onClose} className="konva-cancel-btn">
              Cancelar
            </button>
            <button onClick={handleSave} className="konva-save-btn">
              <SaveIcon />
              <span>Guardar Áreas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonvaAreaEditor;