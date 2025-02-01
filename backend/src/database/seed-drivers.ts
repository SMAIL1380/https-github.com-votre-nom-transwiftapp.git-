import { connect } from 'mongoose';
import { hash } from 'bcrypt';
import { config } from 'dotenv';

config();

const driversData = [
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@transwift.com',
    password: 'driver123', // Sera hashé
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
    password: 'driver123', // Sera hashé
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
  },
  {
    firstName: 'Pierre',
    lastName: 'Dubois',
    email: 'pierre.dubois@transwift.com',
    password: 'driver123', // Sera hashé
    phone: '+33123456791',
    licenseNumber: 'DRV003',
    licenseExpiry: new Date('2026-06-30'),
    status: 'AVAILABLE',
    documents: {
      drivingLicense: {
        number: 'DRV003',
        expiryDate: new Date('2026-06-30'),
        verified: true
      },
      identityCard: {
        number: 'ID003',
        expiryDate: new Date('2029-06-30'),
        verified: true
      }
    },
    vehiclePreferences: {
      preferredVehicleTypes: ['TRUCK'],
      maxWeight: 7500
    },
    workSchedule: {
      availableHours: {
        start: '07:00',
        end: '17:00'
      },
      workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    },
    rating: 4.7,
    totalDeliveries: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDrivers() {
  try {
    // Connexion à MongoDB
    const mongoConnection = await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transwiftdb');
    const db = mongoConnection.connection;

    // Vérifier si la collection drivers existe déjà
    const collections = await db.db.listCollections().toArray();
    const driversCollectionExists = collections.some(col => col.name === 'drivers');

    if (!driversCollectionExists) {
      console.log('Création de la collection drivers...');
      await db.createCollection('drivers');
    }

    // Vérifier si des chauffeurs existent déjà
    const existingDrivers = await db.collection('drivers').countDocuments();
    
    if (existingDrivers > 0) {
      console.log('Des chauffeurs existent déjà dans la base de données.');
      console.log(`Nombre de chauffeurs existants : ${existingDrivers}`);
      const continueSeeding = true; // Vous pouvez ajouter une logique interactive ici si nécessaire
      
      if (!continueSeeding) {
        console.log('Opération annulée.');
        await mongoConnection.disconnect();
        return;
      }
    }

    // Hasher les mots de passe et insérer les chauffeurs
    for (const driver of driversData) {
      const hashedPassword = await hash(driver.password, 10);
      const driverWithHashedPassword = {
        ...driver,
        password: hashedPassword
      };

      await db.collection('drivers').insertOne(driverWithHashedPassword);
      console.log(`Chauffeur ajouté : ${driver.firstName} ${driver.lastName}`);
    }

    console.log('\nInitialisation des chauffeurs terminée avec succès !');
    console.log('\nDonnées de connexion des chauffeurs :');
    driversData.forEach(driver => {
      console.log(`Email: ${driver.email}`);
      console.log(`Mot de passe: driver123`);
      console.log('---');
    });

    await mongoConnection.disconnect();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des chauffeurs:', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation
seedDrivers();
