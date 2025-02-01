import { config } from 'dotenv';
import { createConnection } from 'typeorm';
import { connect } from 'mongoose';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { MaintenanceRecord } from '../modules/vehicles/entities/maintenance-record.entity';
import { User } from '../modules/users/entities/user.entity';
import { Driver } from '../modules/drivers/entities/driver.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { VehicleSchema } from '../modules/vehicles/schemas/vehicle.schema';
import { MaintenanceRecordSchema } from '../modules/vehicles/schemas/maintenance-record.schema';
import { UserSchema } from '../modules/users/schemas/user.schema';
import { DriverSchema } from '../modules/drivers/schemas/driver.schema';
import { OrderSchema } from '../modules/orders/schemas/order.schema';

config(); // Charger les variables d'environnement

async function migrateData() {
  try {
    // Connexion à PostgreSQL
    const postgresConnection = await createConnection({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB || 'transwift_dev',
      entities: [Vehicle, MaintenanceRecord, User, Driver, Order],
      synchronize: false,
    });

    // Connexion à MongoDB
    const mongoConnection = await connect(process.env.MONGODB_URI);
    
    // Définir les modèles MongoDB
    const VehicleModel = mongoConnection.model('Vehicle', VehicleSchema);
    const MaintenanceRecordModel = mongoConnection.model('MaintenanceRecord', MaintenanceRecordSchema);
    const UserModel = mongoConnection.model('User', UserSchema);
    const DriverModel = mongoConnection.model('Driver', DriverSchema);
    const OrderModel = mongoConnection.model('Order', OrderSchema);

    // Migration des utilisateurs
    console.log('Migration des utilisateurs...');
    const users = await postgresConnection.getRepository(User).find();
    for (const user of users) {
      const mongoUser = new UserModel({
        ...user,
        _id: user.id, // Conserver le même ID
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      await mongoUser.save();
    }
    console.log(`${users.length} utilisateurs migrés`);

    // Migration des chauffeurs
    console.log('Migration des chauffeurs...');
    const drivers = await postgresConnection.getRepository(Driver).find();
    for (const driver of drivers) {
      const mongoDriver = new DriverModel({
        ...driver,
        _id: driver.id,
        user: driver.user?.id, // Référence à l'utilisateur
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      });
      await mongoDriver.save();
    }
    console.log(`${drivers.length} chauffeurs migrés`);

    // Migration des véhicules
    console.log('Migration des véhicules...');
    const vehicles = await postgresConnection.getRepository(Vehicle).find({
      relations: ['currentDriver', 'maintenanceRecords'],
    });
    for (const vehicle of vehicles) {
      const mongoVehicle = new VehicleModel({
        ...vehicle,
        _id: vehicle.id,
        currentDriver: vehicle.currentDriver?.id,
        maintenanceRecords: vehicle.maintenanceRecords?.map(record => record.id),
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      });
      await mongoVehicle.save();
    }
    console.log(`${vehicles.length} véhicules migrés`);

    // Migration des enregistrements de maintenance
    console.log('Migration des enregistrements de maintenance...');
    const maintenanceRecords = await postgresConnection.getRepository(MaintenanceRecord).find({
      relations: ['vehicle'],
    });
    for (const record of maintenanceRecords) {
      const mongoRecord = new MaintenanceRecordModel({
        ...record,
        _id: record.id,
        vehicle: record.vehicle?.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
      await mongoRecord.save();
    }
    console.log(`${maintenanceRecords.length} enregistrements de maintenance migrés`);

    // Migration des commandes
    console.log('Migration des commandes...');
    const orders = await postgresConnection.getRepository(Order).find({
      relations: ['driver', 'vehicle'],
    });
    for (const order of orders) {
      const mongoOrder = new OrderModel({
        ...order,
        _id: order.id,
        driver: order.driver?.id,
        vehicle: order.vehicle?.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
      await mongoOrder.save();
    }
    console.log(`${orders.length} commandes migrées`);

    // Fermeture des connexions
    await postgresConnection.close();
    await mongoConnection.disconnect();

    console.log('Migration terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la migration :', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateData();
