import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

type CacheEntry = { expiresAt: number; data: any };

@Injectable()
export class ServiceHttp {
  private readonly logger = new Logger(ServiceHttp.name);
  // Caché simple en memoria para endpoints frecuentemente consultados
  private readonly cache = new Map<string, CacheEntry>();
  // TTL por defecto en segundos
  private readonly defaultTtlSeconds = Number(
    process.env.HTTP_CACHE_TTL_SECONDS ?? 60,
  );
  constructor(private readonly httpService: HttpService) {}

  private handle(error: any): never {
    const status = error.response?.status;
    const method = (error.config?.method || '').toUpperCase();
    const baseURL = error.config?.baseURL ?? '';
    const url = error.config?.url ?? '';
    const fullUrl = `${baseURL || ''}${url || ''}`;
    const data = error.response?.data;
    this.logger.error(
      `${error.message} code=${error.code} status=${status} ${method} ${fullUrl} body=${JSON.stringify(data)}`,
    );
    throw new HttpException(
      {
        message: 'REST error',
        method,
        url: fullUrl,
        status,
        details: data,
      },
      status ?? 502,
    );
  }

  private async withCache<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const now = Date.now();
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > now) {
      return entry.data as T;
    }
    const data = await fetcher();
    this.cache.set(key, { expiresAt: now + ttlSeconds * 1000, data });
    return data;
  }

  // ---- Endpoints generales hacia práctica 4 (prefijo configurado en HttpModule baseURL) ----
  async getCategorias(): Promise<any[]> {
    return this.withCache('categorias', this.defaultTtlSeconds, async () => {
      const { data } = await firstValueFrom(
        this.httpService
          .get<any[]>('/categorias')
          .pipe(catchError((error: any) => this.handle(error))),
      );
      return data;
    });
  }

  async getAreas(): Promise<any[]> {
    return this.withCache('areas', this.defaultTtlSeconds, async () => {
      const { data } = await firstValueFrom(
        this.httpService
          .get<any[]>('/areas')
          .pipe(catchError((error: any) => this.handle(error))),
      );
      return data;
    });
  }

  async getEstados(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any[]>('/estados')
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }

  async getEtiquetas(): Promise<any[]> {
    return this.withCache('etiquetas', this.defaultTtlSeconds, async () => {
      const { data } = await firstValueFrom(
        this.httpService
          .get<any[]>('/etiquetas')
          .pipe(catchError((error: any) => this.handle(error))),
      );
      return data;
    });
  }

  // ---- Taller 4 (practica4) endpoints ----
  async getReportes(): Promise<any[]> {
    // Reportes pueden cambiar con más frecuencia; cache corto
    return this.withCache(
      'reportes',
      Math.min(this.defaultTtlSeconds, 30),
      async () => {
        const { data } = await firstValueFrom(
          this.httpService
            .get<any[]>('/reportes')
            .pipe(catchError((error: any) => this.handle(error))),
        );
        return data;
      },
    );
  }

  async getReporte(id: number): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(`/reportes/${id}`)
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }

  async getPromedioPuntuaciones(
    reporteId: number,
  ): Promise<{ reporteId: number; promedio: number }> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<{
          reporteId: number;
          promedio: number;
        }>(`/puntuaciones/promedio/${reporteId}`)
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }

  async getPuntuaciones(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any[]>('/puntuaciones')
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }

  async getComentarios(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any[]>('/comentarios')
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }

  async getArchivos(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any[]>('/archivos')
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }

  async getUsuarios(): Promise<any[]> {
    return this.withCache('usuarios', this.defaultTtlSeconds, async () => {
      const { data } = await firstValueFrom(
        this.httpService
          .get<any[]>('/usuarios')
          .pipe(catchError((error: any) => this.handle(error))),
      );
      return data;
    });
  }

  async getRoles(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any[]>('/roles')
        .pipe(catchError((error: any) => this.handle(error))),
    );
    return data;
  }
}
