export type BackendServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  department?: string;
};

export type BackendReportStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

export type BackendReport = {
  id: string;
  userId: string;
  assignedToId: string;
  title: string;
  description: string;
  findings?: string;
  priority: string;
  status: BackendReportStatus;
  createdAt: string | Date;
};

export type CreateReportPayload = {
  userId: string;
  assignedToId: string;
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export class BackendClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    const envBase = process.env.BACKEND_BASE_URL;
    this.baseUrl = normalizeBaseUrl(baseUrl ?? envBase ?? 'http://localhost:3002/api');
  }

  private async request<T>(
    path: string,
    options?: { method?: string; body?: unknown; timeoutMs?: number },
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? 10_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: options?.method ?? 'GET',
        headers: {
          'content-type': 'application/json',
        },
        body: options?.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') ?? '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? ((await res.json()) as unknown) : await res.text();

      if (!res.ok) {
        const details = typeof payload === 'string' ? payload : JSON.stringify(payload);
        throw new Error(`Backend HTTP ${res.status} ${res.statusText}: ${details}`);
      }

      return payload as T;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido llamando al backend';
      throw new Error(message);
    } finally {
      clearTimeout(timeout);
    }
  }

  async getUsers(): Promise<BackendServiceResponse<BackendUser[]>> {
    return this.request<BackendServiceResponse<BackendUser[]>>('/users');
  }

  async getActiveUsers(): Promise<BackendServiceResponse<BackendUser[]>> {
    return this.request<BackendServiceResponse<BackendUser[]>>('/users/active');
  }

  async getUserById(id: string): Promise<BackendServiceResponse<BackendUser>> {
    return this.request<BackendServiceResponse<BackendUser>>(`/users/${encodeURIComponent(id)}`);
  }

  async getReports(): Promise<BackendServiceResponse<BackendReport[]>> {
    return this.request<BackendServiceResponse<BackendReport[]>>('/reports');
  }

  async getActiveReports(): Promise<BackendServiceResponse<BackendReport[]>> {
    return this.request<BackendServiceResponse<BackendReport[]>>('/reports/active');
  }

  async createReport(payload: CreateReportPayload): Promise<BackendServiceResponse<BackendReport>> {
    return this.request<BackendServiceResponse<BackendReport>>('/reports', {
      method: 'POST',
      body: payload,
      timeoutMs: 20_000,
    });
  }
}
