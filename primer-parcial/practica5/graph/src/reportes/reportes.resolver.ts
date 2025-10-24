import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { HttpException } from '@nestjs/common';
import { ServiceHttp } from '../servicios/http.service';
import { ReporteType, DashboardReportesType, ReportesPaginadosType } from '../types/usuario-transaccional.type';
import { FiltroReportesInput, PaginacionInput } from '../types/inputs';

@Resolver()
export class ReportesResolver {
  constructor(private readonly rest: ServiceHttp) {}

  @Description('Obtiene un reporte por su ID con sus relaciones básicas (categoría, área, estado, usuario, etiquetas).')
  @Query(() => ReporteType, {
    nullable: true,
    description: 'Obtiene un reporte por su ID con sus relaciones básicas (categoría, área, estado, usuario, etiquetas).',
  })
  async reporte(@Args('id', { type: () => Int }) id: number): Promise<ReporteType | null> {
    try {
      return (await this.rest.getReporte(id)) as any;
    } catch (e) {
      if (e instanceof HttpException && e.getStatus() === 404) {
        // Si el backend REST devuelve 404, exponemos null en GraphQL
        return null;
      }
      throw e;
    }
  }

  @Description('Lista de reportes con filtros por texto/categoría/área/estado y paginación (aplica filtrado en gateway).')
  @Query(() => ReportesPaginadosType, {
    description:
      'Lista de reportes con filtros por texto/categoría/área/estado y paginación (aplica filtrado en gateway).',
  })
  async reportes(
    @Args('filtro', { type: () => FiltroReportesInput, nullable: true }) filtro?: FiltroReportesInput,
    @Args('paginacion', { type: () => PaginacionInput, nullable: true }) paginacion?: PaginacionInput,
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
      items = items.filter(r => r.titulo.toLowerCase().includes(t) || r.descripcion.toLowerCase().includes(t));
    }
    if (filtro?.categoriaId) items = items.filter(r => r.categoria?.id === filtro.categoriaId);
    if (filtro?.areaId) items = items.filter(r => r.area?.id === filtro.areaId);
    if (filtro?.estadoId) items = items.filter(r => r.estado?.id === filtro.estadoId);
    const pagina = paginacion?.pagina ?? 1;
    const limite = paginacion?.limite ?? 10;
    const total = items.length;
    const start = (pagina - 1) * limite;
    const pageItems = items.slice(start, start + limite);
    return { items: pageItems, total, pagina, limite };
  }

  @Description('Dashboard de reportes: totales y distribución por estado y por área.')
  @Query(() => DashboardReportesType, {
    description: 'Dashboard de reportes: totales y distribución por estado y por área.',
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
    const porEstado = [...porEstadoMap.entries()].map(([estado, cantidad]) => ({ estado, cantidad }));
    const porArea = [...porAreaMap.entries()].map(([estado, cantidad]) => ({ estado, cantidad }));
    return { totalReportes, porEstado, porArea };
  }

  @Description('Promedio de puntuación (1..5) calculado para un reporte específico.')
  @Query(() => Number, {
    description: 'Promedio de puntuación (1..5) calculado para un reporte específico.',
  })
  async promedioPuntuacionPorReporte(@Args('reporteId', { type: () => Int }) reporteId: number): Promise<number> {
    try {
      const { promedio } = await this.rest.getPromedioPuntuaciones(reporteId);
      return promedio ?? 0;
    } catch (e) {
      // Si no hay puntuaciones o el reporte no existe, devolvemos 0
      return 0;
    }
  }
}
