import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDriverTable1704453800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'drivers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'licenseNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'vehicleType',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'vehiclePlateNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'currentLocation',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'isAvailable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'rating',
            type: 'float',
            default: 0,
          },
          {
            name: 'totalDeliveries',
            type: 'integer',
            default: 0,
          },
          {
            name: 'documents',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('drivers');
  }
}
