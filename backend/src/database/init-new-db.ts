import { connect } from 'mongoose';
import { hash } from 'bcrypt';
import { config } from 'dotenv';

config();

async function initializeNewDatabase() {
  try {
    console.log('Connexion à MongoDB...');
    const mongoConnection = await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transwift_new');
    const db = mongoConnection.connection;

    // Création de l'administrateur
    console.log('\nCréation de l\'administrateur...');
    await db.collection('users').insertOne({
      email: 'admin@transwift.com',
      password: await hash('admin123', 10),
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'System',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Création des types de véhicules
    console.log('\nCréation des types de véhicules...');
    await db.collection('vehicletypes').insertMany([
      {
        name: 'Fourgonnette',
        category: 'VAN',
        maxWeight: 1500,
        volume: 8,
        description: 'Idéal pour les livraisons urbaines',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Camionnette',
        category: 'VAN',
        maxWeight: 3500,
        volume: 20,
        description: 'Pour les livraisons moyennes distances',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Poids Lourd',
        category: 'TRUCK',
        maxWeight: 7500,
        volume: 40,
        description: 'Pour les grandes livraisons',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Création des chauffeurs
    console.log('\nCréation des chauffeurs...');
    await db.collection('drivers').insertMany([
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@transwift.com',
        password: await hash('driver123', 10),
        phone: '+33123456789',
        licenseNumber: 'DRV001',
        licenseExpiry: new Date('2025-12-31'),
        status: 'AVAILABLE',
        documents: {
          drivingLicense: {
            number: 'DRV001',
            expiryDate: new Date('2025-12-31'),
            verified: true
          },
          identityCard: {
            number: 'ID001',
            expiryDate: new Date('2028-12-31'),
            verified: true
          }
        },
        vehiclePreferences: {
          preferredVehicleTypes: ['VAN', 'TRUCK'],
          maxWeight: 3500
        },
        workSchedule: {
          availableHours: {
            start: '08:00',
            end: '18:00'
          },
          workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        },
        rating: 4.8,
        totalDeliveries: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@transwift.com',
        password: await hash('driver123', 10),
        phone: '+33123456790',
        licenseNumber: 'DRV002',
        licenseExpiry: new Date('2025-12-31'),
        status: 'AVAILABLE',
        documents: {
          drivingLicense: {
            number: 'DRV002',
            expiryDate: new Date('2025-12-31'),
            verified: true
          },
          identityCard: {
            number: 'ID002',
            expiryDate: new Date('2028-12-31'),
            verified: true
          }
        },
        vehiclePreferences: {
          preferredVehicleTypes: ['VAN'],
          maxWeight: 3500
        },
        workSchedule: {
          availableHours: {
            start: '09:00',
            end: '19:00'
          },
          workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        },
        rating: 4.9,
        totalDeliveries: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Création des véhicules
    console.log('\nCréation des véhicules...');
    await db.collection('vehicles').insertMany([
      {
        plateNumber: 'AA-123-BB',
        brand: 'Renault',
        model: 'Master',
        year: 2023,
        color: 'Blanc',
        status: 'ACTIVE',
        type: 'VAN',
        lastMaintenanceDate: new Date('2024-12-01'),
        nextMaintenanceDate: new Date('2025-06-01'),
        insuranceExpiryDate: new Date('2025-12-31'),
        technicalInspectionDate: new Date('2025-12-31'),
        mileage: 50000,
        fuelType: 'Diesel',
        fuelLevel: 75,
        specifications: {
          capacity: '20m³',
          maxWeight: '3.5T',
          length: '5.5m',
          width: '2.1m',
          height: '2.5m'
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
        type: 'VAN',
        lastMaintenanceDate: new Date('2024-11-15'),
        nextMaintenanceDate: new Date('2025-05-15'),
        insuranceExpiryDate: new Date('2025-12-31'),
        technicalInspectionDate: new Date('2025-12-31'),
        mileage: 45000,
        fuelType: 'Diesel',
        fuelLevel: 80,
        specifications: {
          capacity: '15m³',
          maxWeight: '3.5T',
          length: '5.2m',
          width: '2.0m',
          height: '2.4m'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('\nInitialisation de la base de données terminée avec succès !');
    console.log('\nDonnées de connexion :');
    console.log('Admin:');
    console.log('  Email: admin@transwift.com');
    console.log('  Mot de passe: admin123');
    console.log('\nChauffeurs:');
    console.log('  Email: jean.dupont@transwift.com');
    console.log('  Email: marie.martin@transwift.com');
    console.log('  Mot de passe (pour tous les chauffeurs): driver123');

    await mongoConnection.disconnect();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation
initializeNewDatabase();
