// components/UnifiedPanel/UnifiedPanel.jsx - PROPERTIES PANEL (CSS VERSION)
import React, { useState } from 'react';
import './UnifiedPanel.css';

const UnifiedPanel = ({
  selectedElements = [],
  onUpdateElement,
  onUpdateElements,
  customizationAreas = [],
  onUpdateArea
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  const [expandedSections, setExpandedSections] = useState({
    position: true,
    appearance: true,
    text: true,
    effects: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleElementUpdate = (property, value) => {
    if (selectedElements.length === 1) {
      onUpdateElement(selectedElements[0].id, { [property]: value });
    } else if (selectedElements.length > 1) {
      const updates = { [property]: value };
      selectedElements.forEach(element => {
        onUpdateElement(element.id, updates);
      });
    }
  };

  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const hasSelection = selectedElements.length > 0;
  const isMultiSelection = selectedElements.length > 1;

  const tabs = [
    { id: 'properties', label: 'Propiedades', icon: '⚙️' },
    { id: 'layers', label: 'Capas', icon: '📋' },
    { id: 'areas', label: 'Áreas', icon: '🎯' }
  ];

  return (
    <div className="unified-panel">
      {/* Tab Navigation */}
      <div className="panel-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`panel-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {activeTab === 'properties' && (
          <div className="properties-tab">
            {!hasSelection ? (
              <div className="no-selection">
                <div className="no-selection-icon">🎨</div>
                <p>Selecciona un elemento para ver sus propiedades</p>
              </div>
            ) : (
              <div className="properties-sections">
                {/* Selection Info */}
                <div className="selection-info">
                  {isMultiSelection ? (
                    <p>{selectedElements.length} elementos seleccionados</p>
                  ) : (
                    <p>Elemento: {selectedElement?.type || 'Desconocido'}</p>
                  )}
                </div>

                {/* Position Section */}
                <div className="property-section">
                  <button
                    className="section-header"
                    onClick={() => toggleSection('position')}
                  >
                    <span>📍 Posición y Tamaño</span>
                    <span className={`expand-icon ${expandedSections.position ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedSections.position && (
                    <div className="section-content">
                      <div className="property-row">
                        <label>X:</label>
                        <input
                          type="number"
                          value={selectedElement?.x || 0}
                          onChange={(e) => handleElementUpdate('x', parseFloat(e.target.value) || 0)}
                          disabled={isMultiSelection}
                        />
                      </div>
                      <div className="property-row">
                        <label>Y:</label>
                        <input
                          type="number"
                          value={selectedElement?.y || 0}
                          onChange={(e) => handleElementUpdate('y', parseFloat(e.target.value) || 0)}
                          disabled={isMultiSelection}
                        />
                      </div>
                      {selectedElement?.width !== undefined && (
                        <div className="property-row">
                          <label>Ancho:</label>
                          <input
                            type="number"
                            value={selectedElement.width}
                            onChange={(e) => handleElementUpdate('width', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}
                      {selectedElement?.height !== undefined && (
                        <div className="property-row">
                          <label>Alto:</label>
                          <input
                            type="number"
                            value={selectedElement.height}
                            onChange={(e) => handleElementUpdate('height', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}
                      <div className="property-row">
                        <label>Rotación:</label>
                        <input
                          type="number"
                          value={selectedElement?.rotation || 0}
                          onChange={(e) => handleElementUpdate('rotation', parseFloat(e.target.value) || 0)}
                          step="1"
                          min="-360"
                          max="360"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Appearance Section */}
                <div className="property-section">
                  <button
                    className="section-header"
                    onClick={() => toggleSection('appearance')}
                  >
                    <span>🎨 Apariencia</span>
                    <span className={`expand-icon ${expandedSections.appearance ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedSections.appearance && (
                    <div className="section-content">
                      <div className="property-row">
                        <label>Opacidad:</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={selectedElement?.opacity || 1}
                          onChange={(e) => handleElementUpdate('opacity', parseFloat(e.target.value))}
                        />
                        <span className="range-value">
                          {Math.round((selectedElement?.opacity || 1) * 100)}%
                        </span>
                      </div>
                      {(selectedElement?.fill !== undefined || selectedElement?.type === 'text') && (
                        <div className="property-row">
                          <label>Color:</label>
                          <input
                            type="color"
                            value={selectedElement?.fill || '#000000'}
                            onChange={(e) => handleElementUpdate('fill', e.target.value)}
                          />
                        </div>
                      )}
                      {selectedElement?.stroke !== undefined && (
                        <>
                          <div className="property-row">
                            <label>Borde:</label>
                            <input
                              type="color"
                              value={selectedElement.stroke || '#000000'}
                              onChange={(e) => handleElementUpdate('stroke', e.target.value)}
                            />
                          </div>
                          <div className="property-row">
                            <label>Grosor:</label>
                            <input
                              type="number"
                              value={selectedElement.strokeWidth || 0}
                              onChange={(e) => handleElementUpdate('strokeWidth', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="1"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Text Section */}
                {selectedElement?.type === 'text' && (
                  <div className="property-section">
                    <button
                      className="section-header"
                      onClick={() => toggleSection('text')}
                    >
                      <span>📝 Texto</span>
                      <span className={`expand-icon ${expandedSections.text ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {expandedSections.text && (
                      <div className="section-content">
                        <div className="property-row">
                          <label>Contenido:</label>
                          <textarea
                            value={selectedElement.text || ''}
                            onChange={(e) => handleElementUpdate('text', e.target.value)}
                            rows="3"
                          />
                        </div>
                        <div className="property-row">
                          <label>Tamaño:</label>
                          <input
                            type="number"
                            value={selectedElement.fontSize || 24}
                            onChange={(e) => handleElementUpdate('fontSize', parseFloat(e.target.value) || 24)}
                            min="8"
                            max="200"
                          />
                        </div>
                        <div className="property-row">
                          <label>Fuente:</label>
                          <select
                            value={selectedElement.fontFamily || 'Arial'}
                            onChange={(e) => handleElementUpdate('fontFamily', e.target.value)}
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Courier New">Courier New</option>
                          </select>
                        </div>
                        <div className="property-row">
                          <label>Peso:</label>
                          <select
                            value={selectedElement.fontWeight || 'normal'}
                            onChange={(e) => handleElementUpdate('fontWeight', e.target.value)}
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Negrita</option>
                            <option value="lighter">Ligera</option>
                          </select>
                        </div>
                        <div className="property-row">
                          <label>Alineación:</label>
                          <select
                            value={selectedElement.align || 'left'}
                            onChange={(e) => handleElementUpdate('align', e.target.value)}
                          >
                            <option value="left">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="right">Derecha</option>
                            <option value="justify">Justificado</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="layers-tab">
            <div className="layers-header">
              <h3>Capas del Diseño</h3>
              <span className="layers-count">{selectedElements.length} elementos</span>
            </div>
            <div className="layers-list">
              {selectedElements.length === 0 ? (
                <div className="no-layers">
                  <p>No hay elementos en el diseño</p>
                </div>
              ) : (
                selectedElements.map((element, index) => (
                  <div key={element.id} className="layer-item">
                    <div className="layer-info">
                      <span className="layer-type">{element.type}</span>
                      <span className="layer-name">
                        {element.text || element.name || `Elemento ${index + 1}`}
                      </span>
                    </div>
                    <div className="layer-controls">
                      <button
                        className="layer-visibility"
                        title={element.visible !== false ? 'Ocultar' : 'Mostrar'}
                      >
                        {element.visible !== false ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'areas' && (
          <div className="areas-tab">
            <div className="areas-header">
              <h3>Áreas de Personalización</h3>
              <span className="areas-count">{customizationAreas.length} áreas</span>
            </div>
            <div className="areas-list">
              {customizationAreas.length === 0 ? (
                <div className="no-areas">
                  <p>No hay áreas definidas</p>
                </div>
              ) : (
                customizationAreas.map((area) => (
                  <div key={area.id || area._id} className="area-item">
                    <div className="area-info">
                      <span className="area-name">{area.name || 'Área sin nombre'}</span>
                      <span className="area-size">
                        {area.position?.width || 0} × {area.position?.height || 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedPanel;
