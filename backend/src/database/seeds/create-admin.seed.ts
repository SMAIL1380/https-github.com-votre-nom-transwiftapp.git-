import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../../modules/admin/entities/admin.entity';

export const createAdminSeed = async (dataSource: DataSource) => {
  const adminRepository = dataSource.getRepository(Admin);

  // Vérifier si un admin existe déjà
  const existingAdmin = await adminRepository.findOne({
    where: { email: 'admin@transwift.com' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = adminRepository.create({
      email: 'admin@transwift.com',
      firstName: 'Admin',
      lastName: 'System',
      password: hashedPassword,
      roles: ['admin', 'super-admin'],
      isActive: true
    });

    await adminRepository.save(admin);
    console.log('Admin créé avec succès');
  } else {
    console.log('Un admin existe déjà');
  }
};
