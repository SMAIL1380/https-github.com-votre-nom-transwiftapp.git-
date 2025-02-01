import { connect } from 'mongoose';
import { hash } from 'bcrypt';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

async function initializeDatabase() {
  try {
    // Connexion à MongoDB
    const mongoConnection = await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transwift');
    const db = mongoConnection.connection;

    // Créer l'administrateur par défaut
    const adminUser = await db.collection('users').insertOne({
      email: 'admin@transwift.com',
      password: await hash('admin123', 10),
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'System',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Créer quelques chauffeurs de test
    const drivers = await db.collection('drivers').insertMany([
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@transwift.com',
        phone: '+33123456789',
        licenseNumber: 'DRV001',
        licenseExpiry: new Date('2025-12-31'),
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@transwift.com',
        phone: '+33123456790',
        licenseNumber: 'DRV002',
        licenseExpiry: new Date('2025-12-31'),
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Créer quelques véhicules de test
    const vehicles = await db.collection('vehicles').insertMany([
      {
        plateNumber: 'AA-123-BB',
        brand: 'Renault',
        model: 'Master',
        year: 2023,
        color: 'Blanc',
        status: 'ACTIVE',
        lastMaintenanceDate: new Date('2024-12-01'),
        nextMaintenanceDate: new Date('2025-06-01'),
        insuranceExpiryDate: new Date('2025-12-31'),
        technicalInspectionDate: new Date('2025-12-31'),
        specifications: {
          capacity: '20m³',
          maxWeight: '3.5T',
          fuelType: 'Diesel'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        plateNumber: 'CC-456-DD',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2023,
        color: 'Gris',
        status: 'ACTIVE',
        lastMaintenanceDate: new Date('2024-11-15'),
        nextMaintenanceDate: new Date('2025-05-15'),
        insuranceExpiryDate: new Date('2025-12-31'),
        technicalInspectionDate: new Date('2025-12-31'),
        specifications: {
          capacity: '15m³',
          maxWeight: '3.5T',
          fuelType: 'Diesel'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Créer quelques enregistrements de maintenance
    await db.collection('maintenancerecords').insertMany([
      {
        vehicleId: vehicles.insertedIds[0],
        type: 'PREVENTIVE',
        description: 'Maintenance régulière',
        date: new Date('2024-12-01'),
        cost: 500,
        mileage: 50000,
        nextMaintenanceDate: new Date('2025-06-01'),
        status: 'COMPLETED',
        notes: 'RAS',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vehicleId: vehicles.insertedIds[1],
        type: 'PREVENTIVE',
        description: 'Maintenance régulière',
        date: new Date('2024-11-15'),
        cost: 450,
        mileage: 45000,
        nextMaintenanceDate: new Date('2025-05-15'),
        status: 'COMPLETED',
        notes: 'RAS',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Créer quelques commandes de test
    await db.collection('orders').insertMany([
      {
        orderNumber: 'ORD-2024-001',
        clientName: 'Société A',
        status: 'COMPLETED',
        pickupAddress: '123 Rue de Paris, 75001 Paris',
        deliveryAddress: '456 Avenue de Lyon, 69001 Lyon',
        scheduledDate: new Date('2024-12-15'),
        driverId: drivers.insertedIds[0],
        vehicleId: vehicles.insertedIds[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderNumber: 'ORD-2024-002',
        clientName: 'Société B',
        status: 'SCHEDULED',
        pickupAddress: '789 Boulevard de Marseille, 13001 Marseille',
        deliveryAddress: '321 Route de Nice, 06000 Nice',
        scheduledDate: new Date('2025-01-15'),
        driverId: drivers.insertedIds[1],
        vehicleId: vehicles.insertedIds[1],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('Base de données initialisée avec succès !');
    console.log('Données de connexion admin :');
    console.log('Email: admin@transwift.com');
    console.log('Mot de passe: admin123');

    await mongoConnection.disconnect();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation
initializeDatabase();
