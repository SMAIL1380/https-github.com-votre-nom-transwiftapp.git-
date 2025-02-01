import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import DatePicker from 'react-datepicker';
import { FaCreditCard, FaPaypal, FaApplePay, FaGooglePay } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import './PriceEstimator.css';

interface VehicleOption {
  id: string;
  name: string;
  volume: string;
  basePrice: number;
  image: string;
  options: {
    hayon: boolean;
    plsc: boolean;
  };
}

const vehicles: VehicleOption[] = [
  {
    id: '3m3',
    name: 'Utilitaire Compact',
    volume: '3m³',
    basePrice: 50,
    image: '/vehicles/3m3.png',
    options: { hayon: false, plsc: true }
  },
  {
    id: '6m3',
    name: 'Fourgonnette',
    volume: '6m³',
    basePrice: 70,
    image: '/vehicles/6m3.png',
    options: { hayon: true, plsc: true }
  },
  {
    id: '9m3',
    name: 'Fourgon Medium',
    volume: '9m³',
    basePrice: 90,
    image: '/vehicles/9m3.png',
    options: { hayon: true, plsc: true }
  },
  {
    id: '12m3',
    name: 'Grand Fourgon',
    volume: '12m³',
    basePrice: 110,
    image: '/vehicles/12m3.png',
    options: { hayon: true, plsc: true }
  },
  {
    id: '14m3',
    name: 'Extra Large',
    volume: '14m³',
    basePrice: 130,
    image: '/vehicles/14m3.png',
    options: { hayon: true, plsc: true }
  },
  {
    id: '20m3',
    name: 'Camion Porteur',
    volume: '20m³',
    basePrice: 150,
    image: '/vehicles/20m3.png',
    options: { hayon: true, plsc: true }
  }
];

const PriceEstimator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientType: '', // 'personal-occasional', 'personal-regular', 'business-occasional', 'business-regular'
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedVehicle: '',
    withHayon: false,
    withPlsc: false,
    withInsurance: false,
    withHandling: false,
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: null as Date | null,
    pickupTime: '',
    deliveryDate: null as Date | null,
    deliveryTime: '',
    distance: 0,
    estimatedPrice: 0,
    directions: null as google.maps.DirectionsResult | null,
    estimatedDuration: '',
    co2Savings: 0,
    promoCode: '',
    paymentMethod: '',
    cargoType: '', // 'package', 'pallet', 'other'
    cargoWeight: 0,
    cargoDimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    cargoDescription: '',
    cargoQuantity: 1,
    quoteId: '',
    quoteHistory: [] as any[],
    cargoPhotos: [] as File[],
    handlingInstructions: '',
    insuranceType: '', // 'basic', 'premium', 'custom'
    insuranceValue: 0,
    notificationPreferences: {
      email: true,
      sms: false,
      push: false
    },
    specialRequirements: [] as string[],
    isUrgent: false,
    isWeekend: false,
    isNightDelivery: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Maps configuration
  const mapContainerStyle = {
    width: '100%',
    height: '300px'
  };

  const center = {
    lat: 48.8566,
    lng: 2.3522
  };

  // Calculer le prix avec les réductions selon le type de client
  const calculatePrice = (distance: number, vehicleId: string, options: any) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) return 0;

    let price = selectedVehicle.basePrice;
    
    // Prix au kilomètre
    price += distance * 2;

    // Options supplémentaires
    if (options.hayon) price += 25;
    if (options.plsc) price += 15;
    if (options.insurance) price += 30;
    if (options.handling) price += 40;

    // Frais fixes
    const fixedFees = 20;
    price += fixedFees;

    // Réductions selon le type de client
    let discount = 0;
    switch (formData.clientType) {
      case 'personal-regular':
        discount = 0.1; // 10% de réduction
        break;
      case 'business-occasional':
        discount = 0.15; // 15% de réduction
        break;
      case 'business-regular':
        discount = 0.25; // 25% de réduction
        break;
    }

    if (discount > 0) {
      price = price * (1 - discount);
    }

    return Math.round(price);
  };

  // Calculer le temps de trajet estimé
  const calculateDuration = (result: google.maps.DirectionsResult) => {
    if (result.routes[0]?.legs[0]?.duration) {
      return result.routes[0].legs[0].duration.text;
    }
    return '';
  };

  // Calculer les économies de CO2
  const calculateCO2Savings = (distance: number) => {
    // Moyenne des émissions d'une voiture particulière : 120g CO2/km
    const carEmissions = distance * 120;
    // Émissions de notre flotte optimisée : 80g CO2/km
    const ourEmissions = distance * 80;
    return Math.round((carEmissions - ourEmissions) / 1000); // en kg
  };

  // Gérer le calcul d'itinéraire
  const calculateRoute = () => {
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: formData.pickupAddress,
        destination: formData.deliveryAddress,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const duration = calculateDuration(result);
          const distance = result.routes[0].legs[0].distance.value / 1000;
          const co2Savings = calculateCO2Savings(distance);

          setFormData(prev => ({
            ...prev,
            directions: result,
            distance: distance,
            estimatedDuration: duration,
            co2Savings: co2Savings
          }));
        }
      }
    );
  };

  // Vérifier le code promo
  const validatePromoCode = (code: string) => {
    const promoCodes = {
      'FIRST10': 10,
      'SUMMER20': 20,
      'WINTER15': 15
    };
    return promoCodes[code as keyof typeof promoCodes] || 0;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Recalculer le prix si nécessaire
    if (['selectedVehicle', 'withHayon', 'withPlsc', 'withInsurance', 'withHandling', 'pickupAddress', 'deliveryAddress'].includes(name)) {
      if (formData.pickupAddress && formData.deliveryAddress) {
        calculateRoute();
        const price = calculatePrice(formData.distance, formData.selectedVehicle, {
          hayon: formData.withHayon,
          plsc: formData.withPlsc,
          insurance: formData.withInsurance,
          handling: formData.withHandling
        });
        
        setFormData(prev => ({
          ...prev,
          estimatedPrice: price
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Vérifier si c'est une entreprise
      const isCompany = formData.email.endsWith('.com') || formData.email.endsWith('.fr');
      if (isCompany) {
        navigate('/register/business');
      } else {
        // Procéder à la réservation pour particulier
        navigate('/booking/confirm', { state: { formData } });
      }
    }
  };

  // Générer un ID unique pour le devis
  const generateQuoteId = () => {
    return 'QT-' + Date.now().toString(36).toUpperCase();
  };

  // Sauvegarder le devis
  const saveQuote = () => {
    const quote = {
      id: generateQuoteId(),
      date: new Date(),
      ...formData
    };
    
    // Sauvegarder dans l'historique
    setFormData(prev => ({
      ...prev,
      quoteHistory: [...prev.quoteHistory, quote],
      quoteId: quote.id
    }));

    // Sauvegarder dans le localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    localStorage.setItem('savedQuotes', JSON.stringify([...savedQuotes, quote]));
  };

  // Partager par email
  const shareQuoteByEmail = () => {
    const subject = `Devis TransWift ${formData.quoteId}`;
    const body = `
      Détails du devis :
      Date : ${new Date().toLocaleDateString()}
      Type de marchandise : ${formData.cargoType}
      Poids : ${formData.cargoWeight} kg
      Dimensions : ${formData.cargoDimensions.length}x${formData.cargoDimensions.width}x${formData.cargoDimensions.height} cm
      Prix estimé : ${formData.estimatedPrice}€
      Temps estimé : ${formData.estimatedDuration}
    `;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Gérer l'upload des photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        cargoPhotos: [...prev.cargoPhotos, ...files]
      }));
    }
  };

  // Supprimer une photo
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cargoPhotos: prev.cargoPhotos.filter((_, i) => i !== index)
    }));
  };

  // Calculer le prix de l'assurance
  const calculateInsurancePrice = () => {
    switch (formData.insuranceType) {
      case 'basic':
        return formData.cargoWeight * 0.5; // 0.50€ par kg
      case 'premium':
        return formData.cargoWeight * 1; // 1€ par kg
      case 'custom':
        return (formData.insuranceValue * 0.01); // 1% de la valeur déclarée
      default:
        return 0;
    }
  };

  // Calcul du prix de base selon le type de véhicule
  const calculateBasePrice = () => {
    const baseRates = {
      'utilitaire': 50, // Prix par heure pour utilitaire
      'camion': 75,    // Prix par heure pour camion
      'semi': 100,     // Prix par heure pour semi-remorque
      'frigo': 90      // Prix par heure pour frigorifique
    };

    return baseRates[formData.selectedVehicle] || 50;
  };

  // Calcul des suppléments
  const calculateSurcharges = () => {
    let surcharges = 0;
    
    // Supplément urgence (+50%)
    if (formData.isUrgent) {
      surcharges += calculateBasePrice() * 0.5;
    }

    // Supplément weekend (+25%)
    if (formData.isWeekend) {
      surcharges += calculateBasePrice() * 0.25;
    }

    // Supplément nuit (+30%)
    if (formData.isNightDelivery) {
      surcharges += calculateBasePrice() * 0.3;
    }

    // Supplément distance
    const distanceRate = 0.5; // 0.50€ par km
    surcharges += formData.distance * distanceRate;

    // Supplément poids
    if (formData.cargoWeight > 1000) { // Si plus de 1000kg
      surcharges += (formData.cargoWeight - 1000) * 0.1; // 0.10€ par kg supplémentaire
    }

    return surcharges;
  };

  // Calcul du prix total
  const calculateTotalPrice = () => {
    const basePrice = calculateBasePrice();
    const surcharges = calculateSurcharges();
    const insurancePrice = calculateInsurancePrice();
    
    let total = basePrice + surcharges + insurancePrice;

    // Appliquer la réduction si code promo valide
    if (formData.promoCode) {
      const discount = validatePromoCode(formData.promoCode);
      total = total * (1 - discount/100);
    }

    return total;
  };

  // Vérifier si c'est un horaire de nuit (20h-6h)
  const checkNightDelivery = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 20 || hour < 6;
  };

  // Vérifier si c'est un weekend
  const checkWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Gérer le changement de date/heure
  const handleDateTimeChange = (date: Date | null, type: 'pickup' | 'delivery') => {
    if (date) {
      const isWeekend = checkWeekend(date);
      
      setFormData(prev => ({
        ...prev,
        [`${type}Date`]: date,
        isWeekend: isWeekend,
      }));
    }
  };

  const handleTimeChange = (time: string, type: 'pickup' | 'delivery') => {
    const isNight = checkNightDelivery(time);
    
    setFormData(prev => ({
      ...prev,
      [`${type}Time`]: time,
      isNightDelivery: isNight,
    }));
  };

  return (
    <div className="price-estimator">
      <div className="estimator-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          Type Client
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          Véhicule
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          Marchandise
        </div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
          Adresses
        </div>
        <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
          Options
        </div>
        <div className={`progress-step ${step >= 6 ? 'active' : ''}`}>
          Paiement
        </div>
      </div>

      <form onSubmit={handleSubmit} className="estimator-form">
        {step === 1 && (
          <div className="form-step">
            <h2>Type de Client</h2>
            <div className="client-type-grid">
              <div
                className={`client-type-card ${formData.clientType === 'personal-occasional' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, clientType: 'personal-occasional' }))}
              >
                <h3>Particulier Occasionnel</h3>
                <p>Pour vos besoins ponctuels de transport</p>
                <ul>
                  <li>Prix standard</li>
                  <li>Paiement à la course</li>
                  <li>Support client standard</li>
                </ul>
              </div>

              <div
                className={`client-type-card ${formData.clientType === 'personal-regular' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, clientType: 'personal-regular' }))}
              >
                <h3>Particulier Régulier</h3>
                <p>Pour vos déménagements et transports réguliers</p>
                <ul>
                  <li>10% de réduction</li>
                  <li>Programme de fidélité</li>
                  <li>Support client prioritaire</li>
                </ul>
              </div>

              <div
                className={`client-type-card ${formData.clientType === 'business-occasional' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, clientType: 'business-occasional' }))}
              >
                <h3>Professionnel Occasionnel</h3>
                <p>Pour les besoins ponctuels de votre entreprise</p>
                <ul>
                  <li>15% de réduction</li>
                  <li>Facturation entreprise</li>
                  <li>Support dédié</li>
                </ul>
              </div>

              <div
                className={`client-type-card ${formData.clientType === 'business-regular' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, clientType: 'business-regular' }))}
              >
                <h3>Professionnel Régulier</h3>
                <p>Pour les besoins réguliers de votre entreprise</p>
                <ul>
                  <li>25% de réduction</li>
                  <li>Compte professionnel</li>
                  <li>Support prioritaire 24/7</li>
                </ul>
              </div>
            </div>
            <button type="button" className="next-btn" onClick={() => setStep(2)} disabled={!formData.clientType}>
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Choisissez votre véhicule</h2>
            <div className="vehicles-grid">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`vehicle-card ${formData.selectedVehicle === vehicle.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, selectedVehicle: vehicle.id }))}
                >
                  <img src={vehicle.image} alt={vehicle.name} />
                  <h3>{vehicle.name}</h3>
                  <p className="volume">{vehicle.volume}</p>
                  <p className="price">À partir de {vehicle.basePrice}€</p>
                  {vehicle.options.hayon && (
                    <div className="vehicle-options">
                      <label>
                        <input
                          type="checkbox"
                          name="withHayon"
                          checked={formData.withHayon}
                          onChange={handleInputChange}
                          onClick={e => e.stopPropagation()}
                        />
                        Hayon (+25€)
                      </label>
                    </div>
                  )}
                  {vehicle.options.plsc && (
                    <div className="vehicle-options">
                      <label>
                        <input
                          type="checkbox"
                          name="withPlsc"
                          checked={formData.withPlsc}
                          onChange={handleInputChange}
                          onClick={e => e.stopPropagation()}
                        />
                        PLSC (+15€)
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="next-btn" onClick={() => setStep(3)} disabled={!formData.selectedVehicle}>
              Suivant
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Informations sur la Marchandise</h2>
            
            {/* Type de marchandise */}
            <div className="cargo-type">
              <h3>Type de Marchandise</h3>
              <div className="cargo-type-grid">
                <div
                  className={`cargo-type-card ${formData.cargoType === 'package' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, cargoType: 'package' }))}
                >
                  <img src="/icons/package.svg" alt="Colis" />
                  <h4>Colis</h4>
                  <p>Cartons, paquets, objets emballés</p>
                </div>
                <div
                  className={`cargo-type-card ${formData.cargoType === 'pallet' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, cargoType: 'pallet' }))}
                >
                  <img src="/icons/pallet.svg" alt="Palette" />
                  <h4>Palette</h4>
                  <p>Marchandises palettisées</p>
                </div>
                <div
                  className={`cargo-type-card ${formData.cargoType === 'other' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, cargoType: 'other' }))}
                >
                  <img src="/icons/other.svg" alt="Autre" />
                  <h4>Autre</h4>
                  <p>Autre type de marchandise</p>
                </div>
              </div>
            </div>

            {/* Quantité */}
            <div className="form-group">
              <label>Quantité</label>
              <div className="quantity-input">
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    cargoQuantity: Math.max(1, prev.cargoQuantity - 1)
                  }))}
                >
                  -
                </button>
                <input
                  type="number"
                  name="cargoQuantity"
                  value={formData.cargoQuantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    cargoQuantity: prev.cargoQuantity + 1
                  }))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Poids */}
            <div className="form-group">
              <label>Poids total (kg)</label>
              <input
                type="number"
                name="cargoWeight"
                value={formData.cargoWeight}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                required
              />
            </div>

            {/* Dimensions */}
            <div className="dimensions-group">
              <h3>Dimensions (cm)</h3>
              <div className="dimensions-grid">
                <div className="form-group">
                  <label>Longueur</label>
                  <input
                    type="number"
                    name="length"
                    value={formData.cargoDimensions.length}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cargoDimensions: {
                        ...prev.cargoDimensions,
                        length: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Largeur</label>
                  <input
                    type="number"
                    name="width"
                    value={formData.cargoDimensions.width}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cargoDimensions: {
                        ...prev.cargoDimensions,
                        width: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hauteur</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.cargoDimensions.height}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cargoDimensions: {
                        ...prev.cargoDimensions,
                        height: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description pour "Autre" */}
            {formData.cargoType === 'other' && (
              <div className="form-group">
                <label>Description de la marchandise</label>
                <textarea
                  name="cargoDescription"
                  value={formData.cargoDescription}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre marchandise (type, particularités, précautions...)"
                  required
                />
              </div>
            )}

            {/* Upload de photos */}
            <div className="photo-upload-section">
              <h3>Photos de la Marchandise</h3>
              <p>Ajoutez jusqu'à 5 photos de votre marchandise</p>
              
              <div className="photo-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formData.cargoPhotos.length >= 5}
                >
                  <i className="fas fa-camera"></i>
                  Ajouter des photos
                </button>
              </div>

              {formData.cargoPhotos.length > 0 && (
                <div className="photo-preview-grid">
                  {formData.cargoPhotos.map((photo, index) => (
                    <div key={index} className="photo-preview">
                      <img src={URL.createObjectURL(photo)} alt={`Cargo ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions de manipulation */}
            <div className="handling-instructions">
              <h3>Instructions de Manipulation</h3>
              <textarea
                name="handlingInstructions"
                value={formData.handlingInstructions}
                onChange={handleInputChange}
                placeholder="Ex: Fragile, Tenir à la verticale, Température contrôlée..."
              />
              <div className="special-requirements">
                <div className="requirements-grid">
                  {['Fragile', 'Périssable', 'Dangereux', 'Température contrôlée'].map(req => (
                    <label key={req} className="requirement-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.specialRequirements.includes(req)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              specialRequirements: [...prev.specialRequirements, req]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              specialRequirements: prev.specialRequirements.filter(r => r !== req)
                            }));
                          }
                        }}
                      />
                      {req}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="next-btn" 
              onClick={() => setStep(4)}
              disabled={!formData.cargoType || formData.cargoWeight === 0}
            >
              Suivant
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="form-step">
            <h2>Adresses et Horaires</h2>
            <div className="datetime-section">
              <div className="pickup-datetime">
                <h4>Enlèvement</h4>
                <div className="datetime-inputs">
                  <div className="date-picker">
                    <label>Date d'enlèvement</label>
                    <DatePicker
                      selected={formData.pickupDate}
                      onChange={(date) => handleDateTimeChange(date, 'pickup')}
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Sélectionnez une date"
                    />
                  </div>
                  <div className="time-picker">
                    <label>Heure d'enlèvement</label>
                    <input
                      type="time"
                      value={formData.pickupTime}
                      onChange={(e) => handleTimeChange(e.target.value, 'pickup')}
                    />
                  </div>
                </div>
              </div>

              <div className="delivery-datetime">
                <h4>Livraison</h4>
                <div className="datetime-inputs">
                  <div className="date-picker">
                    <label>Date de livraison</label>
                    <DatePicker
                      selected={formData.deliveryDate}
                      onChange={(date) => handleDateTimeChange(date, 'delivery')}
                      minDate={formData.pickupDate || new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Sélectionnez une date"
                    />
                  </div>
                  <div className="time-picker">
                    <label>Heure de livraison</label>
                    <input
                      type="time"
                      value={formData.deliveryTime}
                      onChange={(e) => handleTimeChange(e.target.value, 'delivery')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="urgent-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isUrgent: e.target.checked
                  }))}
                />
                Livraison urgente (+50%)
              </label>
            </div>

            {(formData.isWeekend || formData.isNightDelivery) && (
              <div className="price-warnings">
                {formData.isWeekend && (
                  <p className="warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    Supplément weekend applicable (+25%)
                  </p>
                )}
                {formData.isNightDelivery && (
                  <p className="warning">
                    <i className="fas fa-moon"></i>
                    Supplément horaire de nuit applicable (+30%)
                  </p>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label>Adresse de prise en charge</label>
              <input
                type="text"
                name="pickupAddress"
                placeholder="Numéro, rue, code postal, ville"
                value={formData.pickupAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Adresse de livraison</label>
              <input
                type="text"
                name="deliveryAddress"
                placeholder="Numéro, rue, code postal, ville"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            {formData.pickupAddress && formData.deliveryAddress && (
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                <div className="map-container">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                  >
                    {formData.directions && (
                      <DirectionsRenderer
                        directions={formData.directions}
                        options={{
                          polylineOptions: {
                            strokeColor: '#4F46E5',
                            strokeWeight: 4
                          }
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              </LoadScript>
            )}

            {/* Options d'assurance */}
            <div className="insurance-options">
              <h3>Protection de votre Marchandise</h3>
              <div className="insurance-grid">
                <div
                  className={`insurance-card ${formData.insuranceType === 'basic' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, insuranceType: 'basic' }))}
                >
                  <h4>Assurance Basique</h4>
                  <p>0,50€/kg</p>
                  <ul>
                    <li>Couverture des dommages basiques</li>
                    <li>Remboursement jusqu'à 500€</li>
                    <li>Délai de déclaration 24h</li>
                  </ul>
                </div>
                <div
                  className={`insurance-card ${formData.insuranceType === 'premium' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, insuranceType: 'premium' }))}
                >
                  <h4>Assurance Premium</h4>
                  <p>1€/kg</p>
                  <ul>
                    <li>Couverture complète</li>
                    <li>Remboursement jusqu'à 5000€</li>
                    <li>Délai de déclaration 72h</li>
                  </ul>
                </div>
                <div
                  className={`insurance-card ${formData.insuranceType === 'custom' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, insuranceType: 'custom' }))}
                >
                  <h4>Assurance Sur Mesure</h4>
                  <p>1% de la valeur déclarée</p>
                  <ul>
                    <li>Valeur déclarée personnalisée</li>
                    <li>Couverture spécifique</li>
                    <li>Délai de déclaration 7 jours</li>
                  </ul>
                </div>
              </div>

              {formData.insuranceType === 'custom' && (
                <div className="custom-insurance">
                  <label>Valeur déclarée (€)</label>
                  <input
                    type="number"
                    name="insuranceValue"
                    value={formData.insuranceValue}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                  />
                </div>
              )}
            </div>

            {/* Préférences de notification */}
            <div className="notification-preferences">
              <h3>Préférences de Suivi</h3>
              <p>Choisissez comment recevoir les mises à jour de votre livraison</p>
              
              <div className="preferences-grid">
                <label className="preference-option">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        email: e.target.checked
                      }
                    }))}
                  />
                  <span>Email</span>
                  <small>Notifications détaillées par email</small>
                </label>
                
                <label className="preference-option">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.sms}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        sms: e.target.checked
                      }
                    }))}
                  />
                  <span>SMS</span>
                  <small>Alertes rapides par SMS</small>
                </label>
                
                <label className="preference-option">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.push}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        push: e.target.checked
                      }
                    }))}
                  />
                  <span>Notifications Push</span>
                  <small>Suivi en temps réel sur l'application</small>
                </label>
              </div>
            </div>

            <button type="button" className="next-btn" onClick={() => setStep(5)} disabled={!formData.pickupAddress || !formData.deliveryAddress || !formData.pickupTime}>
              Suivant
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="form-step">
            <h2>Options Supplémentaires</h2>
            <div className="options-grid">
              <div className="option-card">
                <label>
                  <input
                    type="checkbox"
                    name="withInsurance"
                    checked={formData.withInsurance}
                    onChange={handleInputChange}
                  />
                  <span className="option-title">Assurance Premium</span>
                  <span className="option-price">+30€</span>
                  <p>Couverture étendue jusqu'à 50 000€</p>
                </label>
              </div>

              <div className="option-card">
                <label>
                  <input
                    type="checkbox"
                    name="withHandling"
                    checked={formData.withHandling}
                    onChange={handleInputChange}
                  />
                  <span className="option-title">Service Manutention</span>
                  <span className="option-price">+40€</span>
                  <p>2 manutentionnaires pour le chargement/déchargement</p>
                </label>
              </div>
            </div>

            {/* Résumé du prix avec toutes les options */}
            <div className="price-summary">
              <h3>Estimation du prix</h3>
              <div className="price-details">
                <div className="price-row">
                  <span>Prix de base</span>
                  <span>{vehicles.find(v => v.id === formData.selectedVehicle)?.basePrice}€</span>
                </div>
                <div className="price-row">
                  <span>Distance ({Math.round(formData.distance)} km)</span>
                  <span>{Math.round(formData.distance * 2)}€</span>
                </div>
                {formData.withHayon && (
                  <div className="price-row">
                    <span>Hayon</span>
                    <span>25€</span>
                  </div>
                )}
                {formData.withPlsc && (
                  <div className="price-row">
                    <span>PLSC</span>
                    <span>15€</span>
                  </div>
                )}
                {formData.withInsurance && (
                  <div className="price-row">
                    <span>Assurance Premium</span>
                    <span>30€</span>
                  </div>
                )}
                {formData.withHandling && (
                  <div className="price-row">
                    <span>Service Manutention</span>
                    <span>40€</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Frais de service</span>
                  <span>20€</span>
                </div>
                {formData.clientType !== 'personal-occasional' && (
                  <div className="price-row discount">
                    <span>Réduction {
                      formData.clientType === 'personal-regular' ? '10%' :
                      formData.clientType === 'business-occasional' ? '15%' :
                      '25%'
                    }</span>
                    <span>-{Math.round(formData.estimatedPrice * (
                      formData.clientType === 'personal-regular' ? 0.1 :
                      formData.clientType === 'business-occasional' ? 0.15 :
                      0.25
                    ))}€</span>
                  </div>
                )}
                <div className="price-total">
                  <span>Total estimé</span>
                  <span>{formData.estimatedPrice}€</span>
                </div>
              </div>
            </div>

            {/* Assurance */}
            <div className="insurance">
              <h3>Assurance</h3>
              <p>Vous avez choisi l'assurance {formData.insuranceType}</p>
              <p>Prix de l'assurance : {calculateInsurancePrice()}€</p>
            </div>

            <button type="button" className="next-btn" onClick={() => setStep(6)}>
              Suivant
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="form-step">
            <h2>Paiement et Confirmation</h2>
            
            {/* Coordonnées */}
            <div className="contact-section">
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
            </div>

            {/* Méthodes de paiement */}
            <div className="payment-methods">
              <h3>Choisissez votre méthode de paiement</h3>
              <div className="payment-grid">
                <div 
                  className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                >
                  <FaCreditCard />
                  <span>Carte Bancaire</span>
                </div>
                <div 
                  className={`payment-option ${formData.paymentMethod === 'paypal' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                >
                  <FaPaypal />
                  <span>PayPal</span>
                </div>
                <div 
                  className={`payment-option ${formData.paymentMethod === 'applepay' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'applepay' }))}
                >
                  <FaApplePay />
                  <span>Apple Pay</span>
                </div>
                <div 
                  className={`payment-option ${formData.paymentMethod === 'googlepay' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'googlepay' }))}
                >
                  <FaGooglePay />
                  <span>Google Pay</span>
                </div>
              </div>
            </div>

            {/* Résumé final */}
            <div className="final-summary">
              <h3>Résumé de votre commande</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Date et heure</span>
                  <span>{formData.pickupDate?.toLocaleDateString()} à {formData.pickupTime}</span>
                </div>
                <div className="summary-row">
                  <span>Durée estimée</span>
                  <span>{formData.estimatedDuration}</span>
                </div>
                <div className="summary-row">
                  <span>Impact environnemental</span>
                  <span>-{formData.co2Savings} kg CO2</span>
                </div>
                <div className="summary-row total">
                  <span>Total à payer</span>
                  <span>{formData.estimatedPrice}€</span>
                </div>
              </div>
            </div>

            {/* Actions supplémentaires */}
            <div className="quote-actions">
              <button 
                type="button" 
                className="action-button save"
                onClick={saveQuote}
              >
                Sauvegarder le devis
              </button>
              <button 
                type="button" 
                className="action-button share"
                onClick={shareQuoteByEmail}
              >
                Partager par email
              </button>
            </div>

            {/* Historique des devis */}
            {formData.quoteHistory.length > 0 && (
              <div className="quote-history">
                <h3>Historique des devis</h3>
                <div className="history-list">
                  {formData.quoteHistory.map((quote: any) => (
                    <div key={quote.id} className="history-item">
                      <span>Devis #{quote.id}</span>
                      <span>{new Date(quote.date).toLocaleDateString()}</span>
                      <span>{quote.estimatedPrice}€</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton de commande (uniquement pour les particuliers) */}
            {(formData.clientType === 'personal-occasional' || formData.clientType === 'personal-regular') && (
              <button 
                type="submit" 
                className="order-button"
                disabled={!formData.paymentMethod}
              >
                Passer la commande
              </button>
            )}

            {/* Message pour les professionnels */}
            {(formData.clientType === 'business-occasional' || formData.clientType === 'business-regular') && (
              <div className="business-message">
                <p>Pour finaliser votre commande professionnelle, veuillez créer un compte entreprise ou vous connecter.</p>
                <button 
                  type="button" 
                  className="business-register-button"
                  onClick={() => navigate('/register/business')}
                >
                  Créer un compte entreprise
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default PriceEstimator;
