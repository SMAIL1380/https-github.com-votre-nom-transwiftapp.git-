import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const RegisterDriver: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    licenseNumber: '',
    licenseType: '',
    licenseExpiry: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    documents: {
      license: null as File | null,
      insurance: null as File | null,
      vehicleRegistration: null as File | null,
      criminalRecord: null as File | null,
      medicalCertificate: null as File | null
    },
    availability: [] as string[],
    workZones: [] as string[],
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const input = e.target as HTMLInputElement;
    
    if (type === 'file') {
      const fileKey = name as keyof typeof formData.documents;
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [fileKey]: input.files?.[0] || null
        }
      }));
    } else if (type === 'checkbox') {
      if (name === 'terms') {
        setFormData(prev => ({ ...prev, terms: input.checked }));
      } else if (name.startsWith('availability_')) {
        const day = name.split('_')[1];
        setFormData(prev => ({
          ...prev,
          availability: input.checked
            ? [...prev.availability, day]
            : prev.availability.filter(d => d !== day)
        }));
      } else if (name.startsWith('zone_')) {
        const zone = name.split('_')[1];
        setFormData(prev => ({
          ...prev,
          workZones: input.checked
            ? [...prev.workZones, zone]
            : prev.workZones.filter(z => z !== zone)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    // TODO: Implement driver registration logic
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
          Véhicule
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          Documents
        </div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
          Préférences
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
            <div className="form-group">
              <input
                type="date"
                name="birthDate"
                placeholder="Date de naissance"
                value={formData.birthDate}
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
            <h2>Information Véhicule</h2>
            <div className="form-group">
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                required
              >
                <option value="">Type de véhicule</option>
                <option value="car">Voiture</option>
                <option value="van">Camionnette</option>
                <option value="truck">Camion</option>
                <option value="bike">Moto</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="vehicleMake"
                placeholder="Marque"
                value={formData.vehicleMake}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="vehicleModel"
                placeholder="Modèle"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="vehicleYear"
                placeholder="Année"
                value={formData.vehicleYear}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="vehiclePlate"
                placeholder="Immatriculation"
                value={formData.vehiclePlate}
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
            <h2>Documents Requis</h2>
            <div className="form-group">
              <label>Permis de conduire</label>
              <input
                type="file"
                name="license"
                accept="image/*,.pdf"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Assurance professionnelle</label>
              <input
                type="file"
                name="insurance"
                accept=".pdf"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Carte grise</label>
              <input
                type="file"
                name="vehicleRegistration"
                accept="image/*,.pdf"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Extrait casier judiciaire</label>
              <input
                type="file"
                name="criminalRecord"
                accept=".pdf"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Certificat médical</label>
              <input
                type="file"
                name="medicalCertificate"
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

        {step === 4 && (
          <div className="form-step">
            <h2>Préférences de Travail</h2>
            <div className="form-group">
              <h3>Disponibilités</h3>
              <div className="checkbox-group">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      name={`availability_${day}`}
                      checked={formData.availability.includes(day)}
                      onChange={handleInputChange}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <h3>Zones de travail</h3>
              <div className="checkbox-group">
                {['Paris', 'Petite Couronne', 'Grande Couronne'].map(zone => (
                  <label key={zone}>
                    <input
                      type="checkbox"
                      name={`zone_${zone}`}
                      checked={formData.workZones.includes(zone)}
                      onChange={handleInputChange}
                    />
                    {zone}
                  </label>
                ))}
              </div>
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
              <label>J'accepte les conditions d'utilisation chauffeur</label>
            </div>
            <button type="submit" className="submit-btn">
              Créer mon compte chauffeur
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterDriver;
