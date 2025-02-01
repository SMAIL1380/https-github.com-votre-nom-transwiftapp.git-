import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateVehicleAndDocumentsTables1704453900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vehicles table
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'brand',
            type: 'varchar',
          },
          {
            name: 'model',
            type: 'varchar',
          },
          {
            name: 'year',
            type: 'integer',
          },
          {
            name: 'plateNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dimensions',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'insuranceNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'insuranceExpiryDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'technicalInspectionDate',
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
          },
        ],
      }),
      true,
    );

    // Create driver_documents table
    await queryRunner.createTable(
      new Table({
        name: 'driver_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'documentNumber',
            type: 'varchar',
          },
          {
            name: 'documentUrl',
            type: 'varchar',
          },
          {
            name: 'expiryDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verifiedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'driverId',
            type: 'uuid',
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
          },
        ],
      }),
      true,
    );

    // Create driver_reviews table
    await queryRunner.createTable(
      new Table({
        name: 'driver_reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'varchar',
          },
          {
            name: 'deliveryId',
            type: 'varchar',
          },
          {
            name: 'rating',
            type: 'float',
          },
          {
            name: 'comment',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isReported',
            type: 'boolean',
            default: false,
          },
          {
            name: 'reportReason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'driverId',
            type: 'uuid',
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
          },
        ],
      }),
      true,
    );

    // Add foreign key for driver_documents
    await queryRunner.createForeignKey(
      'driver_documents',
      new TableForeignKey({
        columnNames: ['driverId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drivers',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for driver_reviews
    await queryRunner.createForeignKey(
      'driver_reviews',
      new TableForeignKey({
        columnNames: ['driverId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drivers',
        onDelete: 'CASCADE',
      }),
    );

    // Add vehicleId column to drivers table
    await queryRunner.addColumn(
      'drivers',
      new Table({
        name: 'vehicleId',
        columns: [
          {
            name: 'vehicleId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }).columns[0],
    );

    // Add foreign key for drivers-vehicles relation
    await queryRunner.createForeignKey(
      'drivers',
      new TableForeignKey({
        columnNames: ['vehicleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicles',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const driverDocumentsTable = await queryRunner.getTable('driver_documents');
    const driverReviewsTable = await queryRunner.getTable('driver_reviews');
    const driversTable = await queryRunner.getTable('drivers');
    
    const driverDocumentsForeignKey = driverDocumentsTable.foreignKeys.find(
      fk => fk.columnNames.indexOf('driverId') !== -1,
    );
    const driverReviewsForeignKey = driverReviewsTable.foreignKeys.find(
      fk => fk.columnNames.indexOf('driverId') !== -1,
    );
    const driversVehicleForeignKey = driversTable.foreignKeys.find(
      fk => fk.columnNames.indexOf('vehicleId') !== -1,
    );

    await queryRunner.dropForeignKey('driver_documents', driverDocumentsForeignKey);
    await queryRunner.dropForeignKey('driver_reviews', driverReviewsForeignKey);
    await queryRunner.dropForeignKey('drivers', driversVehicleForeignKey);

    // Drop vehicleId column from drivers
    await queryRunner.dropColumn('drivers', 'vehicleId');

    // Drop tables
    await queryRunner.dropTable('driver_documents');
    await queryRunner.dropTable('driver_reviews');
    await queryRunner.dropTable('vehicles');
  }
}
