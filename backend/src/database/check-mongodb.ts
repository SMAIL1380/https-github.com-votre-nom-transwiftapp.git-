import { connect } from 'mongoose';
import { config } from 'dotenv';

config();

async function checkDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/transwiftdb';
    console.log('Connexion à MongoDB...');
    const connection = await connect(uri);
    
    // Obtenir les collections existantes
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('\nCollections existantes :');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Pour chaque collection, afficher un exemple de document
    console.log('\nExemples de documents :');
    for (const collection of collections) {
      const documents = await connection.connection.db
        .collection(collection.name)
        .find({})
        .limit(1)
        .toArray();
      
      if (documents.length > 0) {
        console.log(`\n${collection.name} - Structure :`);
        console.log(JSON.stringify(documents[0], null, 2));
      }
    }

    await connection.disconnect();
    console.log('\nVérification terminée !');
  } catch (error) {
    console.error('Erreur lors de la vérification :', error);
  }
}

checkDatabase();
