import React from 'react';
import './BlogSection.css';

const blogPosts = [
  {
    id: 1,
    title: 'Comment optimiser vos livraisons en ville ?',
    excerpt: 'Découvrez nos conseils pour des livraisons urbaines efficaces et écologiques.',
    image: '/assets/blog/urban-delivery.jpg',
    category: 'Conseils',
    date: '28 Dec 2023',
    readTime: '5 min'
  },
  {
    id: 2,
    title: 'Les nouvelles technologies dans le transport',
    excerpt: 'L\'impact de l\'IA et du Big Data sur l\'industrie du transport.',
    image: '/assets/blog/tech-transport.jpg',
    category: 'Innovation',
    date: '25 Dec 2023',
    readTime: '4 min'
  },
  {
    id: 3,
    title: 'Transport frigorifique : les bonnes pratiques',
    excerpt: 'Guide complet pour maintenir la chaîne du froid pendant le transport.',
    image: '/assets/blog/cold-chain.jpg',
    category: 'Guide',
    date: '22 Dec 2023',
    readTime: '6 min'
  }
];

const BlogSection: React.FC = () => {
  return (
    <section className="blog" id="blog">
      <div className="blog-header">
        <div className="header-content">
          <h2 className="section-title">Actualités & Conseils</h2>
          <p className="section-subtitle">
            Restez informé des dernières tendances et conseils du secteur du transport
          </p>
        </div>
        <a href="/blog" className="view-all">
          Voir tous les articles
          <i className="fas fa-arrow-right"></i>
        </a>
      </div>

      <div className="blog-grid">
        {blogPosts.map(post => (
          <article key={post.id} className="blog-card">
            <div className="blog-image">
              <img src={post.image} alt={post.title} />
              <span className="category">{post.category}</span>
            </div>
            
            <div className="blog-content">
              <div className="blog-meta">
                <span className="date">
                  <i className="far fa-calendar"></i>
                  {post.date}
                </span>
                <span className="read-time">
                  <i className="far fa-clock"></i>
                  {post.readTime}
                </span>
              </div>

              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>

              <a href={`/blog/${post.id}`} className="read-more">
                Lire la suite
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="newsletter">
        <div className="newsletter-content">
          <h3>Abonnez-vous à notre newsletter</h3>
          <p>Recevez nos derniers articles et conseils directement dans votre boîte mail</p>
          
          <form className="newsletter-form">
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Votre adresse email"
                required 
              />
              <button type="submit">
                S'abonner
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <label className="privacy">
              <input type="checkbox" required />
              <span>J'accepte de recevoir la newsletter et la politique de confidentialité</span>
            </label>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
