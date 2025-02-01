import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../entities/driver.entity';
import { DriverBonus } from '../entities/driver-bonus.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class DriverRewardService {
  private readonly REASSIGNMENT_BONUS = 15; // euros
  private readonly QUICK_ACCEPTANCE_BONUS = 5; // euros supplémentaires si accepté en moins de 2 minutes
  private readonly RATING_THRESHOLD = 4.5; // note minimale pour les bonus supplémentaires
  private readonly MONTHLY_BONUS_THRESHOLD = 50; // nombre de réaffectations pour bonus mensuel

  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(DriverBonus)
    private bonusRepository: Repository<DriverBonus>,
    private notificationsService: NotificationsService,
  ) {}

  async handleReassignmentAcceptance(
    driverId: string,
    orderId: string,
    acceptanceTime: Date,
    orderAssignmentTime: Date,
  ): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['bonuses', 'ratings'],
    });

    if (!driver) {
      throw new Error('Chauffeur non trouvé');
    }

    // Calculer le bonus de base
    let bonusAmount = this.REASSIGNMENT_BONUS;

    // Bonus supplémentaire pour acceptation rapide
    const acceptanceDelay = acceptanceTime.getTime() - orderAssignmentTime.getTime();
    if (acceptanceDelay <= 2 * 60 * 1000) { // 2 minutes
      bonusAmount += this.QUICK_ACCEPTANCE_BONUS;
    }

    // Bonus supplémentaire basé sur la note moyenne
    const averageRating = this.calculateAverageRating(driver);
    if (averageRating >= this.RATING_THRESHOLD) {
      bonusAmount *= 1.2; // 20% de bonus supplémentaire
    }

    // Créer et sauvegarder le bonus
    const bonus = this.bonusRepository.create({
      driver,
      amount: bonusAmount,
      type: 'REASSIGNMENT_ACCEPTANCE',
      orderId,
      description: 'Bonus pour acceptation de réaffectation',
      metadata: {
        acceptanceDelay,
        averageRating,
        baseBonus: this.REASSIGNMENT_BONUS,
        quickAcceptanceBonus: acceptanceDelay <= 2 * 60 * 1000 ? this.QUICK_ACCEPTANCE_BONUS : 0,
        ratingBonus: averageRating >= this.RATING_THRESHOLD ? bonusAmount * 0.2 : 0,
      },
    });

    await this.bonusRepository.save(bonus);

    // Mettre à jour le solde du chauffeur
    driver.balance += bonusAmount;
    await this.driverRepository.save(driver);

    // Vérifier et attribuer les bonus mensuels
    await this.checkMonthlyBonuses(driver);

    // Envoyer une notification
    await this.notificationsService.create(
      'BONUS_EARNED',
      'Bonus gagné !',
      `Vous avez reçu un bonus de ${bonusAmount}€ pour avoir accepté une réaffectation`,
      [driverId],
      {
        bonusAmount,
        bonusType: 'REASSIGNMENT_ACCEPTANCE',
        orderId,
      },
    );
  }

  private calculateAverageRating(driver: Driver): number {
    if (!driver.ratings || driver.ratings.length === 0) {
      return 0;
    }

    const sum = driver.ratings.reduce((acc, rating) => acc + rating.value, 0);
    return sum / driver.ratings.length;
  }

  private async checkMonthlyBonuses(driver: Driver): Promise<void> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Compter les réaffectations acceptées ce mois-ci
    const monthlyReassignments = await this.bonusRepository.count({
      where: {
        driver: { id: driver.id },
        type: 'REASSIGNMENT_ACCEPTANCE',
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    if (monthlyReassignments >= this.MONTHLY_BONUS_THRESHOLD) {
      // Vérifier si le bonus mensuel a déjà été attribué
      const existingMonthlyBonus = await this.bonusRepository.findOne({
        where: {
          driver: { id: driver.id },
          type: 'MONTHLY_REASSIGNMENT_ACHIEVEMENT',
          createdAt: Between(startOfMonth, endOfMonth),
        },
      });

      if (!existingMonthlyBonus) {
        // Attribuer le bonus mensuel
        const monthlyBonus = this.bonusRepository.create({
          driver,
          amount: 100, // Bonus mensuel fixe
          type: 'MONTHLY_REASSIGNMENT_ACHIEVEMENT',
          description: 'Bonus mensuel pour réaffectations',
          metadata: {
            monthlyReassignments,
            threshold: this.MONTHLY_BONUS_THRESHOLD,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        });

        await this.bonusRepository.save(monthlyBonus);

        // Mettre à jour le solde du chauffeur
        driver.balance += monthlyBonus.amount;
        await this.driverRepository.save(driver);

        // Envoyer une notification
        await this.notificationsService.create(
          'MONTHLY_BONUS_EARNED',
          'Bonus mensuel gagné !',
          `Félicitations ! Vous avez reçu un bonus mensuel de ${monthlyBonus.amount}€ pour avoir accepté plus de ${this.MONTHLY_BONUS_THRESHOLD} réaffectations ce mois-ci.`,
          [driver.id],
          {
            bonusAmount: monthlyBonus.amount,
            bonusType: 'MONTHLY_REASSIGNMENT_ACHIEVEMENT',
            monthlyReassignments,
          },
        );
      }
    }
  }
}
