import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface DeliveryStats {
  total: number;
  completed: number;
  cancelled: number;
  onTime: number;
  delayed: number;
  averageTime: number;
  totalDistance: number;
  totalEarnings: number;
}

interface TimeRangeStats {
  daily: DeliveryStats;
  weekly: DeliveryStats;
  monthly: DeliveryStats;
  total: DeliveryStats;
}

@Injectable()
export class DeliveryStatisticsService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async getDriverStats(driverId: string): Promise<TimeRangeStats> {
    const now = new Date();

    return {
      daily: await this.getStatsForTimeRange(
        driverId,
        startOfDay(now),
        endOfDay(now),
      ),
      weekly: await this.getStatsForTimeRange(
        driverId,
        startOfWeek(now),
        endOfWeek(now),
      ),
      monthly: await this.getStatsForTimeRange(
        driverId,
        startOfMonth(now),
        endOfMonth(now),
      ),
      total: await this.getStatsForTimeRange(driverId),
    };
  }

  private async getStatsForTimeRange(
    driverId: string,
    start?: Date,
    end?: Date,
  ): Promise<DeliveryStats> {
    const query = this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('delivery.driverId = :driverId', { driverId });

    if (start && end) {
      query.andWhere('delivery.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    const deliveries = await query.getMany();

    const completed = deliveries.filter(d => d.status === 'completed');
    const cancelled = deliveries.filter(d => d.status === 'cancelled');

    const onTime = completed.filter(delivery => {
      if (!delivery.timeWindow) return true;
      return new Date(delivery.completedAt) <= new Date(delivery.timeWindow.end);
    });

    const completionTimes = completed.map(delivery =>
      delivery.completedAt
        ? new Date(delivery.completedAt).getTime() -
          new Date(delivery.acceptedAt).getTime()
        : 0,
    );

    const averageTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    const totalDistance = completed.reduce(
      (sum, delivery) => sum + (delivery.route?.estimatedDistance || 0),
      0,
    );

    const totalEarnings = completed.reduce(
      (sum, delivery) => sum + delivery.price,
      0,
    );

    return {
      total: deliveries.length,
      completed: completed.length,
      cancelled: cancelled.length,
      onTime: onTime.length,
      delayed: completed.length - onTime.length,
      averageTime,
      totalDistance,
      totalEarnings,
    };
  }

  async getPerformanceMetrics(driverId: string) {
    const stats = await this.getDriverStats(driverId);
    const monthly = stats.monthly;

    return {
      completionRate: (monthly.completed / monthly.total) * 100,
      onTimeRate: (monthly.onTime / monthly.completed) * 100,
      cancellationRate: (monthly.cancelled / monthly.total) * 100,
      averageDeliveryTime: monthly.averageTime / (1000 * 60), // Convert to minutes
      averageEarningsPerDelivery: monthly.totalEarnings / monthly.completed,
      averageDistancePerDelivery: monthly.totalDistance / monthly.completed,
    };
  }

  async getDriverRanking(driverId: string) {
    const allDrivers = await this.driverRepository.find();
    const rankings = await Promise.all(
      allDrivers.map(async driver => {
        const stats = await this.getPerformanceMetrics(driver.id);
        return {
          driverId: driver.id,
          score:
            stats.completionRate * 0.3 +
            stats.onTimeRate * 0.3 +
            (1 - stats.cancellationRate) * 0.2 +
            (stats.averageEarningsPerDelivery / 100) * 0.2,
        };
      }),
    );

    rankings.sort((a, b) => b.score - a.score);
    const rank = rankings.findIndex(r => r.driverId === driverId) + 1;
    const totalDrivers = rankings.length;

    return {
      rank,
      totalDrivers,
      percentile: ((totalDrivers - rank + 1) / totalDrivers) * 100,
    };
  }

  async getHourlyStats(driverId: string) {
    const deliveries = await this.deliveryRepository.find({
      where: {
        driverId,
        status: 'completed',
      },
    });

    const hourlyStats = Array(24).fill(0).map(() => ({
      deliveries: 0,
      earnings: 0,
    }));

    deliveries.forEach(delivery => {
      const hour = new Date(delivery.completedAt).getHours();
      hourlyStats[hour].deliveries++;
      hourlyStats[hour].earnings += delivery.price;
    });

    return hourlyStats;
  }

  async getWeeklyStats(driverId: string) {
    const deliveries = await this.deliveryRepository.find({
      where: {
        driverId,
        status: 'completed',
      },
    });

    const weeklyStats = Array(7).fill(0).map(() => ({
      deliveries: 0,
      earnings: 0,
    }));

    deliveries.forEach(delivery => {
      const day = new Date(delivery.completedAt).getDay();
      weeklyStats[day].deliveries++;
      weeklyStats[day].earnings += delivery.price;
    });

    return weeklyStats;
  }

  async getAreaStats(driverId: string) {
    const deliveries = await this.deliveryRepository.find({
      where: {
        driverId,
        status: 'completed',
      },
    });

    const areaStats = new Map();

    deliveries.forEach(delivery => {
      const area = this.getAreaFromLocation(delivery.deliveryLocation);
      if (!areaStats.has(area)) {
        areaStats.set(area, {
          deliveries: 0,
          earnings: 0,
          averageTime: 0,
          totalTime: 0,
        });
      }

      const stats = areaStats.get(area);
      stats.deliveries++;
      stats.earnings += delivery.price;
      
      const deliveryTime = new Date(delivery.completedAt).getTime() -
        new Date(delivery.acceptedAt).getTime();
      stats.totalTime += deliveryTime;
      stats.averageTime = stats.totalTime / stats.deliveries;
    });

    return Array.from(areaStats.entries()).map(([area, stats]) => ({
      area,
      ...stats,
      averageTime: stats.averageTime / (1000 * 60), // Convert to minutes
    }));
  }

  private getAreaFromLocation(location: any) {
    // Implémentation simplifiée - à adapter selon vos besoins
    const { latitude, longitude } = location;
    // Diviser la ville en zones selon les coordonnées
    const lat = Math.floor(latitude * 10) / 10;
    const lng = Math.floor(longitude * 10) / 10;
    return `Zone ${lat},${lng}`;
  }
}
