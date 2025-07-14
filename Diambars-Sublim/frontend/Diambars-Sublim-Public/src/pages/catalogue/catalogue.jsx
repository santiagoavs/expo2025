import './catalogue.css';
import Cards from '../../components/UI/card/card';
import Footer from '../../components/UI/footer/footer';

export default function Catalogue() {
  return (
    <>
      <section className="catalogue-section">
        <div className="catalogue-container">
          <div className="catalogue-text-content">
            <Cards />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
