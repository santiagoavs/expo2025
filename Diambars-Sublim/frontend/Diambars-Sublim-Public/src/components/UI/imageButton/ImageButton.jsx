import './ImageButton.css';

export default function ImageButton({ src, alt, onClick }) {
  return (
    <button className="image-button" onClick={onClick}>
      <img src={src} alt={alt} />
    </button>
  );
}
