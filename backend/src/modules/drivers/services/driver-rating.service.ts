import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Driver } from '../entities/driver.entity';
import { DriverRating } from '../entities/driver-rating.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class DriverRatingService {
  private readonly RATING_WEIGHT_RECENT = 0.6;
  private readonly RATING_WEIGHT_HISTORIC = 0.4;
  private readonly CANCELLATION_PENALTY = -0.5;
  private readonly REASSIGNMENT_BONUS = 0.3;

  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(DriverRating)
    private ratingRepository: Repository<DriverRating>,
    private notificationsService: NotificationsService,
  ) {}

  async updateDriverScore(driverId: string): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['ratings', 'penalties'],
    });

    if (!driver) {
      throw new Error('Chauffeur non trouvé');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculer la note moyenne récente (30 derniers jours)
    const recentRatings = driver.ratings.filter(
      (r) => new Date(r.createdAt) >= thirtyDaysAgo,
    );
    const recentScore = this.calculateAverageRating(recentRatings);

    // Calculer la note moyenne historique
    const historicRatings = driver.ratings.filter(
      (r) => new Date(r.createdAt) < thirtyDaysAgo,
    );
    const historicScore = this.calculateAverageRating(historicRatings);

    // Calculer l'impact des annulations récentes
    const recentCancellations = driver.penalties.filter(
      (p) =>
        p.type === 'CANCELLATION' && new Date(p.createdAt) >= thirtyDaysAgo,
    );
    const cancellationImpact =
      recentCancellations.length * this.CANCELLATION_PENALTY;

    // Calculer l'impact des réaffectations acceptées
    const recentReassignments = await this.countRecentReassignments(
      driver.id,
      thirtyDaysAgo,
    );
    const reassignmentImpact = recentReassignments * this.REASSIGNMENT_BONUS;

    // Calculer le score final
    let finalScore =
      recentScore * this.RATING_WEIGHT_RECENT +
      historicScore * this.RATING_WEIGHT_HISTORIC +
      cancellationImpact +
      reassignmentImpact;

    // Limiter le score entre 0 et 5
    finalScore = Math.max(0, Math.min(5, finalScore));

    // Mettre à jour le score du chauffeur
    driver.rating = finalScore;
    await this.driverRepository.save(driver);

    // Envoyer une notification si le score change significativement
    const scoreDifference = Math.abs(finalScore - driver.rating);
    if (scoreDifference >= 0.5) {
      await this.notifyScoreChange(driver.id, finalScore, driver.rating);
    }

    // Vérifier les seuils de performance
    await this.checkPerformanceThresholds(driver.id, finalScore);
  }

  private calculateAverageRating(ratings: DriverRating[]): number {
    if (!ratings || ratings.length === 0) {
      return 0;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return sum / ratings.length;
  }

  private async countRecentReassignments(
    driverId: string,
    since: Date,
  ): Promise<number> {
    // Compter les réaffectations acceptées
    const count = await this.driverRepository
      .createQueryBuilder('driver')
      .leftJoin('driver.orders', 'order')
      .where('driver.id = :driverId', { driverId })
      .andWhere('order.reassignedAt >= :since', { since })
      .andWhere('order.status != :status', { status: 'CANCELLED' })
      .getCount();

    return count;
  }

  private async notifyScoreChange(
    driverId: string,
    newScore: number,
    oldScore: number,
  ): Promise<void> {
    const change = newScore > oldScore ? 'augmenté' : 'diminué';
    const difference = Math.abs(newScore - oldScore).toFixed(1);

    await this.notificationsService.create(
      'SCORE_CHANGE',
      'Évolution de votre note',
      `Votre note a ${change} de ${difference} points. Nouvelle note : ${newScore.toFixed(
        1,
      )}/5`,
      [driverId],
      {
        oldScore,
        newScore,
        difference,
        change,
      },
    );
  }

  private async checkPerformanceThresholds(
    driverId: string,
    score: number,
  ): Promise<void> {
    // Seuils de performance
    if (score < 3.0) {
      await this.notificationsService.create(
        'PERFORMANCE_WARNING',
        'Avertissement de performance',
        'Votre note est descendue en dessous de 3.0. Veuillez améliorer vos performances pour éviter une suspension.',
        [driverId],
        {
          score,
          threshold: 3.0,
          type: 'WARNING',
        },
      );
    } else if (score >= 4.8) {
      await this.notificationsService.create(
        'PERFORMANCE_EXCELLENCE',
        'Excellence de performance',
        'Félicitations ! Votre note exceptionnelle vous qualifie pour des avantages premium.',
        [driverId],
        {
          score,
          threshold: 4.8,
          type: 'EXCELLENCE',
        },
      );
    }
  }

  async addRating(
    driverId: string,
    rating: number,
    orderId: string,
    comment?: string,
  ): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error('Chauffeur non trouvé');
    }

    // Créer la nouvelle note
    const newRating = this.ratingRepository.create({
      driver,
      value: rating,
      orderId,
      comment,
    });

    await this.ratingRepository.save(newRating);

    // Mettre à jour le score global
    await this.updateDriverScore(driverId);
  }
}
