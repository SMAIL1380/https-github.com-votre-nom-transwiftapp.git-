import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const RegisterPersonal: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idCard: null as File | null,
    address: '',
    terms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value
    }));
  };

  const handleSubmit = async (e: React.ReactEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    // TODO: Implement registration logic
    try {
      // Submit registration
      navigate('/registration-success');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          Information Personnelle
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          Vérification
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          Confirmation
        </div>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        {step === 1 && (
          <div className="form-step">
            <h2>Information Personnelle</h2>
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="next-btn">
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Vérification</h2>
            <div className="form-group">
              <label>Pièce d'identité</label>
              <input
                type="file"
                name="idCard"
                accept="image/*,.pdf"
                onChange={handleInputChange}
                required
              />
              <small>Format accepté : JPG, PNG, PDF (Max 5MB)</small>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Adresse complète"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="next-btn">
              Suivant
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Confirmation</h2>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group checkbox">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
              />
              <label>J'accepte les conditions d'utilisation</label>
            </div>
            <button type="submit" className="submit-btn">
              Créer mon compte
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterPersonal;
