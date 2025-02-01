import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1704453700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Création de l'extension UUID si elle n'existe pas
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // On ne supprime pas l'extension uuid-ossp car elle pourrait être utilisée par d'autres applications
    // await queryRunner.query(`DROP EXTENSION "uuid-ossp"`);
  }
}
