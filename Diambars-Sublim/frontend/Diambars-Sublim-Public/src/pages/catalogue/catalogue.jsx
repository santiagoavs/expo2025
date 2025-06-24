import './catalogue.css';
import Cards from '../../components/UI/Card/card';
import Footer from '../../components/UI/footer/footer';



export default function catalogue() {
    return (
  <>
      <section className="home-section top">
          <div className="home-container">
            <div className="text-content">
            <Cards />
            </div>
          </div>
        </section>
        <Footer />

        
        </>
    );
  }

  