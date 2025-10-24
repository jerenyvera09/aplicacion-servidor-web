import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { AreaType, EtiquetaType, CategoriaType } from './catalogo.type';
import { ReporteType, UsuarioType } from './usuario-transaccional.type';

@ObjectType({ description: 'Ranking de áreas por cantidad de reportes y su promedio de puntuaciones.' })
export class AreaRankingType {
  @Field(() => AreaType)
  area!: AreaType;

  @Field(() => Int)
  totalReportes!: number;

  @Field(() => Float, { nullable: true })
  promedioPuntuacion?: number;
}

@ObjectType({ description: 'Ranking de etiquetas por uso en reportes y comentarios.' })
export class EtiquetaRankingType {
  @Field(() => EtiquetaType)
  etiqueta!: EtiquetaType;

  @Field(() => Int)
  reportesUsos!: number;

  @Field(() => Int)
  comentariosUsos!: number;

  @Field(() => Int)
  totalUsos!: number;
}

@ObjectType({ description: 'Resumen de actividad y calidad de los reportes de un usuario.' })
export class UsuarioDashboardType {
  @Field(() => UsuarioType)
  usuario!: UsuarioType;

  @Field(() => Int)
  totalReportes!: number;

  @Field(() => Int)
  totalComentarios!: number;

  @Field(() => Float)
  promedioPuntuacionReportes!: number;
}

@ObjectType({ description: 'Ranking de usuarios por aportes (reportes, comentarios y puntuaciones).' })
export class UsuarioAportesRankingType {
  @Field(() => UsuarioType)
  usuario!: UsuarioType;

  @Field(() => Int)
  totalReportes!: number;

  @Field(() => Int)
  totalComentarios!: number;

  @Field(() => Int)
  totalPuntuaciones!: number;

  @Field(() => Int)
  totalAportes!: number;
}

@ObjectType({ description: 'Reporte con su promedio de puntuación.' })
export class ReportePromedioType {
  @Field(() => ReporteType)
  reporte!: ReporteType;

  @Field(() => Float)
  promedioPuntuacion!: number;
}

@ObjectType({ description: 'Etiquetas que co-ocurren junto a otra etiqueta en reportes y comentarios.' })
export class EtiquetaCoocurrenciaType {
  @Field(() => EtiquetaType)
  etiqueta!: EtiquetaType;

  @Field(() => Int)
  enReportes!: number;

  @Field(() => Int)
  enComentarios!: number;

  @Field(() => Int)
  total!: number;
}

@ObjectType({ description: 'Punto de tendencia temporal (por semana ISO).' })
export class TendenciaTemporalType {
  @Field()
  periodo!: string; // YYYY-Www

  @Field(() => Int)
  cantidad!: number;
}

@ObjectType({ description: 'Conteo de reportes por combinación Área-Categoría.' })
export class AreaCategoriaConteoType {
  @Field(() => AreaType, { nullable: true })
  area?: AreaType;

  @Field(() => CategoriaType, { nullable: true })
  categoria?: CategoriaType;

  @Field(() => Int)
  cantidad!: number;
}
