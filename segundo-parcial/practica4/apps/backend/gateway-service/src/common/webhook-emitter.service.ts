import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookEmitterService {
  private readonly logger = new Logger(WebhookEmitterService.name);

  private getWebhookUrls(): string[] {
    const urls = process.env.N8N_WEBHOOK_URLS
      ?.split(',')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls && urls.length > 0) return urls;

    const single = process.env.N8N_WEBHOOK_URL?.trim();
    return single ? [single] : [];
  }

  async emit(evento: string, payload: unknown): Promise<void> {
    const webhookUrls = this.getWebhookUrls();
    if (webhookUrls.length === 0) return;

    try {
      const body = JSON.stringify({
        evento,
        timestamp: new Date().toISOString(),
        data: payload,
      });

      await Promise.all(
        webhookUrls.map(async (url) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });

          if (!response.ok) {
            this.logger.warn(
              `n8n respondió ${response.status} al emitir evento ${evento} (${url})`,
            );
            return;
          }

          this.logger.log(`Evento ${evento} emitido a n8n (${url})`);
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Error emitiendo webhook: ${message}`);
    }
  }
}
