import React from 'react';
import './ServicesSection.css';

const services = [
  {
    id: 1,
    title: 'Transport Express',
    description: 'Livraison rapide et sécurisée pour vos envois urgents',
    icon: 'fa-truck-fast',
    color: '#4F46E5'
  },
  {
    id: 2,
    title: 'Déménagement',
    description: 'Service complet de déménagement professionnel',
    icon: 'fa-boxes-packing',
    color: '#10B981'
  },
  {
    id: 3,
    title: 'Transport Frigorifique',
    description: 'Transport à température contrôlée pour produits sensibles',
    icon: 'fa-temperature-low',
    color: '#3B82F6'
  },
  {
    id: 4,
    title: 'Logistique',
    description: 'Solutions logistiques complètes pour entreprises',
    icon: 'fa-warehouse',
    color: '#8B5CF6'
  }
];

const ServicesSection: React.FC = () => {
  return (
    <section className="services" id="services">
      <div className="services-header">
        <h2 className="section-title">Nos Services</h2>
        <p className="section-subtitle">
          Des solutions de transport adaptées à tous vos besoins
        </p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon" style={{ background: `${service.color}15` }}>
              <i className={`fas ${service.icon}`} style={{ color: service.color }}></i>
            </div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <button className="service-button">
              En savoir plus
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
