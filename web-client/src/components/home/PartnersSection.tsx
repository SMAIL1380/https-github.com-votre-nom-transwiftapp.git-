import React from 'react';
import './PartnersSection.css';

const partners = [
  {
    name: 'Amazon',
    logo: '/assets/partners/amazon.png',
    category: 'E-commerce'
  },
  {
    name: 'Carrefour',
    logo: '/assets/partners/carrefour.png',
    category: 'Grande Distribution'
  },
  {
    name: 'Fnac',
    logo: '/assets/partners/fnac.png',
    category: 'Distribution'
  },
  {
    name: 'Leroy Merlin',
    logo: '/assets/partners/leroy-merlin.png',
    category: 'Bricolage'
  },
  {
    name: 'Picard',
    logo: '/assets/partners/picard.png',
    category: 'Alimentaire'
  },
  {
    name: 'Chronopost',
    logo: '/assets/partners/chronopost.png',
    category: 'Logistique'
  }
];

const PartnersSection: React.FC = () => {
  return (
    <section className="partners" id="partners">
      <div className="partners-header">
        <h2 className="section-title">Ils Nous Font Confiance</h2>
        <p className="section-subtitle">
          Des partenaires de renom qui s'appuient sur notre expertise
        </p>
      </div>

      <div className="partners-grid">
        {partners.map((partner, index) => (
          <div key={index} className="partner-card">
            <div className="partner-logo">
              <img src={partner.logo} alt={partner.name} />
            </div>
            <div className="partner-info">
              <h3>{partner.name}</h3>
              <span>{partner.category}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="partnership-cta">
        <div className="cta-content">
          <h3>Devenez Partenaire</h3>
          <p>Rejoignez notre réseau de partenaires et bénéficiez d'avantages exclusifs</p>
          <ul className="benefits-list">
            <li>
              <i className="fas fa-check-circle"></i>
              Tarifs préférentiels
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              Support dédié 24/7
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              Solutions personnalisées
            </li>
          </ul>
          <button className="partnership-button">
            Devenir Partenaire
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div className="partnership-image">
          <img src="/assets/partners/partnership.jpg" alt="Partenariat TransSwift" />
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
