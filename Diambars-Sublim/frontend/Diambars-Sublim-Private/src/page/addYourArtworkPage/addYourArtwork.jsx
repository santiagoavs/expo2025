import React, { useState } from 'react';
import NavbarProductDesigner from '../../components/customProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/customProductDesigner/processBar';
import ArtworkPreviewCard from '../../components/addYourArtwork/artworkPreviewCard';
import UploadArtworkForm from '../../components/addYourArtwork/UploadArtworkForm';
import ArtworkPlacementOptions from '../../components/addYourArtwork/ArtworkPlacementOptions';
import ContinueButton from '../../components/customProductDesigner/continueButton'; // ✅ Importado
import './AddYourArtwork.css';

const AddYourArtwork = () => {
  const currentStep = 2;
  const [images, setImages] = useState([]);

  const handleContinue = () => {
    console.log('Avanzar al siguiente paso');
    // También podés usar useNavigate para redirección si lo necesitás
  };

  return (
    <div className="add-your-artwork-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />

      <div className="add-your-artwork-content">
        <ArtworkPreviewCard />
        <UploadArtworkForm images={images} setImages={setImages} />
        <ArtworkPlacementOptions uploadedImages={images} />
        <div className="add-your-artwork-continue">
          <ContinueButton onClick={handleContinue} className="aya-custom-button">
            Continuar a la confirmación
          </ContinueButton>
        </div>
      </div>
    </div>
  );
};

export default AddYourArtwork;
