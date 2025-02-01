import React from 'react';
import { Link } from 'react-router-dom';
import PriceEstimator from '../components/pricing/PriceEstimator';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <nav className="main-nav">
          <div className="logo">
            <img src="/logo.svg" alt="TransWift" />
            <span>TransWift</span>
          </div>
          <div className="nav-links">
            <a href="#features">Fonctionnalités</a>
            <a href="#apps">Applications</a>
            <a href="#pricing">Tarifs</a>
            <a href="#contact">Contact</a>
            <button className="login-btn">Connexion</button>
          </div>
        </nav>

        <div className="hero-content">
          <h1>La Solution de Transport Intelligente</h1>
          <p>Optimisez vos livraisons avec l'IA et le Machine Learning</p>
          <div className="hero-buttons">
            <Link to="/register/client" className="primary-btn">
              Commencer Maintenant
            </Link>
            <a href="#learn-more" className="secondary-btn">
              En Savoir Plus
            </a>
          </div>
        </div>

        <div className="hero-estimator">
          <PriceEstimator />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>Nos Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Livraison Rapide</h3>
            <p>Optimisation des itinéraires par IA</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Suivi en Temps Réel</h3>
            <p>Localisez vos colis en direct</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Support 24/7</h3>
            <p>Assistance client en temps réel</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Programme Fidélité</h3>
            <p>Gagnez des points et des récompenses</p>
          </div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" className="apps-section">
        <h2>Nos Applications</h2>
        <div className="apps-grid">
          <div className="app-card client">
            <h3>Client Particulier</h3>
            <ul>
              <li>✓ Livraison à la demande</li>
              <li>✓ Suivi en temps réel</li>
              <li>✓ Paiement sécurisé</li>
              <li>✓ Programme de fidélité</li>
            </ul>
            <Link to="/register/personal" className="app-btn">
              S'inscrire comme Particulier
            </Link>
          </div>

          <div className="app-card business">
            <div className="pro-badge">PRO</div>
            <h3>Client Professionnel</h3>
            <ul>
              <li>✓ Gestion de flotte</li>
              <li>✓ API dédiée</li>
              <li>✓ Tableau de bord analytique</li>
              <li>✓ Support prioritaire</li>
            </ul>
            <Link to="/register/business" className="app-btn">
              S'inscrire comme Professionnel
            </Link>
          </div>

          <div className="app-card driver">
            <h3>Chauffeur Partenaire</h3>
            <ul>
              <li>✓ Gestion des courses</li>
              <li>✓ Navigation optimisée</li>
              <li>✓ Revenus attractifs</li>
              <li>✓ Flexibilité horaire</li>
            </ul>
            <Link to="/register/driver" className="app-btn">
              Devenir Chauffeur
            </Link>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="requirements-section">
        <h2>Conditions d'Inscription</h2>
        
        <div className="requirements-grid">
          <div className="requirement-card">
            <h3>Client Particulier</h3>
            <ul>
              <li>✓ Pièce d'identité valide</li>
              <li>✓ Adresse email vérifiée</li>
              <li>✓ Numéro de téléphone</li>
            </ul>
          </div>

          <div className="requirement-card">
            <h3>Client Professionnel</h3>
            <ul>
              <li>✓ SIRET/SIREN</li>
              <li>✓ Justificatif d'entreprise</li>
              <li>✓ Contact professionnel</li>
              <li>✓ Validation commerciale</li>
            </ul>
          </div>

          <div className="requirement-card">
            <h3>Chauffeur</h3>
            <ul>
              <li>✓ Permis de conduire valide</li>
              <li>✓ Casier judiciaire vierge</li>
              <li>✓ Véhicule conforme</li>
              <li>✓ Assurance professionnelle</li>
              <li>✓ Formation obligatoire</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2>Contactez-nous</h2>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📞</span>
              <div>
                <h4>Téléphone</h4>
                <p>+33 1 23 45 67 89</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">✉️</span>
              <div>
                <h4>Email</h4>
                <p>contact@transwift.com</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">📍</span>
              <div>
                <h4>Adresse</h4>
                <p>123 Rue de l'Innovation, Paris</p>
              </div>
            </div>
          </div>
          <form className="contact-form">
            <input type="text" placeholder="Nom" />
            <input type="email" placeholder="Email" />
            <select>
              <option value="">Sélectionnez un sujet</option>
              <option value="client">Client Particulier</option>
              <option value="business">Client Professionnel</option>
              <option value="driver">Chauffeur</option>
              <option value="other">Autre</option>
            </select>
            <textarea placeholder="Message"></textarea>
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>TransWift</h4>
            <p>La solution de transport intelligente pour tous vos besoins.</p>
          </div>
          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <a href="#features">Fonctionnalités</a>
            <a href="#apps">Applications</a>
            <a href="#pricing">Tarifs</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Légal</h4>
            <a href="/terms">Conditions d'utilisation</a>
            <a href="/privacy">Politique de confidentialité</a>
            <a href="/cookies">Cookies</a>
          </div>
          <div className="footer-section">
            <h4>Suivez-nous</h4>
            <div className="social-links">
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p> 2024 TransWift. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
