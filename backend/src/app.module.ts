import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './config/mongodb.config';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { DocumentVerificationModule } from './modules/document-verification/document-verification.module';
import { BillingModule } from './modules/billing/billing.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    VehiclesModule,
    UsersModule,
    AdminModule,
    DocumentVerificationModule,
    BillingModule,
    IncidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
