import React, { useState } from 'react';
import './FleetSection.css';

const vehicles = [
  {
    id: 1,
    name: 'Utilitaire',
    type: '3.5T',
    image: '/assets/vehicles/van.jpg',
    specs: {
      volume: '20m³',
      length: '4.3m',
      width: '1.8m',
      height: '1.9m',
      maxWeight: '1500kg'
    },
    description: 'Parfait pour les livraisons urbaines et petits déménagements'
  },
  {
    id: 2,
    name: 'Frigorifique',
    type: '3.5T',
    image: '/assets/vehicles/frigo.jpg',
    specs: {
      volume: '15m³',
      length: '4.3m',
      width: '1.8m',
      height: '1.9m',
      maxWeight: '1200kg',
      temp: '-20°C à +20°C'
    },
    description: 'Transport à température contrôlée pour produits sensibles'
  }
];

const FleetSection: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);

  return (
    <section className="fleet" id="fleet">
      <div className="fleet-header">
        <h2 className="section-title">Notre Flotte</h2>
        <p className="section-subtitle">
          Une gamme complète de véhicules pour répondre à tous vos besoins
        </p>
      </div>

      <div className="fleet-content">
        <div className="vehicle-selector">
          {vehicles.map(vehicle => (
            <button
              key={vehicle.id}
              className={`vehicle-button ${selectedVehicle.id === vehicle.id ? 'active' : ''}`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <span className="vehicle-name">{vehicle.name}</span>
              <span className="vehicle-type">{vehicle.type}</span>
            </button>
          ))}
        </div>

        <div className="vehicle-details">
          <div className="vehicle-image">
            <img src={selectedVehicle.image} alt={selectedVehicle.name} />
          </div>
          
          <div className="vehicle-info">
            <h3>{selectedVehicle.name}</h3>
            <p className="vehicle-description">{selectedVehicle.description}</p>
            
            <div className="specs-grid">
              {Object.entries(selectedVehicle.specs).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>

            <button className="reserve-button">
              Réserver ce véhicule
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FleetSection;
