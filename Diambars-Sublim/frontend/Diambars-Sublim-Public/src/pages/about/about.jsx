import React, { useState, useRef, useEffect } from 'react';
import './about.css';
import bgLogo from '/images/aboutUs/bgLogo.png';
import Footer from '../../components/UI/footer/footer';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Notifications from '../../components/UI/notifications/notifications'

const About = () => {
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'terms', 'privacy', 'cookies'
  const [openAccordions, setOpenAccordions] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(tab);
    // Removido: setOpenAccordions({}); // Los acordeones mantienen su estado
    
    // Resetear la transición después de la animación
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Componente Acordeón mejorado
  const AccordionItem = ({ id, title, children, tag }) => {
    const contentRef = useRef(null);
    const isOpen = openAccordions[id];

    useEffect(() => {
      if (contentRef.current) {
        const content = contentRef.current;
        
        if (isOpen) {
          // Abrir acordeón - animación suave
          content.style.height = '0px';
          content.style.opacity = '0';
          content.style.transform = 'translateY(-10px)';
          content.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          content.style.visibility = 'visible';
          
          // Forzar reflow
          content.offsetHeight;
          
          // Animar a la altura real
          const targetHeight = content.scrollHeight;
          content.style.height = targetHeight + 'px';
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
          
          // Limpiar altura después de la animación
          setTimeout(() => {
            content.style.height = 'auto';
          }, 400);
          
        } else {
          // Cerrar acordeón - animación suave igual a la de apertura
          const currentHeight = content.scrollHeight;
          content.style.height = currentHeight + 'px';
          content.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          content.style.visibility = 'visible';
          
          // Forzar reflow
          content.offsetHeight;
          
          // Animar a altura 0 con la misma suavidad
          content.style.height = '0px';
          content.style.opacity = '0';
          content.style.transform = 'translateY(-10px)';
          
          // Ocultar después de la animación
          setTimeout(() => {
            content.style.visibility = 'hidden';
          }, 400);
        }
      }
    }, [isOpen]);

    return (
      <div className="accordion-item" id={tag}>
        <div 
          className="accordion-header" 
          onClick={() => toggleAccordion(id)}
        >
          <h3>{title}</h3>
          <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}></span>
        </div>
        <div 
          ref={contentRef}
          className="accordion-content"
          style={{
            height: '0px',
            opacity: '0',
            transform: 'translateY(-10px)',
            overflow: 'hidden',
            visibility: 'hidden'
          }}
        >
          <div className="accordion-body">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // MODIFICACIÓN: useEffect para manejar el hash en la URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Eliminar el '#'
      if (hash) {
        let targetTab = '';
        let targetAccordionId = '';

        // Determinar la pestaña y el acordeón a abrir
        if (hash === 'custom-orders' || hash === 'bulk-orders') {
          targetTab = 'about';
          targetAccordionId = hash;
        } else if (hash === 'terms') {
          targetTab = 'terms';
          targetAccordionId = 'terms-general'; // O el primer acordeón de la sección
        } else if (hash === 'privacy') {
          targetTab = 'privacy';
          targetAccordionId = 'privacy-collection'; // O el primer acordeón de la sección
        } else if (hash === 'cookies') {
          targetTab = 'cookies';
          targetAccordionId = 'cookies-what'; // O el primer acordeón de la sección
        }

        if (targetTab) {
          setActiveTab(targetTab);
          // Abrir el acordeón si existe y no está ya abierto
          if (targetAccordionId && !openAccordions[targetAccordionId]) {
            setOpenAccordions(prev => ({ ...prev, [targetAccordionId]: true }));
          }

          // Desplazarse al elemento después de un pequeño retraso para que la UI se actualice
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100); // Pequeño retraso para permitir que el contenido se renderice
        }
      }
    };

    // Ejecutar al montar el componente y en cada cambio de hash
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [openAccordions]); // Dependencia para reaccionar si un acordeón ya está abierto/cerrado

  // Contenido de cada pestaña
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              En Diambars Sublim nos apasiona transformar objetos cotidianos en piezas únicas y memorables. 
              Nacimos con la visión de ofrecer a nuestros clientes la libertad de expresar su estilo y creatividad 
              a través de la técnica de sublimación, convirtiendo desde tazas y camisetas hasta llaveros, cojines y 
              más, en verdaderos artículos personalizados.
            </div>
            
            <div className='about-container'>
              <AccordionItem 
                id="purpose" 
                title="¿Nuestro propósito?"
              >
                <p> Brindarle una herramienta confiable y precisa al usuario para volver sus ideas realidad a través de una plataforma
                  confiable, interactiva y lo más importante: centrada en el servicio para el usuario. Diambars Sublim surgió como
                  una alternativa para aquellas personas con la necesidad de crear aquello que todavía no existe. Camisas, tazas, gorras,
                  calzado y todo lo que te imagines, aquí. A través de nuestra plataforma brindamos un servicio completo para el usuario
                  dándole un seguimiento detallado de sus productos, diseños, procesos de orden y servicio al cliente.
                </p>
              </AccordionItem>

              <AccordionItem 
                id="features" 
                title="¿Nuestras características?"
              >
                <ul>
                  <li><strong>Calidad y detalle:</strong> Seleccionamos materiales premium y cuidamos cada etapa de impresión para asegurar resultados vibrantes y duraderos.</li>
                  <li><strong>Creatividad colaborativa:</strong> Trabajamos codo a codo contigo, adaptándonos a tus ideas y proponiendo opciones para potenciar tu diseño.</li>
                  <li><strong>Flexibilidad y variedad:</strong> Contamos con un catálogo amplio de objetos y admitimos tanto pedidos individuales como de gran volumen.</li>
                  <li><strong>Compromiso y responsabilidad:</strong> Cumplimos plazos y ofrecemos asesoría personalizada en todo momento.</li>
                </ul>
              </AccordionItem>

              <AccordionItem 
                id="products" 
                title="¿Qué sublimamos?"
              >
                <ul>
                  <li><strong>Textiles:</strong> Camisetas, sudaderas, bolsas de tela, pañuelos, gorras, calcetines, mantas y más.</li>
                  <li><strong>Artículos de cerámica y vidrio:</strong> Tazas, platos, vasos, jarras.</li>
                  <li><strong>Accesorios:</strong> Llaveros, carcasas de móvil, mousepads, pulseras.</li>
                  <li><strong>Decoración:</strong> Cojines, tapetes, cuadros, alfombras.</li>
                </ul>
                <p>Y si tienes en mente algún objeto especial, ¡pregúntanos! Nos encanta explorar nuevas posibilidades.</p>
              </AccordionItem>

              <AccordionItem 
                id="custom-orders" 
                title="Pedidos Personalizados"
                tag="custom-orders" // Añadido tag para el ID del elemento
              >
                <p>Tus pedidos pueden ser entregados tanto a la dirección brindada con tu registro
                  o la dirección activa al momento de hacer el pedido, también se puede determinar un punto de encuentro
                  para la entrega del producto. Más información de esto en nuestro apartado de direcciones.
                </p>
                <p>La personalización de los productos son totalmente a tu imaginación, brindamos determinadas áreas para
                  facilitar y optimizar el proceso al momento de realizar el pedido, pero siempre tienes a disposición un espacio 
                  para agregar los detalles de tu diseño. A la vez, tienes la página de tus diseños, dónde puedes verificar el estado de tus
                  pedidos, además de todos tus diseños hechos hasta el momento, con la posibilidad de editarlos, eliminarlos o crear uno nuevo.
                </p>
              </AccordionItem>

              <AccordionItem 
                id="bulk-orders" 
                title="Pedidos al Mayoreo"
                tag="bulk-orders" // Añadido tag para el ID del elemento
              >
                <p>No contamos con un servicio de pedido por mayoreo desde nuestro sitio web oficial, más sí que puedes contar 
                  con nosotros para esto. Para realizar un pedido al mayoreo, comunícate directamente
                  con nosotros a través de nuestras redes sociales oficiales, número de WhatsApp o correo electrónico
                </p>
              </AccordionItem>
            </div>
          </div>
        );
        
      case 'terms':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              Términos y Condiciones de Uso - Diambars Sublim
            </div>
            <div className='about-container'>
              <AccordionItem id="terms-general" title="Términos Generales" tag="terms"> {/* Añadido tag para el ID del elemento */}
                <h4>Disposiciones generales</h4>
                <p>El presente documento establece los términos y condiciones que regulan el acceso y uso del sitio web de Diambars Sublim, 
                  empresa dedicada a la personalización de productos mediante técnicas de sublimación.</p>
                <p>Al acceder, navegar o utilizar este sitio web, el usuario acepta expresamente los términos aquí establecidos. Diambars Sublim 
                  se reserva el derecho de modificar estos términos en cualquier momento, sin previo aviso, siendo responsabilidad del usuario revisar 
                  periódicamente su contenido.</p>
              </AccordionItem>
              
              <AccordionItem id="terms-services" title="Uso de Servicios">
                <h4>Proceso de pedido y cancelación</h4>
                <p>Para acceder a ciertos servicios, como la realización de pedidos, la gestión de diseños personalizados y la emisión de reseñas, el 
                  usuario deberá crear una cuenta personal. El registro implica la aceptación de estos términos y la veracidad de los datos 
                  proporcionados. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las 
                  actividades realizadas desde su cuenta.</p>

                <p>Los pedidos realizados a través del sitio web son personalizados según las especificaciones del usuario. Una vez 
                  confirmado el pedido, el usuario dispone de un plazo máximo de 24 horas para solicitar su cancelación. Transcurrido 
                  dicho plazo, el pedido será procesado y no podrá ser modificado ni cancelado. Diambars Sublim no ofrece garantías ni 
                  devoluciones, dado el carácter personalizado de los productos. Se proporciona seguimiento detallado del pedido para 
                  asegurar la conformidad del usuario antes de la producción.</p>
              </AccordionItem>
              
              <AccordionItem id="terms-liability" title="Responsabilidades">
                <h4>Propiedad intelectual y contenido del usuario</h4>
                <p>Los diseños proporcionados por el usuario son utilizados exclusivamente como referencia visual para la elaboración del producto
                   solicitado. Diambars Sublim no adquiere derechos sobre dichos diseños ni se responsabiliza por posibles infracciones de 
                   propiedad intelectual y/o daños y perjuicios derivadas del contenido aportado por el usuario.</p>
                <h4>Limitación de responsabilidad</h4>
                <p>Diambars Sublim no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del 
                  uso del sitio web o de los productos entregados, incluyendo pero no limitado a pérdida de datos, interrupciones 
                  del servicio o errores en la personalización, siempre que se haya cumplido con las especificaciones proporcionadas 
                  por el usuario.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              Política de Privacidad - Protección de tus datos personales
            </div>
            <div className='about-container'>
              <AccordionItem id="privacy-collection" title="Recolección de Datos" tag="privacy"> {/* Añadido tag para el ID del elemento */}
                <h4>Información y finalidad de los datos recopilados</h4>
                <p>Diambars Sublim recopila y almacena los siguientes datos personales: 
                  nombre completo, dirección de correo electrónico, número de teléfono, 
                  dirección física, contraseña, fotografía de perfil y datos de tarjetas 
                  de crédito o débito (excluyendo el código CVV). Esta información es necesaria 
                  para la creación de cuentas, la gestión de pedidos y la comunicación con el usuario.</p>
                <p>Los datos personales son utilizados exclusivamente para:</p>
                <ul>
                  <li>Procesar y gestionar pedidos personalizados.</li>
                  <li>Enviar notificaciones y actualizaciones por correo electrónico</li>
                  <li>Facilitar la personalización de productos.</li>
                  <li>Permitir la interacción entre el usuario y el equipo de Diambars Sublim.</li>
                </ul>
                <p>No se realiza ningún tipo de comercialización, cesión o divulgación de datos personales a terceros, salvo en 
                  los casos estrictamente necesarios para el cumplimiento de los servicios ofrecidos.</p>
              </AccordionItem>
              
              <AccordionItem id="privacy-usage" title="Uso de la Información">
                <p>Los datos son almacenados en servidores seguros mediante la plataforma MongoDB Atlas. Las comunicaciones 
                  por correo electrónico se gestionan a través de Nodemailer, y los pagos se procesan mediante la pasarela 
                  Wompi, que cumple con los estándares de seguridad PCI-DSS. Diambars Sublim implementa medidas técnicas y 
                  organizativas para proteger la información personal contra accesos no autorizados, pérdida o alteración.</p>
              </AccordionItem>
              
              <AccordionItem id="privacy-protection" title="Protección de Datos">
                <p>El usuario podrá ejercer sus derechos de acceso, rectificación, cancelación y oposición al tratamiento de sus datos personales mediante solicitud escrita dirigida a los canales de contacto establecidos en el sitio web. Asimismo, podrá eliminar su cuenta en cualquier
                  momento, lo que implicará la eliminación de sus datos personales, salvo aquellos que deban conservarse por obligaciones legales.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      case 'cookies':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              Política de Cookies - Información sobre el uso de cookies en nuestro sitio web
            </div>
            <div className='about-container'>
              <AccordionItem id="cookies-what" title="¿Qué son las Cookies?" tag="cookies"> {/* Añadido tag para el ID del elemento */}
                <p>Las cookies son archivos de texto que se almacenan en el dispositivo del usuario al 
                  acceder al sitio web, con el fin de mejorar la experiencia de navegación y permitir 
                  funcionalidades esenciales como la autenticación, la gestión de pedidos y la comunicación personalizada.</p>
              </AccordionItem>
              <AccordionItem id="cookies-types" title="Tipos de Cookies">
                <p>Diambars Sublim utiliza únicamente cookies técnicas y funcionales, necesarias para:</p>
                <ul>
                  <li>Validar sesiones de usuario.</li>
                  <li>Autorizar la creación de pedidos y emisión de reseñas.</li>
                  <li>Facilitar la comunicación entre el usuario y el equipo de atención.</li>
                </ul>
                <p>No se emplean cookies con fines publicitarios, analíticos ni de seguimiento externo</p>
              </AccordionItem>
              
              <AccordionItem id="cookies-management" title="Gestión de Cookies">
                <p>El usuario puede configurar su navegador para aceptar, bloquear o eliminar las cookies instaladas. La desactivación de 
                  cookies técnicas puede afectar el funcionamiento del sitio web y limitar el acceso a ciertas funcionalidades. 
                  Para más información sobre la gestión de cookies, se recomienda consultar la documentación del navegador utilizado.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="about-page">
      <img src={bgLogo} alt="Logo de fondo" className="about-bg-logo" />

      {/* Sistema de pestañas */}
      <div className="about-tabs-container">
        <div className="about-tabs">
          <button 
            className={activeTab === 'about' ? 'active' : ''} 
            onClick={() => handleTabSwitch('about')}
          >
            Conócenos
          </button>
          <button 
            className={activeTab === 'terms' ? 'active' : ''} 
            onClick={() => handleTabSwitch('terms')}
          >
            Términos y Condiciones
          </button>
          <button 
            className={activeTab === 'privacy' ? 'active' : ''} 
            onClick={() => handleTabSwitch('privacy')}
          >
            Política de Privacidad
          </button>
          <button 
            className={activeTab === 'cookies' ? 'active' : ''} 
            onClick={() => handleTabSwitch('cookies')}
          >
            Política de Cookies
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {renderTabContent()}
      <Notifications />
      <ContactButton />
      <Footer />
    </div>
  );
};

export default About;
