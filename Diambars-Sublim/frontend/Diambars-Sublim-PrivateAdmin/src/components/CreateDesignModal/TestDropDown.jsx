// Componente de diagnóstico avanzado para detectar qué está causando las animaciones
import React, { useState, useRef, useEffect } from 'react';

const AdvancedDiagnostic = () => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Detectar transiciones CSS aplicadas
  useEffect(() => {
    if (dropdownRef.current) {
      const element = dropdownRef.current;
      const computedStyle = window.getComputedStyle(element);
      
      addLog(`Transition: ${computedStyle.transition}`);
      addLog(`Transform: ${computedStyle.transform}`);
      addLog(`Animation: ${computedStyle.animation}`);
      
      // Observer para detectar cambios en el DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            addLog(`Style changed: ${mutation.target.style.cssText}`);
          }
        });
      });

      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      return () => observer.disconnect();
    }
  }, [isOpen]);

  // Detectar animaciones en elementos padre
  useEffect(() => {
    if (containerRef.current) {
      let current = containerRef.current.parentElement;
      let level = 1;
      
      while (current && level <= 5) {
        const computedStyle = window.getComputedStyle(current);
        if (computedStyle.transition !== 'all 0s ease 0s' || 
            computedStyle.transform !== 'none' || 
            computedStyle.animation !== 'none 0s ease 0s 1 normal none running') {
          addLog(`Parent level ${level}: has animations/transitions`);
          addLog(`  - Transition: ${computedStyle.transition}`);
          addLog(`  - Transform: ${computedStyle.transform}`);
          addLog(`  - Animation: ${computedStyle.animation}`);
        }
        current = current.parentElement;
        level++;
      }
    }
  }, []);

  const toggleDropdown = () => {
    addLog(`Toggling dropdown: ${!isOpen ? 'OPENING' : 'CLOSING'}`);
    setIsOpen(!isOpen);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        padding: '40px', 
        maxWidth: '800px', 
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h2>Diagnóstico Avanzado de Animaciones</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Click para abrir dropdown"
            onClick={toggleDropdown}
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          
          {isOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                zIndex: 9999,
                backgroundColor: 'white',
                border: '2px solid #007bff',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                marginTop: '4px',
                minHeight: '100px',
                // EXPLÍCITAMENTE sin animaciones
                transition: 'none !important',
                transform: 'none !important',
                animation: 'none !important',
              }}
            >
              <div style={{ padding: '16px' }}>
                <p>Si este dropdown aparece sin animaciones, el problema está en Material-UI</p>
                <p>Si tiene animaciones, hay CSS global afectando</p>
                <button onClick={() => addLog('Button clicked inside dropdown')}>
                  Test Button
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Logs de Diagnóstico:</h3>
        <div 
          style={{ 
            background: '#f8f9fa', 
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '12px',
            maxHeight: '300px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        >
          {logs.length === 0 ? (
            <p style={{ color: '#6c757d', margin: 0 }}>No hay logs todavía...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Información del Entorno:</h3>
        <div style={{ fontSize: '14px' }}>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>Viewport:</strong> {window.innerWidth} x {window.innerHeight}</p>
          <p><strong>Pixel Ratio:</strong> {window.devicePixelRatio}</p>
        </div>
      </div>

      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        padding: '16px',
        marginTop: '20px'
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Instrucciones:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Haz click en el input para abrir el dropdown</li>
          <li>Observa si aparece instantáneamente o con animación</li>
          <li>Revisa los logs para ver qué CSS se está aplicando</li>
          <li>Comparte estos logs para diagnosticar el problema</li>
        </ol>
      </div>
    </div>
  );
};

export default AdvancedDiagnostic;