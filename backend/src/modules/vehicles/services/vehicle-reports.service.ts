import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { MaintenanceRecord } from '../entities/maintenance-record.entity';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CostReport {
  period: string;
  maintenanceCosts: number;
  fuelCosts: number;
  totalCosts: number;
  costPerKm: number;
  costBreakdown: {
    routine: number;
    repair: number;
    inspection: number;
    emergency: number;
  };
}

interface PerformanceReport {
  period: string;
  totalDeliveries: number;
  totalDistance: number;
  fuelEfficiency: number;
  deliveryEfficiency: number;
  onTimeDeliveryRate: number;
  utilizationRate: number;
}

interface FleetReport {
  period: string;
  totalVehicles: number;
  activeVehicles: number;
  maintenanceRate: number;
  averageAge: number;
  costPerVehicle: number;
  topPerformers: Array<{
    vehicleId: string;
    registrationNumber: string;
    deliveries: number;
    efficiency: number;
  }>;
}

@Injectable()
export class VehicleReportsService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepository: Repository<MaintenanceRecord>,
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  async generateCostReport(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CostReport[]> {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const reports = [];

    for (const month of months) {
      const periodStart = startOfMonth(month);
      const periodEnd = endOfMonth(month);

      const maintenanceRecords = await this.maintenanceRepository.find({
        where: {
          vehicle: { id: vehicleId },
          date: Between(periodStart, periodEnd),
        },
      });

      const deliveries = await this.deliveryRepository.find({
        where: {
          vehicle: { id: vehicleId },
          completedAt: Between(periodStart, periodEnd),
        },
      });

      const totalDistance = deliveries.reduce(
        (sum, delivery) => sum + (delivery.route?.estimatedDistance || 0),
        0,
      );

      const costBreakdown = {
        routine: 0,
        repair: 0,
        inspection: 0,
        emergency: 0,
      };

      const maintenanceCosts = maintenanceRecords.reduce((sum, record) => {
        costBreakdown[record.type] += record.cost;
        return sum + record.cost;
      }, 0);

      // Estimation des coûts de carburant
      const fuelCosts = totalDistance * 0.15; // Exemple: 0.15€/km pour le carburant

      const totalCosts = maintenanceCosts + fuelCosts;
      const costPerKm = totalDistance > 0 ? totalCosts / totalDistance : 0;

      reports.push({
        period: format(month, 'MMMM yyyy', { locale: fr }),
        maintenanceCosts,
        fuelCosts,
        totalCosts,
        costPerKm,
        costBreakdown,
      });
    }

    return reports;
  }

  async generatePerformanceReport(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PerformanceReport[]> {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const reports = [];

    for (const month of months) {
      const periodStart = startOfMonth(month);
      const periodEnd = endOfMonth(month);

      const deliveries = await this.deliveryRepository.find({
        where: {
          vehicle: { id: vehicleId },
          completedAt: Between(periodStart, periodEnd),
        },
      });

      const totalDeliveries = deliveries.length;
      const totalDistance = deliveries.reduce(
        (sum, delivery) => sum + (delivery.route?.estimatedDistance || 0),
        0,
      );

      const onTimeDeliveries = deliveries.filter(delivery => {
        const completedAt = new Date(delivery.completedAt);
        const deadline = new Date(delivery.timeWindow.end);
        return completedAt <= deadline;
      }).length;

      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicleId },
      });

      const workingHours = this.calculateWorkingHours(deliveries);
      const possibleWorkingHours = this.calculatePossibleWorkingHours(periodStart, periodEnd);

      reports.push({
        period: format(month, 'MMMM yyyy', { locale: fr }),
        totalDeliveries,
        totalDistance,
        fuelEfficiency: totalDistance > 0 ? vehicle.fuelCapacity / totalDistance * 100 : 0,
        deliveryEfficiency: workingHours > 0 ? totalDeliveries / workingHours : 0,
        onTimeDeliveryRate: totalDeliveries > 0 ? onTimeDeliveries / totalDeliveries * 100 : 0,
        utilizationRate: (workingHours / possibleWorkingHours) * 100,
      });
    }

    return reports;
  }

  async generateFleetReport(startDate: Date, endDate: Date): Promise<FleetReport[]> {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const reports = [];

    for (const month of months) {
      const periodStart = startOfMonth(month);
      const periodEnd = endOfMonth(month);

      const vehicles = await this.vehicleRepository.find();
      const activeVehicles = vehicles.filter(v => v.isActive).length;

      const maintenanceRecords = await this.maintenanceRepository.find({
        where: {
          date: Between(periodStart, periodEnd),
        },
        relations: ['vehicle'],
      });

      const deliveries = await this.deliveryRepository.find({
        where: {
          completedAt: Between(periodStart, periodEnd),
        },
        relations: ['vehicle'],
      });

      const totalCosts = maintenanceRecords.reduce((sum, record) => sum + record.cost, 0);

      // Calculer les performances par véhicule
      const vehiclePerformance = new Map();
      for (const delivery of deliveries) {
        if (!delivery.vehicle) continue;
        if (!vehiclePerformance.has(delivery.vehicle.id)) {
          vehiclePerformance.set(delivery.vehicle.id, {
            vehicleId: delivery.vehicle.id,
            registrationNumber: delivery.vehicle.registrationNumber,
            deliveries: 0,
            distance: 0,
          });
        }
        const perf = vehiclePerformance.get(delivery.vehicle.id);
        perf.deliveries++;
        perf.distance += delivery.route?.estimatedDistance || 0;
      }

      // Calculer l'efficacité et trier
      const topPerformers = Array.from(vehiclePerformance.values())
        .map(perf => ({
          ...perf,
          efficiency: perf.distance > 0 ? perf.deliveries / perf.distance : 0,
        }))
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5);

      reports.push({
        period: format(month, 'MMMM yyyy', { locale: fr }),
        totalVehicles: vehicles.length,
        activeVehicles,
        maintenanceRate: (maintenanceRecords.length / activeVehicles) * 100,
        averageAge: this.calculateAverageAge(vehicles),
        costPerVehicle: totalCosts / activeVehicles,
        topPerformers,
      });
    }

    return reports;
  }

  private calculateWorkingHours(deliveries: Delivery[]): number {
    let totalHours = 0;
    deliveries.forEach(delivery => {
      const start = new Date(delivery.timeWindow.start);
      const end = new Date(delivery.completedAt);
      totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    });
    return totalHours;
  }

  private calculatePossibleWorkingHours(start: Date, end: Date): number {
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return days * 12; // Exemple: 12 heures de travail possible par jour
  }

  private calculateAverageAge(vehicles: Vehicle[]): number {
    const currentYear = new Date().getFullYear();
    return vehicles.reduce((sum, vehicle) => sum + (currentYear - vehicle.year), 0) / vehicles.length;
  }
}
