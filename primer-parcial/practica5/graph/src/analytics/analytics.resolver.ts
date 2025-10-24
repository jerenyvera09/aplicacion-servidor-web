import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { ServiceHttp } from '../servicios/http.service';
import { AreaRankingType, EtiquetaRankingType, UsuarioDashboardType, UsuarioAportesRankingType, ReportePromedioType, EtiquetaCoocurrenciaType, TendenciaTemporalType, AreaCategoriaConteoType } from '../types/analytics.type';
import { ReporteType, UsuarioType, ReportesPaginadosType } from '../types/usuario-transaccional.type';
import { BusquedaAvanzadaInput, PaginacionInput } from '../types/inputs';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly rest: ServiceHttp) {}

  // Autor: DELGADO CARLOS
  @Description('Top de áreas con más reportes. Incluye total de reportes y promedio de puntuaciones de sus reportes.')
  @Query(() => [AreaRankingType], {
    description:
      'Top de áreas con más reportes. Incluye total de reportes y promedio de puntuaciones de sus reportes.',
  })
  async topAreasConMasReportes(
    @Args('limite', { type: () => Int, nullable: true }) limite?: number,
  ): Promise<AreaRankingType[]> {
    const [reportes, puntuaciones] = await Promise.all([
      this.rest.getReportes(),
      this.rest.getPuntuaciones(),
    ]);

    // Agrupar por área (ignorando reportes sin área)
    const map = new Map<number, { area: any; reportesIds: number[] }>();
    for (const r of reportes as any[]) {
      const area = r.area;
      if (!area?.id) continue;
      if (!map.has(area.id)) map.set(area.id, { area, reportesIds: [] });
      map.get(area.id)!.reportesIds.push(r.id);
    }

    // Calcular promedio de puntuaciones por área
    const list: AreaRankingType[] = [];
    for (const { area, reportesIds } of map.values()) {
      const puntuacionesArea = (puntuaciones as any[]).filter((p) => reportesIds.includes(p.reporte?.id || p.reporteId));
      const total = reportesIds.length;
      const promedio = puntuacionesArea.length
        ? puntuacionesArea.reduce((s, p: any) => s + (Number(p.valor) || 0), 0) / puntuacionesArea.length
        : 0;
      list.push({ area, totalReportes: total, promedioPuntuacion: promedio });
    }

    list.sort((a, b) => b.totalReportes - a.totalReportes || (b.promedioPuntuacion || 0) - (a.promedioPuntuacion || 0));
    return typeof limite === 'number' ? list.slice(0, Math.max(0, limite)) : list;
  }

  // Autor: DELGADO CARLOS
  @Description('Tablero de etiquetas: usos en reportes y comentarios, ordenado por total de usos (desc).')
  @Query(() => [EtiquetaRankingType], {
    description:
      'Tablero de etiquetas: usos en reportes y comentarios, ordenado por total de usos (desc).',
  })
  async tableroEtiquetas(
    @Args('limite', { type: () => Int, nullable: true }) limite?: number,
  ): Promise<EtiquetaRankingType[]> {
    const [etiquetas, reportes, comentarios] = await Promise.all([
      this.rest.getEtiquetas(),
      this.rest.getReportes(),
      this.rest.getComentarios(),
    ]);

    const byId = new Map<number, any>();
    for (const e of etiquetas as any[]) byId.set(e.id, e);

    const counts = new Map<number, { reportesUsos: number; comentariosUsos: number }>();

    for (const r of reportes as any[]) {
      const etis: any[] = Array.isArray(r.etiquetas) ? r.etiquetas : [];
      for (const e of etis) {
        if (!counts.has(e.id)) counts.set(e.id, { reportesUsos: 0, comentariosUsos: 0 });
        counts.get(e.id)!.reportesUsos += 1;
      }
    }

    for (const c of comentarios as any[]) {
      const etis: any[] = Array.isArray(c.etiquetas) ? c.etiquetas : [];
      for (const e of etis) {
        if (!counts.has(e.id)) counts.set(e.id, { reportesUsos: 0, comentariosUsos: 0 });
        counts.get(e.id)!.comentariosUsos += 1;
      }
    }

    const list: EtiquetaRankingType[] = [];
    for (const [id, { reportesUsos, comentariosUsos }] of counts.entries()) {
      const etiqueta = byId.get(id) ?? { id, nombre: `Etiqueta ${id}` };
      const totalUsos = reportesUsos + comentariosUsos;
      list.push({ etiqueta, reportesUsos, comentariosUsos, totalUsos });
    }

    list.sort((a, b) => b.totalUsos - a.totalUsos || b.reportesUsos - a.reportesUsos);
    return typeof limite === 'number' ? list.slice(0, Math.max(0, limite)) : list;
  }

  // Autor: DELGADO CARLOS
  @Description('Resumen por usuario: total de reportes creados, total de comentarios del usuario, y promedio de puntuaciones de sus reportes.')
  @Query(() => UsuarioDashboardType, {
    description:
      'Resumen por usuario: total de reportes creados, total de comentarios del usuario, y promedio de puntuaciones de sus reportes.',
  })
  async resumenUsuario(
    @Args('usuarioId', { type: () => Int }) usuarioId: number,
  ): Promise<UsuarioDashboardType> {
    const [usuarios, reportes, comentarios, puntuaciones] = await Promise.all([
      this.rest.getUsuarios(),
      this.rest.getReportes(),
      this.rest.getComentarios(),
      this.rest.getPuntuaciones(),
    ]);

    const usuario = (usuarios as any[]).find((u) => u.id === usuarioId) ?? { id: usuarioId, nombre: `Usuario ${usuarioId}`, email: '', estado: '' };
    const reportesUsuario = (reportes as any[]).filter((r) => r.usuario?.id === usuarioId);
    const comentariosUsuario = (comentarios as any[]).filter((c) => c.usuario?.id === usuarioId);
    const reportesIds = new Set(reportesUsuario.map((r) => r.id));
    const puntuacionesDeSusReportes = (puntuaciones as any[]).filter((p) => reportesIds.has(p.reporte?.id || p.reporteId));
    const promedio = puntuacionesDeSusReportes.length
      ? puntuacionesDeSusReportes.reduce((s, p: any) => s + (Number(p.valor) || 0), 0) / puntuacionesDeSusReportes.length
      : 0;

    return {
      usuario,
      totalReportes: reportesUsuario.length,
      totalComentarios: comentariosUsuario.length,
      promedioPuntuacionReportes: promedio,
    };
  }

  // Autor: VERA JEREMY
  @Description('Ranking de usuarios por aportes (reportes + comentarios + puntuaciones). Opcionalmente filtra comentarios por rango de fechas (desde/hasta, ISO).')
  @Query(() => [UsuarioAportesRankingType], {
    description:
      'Ranking de usuarios por aportes (reportes + comentarios + puntuaciones). Opcionalmente filtra comentarios por rango de fechas (desde/hasta, ISO).',
  })
  async rankingUsuariosPorAportes(
    @Args('limite', { type: () => Int, nullable: true }) limite?: number,
    @Args('desde', { type: () => String, nullable: true, description: 'Fecha ISO inclusiva para comentarios' }) desde?: string,
    @Args('hasta', { type: () => String, nullable: true, description: 'Fecha ISO inclusiva para comentarios' }) hasta?: string,
  ): Promise<UsuarioAportesRankingType[]> {
    const [usuarios, reportes, comentarios, puntuaciones] = await Promise.all([
      this.rest.getUsuarios(),
      this.rest.getReportes(),
      this.rest.getComentarios(),
      this.rest.getPuntuaciones(),
    ]);

    const from = desde ? new Date(desde) : undefined;
    const to = hasta ? new Date(hasta) : undefined;

    const byId = new Map<number, UsuarioType>();
    for (const u of usuarios as any[]) byId.set(u.id, u);

    const reportesPorUsuario = new Map<number, number>();
    for (const r of reportes as any[]) {
      const uid = r.usuario?.id;
      if (!uid) continue;
      reportesPorUsuario.set(uid, (reportesPorUsuario.get(uid) ?? 0) + 1);
    }

    const comentariosPorUsuario = new Map<number, number>();
    for (const c of comentarios as any[]) {
      const uid = c.usuario?.id;
      if (!uid) continue;
      const fecha = c.fecha ? new Date(c.fecha) : undefined;
      if (from && fecha && fecha < from) continue;
      if (to && fecha && fecha > to) continue;
      comentariosPorUsuario.set(uid, (comentariosPorUsuario.get(uid) ?? 0) + 1);
    }

    const puntuacionesPorUsuario = new Map<number, number>();
    for (const p of puntuaciones as any[]) {
      const uid = p.usuarioRef?.id; // si existe referencia al usuario
      if (!uid) continue;
      puntuacionesPorUsuario.set(uid, (puntuacionesPorUsuario.get(uid) ?? 0) + 1);
    }

    const ids = new Set<number>([
      ...reportesPorUsuario.keys(),
      ...comentariosPorUsuario.keys(),
      ...puntuacionesPorUsuario.keys(),
    ]);

    const ranking: UsuarioAportesRankingType[] = [];
    for (const id of ids) {
      const usuario = byId.get(id) ?? ({ id, nombre: `Usuario ${id}`, email: '', estado: '' } as any);
      const totalReportes = reportesPorUsuario.get(id) ?? 0;
      const totalComentarios = comentariosPorUsuario.get(id) ?? 0;
      const totalPuntuaciones = puntuacionesPorUsuario.get(id) ?? 0;
      const totalAportes = totalReportes + totalComentarios + totalPuntuaciones;
      ranking.push({ usuario, totalReportes, totalComentarios, totalPuntuaciones, totalAportes });
    }

    ranking.sort((a, b) =>
      b.totalAportes - a.totalAportes ||
      b.totalReportes - a.totalReportes ||
      b.totalComentarios - a.totalComentarios,
    );
    return typeof limite === 'number' ? ranking.slice(0, Math.max(0, limite)) : ranking;
  }

  // Autor: VERA JEREMY
  @Description('Lista de reportes asociados a una etiqueta con su promedio de puntuación, ordenados por mayor promedio.')
  @Query(() => [ReportePromedioType], {
    description:
      'Lista de reportes asociados a una etiqueta con su promedio de puntuación, ordenados por mayor promedio.',
  })
  async reportesPorEtiquetaConPromedio(
    @Args('etiquetaId', { type: () => Int }) etiquetaId: number,
    @Args('limite', { type: () => Int, nullable: true }) limite?: number,
  ): Promise<ReportePromedioType[]> {
    const [reportes, puntuaciones] = await Promise.all([
      this.rest.getReportes(),
      this.rest.getPuntuaciones(),
    ]);

    const reportesEtiqueta = (reportes as any[]).filter((r) =>
      Array.isArray(r.etiquetas) && r.etiquetas.some((e: any) => e.id === etiquetaId),
    ) as ReporteType[];

    const list: ReportePromedioType[] = [];
    for (const r of reportesEtiqueta) {
      const ps = (puntuaciones as any[]).filter((p) => (p.reporte?.id || p.reporteId) === r.id);
      const promedio = ps.length ? ps.reduce((s, p: any) => s + (Number(p.valor) || 0), 0) / ps.length : 0;
      list.push({ reporte: r as any, promedioPuntuacion: promedio });
    }

    list.sort((a, b) => b.promedioPuntuacion - a.promedioPuntuacion);
    return typeof limite === 'number' ? list.slice(0, Math.max(0, limite)) : list;
  }

  // Autor: VERA JEREMY
  @Description('Etiquetas que co-ocurren con una etiqueta dada en reportes y comentarios. Excluye la etiqueta base.')
  @Query(() => [EtiquetaCoocurrenciaType], {
    description:
      'Etiquetas que co-ocurren con una etiqueta dada en reportes y comentarios. Excluye la etiqueta base.',
  })
  async etiquetasCoocurrentes(
    @Args('etiquetaId', { type: () => Int }) etiquetaId: number,
    @Args('limite', { type: () => Int, nullable: true }) limite?: number,
  ): Promise<EtiquetaCoocurrenciaType[]> {
    const [etiquetas, reportes, comentarios] = await Promise.all([
      this.rest.getEtiquetas(),
      this.rest.getReportes(),
      this.rest.getComentarios(),
    ]);

    const byId = new Map<number, any>();
    for (const e of etiquetas as any[]) byId.set(e.id, e);

    const counts = new Map<number, { enReportes: number; enComentarios: number }>();

    for (const r of reportes as any[]) {
      const etis: any[] = Array.isArray(r.etiquetas) ? r.etiquetas : [];
      if (!etis.some((e) => e.id === etiquetaId)) continue;
      for (const e of etis) {
        if (e.id === etiquetaId) continue;
        if (!counts.has(e.id)) counts.set(e.id, { enReportes: 0, enComentarios: 0 });
        counts.get(e.id)!.enReportes += 1;
      }
    }

    for (const c of comentarios as any[]) {
      const etis: any[] = Array.isArray(c.etiquetas) ? c.etiquetas : [];
      if (!etis.some((e) => e.id === etiquetaId)) continue;
      for (const e of etis) {
        if (e.id === etiquetaId) continue;
        if (!counts.has(e.id)) counts.set(e.id, { enReportes: 0, enComentarios: 0 });
        counts.get(e.id)!.enComentarios += 1;
      }
    }

    const list: EtiquetaCoocurrenciaType[] = [];
    for (const [id, v] of counts.entries()) {
      const etiqueta = byId.get(id) ?? { id, nombre: `Etiqueta ${id}` };
      list.push({ etiqueta, enReportes: v.enReportes, enComentarios: v.enComentarios, total: v.enReportes + v.enComentarios });
    }

    list.sort((a, b) => b.total - a.total || b.enReportes - a.enReportes);
    return typeof limite === 'number' ? list.slice(0, Math.max(0, limite)) : list;
  }

  // Autor: CINTHIA ZAMBRANO
  @Description('Tendencia de comentarios agregada por semana ISO (YYYY-Www).')
  @Query(() => [TendenciaTemporalType], {
    description: 'Tendencia de comentarios agregada por semana ISO (YYYY-Www).',
  })
  async tendenciasComentariosPorSemana(
    @Args('desde', { type: () => String, nullable: true }) desde?: string,
    @Args('hasta', { type: () => String, nullable: true }) hasta?: string,
  ): Promise<TendenciaTemporalType[]> {
    const comentarios = await this.rest.getComentarios();
    const from = desde ? new Date(desde) : undefined;
    const to = hasta ? new Date(hasta) : undefined;

    const counts = new Map<string, number>();
    for (const c of comentarios as any[]) {
      const d = c.fecha ? new Date(c.fecha) : undefined;
      if (!d) continue;
      if (from && d < from) continue;
      if (to && d > to) continue;
      const key = this.isoWeekKey(d);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const puntos: TendenciaTemporalType[] = [...counts.entries()]
      .map(([periodo, cantidad]) => ({ periodo, cantidad }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
    return puntos;
  }

  // Autor: CINTHIA ZAMBRANO
  @Description('Conteo de reportes agrupado por área y categoría.')
  @Query(() => [AreaCategoriaConteoType], {
    description: 'Conteo de reportes agrupado por área y categoría.',
  })
  async reportesPorAreaYCategoria(
    @Args('areaId', { type: () => Int, nullable: true }) areaId?: number,
    @Args('categoriaId', { type: () => Int, nullable: true }) categoriaId?: number,
  ): Promise<AreaCategoriaConteoType[]> {
    const reportes = await this.rest.getReportes();
    const map = new Map<string, { area: any; categoria: any; cantidad: number }>();
    for (const r of reportes as any[]) {
      const area = r.area;
      const cat = r.categoria;
      if (areaId && area?.id !== areaId) continue;
      if (categoriaId && cat?.id !== categoriaId) continue;
      const key = `${area?.id || 'NA'}-${cat?.id || 'NA'}`;
      if (!map.has(key)) map.set(key, { area, categoria: cat, cantidad: 0 });
      map.get(key)!.cantidad += 1;
    }
    const list: AreaCategoriaConteoType[] = [...map.values()]
      .map(v => ({ area: v.area, categoria: v.categoria, cantidad: v.cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
    return list;
  }

  // Autor: CINTHIA ZAMBRANO
  @Description('Buscador avanzado de reportes con filtros por etiqueta y usuario, además de los filtros básicos.')
  @Query(() => ReportesPaginadosType, {
    description: 'Buscador avanzado de reportes con filtros por etiqueta y usuario, además de los filtros básicos.',
  })
  async buscadorReportesAvanzado(
    @Args('filtro', { type: () => BusquedaAvanzadaInput, nullable: true }) filtro?: BusquedaAvanzadaInput,
    @Args('paginacion', { type: () => PaginacionInput, nullable: true }) paginacion?: PaginacionInput,
  ): Promise<ReportesPaginadosType> {
    let items: ReporteType[] = [];
    try {
      items = (await this.rest.getReportes()) as any;
    } catch {
      items = [];
    }
    if (filtro?.texto) {
      const t = filtro.texto.toLowerCase();
      items = items.filter(r => r.titulo.toLowerCase().includes(t) || r.descripcion.toLowerCase().includes(t));
    }
    if (filtro?.categoriaId) items = items.filter(r => r.categoria?.id === filtro.categoriaId);
    if (filtro?.areaId) items = items.filter(r => r.area?.id === filtro.areaId);
    if (filtro?.estadoId) items = items.filter(r => r.estado?.id === filtro.estadoId);
    if (filtro?.usuarioId) items = items.filter(r => r.usuario?.id === filtro.usuarioId);
    if (filtro?.etiquetaId) items = items.filter(r => Array.isArray(r.etiquetas) && r.etiquetas.some((e: any) => e.id === filtro.etiquetaId));

    const pagina = paginacion?.pagina ?? 1;
    const limite = paginacion?.limite ?? 10;
    const total = items.length;
    const start = (pagina - 1) * limite;
    const pageItems = items.slice(start, start + limite);
    return { items: pageItems as any, total, pagina, limite };
  }

  // Utilidad: clave de semana ISO YYYY-Www
  private isoWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    // Jueves de la semana actual
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const weekStr = weekNo.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}-W${weekStr}`;
  }
}
