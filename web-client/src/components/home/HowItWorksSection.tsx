import React from 'react';
import './HowItWorksSection.css';

const steps = [
  {
    number: '01',
    title: 'Demande de Devis',
    description: 'Remplissez notre formulaire en ligne avec les détails de votre livraison',
    icon: 'fa-clipboard-list'
  },
  {
    number: '02',
    title: 'Confirmation',
    description: 'Recevez un devis instantané et confirmez votre réservation',
    icon: 'fa-check-circle'
  },
  {
    number: '03',
    title: 'Enlèvement',
    description: 'Notre chauffeur récupère votre marchandise à l'adresse indiquée',
    icon: 'fa-box'
  },
  {
    number: '04',
    title: 'Suivi en Temps Réel',
    description: 'Suivez votre livraison en direct sur notre application',
    icon: 'fa-map-marker-alt'
  },
  {
    number: '05',
    title: 'Livraison',
    description: 'Votre marchandise est livrée en toute sécurité à destination',
    icon: 'fa-truck'
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works-header">
        <h2 className="section-title">Comment Ça Marche ?</h2>
        <p className="section-subtitle">
          Un processus simple et efficace en 5 étapes
        </p>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="step-number">{step.number}</div>
            <div className="step-icon">
              <i className={`fas ${step.icon}`}></i>
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
        <div className="steps-connection"></div>
      </div>

      <div className="features-grid">
        <div className="feature">
          <div className="feature-icon">
            <i className="fas fa-mobile-alt"></i>
          </div>
          <h3>Application Mobile</h3>
          <p>Gérez vos livraisons depuis votre smartphone</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3>Sécurité Garantie</h3>
          <p>Vos marchandises sont assurées pendant le transport</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h3>Service 24/7</h3>
          <p>Support client disponible à tout moment</p>
        </div>
      </div>

      <div className="demo-cta">
        <div className="demo-content">
          <h3>Vous voulez voir comment ça marche ?</h3>
          <p>Regardez notre vidéo de démonstration</p>
          <button className="demo-button">
            <i className="fas fa-play"></i>
            Voir la Démo
          </button>
        </div>
        <div className="demo-video">
          <img src="/assets/how-it-works/demo-preview.jpg" alt="Démonstration" />
          <div className="play-overlay">
            <i className="fas fa-play"></i>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
