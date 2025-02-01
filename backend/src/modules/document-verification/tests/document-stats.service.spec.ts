import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentStatsService } from '../services/document-stats.service';
import { DocumentVerification, DocumentType, VerificationStatus } from '../entities/document-verification.entity';

describe('DocumentStatsService', () => {
  let service: DocumentStatsService;
  let documentRepo: Repository<DocumentVerification>;

  const mockDocumentRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentStatsService,
        {
          provide: getRepositoryToken(DocumentVerification),
          useValue: mockDocumentRepo,
        },
      ],
    }).compile();

    service = module.get<DocumentStatsService>(DocumentStatsService);
    documentRepo = module.get<Repository<DocumentVerification>>(
      getRepositoryToken(DocumentVerification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVerificationStats', () => {
    it('should return verification statistics', async () => {
      const mockDocuments = [
        {
          status: VerificationStatus.VERIFIED,
          documentType: DocumentType.KBIS,
          isAutoVerified: true,
          createdAt: new Date(),
          expiryDate: new Date(),
          verificationDetails: {
            verificationDate: new Date(),
          },
        },
      ];

      mockDocumentRepo.find.mockResolvedValue(mockDocuments);

      const result = await service.getVerificationStats(
        new Date(),
        new Date(),
      );

      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.byStatus[VerificationStatus.VERIFIED]).toBe(1);
      expect(result.byType[DocumentType.KBIS]).toBe(1);
      expect(result.autoVerificationTotal).toBe(1);
    });
  });

  describe('getDriverComplianceStats', () => {
    it('should return driver compliance statistics', async () => {
      const mockStats = [
        {
          driver_id: '1',
          driver_firstName: 'John',
          driver_lastName: 'Doe',
          driver_driverType: 'EXTERNAL',
          totalDocuments: '5',
          verifiedDocuments: '4',
          expiredDocuments: '1',
        },
      ];

      mockDocumentRepo.createQueryBuilder().getRawMany.mockResolvedValue(mockStats);

      const result = await service.getDriverComplianceStats();

      expect(result).toBeDefined();
      expect(result[0].complianceRate).toBe(80);
      expect(result[0].totalDocuments).toBe(5);
      expect(result[0].verifiedDocuments).toBe(4);
    });
  });

  describe('getVerificationTrends', () => {
    it('should return verification trends', async () => {
      const mockTrends = [
        {
          date: '2025-01-05',
          total: '10',
          verified: '8',
          rejected: '2',
          autoVerified: '5',
        },
      ];

      mockDocumentRepo.createQueryBuilder().getRawMany.mockResolvedValue(mockTrends);

      const result = await service.getVerificationTrends(30);

      expect(result).toBeDefined();
      expect(result[0].verificationRate).toBe(80);
      expect(result[0].total).toBe(10);
      expect(result[0].verified).toBe(8);
    });
  });

  describe('getDocumentExpirationForecast', () => {
    it('should return document expiration forecast', async () => {
      const mockExpirations = [
        {
          month: '2025-01',
          total: '3',
          documentType: DocumentType.KBIS,
        },
      ];

      mockDocumentRepo.createQueryBuilder().getRawMany.mockResolvedValue(mockExpirations);

      const result = await service.getDocumentExpirationForecast(12);

      expect(result).toBeDefined();
      expect(result.length).toBe(Object.values(DocumentType).length);
      const kbisStats = result.find(r => r.documentType === DocumentType.KBIS);
      expect(kbisStats.expirations[0].total).toBe(3);
    });
  });
});
