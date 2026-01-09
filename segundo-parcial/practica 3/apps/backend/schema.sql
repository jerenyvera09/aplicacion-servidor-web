-- =====================================================
-- ESQUEMA DE BASE DE DATOS COMPLETO
-- Sistema de Reportes con Webhooks y Serverless
-- =====================================================
-- =====================================================
-- TABLAS LOCALES (SQLite)
-- =====================================================
-- Tabla: users (users-service)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'ANALYST' CHECK(role IN ('ADMIN', 'ANALYST', 'VIEWER')),
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  department TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Tabla: reports (reports-service)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  assignedToId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  findings TEXT,
  priority TEXT DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status TEXT DEFAULT 'PENDING' CHECK(
    status IN (
      'PENDING',
      'IN_REVIEW',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED'
    )
  ),
  rejectionReason TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- =====================================================
-- TABLAS EN SUPABASE (PostgreSQL)
-- =====================================================
-- Tabla: webhook_subscriptions
-- Gestión de URLs suscritas a eventos
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_config JSONB DEFAULT '{
    "max_attempts": 6,
    "backoff_type": "exponential",
    "initial_delay_ms": 60000
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_triggered_at TIMESTAMP,
  CONSTRAINT unique_event_url UNIQUE(event_type, url)
);
-- Tabla: webhook_events
-- Registro de todos los eventos recibidos por Edge Functions
CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP
);
-- Tabla: webhook_deliveries
-- Auditoría de todos los intentos de entrega
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES webhook_subscriptions(id),
  event_id VARCHAR(255) REFERENCES webhook_events(event_id),
  attempt_number INTEGER NOT NULL,
  status_code INTEGER,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  duration_ms INTEGER
);
-- Tabla: processed_webhooks
-- Control de idempotencia para Edge Functions (TTL 7 días)
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  event_id INTEGER REFERENCES webhook_events(id),
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);
CREATE TABLE IF NOT EXISTS notification_logs (
  id SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  telegram_message_id BIGINT,
  error_message TEXT,
  sent_at TIMESTAMP,
  attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_idempotency_key ON webhook_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_delivered_at ON webhook_deliveries(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON webhook_deliveries(subscription_id, status);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_key ON processed_webhooks(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_expires ON processed_webhooks(expires_at);
-- =====================================================
-- DATOS DE EJEMPLO PARA SUSCRIPCIONES
-- =====================================================
-- Nota: Ejecutar estos INSERTs después de desplegar Edge Functions
-- Reemplazar URLs con las reales de Supabase
INSERT INTO webhook_subscriptions (event_type, url, secret, is_active)
VALUES (
    'report.created',
    'https://your-project.supabase.co/functions/v1/webhook-event-logger',
    'replace-me',
    true
  ),
  (
    'report.completed',
    'https://your-project.supabase.co/functions/v1/webhook-event-logger',
    'replace-me',
    true
  ),
  (
    'report.created',
    'https://your-project.supabase.co/functions/v1/webhook-external-notifier',
    'replace-me',
    true
  ),
  (
    'report.completed',
    'https://your-project.supabase.co/functions/v1/webhook-external-notifier',
    'replace-me',
    true
  ) ON CONFLICT (event_type, url) DO NOTHING;