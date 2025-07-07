import React from 'react';
import './card.css';
import { useNavigate } from 'react-router-dom';

const Cards = () => {
    
    const navigate = useNavigate();

    const handleClick = (category) => {
    navigate(`/catalogue/${category.toLowerCase()}`);
    };

  return (
    <div className="cards-container">
      <div className="card" onClick={() => handleClick('Hogar')}>
        <div className="card-content">
          <img src="/images/catalogue/Group 139.png" alt="Card 1" />
          <div className='titulo'>
            <h3>Hogar</h3>
          </div>
        </div>
      </div>
      <div className="card" onClick={() => handleClick('Ropa')}>
        <div className="card-content">
          <img src="/images/catalogue/Group 140.png" alt="Card 2" />
          <div className='titulo'>
          <h3>Ropa</h3>
          </div>
        </div>
      </div>
      <div className="card" onClick={() => handleClick('Accesorios')}>
        <div className="card-content">
          <img src="/images/catalogue/Group 141.png" alt="Card 3" />
          <div className='titulo'>
            <h3>Accesorios</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;