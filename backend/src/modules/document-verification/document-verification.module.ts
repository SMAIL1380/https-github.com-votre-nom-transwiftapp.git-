import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DocumentVerificationService } from './services/document-verification.service';
import { DocumentVerificationController } from './controllers/document-verification.controller';
import { WebhookService } from './services/webhook.service';
import { DocumentVerification } from './entities/document-verification.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentVerification, Driver]),
    HttpModule,
    NotificationsModule,
  ],
  controllers: [DocumentVerificationController],
  providers: [DocumentVerificationService, WebhookService],
  exports: [DocumentVerificationService],
})
export class DocumentVerificationModule {}
