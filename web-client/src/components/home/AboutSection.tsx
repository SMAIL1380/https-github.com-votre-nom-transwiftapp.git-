import React from 'react';
import './AboutSection.css';

const stats = [
  {
    number: '5+',
    label: 'Années d\'expérience',
    icon: 'fa-clock'
  },
  {
    number: '15k+',
    label: 'Livraisons réussies',
    icon: 'fa-truck'
  },
  {
    number: '98%',
    label: 'Clients satisfaits',
    icon: 'fa-smile'
  },
  {
    number: '24/7',
    label: 'Support client',
    icon: 'fa-headset'
  }
];

const values = [
  {
    title: 'Fiabilité',
    description: 'Nous respectons nos engagements avec une ponctualité irréprochable.',
    icon: 'fa-shield-check'
  },
  {
    title: 'Sécurité',
    description: 'Vos marchandises sont assurées et manipulées avec le plus grand soin.',
    icon: 'fa-lock'
  },
  {
    title: 'Transparence',
    description: 'Prix clairs et suivi en temps réel de vos livraisons.',
    icon: 'fa-eye'
  },
  {
    title: 'Écologie',
    description: 'Engagement pour réduire notre impact environnemental.',
    icon: 'fa-leaf'
  }
];

const AboutSection: React.FC = () => {
  return (
    <section className="about" id="about">
      <div className="about-header">
        <h2 className="section-title">À Propos de TransSwift</h2>
        <p className="section-subtitle">
          Votre partenaire de confiance pour tous vos besoins en transport
        </p>
      </div>

      <div className="about-content">
        <div className="about-image">
          <img src="/assets/about/team.jpg" alt="L'équipe TransSwift" />
          <div className="experience-badge">
            <span className="number">5+</span>
            <span className="text">Années d'Excellence</span>
          </div>
        </div>

        <div className="about-text">
          <h3>Notre Histoire</h3>
          <p>
            Fondée en 2019, TransSwift est née de la vision d'offrir un service de transport
            moderne, efficace et centré sur le client. Notre engagement envers l'excellence
            et l'innovation nous a permis de devenir un acteur majeur du transport en Île-de-France.
          </p>

          <h3>Notre Mission</h3>
          <p>
            Simplifier le transport de marchandises en proposant des solutions sur mesure,
            rapides et fiables. Nous nous efforçons de dépasser les attentes de nos clients
            en combinant technologie de pointe et service personnalisé.
          </p>

          <div className="certifications">
            <div className="certification">
              <img src="/assets/about/iso.png" alt="Certification ISO" />
              <span>ISO 9001:2015</span>
            </div>
            <div className="certification">
              <img src="/assets/about/eco.png" alt="Certification Écologique" />
              <span>Transport Éco-responsable</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <i className={`fas ${stat.icon}`}></i>
            <span className="stat-number">{stat.number}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="values-section">
        <h3 className="values-title">Nos Valeurs</h3>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">
                <i className={`fas ${value.icon}`}></i>
              </div>
              <h4>{value.title}</h4>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-section">
        <h3>Prêt à Commencer ?</h3>
        <p>Rejoignez les milliers de clients qui nous font confiance</p>
        <button className="cta-button">
          Obtenir un Devis
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
};

export default AboutSection;
