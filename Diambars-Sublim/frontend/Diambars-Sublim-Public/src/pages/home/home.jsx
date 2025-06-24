import './home.css';
import ImageButton from '../../components/UI/ImageButton/ImageButton';
import ContactButton from '../../components/UI/contactButton/contactButton';

export default function Home() {
  return (
<>
    <section className="home-section top">
        <div className="home-container">
          <div className="text-content">
            <img src="/images/home/titulo-superior.png" alt="Imprime tu estilo" className="title-img" />
            <p className="description">
              En Diambars Sublim traemos tus ideas a la realidad,<br />
              desde camisas, tazas y gorros.<br />
              El catálogo no tiene límites.
            </p>
            <ImageButton src="/images/home/buttonBackground.png" alt="Catálogo" />
          </div>
          <img src="/images/home/decoracion-superior.png" alt="Productos parte superior" className="products-img" />
        </div>
      </section>
      <section className="home-section bottom">
        <div className="home-container-bottom">
          <div className="text-content-bottom">
            <img src="/images/home/titulo-inferior.png" alt="Diseña lo que tengas en mente" className="title-img" />
            <p className="description-bottom">
              Siempre es bueno escuchar sugerencias, por lo que si cuentas con una idea que no se encuentra
              en el catálogo, no dudes en ponerte en contacto a través de nuestros medios oficiales.<br /><br />
              Puedes encontrar más información en <a href="/contact">Contáctanos</a>.<br />
              ¿Te intriga escuchar nuestra historia? Te contamos todo en <a href="/info">Acerca de Nosotros</a>.
            </p>
          </div>
          <img src="/images/home/decoracion-inferior.png" alt="Productos parte inferior" className="products-img" />
        </div>
      </section>
      <ContactButton />
      </>
  );
}
