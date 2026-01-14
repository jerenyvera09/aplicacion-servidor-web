import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { createHash } from 'crypto';
import { ProcessedMessage } from './entities/processed-message.entity';

@Injectable()
export class IdempotencyService implements OnModuleInit {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly TTL_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(ProcessedMessage)
    private readonly repo: Repository<ProcessedMessage>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.cleanExpiredKeys();
  }

  generateKey(action: string, entityId: string, additionalData?: Record<string, any>): string {
    const baseKey = `${action}-${entityId}`;
    if (!additionalData) return baseKey;

    const dataHash = createHash('md5')
      .update(JSON.stringify(additionalData))
      .digest('hex')
      .substring(0, 12);
    return `${baseKey}-${dataHash}`;
  }

  async checkProcessed(idempotencyKey: string): Promise<unknown> {
    const existing = await this.repo.findOne({ where: { idempotencyKey } });
    if (!existing) return null;
    this.logger.warn(`🔄 Mensaje duplicado detectado: ${idempotencyKey}`);
    try {
      return JSON.parse(existing.result) as unknown;
    } catch {
      return existing.result;
    }
  }

  async markAsProcessed(
    idempotencyKey: string,
    _action: string,
    _entityId: string,
    result: unknown
  ): Promise<void> {
    const payload = typeof result === 'string' ? result : JSON.stringify(result);
    try {
      await this.repo.insert({ idempotencyKey, result: payload });
    } catch (error) {
      this.logger.error(`Error storing idempotency ${idempotencyKey}: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  async cleanExpiredKeys(): Promise<void> {
    const cutoff = new Date(Date.now() - this.TTL_MS);
    await this.repo.delete({ createdAt: LessThan(cutoff) });
  }
}
