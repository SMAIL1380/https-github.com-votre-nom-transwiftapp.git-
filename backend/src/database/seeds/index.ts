import { DataSource } from 'typeorm';
import { createAdminSeed } from './create-admin.seed';
import { createDriverSeed } from './create-driver.seed';
import { createVehicleSeed } from './create-vehicle.seed';
import dataSource from '../datasource';

const runSeeds = async () => {
  try {
    await dataSource.initialize();
    console.log('Base de données connectée');

    await createAdminSeed(dataSource);
    await createDriverSeed(dataSource);
    await createVehicleSeed(dataSource);
    console.log('Seeds exécutés avec succès');

    await dataSource.destroy();
    console.log('Connexion fermée');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des seeds:', error);
    process.exit(1);
  }
};

runSeeds();
