import React, { useState } from 'react';
import NavbarProductDesigner from '../../components/customProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/customProductDesigner/processBar';
import ArtworkPreviewCard from '../../components/addYourArtwork/artworkPreviewCard';
import UploadArtworkForm from '../../components/addYourArtwork/UploadArtworkForm';
import ArtworkPlacementOptions from '../../components/addYourArtwork/ArtworkPlacementOptions';
import ContinueButton from '../../components/customProductDesigner/continueButton';
import './AddYourArtwork.css';

const AddYourArtwork = () => {
  const currentStep = 2;
  const [images, setImages] = useState([]);

  const handleContinue = () => {
    console.log('Avanzar al siguiente paso');
  };

  return (
    <div className="add-your-artwork-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />

      <div className="add-your-artwork-content">
        <div className="artwork-preview-card-position">
          <ArtworkPreviewCard />
        </div>
        <div className="upload-artwork-form-position">
          <UploadArtworkForm images={images} setImages={setImages} />
        </div>
        <div className="artwork-placement-options-position">
          <ArtworkPlacementOptions uploadedImages={images} />
        </div>
        <div className="continue-button-position">
          <ContinueButton onClick={handleContinue} className="aya-custom-button">
            Continuar a la confirmación
          </ContinueButton>
        </div>
      </div>
    </div>
  );
};

export default AddYourArtwork;
