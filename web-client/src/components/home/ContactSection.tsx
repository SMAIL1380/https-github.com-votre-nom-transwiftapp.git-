import React, { useState } from 'react';
import './ContactSection.css';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Traitement du formulaire
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-header">
        <h2 className="section-title">Contactez-Nous</h2>
        <p className="section-subtitle">
          Notre équipe est à votre disposition pour répondre à toutes vos questions
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card">
            <i className="fas fa-phone"></i>
            <h3>Téléphone</h3>
            <p>+33 1 23 45 67 89</p>
            <p className="availability">Lun-Ven: 8h-20h</p>
          </div>

          <div className="info-card">
            <i className="fas fa-envelope"></i>
            <h3>Email</h3>
            <p>contact@transwift.fr</p>
            <p className="availability">Réponse sous 24h</p>
          </div>

          <div className="info-card">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Adresse</h3>
            <p>123 Avenue des Transports</p>
            <p>75001 Paris, France</p>
          </div>

          <div className="social-links">
            <a href="#" className="social-link">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Sujet</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un sujet</option>
              <option value="devis">Demande de devis</option>
              <option value="info">Renseignements</option>
              <option value="support">Support technique</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button">
            Envoyer le message
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>

      <div className="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937586!2d2.3519383!3d48.8567355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDUxJzI0LjIiTiAywrAyMScwNy4wIkU!5e0!3m2!1sfr!2sfr!4v1635959562000!5m2!1sfr!2sfr"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </section>
  );
};

export default ContactSection;
