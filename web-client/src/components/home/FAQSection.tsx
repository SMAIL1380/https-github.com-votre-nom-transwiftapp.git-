import React, { useState } from 'react';
import './FAQSection.css';

const faqs = [
  {
    id: 1,
    question: 'Comment fonctionne le service de transport express ?',
    answer: 'Notre service express garantit une livraison rapide de vos colis. Après votre réservation, un chauffeur professionnel récupère votre marchandise et la livre directement à l'adresse indiquée. Vous pouvez suivre votre livraison en temps réel via notre application.'
  },
  {
    id: 2,
    question: 'Quels sont vos délais de livraison ?',
    answer: 'Les délais varient selon la distance et le type de service choisi. En express, nous livrons généralement dans les 2-4 heures suivant l'enlèvement. Pour les livraisons standard, comptez 4-8 heures. Les délais exacts vous sont communiqués lors de votre devis.'
  },
  {
    id: 3,
    question: 'Comment sont calculés vos tarifs ?',
    answer: 'Nos tarifs sont calculés en fonction de plusieurs critères : la distance, le type de véhicule, le poids de la marchandise, et les options choisies (express, frigorifique, etc.). Des suppléments peuvent s'appliquer pour les livraisons de nuit, le weekend ou les jours fériés.'
  },
  {
    id: 4,
    question: 'Proposez-vous une assurance pour les marchandises ?',
    answer: 'Oui, nous proposons différentes options d'assurance. L'assurance de base est incluse dans tous nos services. Pour une protection supplémentaire, vous pouvez opter pour notre assurance premium qui couvre jusqu'à 5000€ de marchandises.'
  },
  {
    id: 5,
    question: 'Comment puis-je suivre ma livraison ?',
    answer: 'Vous recevez un lien de suivi par SMS et email dès que votre colis est pris en charge. Notre interface de suivi vous permet de voir la position du chauffeur en temps réel et l'heure estimée de livraison.'
  },
  {
    id: 6,
    question: 'Que faire en cas de problème avec ma livraison ?',
    answer: 'Notre service client est disponible 7j/7 pour vous assister. En cas de problème, contactez-nous immédiatement par téléphone ou via le chat de notre application. Nous mettrons tout en œuvre pour résoudre rapidement la situation.'
  }
];

const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq" id="faq">
      <div className="faq-header">
        <h2 className="section-title">Questions Fréquentes</h2>
        <p className="section-subtitle">
          Tout ce que vous devez savoir sur nos services de transport
        </p>
      </div>

      <div className="faq-grid">
        {faqs.map(faq => (
          <div 
            key={faq.id} 
            className={`faq-item ${openId === faq.id ? 'open' : ''}`}
            onClick={() => toggleFAQ(faq.id)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <i className={`fas fa-chevron-${openId === faq.id ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="faq-contact">
        <p>Vous ne trouvez pas la réponse à votre question ?</p>
        <button className="contact-button">
          Contactez-nous
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
};

export default FAQSection;
