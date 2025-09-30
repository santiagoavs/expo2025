import './catalogue.css';
import Cards from '../../components/UI/card/card';
import Footer from '../../components/UI/footer/footer';
import Notifications from '../../components/UI/notifications/notifications';
import ContactButton from '../../components/UI/contactButton/contactButton';

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
      <Notifications />
      <ContactButton />
      <Footer />
    </>
  );
}
