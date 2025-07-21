import React from 'react';
import './UploadArtworkForm.css';
import { FaCloudUploadAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';

const UploadArtworkForm = ({ images, setImages }) => {
  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file =>
      ['image/png', 'image/jpeg'].includes(file.type)
    ).slice(0, 4 - images.length);

    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...previews]);
  };

  const handleRemove = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="aaf-wrapper">
      <h3 className="aaf-title">Subir imágenes</h3>
      <p className="aaf-description">
        Añade hasta 4 imágenes (PNG/JPG) para tu diseño personalizado
      </p>

      <label className="aaf-dropzone">
        <FaCloudUploadAlt className="aaf-icon" />
        <span className="aaf-drop-text">Arrastre y suelte o haga clic para cargar</span>
        <span className="aaf-size-note">Tamaño máximo de archivo: 5 MB</span>
        <input
          type="file"
          accept="image/png, image/jpeg"
          multiple
          onChange={handleUpload}
          hidden
        />
      </label>

      <div className="aaf-gallery">
        <div className="aaf-gallery-header">
          <span className="aaf-gallery-title">Tus imágenes</span>
          <span className="aaf-gallery-count">{images.length} / 4</span>
        </div>

        <div className="aaf-thumbnails">
          {images.map((src, i) => (
            <div key={i} className="aaf-thumb">
              <img src={src} alt={`img-${i}`} />
              <button className="aaf-remove" onClick={() => handleRemove(i)}>
                <FaTrashAlt size={12} />
              </button>
            </div>
          ))}

          {images.length < 4 && (
            <label className="aaf-thumb aaf-thumb-add">
              <FaPlus size={16} />
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleUpload}
                hidden
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadArtworkForm;
