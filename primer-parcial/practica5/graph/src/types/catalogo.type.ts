import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Categoría de negocio para clasificar los reportes.' })
export class CategoriaType {
  @Field(() => Int) id!: number;
  @Field() nombre!: string;
  @Field({ nullable: true }) descripcion?: string;
  @Field({ nullable: true }) prioridad?: string;
  @Field() estado!: string;
}

@ObjectType({ description: 'Área o unidad organizacional responsable.' })
export class AreaType {
  @Field(() => Int) id!: number;
  @Field() nombre!: string;
  @Field({ nullable: true }) responsable?: string;
  @Field({ nullable: true }) ubicacion?: string;
  @Field({ nullable: true }) descripcion?: string;
}

@ObjectType({ description: 'Estado del ciclo de vida de un reporte.' })
export class EstadoReporteType {
  @Field(() => Int) id!: number;
  @Field() nombre!: string;
  @Field({ nullable: true }) descripcion?: string;
  @Field({ nullable: true }) color?: string;
  @Field({ nullable: true }) orden?: number;
  @Field({ nullable: true }) es_final?: boolean;
}

@ObjectType({ description: 'Etiqueta temática utilizada en reportes y comentarios.' })
export class EtiquetaType {
  @Field(() => Int) id!: number;
  @Field() nombre!: string;
  @Field({ nullable: true }) color?: string;
  @Field({ nullable: true }) descripcion?: string;
  @Field({ nullable: true }) slug?: string;
}
