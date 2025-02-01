import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const RegisterBusiness: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    siret: '',
    businessType: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    phone: '',
    address: '',
    documents: [] as File[],
    estimatedDeliveries: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const input = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? input.checked : 
              type === 'file' ? Array.from(input.files || []) :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    // TODO: Implement business registration logic
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
          Information Entreprise
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          Documents
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          Validation
        </div>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        {step === 1 && (
          <div className="form-step">
            <h2>Information Entreprise</h2>
            <div className="form-group">
              <input
                type="text"
                name="companyName"
                placeholder="Nom de l'entreprise"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="siret"
                placeholder="Numéro SIRET"
                value={formData.siret}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
              >
                <option value="">Type d'entreprise</option>
                <option value="sarl">SARL</option>
                <option value="sas">SAS</option>
                <option value="sa">SA</option>
                <option value="ei">Entreprise Individuelle</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="contactFirstName"
                placeholder="Prénom du contact"
                value={formData.contactFirstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="contactLastName"
                placeholder="Nom du contact"
                value={formData.contactLastName}
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
            <h2>Documents</h2>
            <div className="form-group">
              <label>Kbis (moins de 3 mois)</label>
              <input
                type="file"
                name="documents"
                accept=".pdf"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Pièce d'identité du représentant</label>
              <input
                type="file"
                name="documents"
                accept="image/*,.pdf"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Attestation d'assurance professionnelle</label>
              <input
                type="file"
                name="documents"
                accept=".pdf"
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
            <h2>Validation</h2>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email professionnel"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Téléphone professionnel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Adresse de l'entreprise"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <select
                name="estimatedDeliveries"
                value={formData.estimatedDeliveries}
                onChange={handleInputChange}
                required
              >
                <option value="">Livraisons estimées par mois</option>
                <option value="0-50">0-50</option>
                <option value="51-200">51-200</option>
                <option value="201-1000">201-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
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
              <label>J'accepte les conditions d'utilisation professionnelles</label>
            </div>
            <button type="submit" className="submit-btn">
              Créer le compte professionnel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterBusiness;
