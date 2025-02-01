import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LocationHistory } from './entities/location-history.entity';
import { Driver } from '../drivers/entities/driver.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class TrackingService {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(LocationHistory)
    private locationHistoryRepository: Repository<LocationHistory>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async updateDriverLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number,
    accuracy?: number,
    altitude?: number,
  ): Promise<LocationHistory> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    // Mettre à jour la position actuelle du chauffeur
    driver.currentLocation = { latitude, longitude };
    await this.driverRepository.save(driver);

    // Enregistrer dans l'historique
    const locationHistory = this.locationHistoryRepository.create({
      driver,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      altitude,
    });

    const savedLocation = await this.locationHistoryRepository.save(locationHistory);

    // Émettre la mise à jour de position via WebSocket
    this.server.emit(`driver-location-${driverId}`, {
      driverId,
      location: savedLocation,
    });

    return savedLocation;
  }

  async getDriverLocation(driverId: string): Promise<any> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    return driver.currentLocation;
  }

  async getDriverLocationHistory(
    driverId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LocationHistory[]> {
    return this.locationHistoryRepository.find({
      where: {
        driver: { id: driverId },
        timestamp: Between(startDate, endDate),
      },
      order: {
        timestamp: 'ASC',
      },
    });
  }

  async getActiveDriversLocations(): Promise<any[]> {
    const drivers = await this.driverRepository.find({
      where: {
        isActive: true,
        isAvailable: true,
      },
    });

    return drivers.map(driver => ({
      driverId: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      location: driver.currentLocation,
    }));
  }

  async calculateDriverStats(
    driverId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const locations = await this.getDriverLocationHistory(driverId, startDate, endDate);
    
    let totalDistance = 0;
    let maxSpeed = 0;
    let avgSpeed = 0;

    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];

      // Calculer la distance entre deux points
      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );

      totalDistance += distance;

      if (curr.speed > maxSpeed) {
        maxSpeed = curr.speed;
      }
      avgSpeed += curr.speed || 0;
    }

    avgSpeed = locations.length > 0 ? avgSpeed / locations.length : 0;

    return {
      totalDistance,
      maxSpeed,
      avgSpeed,
      trackPoints: locations.length,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
