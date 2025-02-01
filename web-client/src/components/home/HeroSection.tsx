import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Transport Professionnel, 
          <span className="accent">Livraison Rapide</span>
        </h1>
        <p className="hero-subtitle">
          Solutions de transport sur mesure pour vos besoins professionnels. 
          Devis instantané, suivi en temps réel, satisfaction garantie.
        </p>
        <div className="hero-cta">
          <Link to="/estimate" className="primary-button">
            Obtenir un Devis
          </Link>
          <Link to="/services" className="secondary-button">
            Nos Services
          </Link>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">15k+</span>
            <span className="stat-label">Clients Satisfaits</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-label">Livraisons à l'heure</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support Client</span>
          </div>
        </div>
      </div>
      <div className="hero-image">
        <img 
          src="/assets/hero-truck.svg" 
          alt="Transport professionnel" 
          className="main-image"
        />
        <div className="floating-card delivery-card">
          <i className="fas fa-truck"></i>
          <span>En route</span>
          <div className="progress-bar">
            <div className="progress" style={{width: '75%'}}></div>
          </div>
        </div>
        <div className="floating-card tracking-card">
          <i className="fas fa-map-marker-alt"></i>
          <span>Suivi en direct</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
