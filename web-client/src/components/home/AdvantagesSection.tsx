import React from 'react';
import './AdvantagesSection.css';

const advantages = [
  {
    title: 'Rapidité',
    description: 'Livraison express en 2-4 heures sur Paris et sa région',
    icon: 'fa-bolt',
    color: '#4F46E5'
  },
  {
    title: 'Prix Compétitifs',
    description: 'Tarifs transparents et adaptés à vos besoins',
    icon: 'fa-euro-sign',
    color: '#10B981'
  },
  {
    title: 'Suivi en Temps Réel',
    description: 'Suivez vos livraisons en direct sur notre application',
    icon: 'fa-map-marker-alt',
    color: '#F59E0B'
  },
  {
    title: 'Service Client 24/7',
    description: 'Une équipe dédiée à votre écoute à tout moment',
    icon: 'fa-headset',
    color: '#EC4899'
  },
  {
    title: 'Assurance Incluse',
    description: 'Vos marchandises sont assurées jusqu'à 5000€',
    icon: 'fa-shield-alt',
    color: '#8B5CF6'
  },
  {
    title: 'Éco-responsable',
    description: 'Flotte de véhicules à faible émission de CO2',
    icon: 'fa-leaf',
    color: '#059669'
  }
];

const AdvantagesSection: React.FC = () => {
  return (
    <section className="advantages" id="advantages">
      <div className="advantages-header">
        <h2 className="section-title">Pourquoi Choisir TransSwift ?</h2>
        <p className="section-subtitle">
          Des avantages uniques pour une expérience de livraison optimale
        </p>
      </div>

      <div className="advantages-grid">
        {advantages.map((advantage, index) => (
          <div key={index} className="advantage-card">
            <div className="advantage-icon" style={{ background: advantage.color }}>
              <i className={`fas ${advantage.icon}`}></i>
            </div>
            <div className="advantage-content">
              <h3>{advantage.title}</h3>
              <p>{advantage.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="comparison-table">
        <h3>Comparaison des Services</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Caractéristiques</th>
                <th>TransSwift</th>
                <th>Autres Services</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Délai de livraison</td>
                <td className="highlight">2-4 heures</td>
                <td>4-8 heures</td>
              </tr>
              <tr>
                <td>Suivi en temps réel</td>
                <td className="highlight">
                  <i className="fas fa-check"></i>
                </td>
                <td>
                  <i className="fas fa-times"></i>
                </td>
              </tr>
              <tr>
                <td>Support client</td>
                <td className="highlight">24/7</td>
                <td>Heures de bureau</td>
              </tr>
              <tr>
                <td>Assurance incluse</td>
                <td className="highlight">Jusqu'à 5000€</td>
                <td>Basique</td>
              </tr>
              <tr>
                <td>Prix</td>
                <td className="highlight">Transparent</td>
                <td>Variable</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-banner">
        <div className="stat">
          <div className="stat-number">98%</div>
          <div className="stat-label">Livraisons à l'heure</div>
        </div>
        <div className="stat">
          <div className="stat-number">15k+</div>
          <div className="stat-label">Clients satisfaits</div>
        </div>
        <div className="stat">
          <div className="stat-number">50+</div>
          <div className="stat-label">Villes desservies</div>
        </div>
        <div className="stat">
          <div className="stat-number">4.9/5</div>
          <div className="stat-label">Note moyenne</div>
        </div>
      </div>

      <div className="guarantee">
        <div className="guarantee-icon">
          <i className="fas fa-award"></i>
        </div>
        <div className="guarantee-content">
          <h3>Notre Garantie</h3>
          <p>
            Si nous ne respectons pas nos engagements de livraison,
            nous vous remboursons intégralement votre commande.
          </p>
          <button className="guarantee-button">
            En savoir plus
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
