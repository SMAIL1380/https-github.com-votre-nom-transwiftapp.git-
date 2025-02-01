import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver } from './entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DriverDocument } from './entities/driver-document.entity';
import { DriverReview } from './entities/driver-review.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { CreateDriverDocumentDto } from './dto/create-driver-document.dto';
import { CreateDriverReviewDto } from './dto/create-driver-review.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(DriverDocument)
    private documentRepository: Repository<DriverDocument>,
    @InjectRepository(DriverReview)
    private reviewRepository: Repository<DriverReview>,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const existingDriver = await this.driverRepository.findOne({
      where: { email: createDriverDto.email },
    });

    if (existingDriver) {
      throw new BadRequestException('Un chauffeur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(createDriverDto.password, 10);
    
    const driver = this.driverRepository.create({
      ...createDriverDto,
      password: hashedPassword,
      currentLocation: createDriverDto.latitude && createDriverDto.longitude
        ? { latitude: createDriverDto.latitude, longitude: createDriverDto.longitude }
        : null,
    });

    return this.driverRepository.save(driver);
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({
      relations: ['vehicle', 'documents', 'reviews'],
    });
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['vehicle', 'documents', 'reviews'],
    });

    if (!driver) {
      throw new NotFoundException('Chauffeur non trouvé');
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);

    if (updateDriverDto.password) {
      updateDriverDto.password = await bcrypt.hash(updateDriverDto.password, 10);
    }

    if (updateDriverDto.latitude && updateDriverDto.longitude) {
      driver.currentLocation = {
        latitude: updateDriverDto.latitude,
        longitude: updateDriverDto.longitude,
      };
    }

    Object.assign(driver, updateDriverDto);
    return this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<void> {
    const driver = await this.findOne(id);
    await this.driverRepository.remove(driver);
  }

  // Documents
  async addDocument(createDocumentDto: CreateDriverDocumentDto): Promise<DriverDocument> {
    const driver = await this.findOne(createDocumentDto.driverId);
    const document = this.documentRepository.create({
      ...createDocumentDto,
      driver,
    });
    return this.documentRepository.save(document);
  }

  // Reviews
  async addReview(createReviewDto: CreateDriverReviewDto): Promise<DriverReview> {
    const driver = await this.findOne(createReviewDto.driverId);
    const review = this.reviewRepository.create({
      ...createReviewDto,
      driver,
    });
    
    const savedReview = await this.reviewRepository.save(review);

    // Mettre à jour la note moyenne du chauffeur
    const reviews = await this.reviewRepository.find({
      where: { driver: { id: driver.id } },
    });

    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    await this.driverRepository.update(driver.id, { rating: averageRating });

    return savedReview;
  }

  // Recherche de chauffeurs disponibles
  async findAvailableDrivers(latitude: number, longitude: number, radius: number = 10): Promise<Driver[]> {
    // Conversion du rayon en degrés (approximation simple)
    const degreesRadius = radius / 111.32;

    return this.driverRepository.find({
      where: {
        isAvailable: true,
        isActive: true,
        currentLocation: {
          latitude: Between(latitude - degreesRadius, latitude + degreesRadius),
          longitude: Between(longitude - degreesRadius, longitude + degreesRadius),
        },
      },
      relations: ['vehicle'],
    });
  }

  // Statistiques du chauffeur
  async getDriverStats(id: string): Promise<any> {
    const driver = await this.findOne(id);
    const reviews = await this.reviewRepository.find({
      where: { driver: { id } },
    });

    const totalReviews = reviews.length;
    const averageRating = driver.rating;
    const reviewsByRating = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    return {
      totalDeliveries: driver.totalDeliveries,
      totalReviews,
      averageRating,
      reviewsByRating,
    };
  }

  // Vérification des documents expirés
  async checkExpiredDocuments(): Promise<DriverDocument[]> {
    const today = new Date();
    return this.documentRepository.find({
      where: {
        expiryDate: LessThan(today),
      },
      relations: ['driver'],
    });
  }

  // Documents à expirer bientôt
  async checkDocumentsExpiringInDays(days: number = 30): Promise<DriverDocument[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return this.documentRepository.find({
      where: {
        expiryDate: Between(today, futureDate),
      },
      relations: ['driver'],
    });
  }
}
