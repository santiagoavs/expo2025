import React, { useState } from 'react';
import './ArtworkPreviewCard.css';
import { FaRegImage } from 'react-icons/fa';
import { MdOpenWith } from 'react-icons/md'; // ✅ Ícono de mover compatible

const tabs = ['Frente', 'Atrás', 'Mangas'];

const ArtworkPreviewCard = () => {
  const [activeTab, setActiveTab] = useState('Frente');

  return (
    <div className="artwork-preview-card">
      <h3 className="apc-title">Vista previa del producto</h3>

      <div className="apc-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`apc-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="apc-preview-area">
        <div className="apc-image-frame">
          <div className="apc-drag-icon">
            <MdOpenWith size={14} />
          </div>
          <FaRegImage className="apc-image-icon" size={36} />
        </div>
      </div>
    </div>
  );
};

export default ArtworkPreviewCard;
