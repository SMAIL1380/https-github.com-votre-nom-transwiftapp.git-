import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async verifyUrssaf(siret: string, metadata?: any): Promise<any> {
    const apiKey = this.configService.get('URSSAF_API_KEY');
    const apiUrl = this.configService.get('URSSAF_API_URL');

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}/verify`, {
          siret,
          ...metadata,
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }),
      );

      return {
        isValid: response.data.isValid,
        reason: response.data.reason,
        details: response.data,
      };
    } catch (error) {
      console.error('URSSAF verification failed:', error);
      throw new Error('Échec de la vérification URSSAF');
    }
  }

  async verifyVat(vatNumber: string): Promise<any> {
    const apiKey = this.configService.get('VAT_API_KEY');
    const apiUrl = this.configService.get('VAT_API_URL');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/check/${vatNumber}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }),
      );

      return {
        isValid: response.data.valid,
        reason: response.data.reason,
        details: response.data,
      };
    } catch (error) {
      console.error('VAT verification failed:', error);
      throw new Error('Échec de la vérification TVA');
    }
  }

  async verifyKbis(kbisNumber: string): Promise<any> {
    const apiKey = this.configService.get('INFOGREFFE_API_KEY');
    const apiUrl = this.configService.get('INFOGREFFE_API_URL');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/companies/${kbisNumber}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }),
      );

      return {
        isValid: response.data.status === 'ACTIVE',
        reason: response.data.status !== 'ACTIVE' ? 'Entreprise non active' : null,
        details: response.data,
      };
    } catch (error) {
      console.error('KBIS verification failed:', error);
      throw new Error('Échec de la vérification KBIS');
    }
  }

  // Webhook pour les notifications aux systèmes externes
  async notifyExternalSystems(event: string, data: any): Promise<void> {
    const webhookUrls = this.configService.get('WEBHOOK_URLS') as string[];
    
    if (!webhookUrls || webhookUrls.length === 0) {
      return;
    }

    const notifications = webhookUrls.map(url =>
      firstValueFrom(
        this.httpService.post(url, {
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      ),
    );

    try {
      await Promise.all(notifications);
    } catch (error) {
      console.error('Failed to notify external systems:', error);
    }
  }
}
