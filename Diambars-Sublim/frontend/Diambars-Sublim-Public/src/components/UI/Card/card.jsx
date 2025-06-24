import React from 'react';
import './card.css';

const Cards = () => {
  return (
    <div className="cards-container">
      <div className="card">
        <div className="card-content">
          <img src="/images/home/Group 139.png" alt="Card 1" />
          <div className='titulo'>
            <h3>NO hay hogar como tu hogar, ahi perteneeeeces tuuu</h3>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-content">
          <img src="/images/home/Group 140.png" alt="Card 2" />
          <div className='titulo'>
          <h3>Ropa</h3>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-content">
          <img src="/images/home/Group 141.png" alt="Card 3" />
          <div className='titulo'>
            <h3>Accesorios</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
