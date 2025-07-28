import { useEffect, useState } from 'react';
import './BonziBuddy.css';

const PHRASE_GIF_MAP = {
    '¿Te estoy aburriendo?': 'bonzi-sad.gif',
    'No me esperabas por aquí, ¿No?': 'bonzi-glasses.gif',
    '¿No sabes qué decir?': 'bonzi-laugh.gif',
    'Será mejor que me relaje': 'bonzi-music.gif',
    'Si tienes dudas, intenta contactárnos': 'bonzi-low-glasses.gif'
  };
  
  const PHRASES = [
    '¿Te estoy aburriendo?',
    'No me esperabas por aquí, ¿No?',
    '¿No sabes qué decir?',
    'Será mejor que me relaje',
    '¿Puedo ayudarte con algo más?',
    'Si tienes dudas, intenta contactárnos'
  ];

const getGifBaseName = (phrase) => PHRASE_GIF_MAP[phrase] || 'bonzi-idle';

export default function BonziBuddy() {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentGif, setCurrentGif] = useState('bonzi-idle');

  useEffect(() => {
    const showPhrase = () => {
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      const gifName = getGifBaseName(phrase);
      setCurrentPhrase(phrase);
      setCurrentGif(gifName);

      // 1. Mostrar animación
      setTimeout(() => {
        // 2. Mostrar imagen estática como "reversa"
        setCurrentGif(`${gifName}-still`);

        // 3. Volver a idle
        setTimeout(() => {
          setCurrentGif('bonzi-idle');
          setCurrentPhrase('');
        }, 1000); // tiempo del "reversa"
      }, 3500); // duración de gif activo
    };

    const interval = setInterval(showPhrase, 10000);
    showPhrase(); // inicial

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bonzi-container">
      {currentPhrase && <div className="bonzi-bubble">{currentPhrase}</div>}
      <img
        className="bonzi-gif"
        src={`/gifs/${currentGif}.gif`.replace('-still.gif', '-still.png')}
        alt="Bonzi Buddy"
      />
    </div>
  );
}
