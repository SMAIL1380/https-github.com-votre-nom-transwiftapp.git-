import React from 'react';
import './TestimonialsSection.css';

const testimonials = [
  {
    id: 1,
    name: 'Sophie Martin',
    company: 'Restaurant Le Gourmet',
    image: '/assets/testimonials/sophie.jpg',
    rating: 5,
    text: 'Service exceptionnel pour nos livraisons de produits frais. La ponctualité et le respect de la chaîne du froid sont impeccables.',
    date: '15 décembre 2023'
  },
  {
    id: 2,
    name: 'Thomas Dubois',
    company: 'Particulier',
    image: '/assets/testimonials/thomas.jpg',
    rating: 5,
    text: 'Déménagement parfaitement géré. Équipe professionnelle et très soigneuse avec mes meubles.',
    date: '3 décembre 2023'
  },
  {
    id: 3,
    name: 'Marie Leroy',
    company: 'Fleuriste Bloom',
    image: '/assets/testimonials/marie.jpg',
    rating: 5,
    text: 'Livraisons rapides et soignées pour mes fleurs. Un vrai plus pour mon commerce !',
    date: '28 novembre 2023'
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-header">
        <h2 className="section-title">Ils Nous Font Confiance</h2>
        <p className="section-subtitle">
          Découvrez ce que nos clients disent de nos services
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-image">
                <img src={testimonial.image} alt={testimonial.name} />
              </div>
              <div className="testimonial-info">
                <h3 className="testimonial-name">{testimonial.name}</h3>
                <p className="testimonial-company">{testimonial.company}</p>
              </div>
            </div>

            <div className="testimonial-rating">
              {Array.from({ length: testimonial.rating }).map((_, index) => (
                <i key={index} className="fas fa-star"></i>
              ))}
            </div>

            <p className="testimonial-text">{testimonial.text}</p>
            
            <div className="testimonial-footer">
              <span className="testimonial-date">{testimonial.date}</span>
              <div className="testimonial-verify">
                <i className="fas fa-check-circle"></i>
                Client vérifié
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="testimonials-stats">
        <div className="stat-item">
          <span className="stat-number">4.9/5</span>
          <span className="stat-label">Note moyenne</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">1500+</span>
          <span className="stat-label">Avis clients</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Clients satisfaits</span>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
