import React, { useState } from 'react';
import './ArtworkPlacementOptions.css';

const zoneDescriptions = {
  heart: 'Ubicado sobre el pecho izquierdo, a 10 cm debajo del hombro.',
  back: 'Centrada entre los omóplatos, ideal para diseños más grandes.',
  sleeve: 'Sobre la manga izquierda, ideal para logotipos o elementos verticales.'
};

const zones = [
  { value: '', label: 'Seleccione una zona de ubicación' },
  { value: 'heart', label: 'Área del corazón' },
  { value: 'back', label: 'Espalda central' },
  { value: 'sleeve', label: 'Manga izquierda' }
];

const ArtworkPlacementOptions = ({ uploadedImages }) => {
  const [mode, setMode] = useState('sencillo');
  const [selectedZone, setSelectedZone] = useState('');

  return (
    <div className="apo-wrapper">
      <h3 className="apo-title">Modo de colocación</h3>

      <div className="apo-mode-toggle">
        <button
          className={`apo-mode-button ${mode === 'sencillo' ? 'active' : ''}`}
          onClick={() => setMode('sencillo')}
        >
          Modo sencillo
        </button>
        <button
          className={`apo-mode-button ${mode === 'avanzado' ? 'active' : ''}`}
          onClick={() => setMode('avanzado')}
        >
          Modo avanzado
        </button>
      </div>

      <label className="apo-label">Elija el área de ubicación</label>
      <select
        className="apo-select"
        value={selectedZone}
        onChange={e => setSelectedZone(e.target.value)}
      >
        {zones.map((zone, i) => (
          <option key={i} value={zone.value}>
            {zone.label}
          </option>
        ))}
      </select>

      {selectedZone && zoneDescriptions[selectedZone] && (
        <p className="apo-note">{zoneDescriptions[selectedZone]}</p>
      )}

      {uploadedImages.length > 0 && (
        <div className="apo-image-selector">
          {uploadedImages.map((src, i) => (
            <div key={i} className="apo-image-box">
              <img
                src={src}
                alt={`placement-${i}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtworkPlacementOptions;
