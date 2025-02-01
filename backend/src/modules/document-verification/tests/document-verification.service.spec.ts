import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVerificationService } from '../services/document-verification.service';
import { DocumentVerification, DocumentType, VerificationStatus } from '../entities/document-verification.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { WebhookService } from '../services/webhook.service';
import { ConfigService } from '@nestjs/config';

describe('DocumentVerificationService', () => {
  let service: DocumentVerificationService;
  let documentRepo: Repository<DocumentVerification>;
  let driverRepo: Repository<Driver>;
  let notificationsService: NotificationsService;
  let webhookService: WebhookService;

  const mockDocumentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDriverRepo = {
    findOne: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockWebhookService = {
    verifyUrssaf: jest.fn(),
    verifyVat: jest.fn(),
    verifyKbis: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentVerificationService,
        {
          provide: getRepositoryToken(DocumentVerification),
          useValue: mockDocumentRepo,
        },
        {
          provide: getRepositoryToken(Driver),
          useValue: mockDriverRepo,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: WebhookService,
          useValue: mockWebhookService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DocumentVerificationService>(DocumentVerificationService);
    documentRepo = module.get<Repository<DocumentVerification>>(
      getRepositoryToken(DocumentVerification),
    );
    driverRepo = module.get<Repository<Driver>>(getRepositoryToken(Driver));
    notificationsService = module.get<NotificationsService>(NotificationsService);
    webhookService = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVerification', () => {
    it('should create a new document verification', async () => {
      const mockDriver = { id: '1', firstName: 'John' };
      const mockVerification = {
        id: '1',
        documentType: DocumentType.KBIS,
        status: VerificationStatus.PENDING,
      };

      mockDriverRepo.findOne.mockResolvedValue(mockDriver);
      mockDocumentRepo.create.mockReturnValue(mockVerification);
      mockDocumentRepo.save.mockResolvedValue(mockVerification);

      const result = await service.createVerification(
        '1',
        DocumentType.KBIS,
        'http://example.com/doc',
        '12345',
        new Date(),
        new Date(),
      );

      expect(result).toEqual(mockVerification);
      expect(mockDriverRepo.findOne).toHaveBeenCalled();
      expect(mockDocumentRepo.create).toHaveBeenCalled();
      expect(mockDocumentRepo.save).toHaveBeenCalled();
    });

    it('should throw error if driver not found', async () => {
      mockDriverRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createVerification(
          '1',
          DocumentType.KBIS,
          'http://example.com/doc',
          '12345',
          new Date(),
          new Date(),
        ),
      ).rejects.toThrow('Chauffeur non trouvé');
    });
  });

  describe('updateVerificationStatus', () => {
    it('should update document status and send notification', async () => {
      const mockVerification = {
        id: '1',
        documentType: DocumentType.KBIS,
        status: VerificationStatus.PENDING,
        driver: { id: '1' },
      };

      mockDocumentRepo.findOne.mockResolvedValue(mockVerification);
      mockDocumentRepo.save.mockResolvedValue({
        ...mockVerification,
        status: VerificationStatus.VERIFIED,
      });

      const result = await service.updateVerificationStatus(
        '1',
        VerificationStatus.VERIFIED,
        { verificationMethod: 'MANUAL' },
      );

      expect(result.status).toBe(VerificationStatus.VERIFIED);
      expect(mockDocumentRepo.save).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalled();
    });
  });

  describe('checkExpiringDocuments', () => {
    it('should return documents expiring soon', async () => {
      const mockDocuments = [
        {
          id: '1',
          documentType: DocumentType.KBIS,
          expiryDate: new Date(),
        },
      ];

      mockDocumentRepo.find.mockResolvedValue(mockDocuments);

      const result = await service.checkExpiringDocuments(30);

      expect(result).toEqual(mockDocuments);
      expect(mockDocumentRepo.find).toHaveBeenCalled();
    });
  });
});
