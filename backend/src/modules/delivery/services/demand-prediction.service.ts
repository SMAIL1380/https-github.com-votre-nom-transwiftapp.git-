import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { DeliveryZone } from '../entities/delivery-zone.entity';
import * as tf from '@tensorflow/tfjs-node';

interface PredictionFactors {
  historicalDemand: number[];
  timeOfDay: number;
  dayOfWeek: number;
  weather: {
    temperature: number;
    precipitation: number;
    weatherCode: string;
  };
  events: {
    name: string;
    impact: number;
  }[];
  seasonality: number;
}

@Injectable()
export class DemandPredictionService {
  private model: tf.LayersModel;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(DeliveryZone)
    private zoneRepository: Repository<DeliveryZone>,
  ) {
    this.initializeModel();
  }

  private async initializeModel() {
    // Créer un modèle de réseau neuronal simple pour la prédiction
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });
  }

  async predictDemand(
    zoneId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<{
    predictedOrders: number;
    confidence: number;
    factors: PredictionFactors;
  }> {
    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId },
    });

    // Récupérer les facteurs de prédiction
    const factors = await this.getPredictionFactors(zone, startTime);

    // Préparer les données pour le modèle
    const inputTensor = this.prepareInputData(factors);

    // Faire la prédiction
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const predictedValue = (await prediction.data())[0];

    // Calculer l'intervalle de confiance
    const confidence = this.calculateConfidence(predictedValue, factors);

    return {
      predictedOrders: Math.round(predictedValue),
      confidence,
      factors,
    };
  }

  private async getPredictionFactors(
    zone: DeliveryZone,
    targetTime: Date,
  ): Promise<PredictionFactors> {
    // Récupérer l'historique des commandes
    const historicalDemand = await this.getHistoricalDemand(zone.id, targetTime);

    // Récupérer les données météo (à implémenter avec une API météo)
    const weather = await this.getWeatherForecast(zone, targetTime);

    // Récupérer les événements locaux
    const events = await this.getLocalEvents(zone, targetTime);

    return {
      historicalDemand,
      timeOfDay: targetTime.getHours(),
      dayOfWeek: targetTime.getDay(),
      weather,
      events,
      seasonality: this.calculateSeasonality(targetTime),
    };
  }

  private async getHistoricalDemand(
    zoneId: string,
    targetTime: Date,
  ): Promise<number[]> {
    // Récupérer les 4 dernières semaines de données
    const startDate = new Date(targetTime);
    startDate.setDate(startDate.getDate() - 28);

    const orders = await this.orderRepository.find({
      where: {
        deliveryZone: { id: zoneId },
        createdAt: Between(startDate, targetTime),
      },
    });

    // Agréger par jour
    const dailyDemand = new Array(28).fill(0);
    orders.forEach((order) => {
      const dayIndex = Math.floor(
        (order.createdAt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayIndex >= 0 && dayIndex < 28) {
        dailyDemand[dayIndex]++;
      }
    });

    return dailyDemand;
  }

  private async getWeatherForecast(
    zone: DeliveryZone,
    targetTime: Date,
  ): Promise<PredictionFactors['weather']> {
    // Implémenter l'appel à l'API météo
    return {
      temperature: 20,
      precipitation: 0,
      weatherCode: 'CLEAR',
    };
  }

  private async getLocalEvents(
    zone: DeliveryZone,
    targetTime: Date,
  ): Promise<PredictionFactors['events']> {
    // Implémenter la récupération des événements locaux
    return [];
  }

  private calculateSeasonality(date: Date): number {
    const dayOfYear = this.getDayOfYear(date);
    // Calculer un facteur saisonnier entre 0 et 1
    return Math.sin((2 * Math.PI * dayOfYear) / 365) * 0.5 + 0.5;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private prepareInputData(factors: PredictionFactors): tf.Tensor {
    // Normaliser et préparer les données pour le modèle
    const input = [
      factors.timeOfDay / 24,
      factors.dayOfWeek / 7,
      factors.weather.temperature / 40,
      factors.weather.precipitation / 100,
      factors.seasonality,
      ...this.normalizeArray(factors.historicalDemand.slice(-5)), // Derniers 5 jours
    ];

    return tf.tensor2d([input], [1, input.length]);
  }

  private normalizeArray(arr: number[]): number[] {
    const max = Math.max(...arr);
    return max > 0 ? arr.map((v) => v / max) : arr;
  }

  private calculateConfidence(
    prediction: number,
    factors: PredictionFactors,
  ): number {
    // Calculer un score de confiance basé sur la qualité des données
    let confidence = 1.0;

    // Réduire la confiance si les données historiques sont volatiles
    const historicalVariance = this.calculateVariance(factors.historicalDemand);
    confidence *= 1 - Math.min(historicalVariance / 100, 0.5);

    // Réduire la confiance pour les prédictions éloignées
    if (prediction > 2 * Math.max(...factors.historicalDemand)) {
      confidence *= 0.7;
    }

    // Réduire la confiance si des événements inhabituels sont prévus
    if (factors.events.length > 0) {
      confidence *= 0.9;
    }

    return Math.max(0.1, Math.min(1, confidence));
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / numbers.length);
  }
}
