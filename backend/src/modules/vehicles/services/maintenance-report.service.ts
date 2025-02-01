import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceReport, MaintenanceStatus } from '../entities/maintenance-report.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { MaintenanceSchedule } from '../entities/maintenance-schedule.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class MaintenanceReportService {
  constructor(
    @InjectRepository(MaintenanceReport)
    private reportRepository: Repository<MaintenanceReport>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceSchedule)
    private scheduleRepository: Repository<MaintenanceSchedule>,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: Partial<MaintenanceReport>): Promise<MaintenanceReport> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: data.vehicle.id },
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');
    if (!vehicle.isInternal) throw new Error('La maintenance ne peut être effectuée que sur les véhicules internes');

    const schedule = await this.scheduleRepository.findOne({
      where: { id: data.schedule.id },
    });
    if (!schedule) throw new NotFoundException('Planning de maintenance non trouvé');

    const report = this.reportRepository.create({
      ...data,
      vehicle,
      schedule,
      kilometersAtMaintenance: vehicle.currentKilometers,
    });

    const savedReport = await this.reportRepository.save(report);

    // Générer des notifications basées sur les résultats
    await this.generateReportNotifications(savedReport);

    return savedReport;
  }

  async findAll(filters?: any): Promise<MaintenanceReport[]> {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.vehicle', 'vehicle')
      .where('vehicle.isInternal = :isInternal', { isInternal: true });

    if (filters) {
      if (filters.vehicleId) {
        query.andWhere('vehicle.id = :vehicleId', { vehicleId: filters.vehicleId });
      }
      if (filters.status) {
        query.andWhere('report.status = :status', { status: filters.status });
      }
      if (filters.dateFrom) {
        query.andWhere('report.scheduledDate >= :dateFrom', { dateFrom: filters.dateFrom });
      }
      if (filters.dateTo) {
        query.andWhere('report.scheduledDate <= :dateTo', { dateTo: filters.dateTo });
      }
    }

    return query
      .orderBy('report.scheduledDate', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<MaintenanceReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['vehicle', 'schedule'],
    });
    if (!report) throw new NotFoundException('Rapport non trouvé');
    return report;
  }

  async update(id: string, data: Partial<MaintenanceReport>): Promise<MaintenanceReport> {
    const report = await this.findOne(id);
    const previousStatus = report.status;

    Object.assign(report, data);
    const updatedReport = await this.reportRepository.save(report);

    // Vérifier les changements de statut
    if (data.status && data.status !== previousStatus) {
      await this.handleStatusChange(updatedReport, previousStatus);
    }

    // Vérifier les anomalies
    if (data.anomalies) {
      await this.checkAnomalies(updatedReport);
    }

    return updatedReport;
  }

  async generateReport(vehicleId: string, scheduleId: string): Promise<any> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['type'],
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    const reports = await this.reportRepository.find({
      where: { vehicle: { id: vehicleId } },
      order: { completedDate: 'DESC' },
    });

    return {
      vehicle: {
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        type: vehicle.type.name,
        currentKilometers: vehicle.currentKilometers,
      },
      maintenanceHistory: reports.map(report => ({
        date: report.completedDate,
        type: report.maintenanceType,
        kilometers: report.kilometersAtMaintenance,
        costs: report.costs,
        anomalies: report.anomalies,
      })),
      statistics: this.calculateStatistics(reports),
      recommendations: this.generateRecommendations(reports, vehicle),
    };
  }

  private calculateStatistics(reports: MaintenanceReport[]): any {
    const completedReports = reports.filter(r => r.status === MaintenanceStatus.COMPLETED);
    
    return {
      totalMaintenances: completedReports.length,
      totalCost: completedReports.reduce((sum, r) => sum + r.costs.total, 0),
      averageCost: completedReports.length > 0
        ? completedReports.reduce((sum, r) => sum + r.costs.total, 0) / completedReports.length
        : 0,
      mostCommonIssues: this.analyzeMostCommonIssues(completedReports),
      maintenanceFrequency: this.calculateMaintenanceFrequency(completedReports),
    };
  }

  private analyzeMostCommonIssues(reports: MaintenanceReport[]): any[] {
    const issues = reports
      .flatMap(r => r.anomalies || [])
      .reduce((acc, anomaly) => {
        const key = anomaly.description;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(issues)
      .map(([description, count]) => ({ description, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateMaintenanceFrequency(reports: MaintenanceReport[]): any {
    if (reports.length < 2) return null;

    const intervals = reports
      .slice(1)
      .map((report, index) => {
        const previousReport = reports[index];
        return {
          days: Math.floor((previousReport.completedDate.getTime() - report.completedDate.getTime()) 
            / (1000 * 60 * 60 * 24)),
          kilometers: previousReport.kilometersAtMaintenance - report.kilometersAtMaintenance,
        };
      });

    return {
      averageDays: Math.floor(intervals.reduce((sum, i) => sum + i.days, 0) / intervals.length),
      averageKilometers: Math.floor(intervals.reduce((sum, i) => sum + i.kilometers, 0) / intervals.length),
    };
  }

  private generateRecommendations(reports: MaintenanceReport[], vehicle: Vehicle): string[] {
    const recommendations: string[] = [];
    const recentReports = reports.slice(0, 5);

    // Analyse des coûts
    const averageCost = recentReports.reduce((sum, r) => sum + r.costs.total, 0) / recentReports.length;
    if (averageCost > vehicle.type.specifications.estimatedCosts.total * 1.2) {
      recommendations.push('Les coûts de maintenance sont supérieurs à la moyenne. Une révision du programme d\'entretien est recommandée.');
    }

    // Analyse des anomalies récurrentes
    const recurringIssues = this.analyzeMostCommonIssues(recentReports);
    if (recurringIssues.some(issue => issue.count >= 3)) {
      recommendations.push('Des problèmes récurrents ont été détectés. Une inspection approfondie est recommandée.');
    }

    // Analyse de la fréquence
    const frequency = this.calculateMaintenanceFrequency(recentReports);
    if (frequency && frequency.averageDays < vehicle.type.specifications.maintenanceFrequency * 0.8) {
      recommendations.push('La fréquence des maintenances est plus élevée que prévue. Une révision du véhicule est recommandée.');
    }

    return recommendations;
  }

  private async handleStatusChange(report: MaintenanceReport, previousStatus: MaintenanceStatus): Promise<void> {
    if (report.status === MaintenanceStatus.COMPLETED) {
      // Mettre à jour les informations du véhicule
      await this.vehicleRepository.update(report.vehicle.id, {
        lastMaintenanceDate: report.completedDate,
        nextMaintenanceDate: report.nextMaintenance?.recommendedDate,
      });

      // Notifier de la completion
      await this.notificationsService.create(
        'MAINTENANCE_COMPLETED',
        `Maintenance terminée - ${report.vehicle.registrationNumber}`,
        `La maintenance ${report.maintenanceType} a été complétée avec succès.`,
        ['fleet_manager', 'maintenance_manager'],
        { reportId: report.id },
      );
    }
  }

  private async checkAnomalies(report: MaintenanceReport): Promise<void> {
    const criticalAnomalies = report.anomalies?.filter(a => a.severity === 'CRITICAL');
    if (criticalAnomalies?.length > 0) {
      await this.notificationsService.create(
        'CRITICAL_ANOMALY',
        `Anomalies critiques détectées - ${report.vehicle.registrationNumber}`,
        `${criticalAnomalies.length} anomalies critiques nécessitent une attention immédiate.`,
        ['maintenance_manager', 'safety_officer'],
        { reportId: report.id, anomalies: criticalAnomalies },
      );
    }
  }
}
