import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { HttpException } from '@nestjs/common';
import { ServiceHttp } from '../servicios/http.service';
import {
  ReporteType,
  DashboardReportesType,
  ReportesPaginadosType,
  UsuarioType,
} from '../types/usuario-transaccional.type';
import {
  ComentarioType,
  PuntuacionType,
} from '../types/usuario-transaccional.type';
import {
  CategoriaType,
  AreaType,
  EstadoReporteType,
} from '../types/catalogo.type';
import { FiltroReportesInput, PaginacionInput } from '../types/inputs';
import DataLoader from 'dataloader';

@Resolver(() => ReporteType)
export class ReportesResolver {
  constructor(private readonly rest: ServiceHttp) {}

  // DataLoaders simples (por request idealmente). Aquí se instancian por clase para simplicidad.
  private readonly usuarioLoader = new DataLoader<number, UsuarioType | null>(
    async (ids) => {
      const usuarios =
        (await this.rest.getUsuarios()) as unknown as UsuarioType[];
      return ids.map((id) => usuarios.find((u) => u.id === id) ?? null);
    },
  );
  private readonly categoriaLoader = new DataLoader<
    number,
    CategoriaType | null
  >(async (ids) => {
    const categorias =
      (await this.rest.getCategorias()) as unknown as CategoriaType[];
    return ids.map((id) => categorias.find((c) => c.id === id) ?? null);
  });
  private readonly areaLoader = new DataLoader<number, AreaType | null>(
    async (ids) => {
      const areas = (await this.rest.getAreas()) as unknown as AreaType[];
      return ids.map((id) => areas.find((a) => a.id === id) ?? null);
    },
  );
  private readonly estadoLoader = new DataLoader<
    number,
    EstadoReporteType | null
  >(async (ids) => {
    const estados =
      (await this.rest.getEstados()) as unknown as EstadoReporteType[];
    return ids.map((id) => estados.find((e) => e.id === id) ?? null);
  });

  // Loaders para colecciones relacionadas (comentarios y puntuaciones por reporte)
  private readonly comentariosLoader = new DataLoader<number, ComentarioType[]>(
    async (ids) => {
      const comentarios =
        (await this.rest.getComentarios()) as unknown as ComentarioType[];
      return ids.map((id) =>
        comentarios.filter(
          (c: any) => Number(c?.reporte?.id ?? c?.reporteId) === Number(id),
        ),
      );
    },
  );

  private readonly puntuacionesLoader = new DataLoader<
    number,
    PuntuacionType[]
  >(async (ids) => {
    const puntuaciones =
      (await this.rest.getPuntuaciones()) as unknown as PuntuacionType[];
    return ids.map((id) =>
      puntuaciones.filter(
        (p: any) => Number(p?.reporte?.id ?? p?.reporteId) === Number(id),
      ),
    );
  });

  @Description(
    'Obtiene un reporte por su ID con sus relaciones básicas (categoría, área, estado, usuario, etiquetas).',
  )
  @Query(() => ReporteType, {
    nullable: true,
    description:
      'Obtiene un reporte por su ID con sus relaciones básicas (categoría, área, estado, usuario, etiquetas).',
  })
  async reporte(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<ReporteType | null> {
    try {
      return await this.rest.getReporte(id);
    } catch (e) {
      if (e instanceof HttpException && e.getStatus() === 404) {
        // Si el backend REST devuelve 404, exponemos null en GraphQL
        return null;
      }
      throw e;
    }
  }

  @Description(
    'Lista de reportes con filtros por texto/categoría/área/estado y paginación (aplica filtrado en gateway).',
  )
  @Query(() => ReportesPaginadosType, {
    description:
      'Lista de reportes con filtros por texto/categoría/área/estado y paginación (aplica filtrado en gateway).',
  })
  async reportes(
    @Args('filtro', { type: () => FiltroReportesInput, nullable: true })
    filtro?: FiltroReportesInput,
    @Args('paginacion', { type: () => PaginacionInput, nullable: true })
    paginacion?: PaginacionInput,
  ): Promise<ReportesPaginadosType> {
    let items: ReporteType[] = [];
    try {
      const data = await this.rest.getReportes();
      items = data as unknown as ReporteType[];
    } catch (e) {
      // Si el servicio REST no está poblado o responde error, devolvemos vacío
      items = [];
    }
    if (filtro?.texto) {
      const t = filtro.texto.toLowerCase();
      items = items.filter(
        (r) =>
          r.titulo.toLowerCase().includes(t) ||
          r.descripcion.toLowerCase().includes(t),
      );
    }
    if (filtro?.categoriaId)
      items = items.filter((r) => r.categoria?.id === filtro.categoriaId);
    if (filtro?.areaId)
      items = items.filter((r) => r.area?.id === filtro.areaId);
    if (filtro?.estadoId)
      items = items.filter((r) => r.estado?.id === filtro.estadoId);
    const pagina = paginacion?.pagina ?? 1;
    const limite = paginacion?.limite ?? 10;
    const total = items.length;
    const start = (pagina - 1) * limite;
    const pageItems = items.slice(start, start + limite);
    return { items: pageItems, total, pagina, limite };
  }

  @Description(
    'Dashboard de reportes: totales y distribución por estado y por área.',
  )
  @Query(() => DashboardReportesType, {
    description:
      'Dashboard de reportes: totales y distribución por estado y por área.',
  })
  async dashboardReportes(): Promise<DashboardReportesType> {
    let items: ReporteType[] = [];
    try {
      items = (await this.rest.getReportes()) as unknown as ReporteType[];
    } catch (e) {
      items = [];
    }
    const totalReportes = items.length;
    const porEstadoMap = new Map<string, number>();
    const porAreaMap = new Map<string, number>();
    for (const r of items as any[]) {
      const est = r.estado?.nombre ?? 'Sin estado';
      porEstadoMap.set(est, (porEstadoMap.get(est) ?? 0) + 1);
      const area = r.area?.nombre ?? 'Sin área';
      porAreaMap.set(area, (porAreaMap.get(area) ?? 0) + 1);
    }
    const porEstado = [...porEstadoMap.entries()].map(([estado, cantidad]) => ({
      estado,
      cantidad,
    }));
    const porArea = [...porAreaMap.entries()].map(([estado, cantidad]) => ({
      estado,
      cantidad,
    }));
    return { totalReportes, porEstado, porArea };
  }

  @Description(
    'Promedio de puntuación (1..5) calculado para un reporte específico.',
  )
  @Query(() => Number, {
    description:
      'Promedio de puntuación (1..5) calculado para un reporte específico.',
  })
  async promedioPuntuacionPorReporte(
    @Args('reporteId', { type: () => Int }) reporteId: number,
  ): Promise<number> {
    try {
      const { promedio } = await this.rest.getPromedioPuntuaciones(reporteId);
      return promedio ?? 0;
    } catch (e) {
      // Si no hay puntuaciones o el reporte no existe, devolvemos 0
      return 0;
    }
  }

  // ---------- Field Resolvers con DataLoader (evita N+1) ----------
  @ResolveField(() => UsuarioType, { nullable: true })
  async usuario(@Parent() reporte: any): Promise<UsuarioType | null> {
    if (reporte?.usuario) return reporte.usuario as UsuarioType;
    const id = reporte?.usuarioId || reporte?.usuario?.id;
    if (!id) return null;
    return this.usuarioLoader.load(Number(id));
  }

  @ResolveField(() => CategoriaType, { nullable: true })
  async categoria(@Parent() reporte: any): Promise<CategoriaType | null> {
    if (reporte?.categoria) return reporte.categoria as CategoriaType;
    const id = reporte?.categoriaId || reporte?.categoria?.id;
    if (!id) return null;
    return this.categoriaLoader.load(Number(id));
  }

  @ResolveField(() => AreaType, { nullable: true })
  async area(@Parent() reporte: any): Promise<AreaType | null> {
    if (reporte?.area) return reporte.area as AreaType;
    const id = reporte?.areaId || reporte?.area?.id;
    if (!id) return null;
    return this.areaLoader.load(Number(id));
  }

  @ResolveField(() => EstadoReporteType, { nullable: true })
  async estado(@Parent() reporte: any): Promise<EstadoReporteType | null> {
    if (reporte?.estado) return reporte.estado as EstadoReporteType;
    const id = reporte?.estadoId || reporte?.estado?.id;
    if (!id) return null;
    return this.estadoLoader.load(Number(id));
  }

  @ResolveField(() => [ComentarioType], { nullable: true })
  async comentarios(@Parent() reporte: any): Promise<ComentarioType[]> {
    if (reporte?.comentarios) return reporte.comentarios as ComentarioType[];
    const id = reporte?.id || reporte?.reporteId;
    if (!id) return [];
    return this.comentariosLoader.load(Number(id));
  }

  @ResolveField(() => [PuntuacionType], { nullable: true })
  async puntuaciones(@Parent() reporte: any): Promise<PuntuacionType[]> {
    if (reporte?.puntuaciones) return reporte.puntuaciones as PuntuacionType[];
    const id = reporte?.id || reporte?.reporteId;
    if (!id) return [];
    return this.puntuacionesLoader.load(Number(id));
  }
}
