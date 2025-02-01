import React from 'react';
import './HowItWorks.css';

const steps = [
  {
    id: 1,
    title: 'Devis Instantané',
    description: 'Obtenez un devis immédiat en quelques clics',
    icon: 'fa-calculator',
    color: '#4F46E5'
  },
  {
    id: 2,
    title: 'Réservation',
    description: 'Choisissez votre véhicule et créneaux horaires',
    icon: 'fa-calendar-check',
    color: '#10B981'
  },
  {
    id: 3,
    title: 'Enlèvement',
    description: 'Nos chauffeurs professionnels récupèrent votre marchandise',
    icon: 'fa-box',
    color: '#F59E0B'
  },
  {
    id: 4,
    title: 'Suivi en Direct',
    description: 'Suivez votre livraison en temps réel',
    icon: 'fa-location-dot',
    color: '#EC4899'
  },
  {
    id: 5,
    title: 'Livraison',
    description: 'Livraison à l'adresse et à l'heure convenues',
    icon: 'fa-check-circle',
    color: '#8B5CF6'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-header">
        <h2 className="section-title">Comment Ça Marche</h2>
        <p className="section-subtitle">
          Un processus simple et efficace en 5 étapes
        </p>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.id} className="step-card">
            <div className="step-number" style={{ background: `${step.color}15`, color: step.color }}>
              {step.id}
            </div>
            
            <div className="step-content">
              <div className="step-icon" style={{ color: step.color }}>
                <i className={`fas ${step.icon}`}></i>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>

            {index < steps.length - 1 && (
              <div className="step-connector">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" 
                        stroke="#4F46E5" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cta-container">
        <button className="start-button">
          Commencer Maintenant
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
};

export default HowItWorks;
