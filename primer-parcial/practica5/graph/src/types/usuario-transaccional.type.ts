import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CategoriaType, AreaType, EstadoReporteType, EtiquetaType } from './catalogo.type';

@ObjectType({ description: 'Usuario del sistema que reporta o interactúa.' })
export class UsuarioType {
  @Field(() => Int) id!: number;
  @Field() nombre!: string;
  @Field() email!: string;
  @Field() estado!: string;
}

@ObjectType({ description: 'Comentario asociado a un reporte.' })
export class ComentarioType {
  @Field(() => Int) id!: number;
  @Field() contenido!: string;
  @Field() fecha!: Date;
  @Field(() => Int) reporteId!: number;
  @Field(() => UsuarioType, { nullable: true }) usuario?: UsuarioType;
  @Field(() => [EtiquetaType], { nullable: true }) etiquetas?: EtiquetaType[];
}

@ObjectType({ description: 'Archivo adjunto a un reporte.' })
export class ArchivoAdjuntoType {
  @Field(() => Int) id!: number;
  @Field() nombre!: string;
  @Field() ruta!: string;
  @Field({ nullable: true }) mimeType?: string;
  @Field({ nullable: true }) tamanoBytes?: number;
}

@ObjectType({ description: 'Puntuación (1..5) que ayuda a valorar el reporte.' })
export class PuntuacionType {
  @Field(() => Int) id!: number;
  @Field(() => Int) valor!: number;
  @Field({ nullable: true }) usuario?: string;
  @Field({ nullable: true }) comentario?: string;
}

@ObjectType({ description: 'Reporte de incidente o requerimiento, con sus relaciones principales.' })
export class ReporteType {
  @Field(() => Int) id!: number;
  @Field() titulo!: string;
  @Field() descripcion!: string;
  @Field({ nullable: true }) ubicacion?: string;
  @Field({ nullable: true }) prioridad?: string;
  @Field(() => CategoriaType, { nullable: true }) categoria?: CategoriaType;
  @Field(() => AreaType, { nullable: true }) area?: AreaType;
  @Field(() => EstadoReporteType, { nullable: true }) estado?: EstadoReporteType;
  @Field(() => UsuarioType, { nullable: true }) usuario?: UsuarioType;
  @Field(() => [EtiquetaType], { nullable: true }) etiquetas?: EtiquetaType[];
}

@ObjectType({ description: 'Par (clave, cantidad) para agregaciones por estado/área.' })
export class ConteoPorEstadoType {
  @Field() estado!: string;
  @Field(() => Int) cantidad!: number;
}

@ObjectType({ description: 'Resumen con totales y distribuciones para dashboard.' })
export class DashboardReportesType {
  @Field(() => Int) totalReportes!: number;
  @Field(() => [ConteoPorEstadoType]) porEstado!: ConteoPorEstadoType[];
  @Field(() => [ConteoPorEstadoType]) porArea!: ConteoPorEstadoType[];
}

@ObjectType({ description: 'Respuesta paginada de reportes con total y parámetros de página.' })
export class ReportesPaginadosType {
  @Field(() => [ReporteType]) items!: ReporteType[];
  @Field(() => Int) total!: number;
  @Field(() => Int) pagina!: number;
  @Field(() => Int) limite!: number;
}
