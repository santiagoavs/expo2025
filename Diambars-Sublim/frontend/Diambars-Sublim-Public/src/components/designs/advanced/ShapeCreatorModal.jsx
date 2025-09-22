// ShapeCreatorModal.jsx - Modal for creating custom shapes with traditional CSS
import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Rect, Star, RegularPolygon } from 'react-konva';
import './ShapeCreatorModal.css';

const ShapeCreatorModal = ({ 
  isOpen, 
  onClose, 
  onAddShape, 
  onAddCustomShape 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [customPoints, setCustomPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeProperties, setShapeProperties] = useState({
    fill: '#1f64bf',
    stroke: '#164a8a',
    strokeWidth: 2,
    closed: true
  });
  const [starProperties, setStarProperties] = useState({
    numPoints: 5,
    innerRadius: 20,
    outerRadius: 40
  });

  const stageRef = useRef();

  const shapeTemplates = [
    { id: 'rect', label: 'Rectángulo', icon: '⬜' },
    { id: 'circle', label: 'Círculo', icon: '⭕' },
    { id: 'triangle', label: 'Triángulo', icon: '🔺' },
    { id: 'star', label: 'Estrella', icon: '⭐' },
    { id: 'pentagon', label: 'Pentágono', icon: '⬟' },
    { id: 'hexagon', label: 'Hexágono', icon: '⬡' },
    { id: 'octagon', label: 'Octágono', icon: '⯃' },
    { id: 'custom', label: 'Personalizada', icon: '✏️' }
  ];

  // ==================== EVENT HANDLERS ====================
  const handleCanvasClick = (e) => {
    if (selectedTemplate !== 'custom' || !isDrawing) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    setCustomPoints(prev => [
      ...prev,
      pointerPosition.x,
      pointerPosition.y
    ]);
  };

  const clearCustomShape = () => {
    setCustomPoints([]);
  };

  const finishCustomShape = () => {
    if (customPoints.length < 6) {
      alert('Necesitas al menos 3 puntos para crear una forma');
      return;
    }
    
    onAddCustomShape(customPoints, shapeProperties);
    handleClose(); // Modal closes automatically after adding custom shape
  };

  const createPresetShape = (shapeType) => {
    let shapeData = {
      fill: shapeProperties.fill,
      stroke: shapeProperties.stroke,
      strokeWidth: shapeProperties.strokeWidth
    };

    switch (shapeType) {
      case 'star':
        const starPoints = generateStarPoints(
          starProperties.numPoints,
          starProperties.innerRadius,
          starProperties.outerRadius
        );
        shapeData = { 
          ...shapeData,
          points: starPoints,
          numPoints: starProperties.numPoints,
          innerRadius: starProperties.innerRadius,
          outerRadius: starProperties.outerRadius,
          closed: true,
          lineCap: 'round',
          lineJoin: 'round'
        };
        break;
      case 'pentagon':
        shapeData.points = generatePentagonPoints();
        shapeData.closed = true;
        break;
      case 'hexagon':
        shapeData.points = generateHexagonPoints();
        shapeData.closed = true;
        break;
      case 'octagon':
        shapeData.points = generateOctagonPoints();
        shapeData.closed = true;
        break;
      case 'triangle':
        shapeData.points = generateTrianglePoints();
        shapeData.closed = true;
        break;
    }
    
    onAddShape(shapeType, shapeData);
    handleClose(); // Modal closes automatically after adding shape
  };

  // ==================== SHAPE GENERATORS ====================
  const generateStarPoints = (numPoints, innerRadius, outerRadius) => {
    const points = [];
    const step = Math.PI / numPoints;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push(Math.cos(angle) * radius + outerRadius);
      points.push(Math.sin(angle) * radius + outerRadius);
    }
    
    return points;
  };

  const generateTrianglePoints = () => {
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    const points = [];
    
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const generatePentagonPoints = () => {
    const points = [];
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const generateHexagonPoints = () => {
    const points = [];
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const generateOctagonPoints = () => {
    const points = [];
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const renderCustomPoints = () => {
    const points = [];
    for (let i = 0; i < customPoints.length; i += 2) {
      points.push(
        <Circle
          key={i}
          x={customPoints[i]}
          y={customPoints[i + 1]}
          radius={4}
          fill={shapeProperties.fill}
          stroke={shapeProperties.stroke}
          strokeWidth={2}
        />
      );
    }
    return points;
  };

  // ==================== PREVIEW RENDERER ====================
  const renderShapePreview = () => {
    const centerX = 225; // Center of 450px canvas
    const centerY = 140; // Center of 280px canvas
    const size = 80; // Base size for shapes

    switch (selectedTemplate) {
      case 'rect':
        return (
          <Rect
            x={centerX - size/2}
            y={centerY - size/2}
            width={size}
            height={size}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
          />
        );
      
      case 'circle':
        return (
          <Circle
            x={centerX}
            y={centerY}
            radius={size/2}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
          />
        );
      
      case 'triangle':
        const trianglePoints = [];
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          trianglePoints.push(centerX + Math.cos(angle) * size/2);
          trianglePoints.push(centerY + Math.sin(angle) * size/2);
        }
        return (
          <Line
            points={trianglePoints}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
            closed={true}
          />
        );
      
      case 'star':
        return (
          <Star
            x={centerX}
            y={centerY}
            numPoints={starProperties.numPoints}
            innerRadius={starProperties.innerRadius}
            outerRadius={starProperties.outerRadius}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
          />
        );
      
      case 'pentagon':
        return (
          <RegularPolygon
            x={centerX}
            y={centerY}
            sides={5}
            radius={size/2}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
          />
        );
      
      case 'hexagon':
        return (
          <RegularPolygon
            x={centerX}
            y={centerY}
            sides={6}
            radius={size/2}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
          />
        );
      
      case 'octagon':
        return (
          <RegularPolygon
            x={centerX}
            y={centerY}
            sides={8}
            radius={size/2}
            fill={shapeProperties.fill}
            stroke={shapeProperties.stroke}
            strokeWidth={shapeProperties.strokeWidth}
          />
        );
      
      default:
        return null;
    }
  };

  const handleClose = () => {
    setCustomPoints([]);
    setIsDrawing(false);
    setSelectedTemplate('custom');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="shape-creator-modal-overlay">
      <div className="shape-creator-modal">
        {/* Header */}
        <div className="shape-creator-header">
          <div className="header-title">
            <span className="header-icon">🎨</span>
            <h2>Creador de Formas Personalizadas</h2>
          </div>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="shape-creator-content">
          {/* Canvas Section */}
          <div className="canvas-section">
            <div className="section-header">
              <h3>🎨 Lienzo de Dibujo</h3>
            </div>
            
            <div className="preview-canvas">
              <Stage
                ref={stageRef}
                width={450}
                height={280}
                onMouseDown={handleCanvasClick}
              >
                <Layer>
                  {/* Shape Preview for preset templates */}
                  {selectedTemplate !== 'custom' && renderShapePreview()}
                  
                  {/* Custom shape drawing */}
                  {selectedTemplate === 'custom' && (
                    <>
                      {/* Connecting lines */}
                      {customPoints.length >= 4 && (
                        <Line
                          points={customPoints}
                          stroke={shapeProperties.stroke}
                          strokeWidth={shapeProperties.strokeWidth}
                          closed={false}
                          dash={[5, 5]}
                        />
                      )}
                      
                      {/* Individual points */}
                      {renderCustomPoints()}
                      
                      {/* Preview of closed shape */}
                      {customPoints.length >= 6 && shapeProperties.closed && (
                        <Line
                          points={customPoints}
                          fill={shapeProperties.fill}
                          stroke={shapeProperties.stroke}
                          strokeWidth={shapeProperties.strokeWidth}
                          closed={true}
                          opacity={0.7}
                        />
                      )}
                    </>
                  )}
                </Layer>
              </Stage>
            </div>

            {/* Canvas controls */}
            <div className="canvas-controls">
              {selectedTemplate === 'custom' ? (
                <>
                  <button
                    className={`control-button ${isDrawing ? 'active' : ''}`}
                    onClick={() => setIsDrawing(!isDrawing)}
                  >
                    {isDrawing ? '✓ Dibujando...' : '✏️ Iniciar dibujo'}
                  </button>
                  
                  <button
                    className="control-button danger"
                    onClick={clearCustomShape}
                    disabled={customPoints.length === 0}
                  >
                    🗑️ Limpiar
                  </button>

                  {customPoints.length > 0 && (
                    <span className="points-counter">
                      {customPoints.length / 2} puntos
                    </span>
                  )}
                </>
              ) : (
                <div className="preview-info">
                  <span className="preview-label">
                    👁️ Vista previa de {shapeTemplates.find(t => t.id === selectedTemplate)?.label}
                  </span>
                  <span className="preview-hint">
                    Ajusta las propiedades para ver los cambios en tiempo real
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-section">
            {/* Shape Templates */}
            <div className="property-group">
              <h4>📐 Tipo de Forma</h4>
              <div className="shape-grid">
                {shapeTemplates.map(template => (
                  <button
                    key={template.id}
                    className={`shape-button ${selectedTemplate === template.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setIsDrawing(false);
                      setCustomPoints([]);
                    }}
                  >
                    <span className="shape-icon">{template.icon}</span>
                    <span className="shape-label">{template.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Star Configuration */}
            {selectedTemplate === 'star' && (
              <div className="property-group">
                <h4>⭐ Configuración de Estrella</h4>
                
                <div className="property-item">
                  <label>Puntas: {starProperties.numPoints}</label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={starProperties.numPoints}
                    onChange={(e) => setStarProperties(prev => ({ 
                      ...prev, 
                      numPoints: parseInt(e.target.value) 
                    }))}
                    className="slider"
                  />
                </div>

                <div className="property-row">
                  <div className="property-item">
                    <label>Radio interior</label>
                    <input
                      type="number"
                      value={starProperties.innerRadius}
                      onChange={(e) => setStarProperties(prev => ({ 
                        ...prev, 
                        innerRadius: parseInt(e.target.value) 
                      }))}
                      className="number-input"
                    />
                  </div>
                  <div className="property-item">
                    <label>Radio exterior</label>
                    <input
                      type="number"
                      value={starProperties.outerRadius}
                      onChange={(e) => setStarProperties(prev => ({ 
                        ...prev, 
                        outerRadius: parseInt(e.target.value) 
                      }))}
                      className="number-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Visual Properties */}
            <div className="property-group">
              <h4>🎨 Propiedades Visuales</h4>
              
              <div className="property-item">
                <label>Color de relleno</label>
                <input
                  type="color"
                  value={shapeProperties.fill}
                  onChange={(e) => setShapeProperties(prev => ({ 
                    ...prev, 
                    fill: e.target.value 
                  }))}
                  className="color-input"
                />
              </div>
              
              <div className="property-item">
                <label>Color de borde</label>
                <input
                  type="color"
                  value={shapeProperties.stroke}
                  onChange={(e) => setShapeProperties(prev => ({ 
                    ...prev, 
                    stroke: e.target.value 
                  }))}
                  className="color-input"
                />
              </div>
              
              <div className="property-item">
                <label>Grosor de borde</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={shapeProperties.strokeWidth}
                  onChange={(e) => setShapeProperties(prev => ({ 
                    ...prev, 
                    strokeWidth: parseInt(e.target.value) 
                  }))}
                  className="number-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shape-creator-footer">
          <button className="footer-button secondary" onClick={handleClose}>
            Cancelar
          </button>
          
          {selectedTemplate === 'custom' && customPoints.length >= 6 && (
            <button
              className="footer-button primary"
              onClick={finishCustomShape}
            >
              ✓ Crear Forma Personalizada
            </button>
          )}
          
          {selectedTemplate !== 'custom' && (
            <button
              className="footer-button primary"
              onClick={() => createPresetShape(selectedTemplate)}
            >
              ➕ Agregar {shapeTemplates.find(t => t.id === selectedTemplate)?.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShapeCreatorModal;
