import { DataSource } from 'typeorm';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';
import { Driver } from '../../modules/drivers/entities/driver.entity';

export const createVehicleSeed = async (dataSource: DataSource) => {
  const vehicleRepository = dataSource.getRepository(Vehicle);
  const driverRepository = dataSource.getRepository(Driver);

  // Trouver le chauffeur existant
  const driver = await driverRepository.findOne({
    where: { email: 'driver@transwift.com' }
  });

  if (driver) {
    // Vérifier si un véhicule existe déjà
    const existingVehicle = await vehicleRepository.findOne({
      where: { plateNumber: 'AB-123-CD' }
    });

    if (!existingVehicle) {
      const vehicle = vehicleRepository.create({
        brand: 'Renault',
        model: 'Master',
        year: 2022,
        plateNumber: 'AB-123-CD',
        type: 'Van',
        color: 'White',
        dimensions: {
          length: 5.48,
          width: 2.07,
          height: 2.50,
          maxWeight: 3500
        },
        insuranceNumber: 'INS123456',
        insuranceExpiryDate: new Date('2025-12-31'),
        technicalInspectionDate: new Date('2025-06-30')
      });

      const savedVehicle = await vehicleRepository.save(vehicle);
      
      // Mettre à jour le chauffeur avec le véhicule
      driver.vehicle = savedVehicle;
      await driverRepository.save(driver);
      
      console.log('Véhicule créé et associé au chauffeur avec succès');
    } else {
      console.log('Un véhicule existe déjà');
    }
  } else {
    console.log('Chauffeur non trouvé');
  }
};
