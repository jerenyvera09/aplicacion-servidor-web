import Database from 'better-sqlite3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createHash } from 'crypto';

interface StoredResult {
  id: number;
  idempotency_key: string;
  result: string;
  created_at: string;
}

@Injectable()
export class IdempotencyService implements OnModuleInit {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly TTL_MS = 7 * 24 * 60 * 60 * 1000;
  private db: Database.Database;

  constructor() {
    this.db = new Database('idempotency.sqlite');
  }

  onModuleInit(): void {
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS processed_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idempotency_key TEXT UNIQUE NOT NULL,
          result TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .run();

    this.cleanupExpired();
  }

  generateKey(action: string, entityId: string, additionalData?: Record<string, unknown>): string {
    const base = `${action}:${entityId}`;
    if (!additionalData) return base;
    const hash = createHash('md5').update(JSON.stringify(additionalData)).digest('hex').substring(0, 12);
    return `${base}:${hash}`;
  }

  get(idempotencyKey: string): unknown | null {
    const row = this.db
      .prepare<unknown, StoredResult>(
        'SELECT id, idempotency_key, result, created_at FROM processed_messages WHERE idempotency_key = ?'
      )
      .get(idempotencyKey) as StoredResult | undefined;

    if (!row) return null;
    try {
      return JSON.parse(row.result) as unknown;
    } catch {
      return row.result;
    }
  }

  store(idempotencyKey: string, result: unknown): void {
    const payload = typeof result === 'string' ? result : JSON.stringify(result);
    try {
      this.db
        .prepare('INSERT OR IGNORE INTO processed_messages (idempotency_key, result) VALUES (?, ?)')
        .run(idempotencyKey, payload);
    } catch (error) {
      this.logger.error(`Failed to persist idempotency ${idempotencyKey}: ${error instanceof Error ? error.message : error}`);
    }
  }

  private cleanupExpired(): void {
    const cutoffISO = new Date(Date.now() - this.TTL_MS).toISOString();
    this.db.prepare('DELETE FROM processed_messages WHERE created_at < ?').run(cutoffISO);
  }
}
