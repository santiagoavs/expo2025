import React from 'react';
import './ProcessBar.css';
import { FaCheck } from 'react-icons/fa';

const steps = [
  { id: 1, title: 'Details', description: 'Product selection' },
  { id: 2, title: 'Design', description: 'Add your artwork' },
  { id: 3, title: 'Shipping', description: 'Delivery address' },
  { id: 4, title: 'Review', description: 'Order summary' },
  { id: 5, title: 'Confirmation', description: 'Submit order' },
];

const ProcessBar = ({ currentStep }) => {
  return (
    <div className="process-bar-wrapper">
      {steps.map((step, index) => {
        const status =
          currentStep > step.id
            ? 'completed'
            : currentStep === step.id
            ? 'active'
            : 'pending';

        return (
          <div key={step.id} className={`step ${status}`}>
            <div className="step-circle">
              {status === 'completed' ? <FaCheck size={12} /> : step.id}
            </div>
            <div className="step-text">
              <span className="step-title">{step.title}</span>
              <span className="step-description">{step.description}</span>
            </div>
            {index < steps.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
};

export default ProcessBar;
