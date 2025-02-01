import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { PerformanceMetric, MetricType, MetricPeriod } from '../entities/performance-metric.entity';
import { Driver } from '../entities/driver.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceMetric)
    private performanceRepository: Repository<PerformanceMetric>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private notificationsService: NotificationsService,
  ) {}

  async createMetric(driverId: string, data: Partial<PerformanceMetric>): Promise<PerformanceMetric> {
    const driver = await this.driverRepository.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new Error('Chauffeur non trouvé');
    }

    const metric = this.performanceRepository.create({
      ...data,
      driver,
    });

    const savedMetric = await this.performanceRepository.save(metric);

    // Vérifier les seuils et envoyer des notifications si nécessaire
    await this.checkPerformanceThresholds(savedMetric);

    return savedMetric;
  }

  async getDriverMetrics(
    driverId: string,
    period: MetricPeriod,
    startDate: Date,
    endDate: Date,
  ): Promise<PerformanceMetric[]> {
    return this.performanceRepository.find({
      where: {
        driver: { id: driverId },
        period,
        startDate: Between(startDate, endDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  async calculateOverallScore(driverId: string): Promise<number> {
    const metrics = await this.performanceRepository.find({
      where: {
        driver: { id: driverId },
        endDate: LessThan(new Date()),
      },
    });

    if (!metrics.length) return 0;

    const weights = {
      [MetricType.CUSTOMER_RATING]: 0.3,
      [MetricType.COMPLETION_RATE]: 0.2,
      [MetricType.PUNCTUALITY]: 0.2,
      [MetricType.PROFESSIONALISM]: 0.1,
      [MetricType.VEHICLE_CONDITION]: 0.1,
      [MetricType.SAFETY_SCORE]: 0.1,
    };

    let totalScore = 0;
    let totalWeight = 0;

    metrics.forEach(metric => {
      const weight = weights[metric.metricType] || 0;
      totalScore += (metric.value * weight);
      totalWeight += weight;
    });

    return totalWeight > 0 ? (totalScore / totalWeight) : 0;
  }

  async generatePerformanceReport(driverId: string): Promise<any> {
    const driver = await this.driverRepository.findOne({ where: { id: driverId } });
    const metrics = await this.getDriverMetrics(
      driverId,
      MetricPeriod.MONTHLY,
      new Date(new Date().setMonth(new Date().getMonth() - 12)),
      new Date(),
    );

    const overallScore = await this.calculateOverallScore(driverId);

    return {
      driver: {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        type: driver.driverType,
      },
      overallScore,
      metrics: this.aggregateMetrics(metrics),
      trends: this.calculateTrends(metrics),
      recommendations: this.generateRecommendations(metrics, overallScore),
    };
  }

  private aggregateMetrics(metrics: PerformanceMetric[]): any {
    const aggregated = {};
    Object.values(MetricType).forEach(type => {
      const typeMetrics = metrics.filter(m => m.metricType === type);
      if (typeMetrics.length > 0) {
        const values = typeMetrics.map(m => m.value);
        aggregated[type] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });
    return aggregated;
  }

  private calculateTrends(metrics: PerformanceMetric[]): any {
    const trends = {};
    Object.values(MetricType).forEach(type => {
      const typeMetrics = metrics
        .filter(m => m.metricType === type)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      if (typeMetrics.length >= 2) {
        const firstValue = typeMetrics[0].value;
        const lastValue = typeMetrics[typeMetrics.length - 1].value;
        trends[type] = {
          change: ((lastValue - firstValue) / firstValue) * 100,
          trend: lastValue > firstValue ? 'up' : 'down',
        };
      }
    });
    return trends;
  }

  private generateRecommendations(metrics: PerformanceMetric[], overallScore: number): string[] {
    const recommendations = [];

    // Recommandations basées sur le score global
    if (overallScore < 3) {
      recommendations.push('Formation complémentaire recommandée');
    }

    // Analyse par type de métrique
    metrics.forEach(metric => {
      if (metric.value < metric.target) {
        switch (metric.metricType) {
          case MetricType.CUSTOMER_RATING:
            recommendations.push('Améliorer la qualité du service client');
            break;
          case MetricType.PUNCTUALITY:
            recommendations.push('Optimiser la gestion du temps et des itinéraires');
            break;
          case MetricType.SAFETY_SCORE:
            recommendations.push('Suivre une formation de sécurité routière');
            break;
        }
      }
    });

    return [...new Set(recommendations)]; // Supprimer les doublons
  }

  private async checkPerformanceThresholds(metric: PerformanceMetric): Promise<void> {
    const thresholds = {
      [MetricType.CUSTOMER_RATING]: 3.5,
      [MetricType.COMPLETION_RATE]: 0.85,
      [MetricType.PUNCTUALITY]: 0.9,
      [MetricType.SAFETY_SCORE]: 4.0,
    };

    const threshold = thresholds[metric.metricType];
    if (threshold && metric.value < threshold) {
      await this.notificationsService.create(
        'PERFORMANCE_ALERT',
        'Alerte Performance',
        `Performance en dessous du seuil pour ${metric.metricType}`,
        metric.driver.id,
        {
          metricType: metric.metricType,
          value: metric.value,
          threshold,
          period: metric.period,
        },
      );
    }
  }
}
