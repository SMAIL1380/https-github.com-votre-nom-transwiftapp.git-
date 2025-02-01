import { DataSource } from 'typeorm';
import dataSource from './datasource';

const checkTables = async () => {
  try {
    await dataSource.initialize();
    console.log('Base de données connectée');

    // Lister toutes les tables
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables trouvées :', tables);

    // Vérifier spécifiquement la table admins
    const adminTable = await dataSource.query(`
      SELECT * FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'admins'
    `);
    
    console.log('Table admins :', adminTable);

    // Lister les colonnes de la table admins si elle existe
    if (adminTable.length > 0) {
      const columns = await dataSource.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'admins'
      `);
      console.log('Colonnes de la table admins :', columns);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Erreur :', error);
  }
};

checkTables();
