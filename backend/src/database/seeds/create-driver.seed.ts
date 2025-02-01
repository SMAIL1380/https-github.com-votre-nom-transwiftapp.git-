import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver } from '../../modules/drivers/entities/driver.entity';

export const createDriverSeed = async (dataSource: DataSource) => {
  const driverRepository = dataSource.getRepository(Driver);

  // Vérifier si un chauffeur existe déjà
  const existingDriver = await driverRepository.findOne({
    where: { email: 'driver@transwift.com' }
  });

  if (!existingDriver) {
    const hashedPassword = await bcrypt.hash('Driver@123', 10);
    
    const driver = new Driver();
    driver.email = 'driver@transwift.com';
    driver.firstName = 'John';
    driver.lastName = 'Doe';
    driver.password = hashedPassword;
    driver.phoneNumber = '+33123456789';
    driver.licenseNumber = 'LIC123456';
    driver.isAvailable = true;
    driver.currentLocation = {
      latitude: 48.8566,
      longitude: 2.3522
    };

    await driverRepository.save(driver);
    console.log('Chauffeur créé avec succès');
  } else {
    console.log('Un chauffeur existe déjà');
  }
};
