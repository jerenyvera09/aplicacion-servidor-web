import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WebhookSecurityService } from './webhook-security.service';
import { SupabaseService } from './supabase.service';
import { WebhookPayloadDto, WebhookMetadataDto } from './dto/webhook-payload.dto';
import { WebhookSubscription, WebhookDeliveryResult } from './interfaces/webhook-subscription.interface';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

// Interfaz para datos de la BD de Supabase
interface SupabaseSubscription {
  id: number;
  event_type: string;
  url: string;
  secret: string;
  is_active: boolean;
  retry_config?: {
    max_attempts: number;
    backoff_type: 'exponential' | 'linear';
    initial_delay_ms: number;
  };
}

// Interfaz para error de Axios
interface AxiosError {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
  message: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly securityService: WebhookSecurityService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Publica un webhook a todos los suscriptores del evento
   */
  async publishWebhook<T = any>(
    eventType: string, 
    data: T, 
    metadata?: Partial<WebhookMetadataDto>
  ): Promise<void> {
    const eventId = uuidv4();
    const correlationId = metadata?.correlation_id ?? uuidv4();

    // Construir payload estándar
    const payload: WebhookPayloadDto<T> = {
      event: eventType,
      version: '1.0',
      id: eventId,
      idempotency_key: this.generateIdempotencyKey(eventType, data),
      timestamp: new Date().toISOString(),
      data: data,
      metadata: {
        source: 'reports-service',
        environment: process.env.NODE_ENV || 'development',
        correlation_id: correlationId,
        ...metadata
      }
    };

    this.logger.log(`📤 Publishing webhook: ${eventType} [${eventId}]`);

    // Obtener suscriptores activos desde la BD
    const dbSubscriptions = await this.supabaseService.getActiveSubscriptions(eventType) as SupabaseSubscription[];
    
    // Transformar al formato interno
    const subscribers: WebhookSubscription[] = dbSubscriptions.map(sub => ({
      id: sub.id,
      event_type: sub.event_type,
      url: sub.url,
      secret: sub.secret,
      is_active: sub.is_active,
      retry_config: sub.retry_config ?? {
        max_attempts: 5,
        backoff_type: 'exponential' as const,
        initial_delay_ms: 60000
      }
    }));

    if (subscribers.length === 0) {
      this.logger.warn(`⚠️  No active subscribers for event: ${eventType}`);
      return;
    }

    this.logger.log(`📨 Sending to ${subscribers.length} subscriber(s)`);

    // Enviar a todos los suscriptores (Fanout pattern)
    const deliveryPromises = subscribers.map(subscriber => 
      this.deliverWebhook(subscriber, payload)
    );

    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Entrega un webhook a un suscriptor específico con retry logic
   */
  private async deliverWebhook<T = any>(
    subscription: WebhookSubscription,
    payload: WebhookPayloadDto<T>,
    attemptNumber: number = 1
  ): Promise<WebhookDeliveryResult> {
    const startTime = Date.now();
    const timestamp = this.securityService.generateTimestamp();

    if (!this.securityService.isTimestampValid(timestamp)) {
      throw new Error('Timestamp generation failed');
    }

    try {
      this.logger.log(
        `🚀 Sending webhook to ${subscription.url} (attempt ${attemptNumber}/${subscription.retry_config.max_attempts})`
      );

      // Generar firma HMAC
      const signature = this.securityService.generateSignature(payload, subscription.secret, timestamp);

      // Enviar HTTP POST
      const response = await firstValueFrom(
        this.httpService.post(subscription.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': timestamp,
            'X-Event-Type': payload.event,
            'X-Event-Id': payload.id
          },
          timeout: 10000 // 10 segundos
        })
      );

      const duration = Date.now() - startTime;

      this.logger.log(`✅ Webhook delivered successfully to ${subscription.url} (${duration}ms)`);

      const result: WebhookDeliveryResult = {
        subscription_id: subscription.id,
        event_id: payload.id,
        attempt_number: attemptNumber,
        status_code: response.status,
        status: 'success' as const,
        error_message: null,
        duration_ms: duration
      };

      // Registrar entrega exitosa en BD
      await this.supabaseService.saveDeliveryLog({
        subscription_id: subscription.id,
        event_id: payload.id,
        attempt_number: attemptNumber,
        status: 'success',
        status_code: response.status,
        error_message: null,
        duration_ms: duration,
      });

      return result;

    } catch (err) {
      const duration = Date.now() - startTime;
      const error = err as AxiosError;
      const errorMessage = error.response?.data?.error ?? error.message;

      this.logger.error(
        `❌ Webhook delivery failed to ${subscription.url}: ${errorMessage}`
      );

      await this.supabaseService.saveDeliveryLog({
        subscription_id: subscription.id,
        event_id: payload.id,
        attempt_number: attemptNumber,
        status: 'failed',
        status_code: error.response?.status ?? null,
        error_message: errorMessage,
        duration_ms: duration,
      });

      const retrySchedule = [60000, 300000, 1800000, 7200000, 43200000];

      if (attemptNumber < retrySchedule.length) {
        const delay = retrySchedule[attemptNumber - 1];
        this.logger.warn(`🔄 Retrying in ${delay}ms (attempt ${attemptNumber + 1})`);
        await this.sleep(delay);
        return this.deliverWebhook(subscription, payload, attemptNumber + 1);
      }

      this.logger.error(`💀 Webhook delivery failed permanently after ${attemptNumber} attempts`);

      const result: WebhookDeliveryResult = {
        subscription_id: subscription.id,
        event_id: payload.id,
        attempt_number: attemptNumber,
        status_code: error.response?.status ?? null,
        status: 'failed' as const,
        error_message: errorMessage,
        duration_ms: duration
      };

      return result;
    }
  }

  /**
   * Genera una clave de idempotencia única
   */
  private generateIdempotencyKey(eventType: string, data: any): string {
    const reportId = data.report_id ?? data.id ?? data.reportId;
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${eventType}-${reportId}-${timestamp}`;
  }

  /**
   * Helper para sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}